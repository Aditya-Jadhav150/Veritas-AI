import os
import shutil
import random
from tqdm import tqdm

def split_dataset(train_dir, val_dir, split_ratio=0.1):
    random.seed(42)  # For reproducibility

    for class_name in ['real', 'fake']:
        src_folder = os.path.join(train_dir, class_name)
        dest_folder = os.path.join(val_dir, class_name)
        
        os.makedirs(dest_folder, exist_ok=True)
        
        if not os.path.exists(src_folder):
            print(f"Warning: {src_folder} not found. Skipping {class_name}.")
            continue
            
        files = [f for f in os.listdir(src_folder) if os.path.isfile(os.path.join(src_folder, f))]
        
        # Calculate exactly 10% split
        split_index = int(len(files) * split_ratio)
        
        print(f"Class '{class_name}': Found {len(files)} training images.")
        print(f"Class '{class_name}': Splicing {split_index} images to the validation set...")
        
        # Shuffle deterministically to prevent bias
        random.shuffle(files)
        val_files = files[:split_index]
        
        # Move files over to the validation array
        for file in tqdm(val_files, desc=f"Migrating {class_name} images"):
            src_path = os.path.join(src_folder, file)
            dest_path = os.path.join(dest_folder, file)
            shutil.move(src_path, dest_path)
            
        print(f"Class '{class_name}': Split operation permanently completed.\n")

if __name__ == "__main__":
    split_dataset("dataset/processed_train", "dataset/processed_val", split_ratio=0.1)
    print("=== SYNCHRONIZATION COMPLETE ===")
    print("DataLoader dependencies securely satisfied. Ready for pure model training.")
