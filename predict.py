import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
from facenet_pytorch import MTCNN

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using:", device)
mtcnn = MTCNN(keep_all=False, device=device)

# Load state-of-the-art Hugging Face Vision Transformer for Deepfake Detection
model_id = "prithivMLmods/Deep-Fake-Detector-v2-Model"
print(f"Loading Hugging Face ViT [{model_id}]... (This may take a moment to download weights on first run)")
processor = AutoImageProcessor.from_pretrained(model_id)
model = AutoModelForImageClassification.from_pretrained(model_id).to(device)
model.eval()

def predict(image_path):
    image = Image.open(image_path).convert("RGB")
    
    # Transformer Inference (The ViT is trained on global image context, not just local cropped bounding boxes)
    inputs = processor(images=image, return_tensors="pt").to(device)
    
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        model_probs = torch.nn.functional.softmax(logits, dim=1)

    labels = model.config.id2label
    # Dynamically find which index maps to real/fake in case the hub model swaps them
    fake_prob = 0.0
    real_prob = 0.0
    for idx, label_name in labels.items():
        prob = model_probs[0][idx].item()
        l = label_name.lower()
        if 'fake' in l or 'deepfake' in l or 'spoof' in l:
            fake_prob += prob
        elif 'real' in l or 'pristine' in l:
            real_prob += prob

    # Fallback to direct argmax if labels are ambiguous
    if fake_prob == 0 and real_prob == 0:
        pred_idx = torch.argmax(model_probs, dim=1).item()
        print(f"\nRaw Hub Label mapped: {labels[pred_idx]}")
        return

    print(f"\nFake: {fake_prob*100:.2f}%")
    print(f"Real: {real_prob*100:.2f}%")

    if real_prob > fake_prob:
        print("Prediction: REAL ✅")
    else:
        print("Prediction: FAKE ⚠️")

if __name__ == "__main__":
    import sys
    import os
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        predict(sys.argv[1])
    else:
        if os.path.exists("test.jpg"):
            predict("test.jpg")