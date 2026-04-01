import warnings
import os

# Suppress FaceNet/PyTorch warnings
warnings.filterwarnings("ignore", category=FutureWarning)
# Optional: suppress some TensorFlow/standard logs if they get noisy
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import os
import torch
import torch.nn as nn
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image, ImageOps
from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix
from facenet_pytorch import MTCNN

app = Flask(__name__)
app.config['SECRET_KEY'] = 'deepfake-detection-super-secret-key-2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit

# CRITICAL HF FIX: Allow cookies to survive inside across cross-origin iframes!
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['REMEMBER_COOKIE_SAMESITE'] = 'None'
app.config['REMEMBER_COOKIE_SECURE'] = True

# Tell Flask it is behind a proxy (like Hugging Face) so Secure=True works over HTTP
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# --- Database Models ---
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(300), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Guarantee the SQLite User database exists if deployed out via WSGI Container (Docker)
with app.app_context():
    db.create_all()

# --- PyTorch Model Setup ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Loading Hugging Face Hub Deepfake model onto:", device)

mtcnn = MTCNN(keep_all=False, device=device)

# Switch to production-grade generalized Vision Transformer from HF Hub
model_id = "prithivMLmods/Deep-Fake-Detector-v2-Model"
try:
    processor = AutoImageProcessor.from_pretrained(model_id)
    model = AutoModelForImageClassification.from_pretrained(model_id).to(device)
    model.eval()
    print(f"[{model_id}] perfectly synchronized and successfully loaded globally out of the box.")
except Exception as e:
    print(f"WARNING: Transformer model failed to boot from Hugging Face Hub (Internet issue?): {e}")

def predict_image(image_path):
    try:
        # CRITICAL FIX 1: Read EXIF orientation natively! Phone cameras write pixels sideways.
        image = Image.open(image_path)
        image = ImageOps.exif_transpose(image).convert("RGB")
        
        # CRITICAL FIX 2: Isolate the human face. The ViT hallucinated on complex phone backgrounds (rooms, outdoors).
        inference_image = image
        try:
            boxes, probs = mtcnn.detect(image)
            if boxes is not None and len(boxes) > 0:
                box = boxes[0]  # Take highest prob face
                
                # Expand box exactly by 15% to grab jawline and hairline (deepfake seams)
                w, h = box[2] - box[0], box[3] - box[1]
                b1, b2 = max(0, box[0] - w * 0.15), max(0, box[1] - h * 0.15)
                b3, b4 = min(image.width, box[2] + w * 0.15), min(image.height, box[3] + h * 0.15)
                
                inference_image = image.crop((int(b1), int(b2), int(b3), int(b4)))
        except Exception:
            pass # Safely back off to the raw image if no logical face is found
        
        inputs = processor(images=inference_image, return_tensors="pt").to(device)

        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            model_probs = torch.nn.functional.softmax(logits, dim=1)

        labels = model.config.id2label
        fake_prob = 0.0
        real_prob = 0.0
        
        # Smart dictionary parsing depending on model registry configuration
        for idx, label_name in labels.items():
            prob = model_probs[0][idx].item()
            l = label_name.lower()
            if 'fake' in l or 'deepfake' in l or 'spoof' in l:
                fake_prob += prob
            elif 'real' in l or 'pristine' in l:
                real_prob += prob

        # Fallback if label resolution gets highly ambiguous
        if fake_prob == 0 and real_prob == 0:
            pred_idx = torch.argmax(model_probs, dim=1).item()
            predicted_label = labels[pred_idx].upper()
            if 'FAKE' in predicted_label:
                fake_prob = 1.0
            else:
                real_prob = 1.0
        
        return {
            "success": True,
            "fake_prob": round(fake_prob * 100, 2),
            "real_prob": round(real_prob * 100, 2),
            "prediction": "REAL" if real_prob > fake_prob else "FAKE"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# --- Web Routes ---
@app.route('/')
@login_required
def index():
    return render_template('index.html', user=current_user)

@app.route('/login', methods=['GET'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if user and check_password_hash(user.password_hash, data.get('password')):
        login_user(user, remember=True)
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid username or password"})

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or len(username) < 3:
        return jsonify({"success": False, "message": "Username must be at least 3 characters."})
    
    if User.query.filter_by(username=username).first():
        return jsonify({"success": False, "message": "Username already exists."})
    
    new_user = User(username=username, password_hash=generate_password_hash(password))
    db.session.add(new_user)
    db.session.commit()
    
    # Auto-login after registration
    login_user(new_user)
    return jsonify({"success": True})

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/api/predict', methods=['POST'])
@login_required
def api_predict():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file chunk found."}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No file selected."}), 400
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        result = predict_image(filepath)
        if result["success"]:
            # Expose public visual path
            result["image_url"] = f"/static/uploads/{filename}"
            return jsonify(result)
        else:
            return jsonify({"success": False, "message": result.get("error")}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
