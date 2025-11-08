import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import transforms
from tqdm import tqdm
import os

from src.dataset import ParkingDataset
from src.model import build_model

def train_model():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    transform = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
    ])

    train_dataset = ParkingDataset(
    label_file="./CNR_EXT/LABELS/train.txt",
    root_dir="./CNR_EXT",
    transform=transform
    )

    val_dataset = ParkingDataset(
    label_file="./CNR_EXT/LABELS/val.txt",
    root_dir="./CNR_EXT",
    transform=transform
    )


    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32)

    model = build_model()
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-4)

    os.makedirs("outputs/checkpoints", exist_ok=True)

    for epoch in range(5):
        model.train()
        running_loss = 0
        progress = tqdm(train_loader, desc=f"Epoch {epoch+1}/5", leave=False)
        for images, labels in progress:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
            progress.set_postfix(loss=loss.item())

        print(f"Epoch [{epoch+1}/5] Training Loss: {running_loss/len(train_loader):.4f}")

        # Validation
        model.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, preds = torch.max(outputs, 1)
                correct += (preds == labels).sum().item()
                total += labels.size(0)

        val_acc = 100 * correct / total
        print(f"Validation Accuracy: {val_acc:.2f}%")

        torch.save(model.state_dict(), f"outputs/checkpoints/epoch_{epoch+1}.pth")

    print("Training complete. Model saved.")
