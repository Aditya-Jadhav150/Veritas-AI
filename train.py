from PIL import ImageFilter

# Define a custom wrapper to systematically inject High-Frequency Edge signals into the Convolution pipeline
class EdgeEnhanceTransform:
    def __call__(self, img):
        import random
        if random.random() > 0.5:
            return img.filter(ImageFilter.EDGE_ENHANCE_MORE)
        return img

def main():
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torchvision import datasets, transforms
    import timm
    from torch.utils.data import DataLoader

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("Using:", device)

    from torch.optim.lr_scheduler import StepLR



    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        EdgeEnhanceTransform(),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    train_data = datasets.ImageFolder("dataset/processed_train", transform=train_transform)
    val_data = datasets.ImageFolder("dataset/processed_val", transform=val_transform)

    print("Class mapping:", train_data.class_to_idx)

    train_loader = DataLoader(
        train_data,
        batch_size=32,
        shuffle=True,
        num_workers=2,
        pin_memory=True
    )

    val_loader = DataLoader(
        val_data,
        batch_size=32,
        num_workers=2,
        pin_memory=True
    )

    # Transitioned from 2015 ResNet18 to bleeding-edge EfficientNet-B3 SOTA architecture
    model = timm.create_model('efficientnet_b3', pretrained=True, num_classes=2, drop_rate=0.5)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.0001, weight_decay=1e-4)
    scheduler = StepLR(optimizer, step_size=3, gamma=0.1)

    epochs = 10
    best_val_acc = 0.0

    try:
        for epoch in range(epochs):
            model.train()
        total_loss = 0

        # Booting up NVIDIA Automatic Mixed Precision (AMP) logic
        scaler = torch.amp.GradScaler('cuda')

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            
            # Autocasting triggers the Tensor Cores into FP16 hyper-processing for exactly this block
            with torch.amp.autocast('cuda'):
                outputs = model(images)
                loss = criterion(outputs, labels)

            # Scaling backwards intercepts underflowing FP16 gradients natively
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)

        model.eval()
        correct = 0
        total = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)

                outputs = model(images)
                _, predicted = torch.max(outputs, 1)

                total += labels.size(0)
                correct += (predicted == labels).sum().item()

        val_acc = 100 * correct / total

        print(f"Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.4f}, Val Accuracy: {val_acc:.2f}%")
        
        # Immediate Checkpointing for the best model so far
        if val_acc >= best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), "model_best.pth")
            print("--> Best model checkpoint completely secured (model_best.pth).")
            
        scheduler.step()

    except KeyboardInterrupt:
        print("\n[!] Training halted manually by user. The highest accuracy checkpoint is completely saved as 'model_best.pth'!")
    
    torch.save(model.state_dict(), "model.pth")
    print("\nTraining procedure officially terminated. 'model.pth' securely written to disk!")

if __name__ == "__main__":
    main()