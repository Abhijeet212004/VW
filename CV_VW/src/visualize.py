import matplotlib.pyplot as plt
import torch
from torchvision import transforms
from PIL import Image
from src.model import build_model

def visualize_prediction(image_path, weights_path="outputs/checkpoints/epoch_5.pth"):
    device = "cuda" if torch.cuda.is_available() else "cpu"

    transform = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
    ])

    model = build_model()
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model = model.to(device)
    model.eval()

    image = Image.open(image_path).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(tensor)
        pred = torch.argmax(output, dim=1).item()

    label = "Occupied" if pred == 1 else "Free"
    color = "red" if pred == 1 else "green"

    plt.imshow(image)
    plt.title(f"{label}", color=color, fontsize=16)
    plt.axis("off")
    plt.show()
