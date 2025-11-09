import os
import torch
import torch.nn as nn
from torchvision import models, transforms
import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image
import json
from threading import Event
from typing import Callable, Optional
import threading
import httpx

# -----------------------------
# Paths
# -----------------------------
base_dir = "/Users/abhijeet/Documents/TechWagon/CV_VW/FULL_IMAGE_1000x750/OVERCAST"
yolo_model_path = "/Users/abhijeet/Documents/TechWagon/CV_VW/YOLO_training/runs/detect/parking_yolo5/weights/best.pt"
cnn_weights_path = "/Users/abhijeet/Documents/TechWagon/CV_VW/outputs/checkpoints/epoch_5.pth"

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
# Slot Registration (per camera)
# -----------------------------
camera_slots = {}  # holds permanent slots per camera

def iou(boxA, boxB):
    """Compute IoU between two boxes."""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    interArea = max(0, xB - xA) * max(0, yB - yA)
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    return interArea / float(boxAArea + boxBArea - interArea + 1e-6)

# -----------------------------
# Function to draw block dashboard
# -----------------------------
def draw_block_dashboard(slots, block_size=50, padding=10):
    total_slots = len(slots)
    if total_slots == 0:
        return np.zeros((200, 600, 3), dtype=np.uint8)

    cols = min(10, total_slots)
    rows = (total_slots + cols - 1) // cols
    canvas_width = cols * (block_size + padding) + padding
    canvas_height = rows * (block_size + padding) + padding
    canvas = np.zeros((canvas_height, canvas_width, 3), dtype=np.uint8)

    for idx, slot in enumerate(slots):
        row = idx // cols
        col = idx % cols
        x1 = padding + col * (block_size + padding)
        y1 = padding + row * (block_size + padding)
        x2 = x1 + block_size
        y2 = y1 + block_size

        color = (0, 255, 0) if slot["status"] == "Free" else (0, 0, 255)
        cv2.rectangle(canvas, (x1, y1), (x2, y2), color, -1)
        cv2.putText(canvas, str(slot["slot_number"]), (x1 + 5, y1 + block_size - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    
    return canvas

# -----------------------------
# Create windows
# -----------------------------
cv2.namedWindow("Parking Slot Detection", cv2.WINDOW_NORMAL)
cv2.resizeWindow("Parking Slot Detection", 1000, 750)

cv2.namedWindow("Block Dashboard", cv2.WINDOW_NORMAL)
cv2.resizeWindow("Block Dashboard", 800, 400)

# -----------------------------
# Function to post slot updates in bulk
# -----------------------------
def post_slots_bulk(camera, slots):
    def _post():
        try:
            url = "http://localhost:3000/api/slot-details/event"
            headers = {
                "accept": "application/json",
                "Content-Type": "application/json"
            }
            for s in slots:
                payload = {
                    "parkingSpotId": "760f4dd0-86ac-42d7-96c9-2867dc9bc882",  # PICT Main Campus Parking
                    "slotNumber": s["slot_number"],
                    "eventType": "SLOT_UPDATE",
                    "status": s["status"].upper()  # "FREE" or "OCCUPIED"
                }
                r = httpx.post(url, json=payload, headers=headers, timeout=5.0)
                print(f"POST Slot {s['slot_number']} -> {r.status_code}")
        except Exception as e:
            print(f"Failed to post slots for camera {camera}: {e}")
    
    threading.Thread(target=_post, daemon=True).start()

# -----------------------------
# Main loop
# -----------------------------
def run_dashboard(stop_event: Optional[Event] = None, base_dir_override: Optional[str] = None):
    _base_dir = base_dir_override or base_dir

    for day_folder in sorted(os.listdir(_base_dir)):
        day_path = os.path.join(_base_dir, day_folder)
        if not os.path.isdir(day_path):
            continue

        for cam_folder in sorted(os.listdir(day_path)):
            if stop_event and stop_event.is_set():
                cv2.destroyAllWindows()
                return
            cam_path = os.path.join(day_path, cam_folder)
            if not os.path.isdir(cam_path):
                continue

            # Register camera if not present
            if cam_folder not in camera_slots:
                camera_slots[cam_folder] = []

            for img_file in sorted(os.listdir(cam_path)):
                if stop_event and stop_event.is_set():
                    cv2.destroyAllWindows()
                    return
                if not (img_file.lower().endswith(".jpg") or img_file.lower().endswith(".png")):
                    continue

                img_path = os.path.join(cam_path, img_file)
                img = cv2.imread(img_path)
                if img is None:
                    continue

                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

                # YOLO detection
                results = yolo_model.predict(source=img_rgb, imgsz=1000, conf=0.3, verbose=False)
                detections = results[0].boxes if len(results) > 0 else []

                # Update slot statuses
                # Limit to 55 detections max
                limited_detections = detections[:55] if len(detections) > 55 else detections
                
                for idx, box in enumerate(limited_detections):
                    if idx >= 55:  # Hard limit to 55 slots
                        break
                        
                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                    slot_crop = img_rgb[y1:y2, x1:x2]
                    if slot_crop.size == 0:
                        continue

                    slot_pil = Image.fromarray(slot_crop)
                    slot_tensor = transform(slot_pil).unsqueeze(0).to(device)
                    with torch.no_grad():
                        output = cnn_model(slot_tensor)
                        pred = torch.argmax(output, dim=1).item()

                    status = "Occupied" if pred == 1 else "Free"
                    slot_number = idx + 1  # Slot numbers 1-55
                    
                    # Update or create slot with specific slot number
                    if len(camera_slots[cam_folder]) <= idx:
                        camera_slots[cam_folder].append({
                            "slot_number": slot_number,
                            "coords": [x1, y1, x2, y2],
                            "status": status
                        })
                    else:
                        camera_slots[cam_folder][idx]["status"] = status
                        camera_slots[cam_folder][idx]["coords"] = [x1, y1, x2, y2]

                # Post all slots for this camera
                post_slots_bulk(cam_folder, camera_slots[cam_folder])

                # Draw main video boxes
                for slot in camera_slots[cam_folder]:
                    x1, y1, x2, y2 = slot["coords"]
                    color = (0, 255, 0) if slot["status"] == "Free" else (0, 0, 255)
                    cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(img, f"Slot {slot['slot_number']} ({slot['status']})", (x1, y1 - 5),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                # Overlay counts
                free_count = sum(1 for s in camera_slots[cam_folder] if s["status"] == "Free")
                occ_count = sum(1 for s in camera_slots[cam_folder] if s["status"] == "Occupied")
                total_slots = len(camera_slots[cam_folder])

                cv2.rectangle(img, (10, 10), (320, 110), (0, 0, 0), -1)
                cv2.putText(img, f"Total: {total_slots}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)
                cv2.putText(img, f"Free: {free_count}", (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0), 2)
                cv2.putText(img, f"Occupied: {occ_count}", (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255), 2)

                # Show windows
                cv2.imshow("Parking Slot Detection", img)
                dashboard_img = draw_block_dashboard(camera_slots[cam_folder])
                cv2.imshow("Block Dashboard", dashboard_img)

                key = cv2.waitKey(50)
                if key == 27:
                    cv2.destroyAllWindows()
                    return

    cv2.destroyAllWindows()
    print("\n✅ Permanent slot tracking completed!")

# -----------------------------
# Run main
# -----------------------------
if __name__ == '__main__':
    run_dashboard()
