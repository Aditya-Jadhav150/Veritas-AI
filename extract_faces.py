import os
import shutil
import cv2
from PIL import Image
import torch
from facenet_pytorch import MTCNN
from tqdm import tqdm

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Loading MTCNN onto {device}...")
mtcnn = MTCNN(keep_all=False, device=device)

# Base directories
BASE_VAL_DIR = "dataset/validation"
PROCESSED_TRAIN_DIR = "dataset/processed_train"
PROCESSED_VAL_DIR = "dataset/processed_val"

# Source directories
CIFAKE_TRAIN = "dataset/train"
CIFAKE_TEST = "dataset/test"
DEEPFAKE_DIR = "dataset/flickr_deepfake"

for p in [PROCESSED_TRAIN_DIR, PROCESSED_VAL_DIR]:
    os.makedirs(os.path.join(p, 'real'), exist_ok=True)
    os.makedirs(os.path.join(p, 'fake'), exist_ok=True)

def process_real_faces(src_dir, dest_dir):
    """
    This will be used for your new REAL dataset (e.g., FFHQ).
    We detect faces using NVIDIA-accelerated MTCNN and crop them for training.
    """
    print(f"Processing REAL images from {src_dir} to {dest_dir}...")
    if not os.path.exists(src_dir):
        print(f"Warning: {src_dir} not found. Skipping.")
        return

    for filename in tqdm(os.listdir(src_dir), desc="Extracting REAL Faces"):
        if not filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue
            
        src_path = os.path.join(src_dir, filename)
        dest_path = os.path.join(dest_dir, 'real', f"real_{filename}")
        
        try:
            img = Image.open(src_path).convert('RGB')
            img_cropped = mtcnn(img, save_path=None)
            
            if img_cropped is not None:
                mtcnn(img, save_path=dest_path)
            else:
                img = img.resize((224, 224))
                img.save(dest_path)
        except Exception as e:
            print(f"Error extracting face from {filename}: {e}")

def process_deepfake(src_dir, dest_dir):
    """
    flickr_deepfake images are full resolution with Real and Fake mixed.
    We detect faces using NVIDIA-accelerated MTCNN, crop them, and sort
    by checking if the filename implies a face-swap (e.g. contains an underscore).
    """
    print(f"Processing Deepfake (MTCNN Face Extraction) from {src_dir} to {dest_dir}...")
    if not os.path.exists(src_dir):
        print(f"Warning: {src_dir} not found. Skipping.")
        return

    for filename in tqdm(os.listdir(src_dir), desc="Extracting Faces"):
        if not filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue
            
        src_path = os.path.join(src_dir, filename)
        
        # Heuristic: If ID_ID.jpg format (has underscore), it is fake. Else real.
        if '_' in filename:
            dest_label = 'fake'
        else:
            dest_label = 'real'
            
        dest_path = os.path.join(dest_dir, dest_label, f"df_{filename}")
        
        try:
            img = Image.open(src_path).convert('RGB')
            # MTCNN cropping
            img_cropped = mtcnn(img, save_path=None)
            
            if img_cropped is not None:
                # MTCNN returns a tensor (C, H, W) normalized [-1, 1] if save_path is None
                # We can just extract the bounding box manually so we have PIL logic, 
                # but facenet_pytorch allows direct saving if we pass save_path.
                mtcnn(img, save_path=dest_path)
            else:
                # Fallback if MTCNN fails finding a face
                img = img.resize((224, 224))
                img.save(dest_path)
        except Exception as e:
            print(f"Error extracting face from {filename}: {e}")

if __name__ == "__main__":
    print("=== EXTRACTING REAL FFHQ FACES ===")
    
    # We successfully extracted the FAKE dataset, now we do the REAL one!
    process_real_faces("dataset/ffhq_real", PROCESSED_TRAIN_DIR)
    
    # process_deepfake(DEEPFAKE_DIR, PROCESSED_TRAIN_DIR) # Commented out to save you a 2.5 hour re-run!
    
    print("Real FFHQ Extraction Complete! All unified images are stored in dataset/processed_train.")
