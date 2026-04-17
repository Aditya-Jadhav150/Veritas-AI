import warnings
import os
import re

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
from datetime import datetime, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from collections import defaultdict
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'deepfake-detection-super-secret-key-2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'

# Simple memory cache for rate limiting IPs (tracks failed attempts only)
failed_logins = defaultdict(list)
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
    email = db.Column(db.String(150), unique=True, nullable=True)
    password_hash = db.Column(db.String(300), nullable=True) # Now nullable for Google users
    google_id = db.Column(db.String(150), unique=True, nullable=True)
    last_username_change = db.Column(db.DateTime, nullable=True)
    ai_data_optin = db.Column(db.Boolean, default=False, nullable=True)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Guarantee the SQLite User database exists if deployed out via WSGI Container (Docker)
with app.app_context():
    try:
        from sqlalchemy import text
        db.session.execute(text('ALTER TABLE user ADD COLUMN ai_data_optin BOOLEAN DEFAULT 0'))
        db.session.commit()
    except Exception:
        pass
    try:
        db.create_all()
    except Exception as e:
        print(f"Skipping database creation (likely handled by another worker): {e}")

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
@app.route('/aegis-override-system')
@login_required
def admin():
    if not current_user.email or current_user.email.strip().lower() != 'adityajadhav300405@gmail.com':
        return redirect(url_for('index'))
    return render_template('admin.html', user=current_user)

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
    ip = request.remote_addr or request.headers.get('X-Forwarded-For', 'unknown-ip')
    now = datetime.utcnow()
    
    # Prune failures older than 5 hours (18000 seconds)
    failed_logins[ip] = [t for t in failed_logins[ip] if (now - t).total_seconds() < 18000]
    
    if len(failed_logins[ip]) >= 5:
        return jsonify({"success": False, "message": "CRITICAL: Too many failed attempts. Your device is locked out of logins for 5 hours."}), 429

    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    # Google users will not have a password hash, explicitly block password login for them if hash is None
    if user and user.password_hash and check_password_hash(user.password_hash, data.get('password')):
        login_user(user, remember=True)
        # Clear failures on successful login
        if ip in failed_logins:
            del failed_logins[ip]
        return jsonify({"success": True})
        
    # Record the failure
    failed_logins[ip].append(now)
    attempts_left = 5 - len(failed_logins[ip])
    return jsonify({"success": False, "message": f"Invalid username or password. {attempts_left} attempts remaining."}), 401

@app.route('/api/auth/google', methods=['POST'])
def api_google_login():
    data = request.json
    token = data.get('credential')
    client_id = data.get('clientId')
    
    if not token or not client_id:
        return jsonify({"success": False, "message": "Missing Google payload"}), 400
        
    try:
        # Validate the JWT natively using Google's Python SDK
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
        
        google_id = idinfo["sub"]
        email = idinfo.get("email")
        # Base username strategy from email prefix
        base_username = email.split('@')[0] if email else f"User{google_id[:6]}"
        
        user = User.query.filter_by(google_id=google_id).first()
        
        if not user:
            # Handle potential username collisions automatically during first creation
            candidate = base_username
            attempt = 1
            while User.query.filter_by(username=candidate).first():
                candidate = f"{base_username}{attempt}"
                attempt += 1

            user = User(
                username=candidate,
                email=email,
                google_id=google_id,
                # Force last_username_change to 7 days ago initially so they can change auto-generated names immediately
                last_username_change=datetime.utcnow() - timedelta(days=8)
            )
            db.session.add(user)
            db.session.commit()
            
        login_user(user, remember=True)
        return jsonify({"success": True})
    except ValueError:
        return jsonify({"success": False, "message": "Invalid Google token"}), 401

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or len(username) < 5:
        return jsonify({"success": False, "message": "Username must be at least 5 characters long."})
        
    if not password or len(password) < 8:
        return jsonify({"success": False, "message": "Password must be at least 8 characters long."})
    if not re.search(r"[a-z]", password):
        return jsonify({"success": False, "message": "Password must contain at least one lowercase letter."})
    if not re.search(r"[A-Z]", password):
        return jsonify({"success": False, "message": "Password must contain at least one uppercase letter."})
    if not re.search(r"[0-9]", password):
        return jsonify({"success": False, "message": "Password must contain at least one number."})
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return jsonify({"success": False, "message": "Password must contain at least one special character."})
    
    if User.query.filter_by(username=username).first():
        return jsonify({"success": False, "message": "Username already exists. Please choose a new combination."})
    
    new_user = User(
        username=username, 
        password_hash=generate_password_hash(password),
        last_username_change=datetime.utcnow() # Lock them for 7 days upon standard creation
    )
    db.session.add(new_user)
    db.session.commit()
    
    # Auto-login after registration
    login_user(new_user)
    return jsonify({"success": True})

@app.route('/api/admin/users', methods=['GET'])
@login_required
def api_admin_users():
    if not current_user.email or current_user.email.strip().lower() != 'adityajadhav300405@gmail.com':
        return jsonify({"success": False, "message": "FORBIDDEN: Admin access only."}), 403
    
    users = User.query.all()
    user_data = []
    for u in users:
        auth_type = "Google" if u.google_id else "Password"
        user_data.append({
            "id": u.id,
            "username": u.username,
            "email": u.email or "Unassigned",
            "auth_type": auth_type,
            "last_username_change": u.last_username_change.isoformat() if u.last_username_change else None,
            "ai_data_optin": u.ai_data_optin
        })
        
    return jsonify({
        "success": True,
        "users": user_data
    })

@app.route('/api/me', methods=['GET'])
@login_required
def api_me():
    last_change = current_user.last_username_change
    days_since_change = (datetime.utcnow() - last_change).days if last_change else 999
    is_locked = days_since_change < 7
    days_remaining = max(0, 7 - days_since_change)
    
    return jsonify({
        "success": True,
        "user": {
            "username": current_user.username,
            "email": current_user.email,
            "is_locked": is_locked,
            "days_remaining": days_remaining,
            "is_google": current_user.google_id is not None
        }
    })

@app.route('/api/update_username', methods=['POST'])
@login_required
def api_update_username():
    data = request.json
    new_username = data.get('new_username')
    
    if not new_username or len(new_username) < 5:
        return jsonify({"success": False, "message": "Username must be at least 5 characters long."})
        
    if current_user.username == new_username:
         return jsonify({"success": False, "message": "This is already your username."})
         
    # Enforce 7 day lockout
    if current_user.last_username_change:
        days_since_change = (datetime.utcnow() - current_user.last_username_change).days
        if days_since_change < 7:
            return jsonify({"success": False, "message": f"You changed your username recently. Please wait {7 - days_since_change} more days."})

    # Ensure absolute uniqueness
    if User.query.filter_by(username=new_username).first():
        return jsonify({"success": False, "message": "Username already exists. Please choose a new combination."})
        
    current_user.username = new_username
    current_user.last_username_change = datetime.utcnow()
    db.session.commit()
    return jsonify({"success": True, "message": "Username updated successfully."})

@app.route('/api/update_optin', methods=['POST'])
@login_required
def api_update_optin():
    data = request.json
    optin_status = data.get('ai_data_optin')
    if optin_status is not None:
        current_user.ai_data_optin = bool(optin_status)
        db.session.commit()
        return jsonify({"success": True})
    return jsonify({"success": False}), 400

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
