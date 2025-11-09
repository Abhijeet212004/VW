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
base_dir = r"D:\CV_VW\FULL_IMAGE_1000x750\OVERCAST"
yolo_model_path = r"D:\CV_VW\YOLO_training\runs\detect\parking_yolo5\weights\best.pt"
cnn_weights_path = r"D:\CV_VW\outputs\checkpoints\epoch_5.pth"

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
# Video-like Display
# -----------------------------
cv2.namedWindow("Parking Slot Detection", cv2.WINDOW_NORMAL)
cv2.resizeWindow("Parking Slot Detection", 1000, 750)

for day_folder in sorted(os.listdir(base_dir)):
    day_path = os.path.join(base_dir, day_folder)
    if not os.path.isdir(day_path):
        continue

    for cam_folder in sorted(os.listdir(day_path)):
        cam_path = os.path.join(day_path, cam_folder)
        if not os.path.isdir(cam_path):
            continue

        print(f"🎥 Playing {day_folder}/{cam_folder}")

        for img_file in sorted(os.listdir(cam_path)):
            if not (img_file.lower().endswith(".jpg") or img_file.lower().endswith(".png")):
                continue

            img_path = os.path.join(cam_path, img_file)
            img = cv2.imread(img_path)
            if img is None:
                continue

            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            h, w, _ = img.shape

            # YOLO detection
            results = yolo_model.predict(source=img_rgb, imgsz=1000, conf=0.3, verbose=False)
            detections = results[0].boxes if len(results) > 0 else []

            # Draw each slot
            for box in detections:
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                conf = box.conf.item() if hasattr(box, "conf") else 0.0
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w - 1, x2), min(h - 1, y2)

                slot_crop = img_rgb[y1:y2, x1:x2]
                if slot_crop.size == 0:
                    continue

                slot_pil = Image.fromarray(slot_crop)
                slot_tensor = transform(slot_pil).unsqueeze(0).to(device)
                with torch.no_grad():
                    output = cnn_model(slot_tensor)
                    pred = torch.argmax(output, dim=1).item()

                # Status and visualization
                status = "Occupied" if pred == 1 else "Free"
                color = (0, 0, 255) if pred == 1 else (0, 255, 0)
                label = f"{status} {conf:.2f}"

                cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                cv2.putText(img, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            # Display like a video
            cv2.imshow("Parking Slot Detection", img)
            key = cv2.waitKey(50)  # 20 FPS (lower = faster)

            if key == 27:  # ESC to exit
                cv2.destroyAllWindows()
                exit()

cv2.destroyAllWindows()
print("\n✅ Video-like display completed!")
