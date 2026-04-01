import os
from PIL import Image

DATA_DIR = "dataset/processed_train"
REAL_DIR = os.path.join(DATA_DIR, "real")
FAKE_DIR = os.path.join(DATA_DIR, "fake")

def count_images(folder):
    try:
        return len([
            f for f in os.listdir(folder)
            if f.lower().endswith((".jpg", ".png", ".jpeg"))
        ])
    except FileNotFoundError:
        return 0

def verify_dataset():
    real_count = count_images(REAL_DIR)
    fake_count = count_images(FAKE_DIR)

    print("Dataset check:")
    print("Real images:", real_count)
    print("Fake images:", fake_count)

    if real_count == 0 or fake_count == 0:
        print("⚠️ Dataset incomplete or not found in dataset/processed_train!")
    else:
        print("✅ Dataset looks good")

if __name__ == "__main__":
    verify_dataset()
