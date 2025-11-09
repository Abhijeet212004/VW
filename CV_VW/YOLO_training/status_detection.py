import os
import torch
import torch.nn as nn
from torchvision import models, transforms
import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image

# -----------------------------
# Paths
# -----------------------------
yolo_model_path = r"D:\CV_VW\YOLO_training\runs\detect\parking_yolo5\weights\best.pt"
cnn_weights_path = r"D:\CV_VW\outputs\checkpoints\epoch_5.pth"
image_path = r"D:\CV_VW\FULL_IMAGE_1000x750\OVERCAST\2015-11-25\camera9\2015-11-25_1417.jpg"
output_path = r"D:\CV_VW\YOLO_training\output\final_result.jpg"

# -----------------------------
# Device
# -----------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# -----------------------------
# Load YOLO Model
# -----------------------------
yolo_model = YOLO(yolo_model_path)

# -----------------------------
# Build and Load CNN Model
# -----------------------------
def build_model(num_classes=2):
    model = models.resnet18(pretrained=True)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model

cnn_model = build_model()
cnn_model.load_state_dict(torch.load(cnn_weights_path, map_location=device))
cnn_model.to(device)
cnn_model.eval()

# -----------------------------
# Image Transform for CNN
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

# -----------------------------
# Load Image
# -----------------------------
img = cv2.imread(image_path)
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
h, w, _ = img.shape

# -----------------------------
# YOLO Detection
# -----------------------------
results = yolo_model.predict(source=img_rgb, imgsz=1000, conf=0.3, verbose=False)
detections = results[0].boxes.xyxy.cpu().numpy() if len(results) > 0 else []

print(f"Detected {len(detections)} slots")

# -----------------------------
# Process Each Detected Slot
# -----------------------------
for box in detections:
    x1, y1, x2, y2 = map(int, box[:4])
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w - 1, x2), min(h - 1, y2)

    # Crop the slot region
    slot_crop = img_rgb[y1:y2, x1:x2]
    if slot_crop.size == 0:
        continue

    # Convert to PIL image for transform
    slot_pil = Image.fromarray(slot_crop)

    # Transform and predict using CNN
    slot_tensor = transform(slot_pil).unsqueeze(0).to(device)
    with torch.no_grad():
        output = cnn_model(slot_tensor)
        pred = torch.argmax(output, dim=1).item()

    # Map prediction to class
    status = "Occupied" if pred == 1 else "Free"
    color = (0, 0, 255) if pred == 1 else (0, 255, 0)

    # Draw Bounding Box and label
    cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
    cv2.putText(img, status, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

# -----------------------------
# Save Final Annotated Image
# -----------------------------
os.makedirs(os.path.dirname(output_path), exist_ok=True)
cv2.imwrite(output_path, img)
print(f"✅ Final annotated image saved at: {output_path}")
