import torch
from torch.utils.data import DataLoader
from torchvision import transforms
from src.dataset import ParkingDataset
from src.model import build_model

def evaluate_model(weights_path="outputs/checkpoints/epoch_5.pth"):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    transform = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
    ])

    # ✅ FIX: Added root_dir argument
    test_dataset = ParkingDataset(
    labels_file="./CNR_EXT/LABELS/test.txt",
    root_dir="./CNR_EXT/PATCHES/",
    transform=transform
    )


    test_loader = DataLoader(test_dataset, batch_size=32)

    model = build_model()
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model = model.to(device)
    model.eval()

    correct, total = 0, 0
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

    print(f"Test Accuracy: {100 * correct / total:.2f}%")
