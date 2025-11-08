import cv2
import torch
import torch.nn as nn
from torchvision import models, transforms
from ultralytics import YOLO
from PIL import Image
import numpy as np

# -----------------------------
# Paths
# -----------------------------
video_path = r"D:\CV_VW\videos\parking.MOV"
yolo_model_path = r"D:\CV_VW\YOLO_training\runs\detect\parking_yolo5\weights\best.pt"
cnn_weights_path = r"D:\CV_VW\outputs\checkpoints\epoch_5.pth"

device = "cuda" if torch.cuda.is_available() else "cpu"

# -----------------------------
# Load YOLO and CNN
# -----------------------------
yolo_model = YOLO(yolo_model_path)

def build_model(num_classes=2):
    model = models.resnet18(pretrained=True)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model

cnn_model = build_model()
cnn_model.load_state_dict(torch.load(cnn_weights_path, map_location=device))
cnn_model.to(device)
cnn_model.eval()

transform = transforms.Compose([
    transforms.Resize((128,128)),
    transforms.ToTensor(),
    transforms.Normalize([0.5,0.5,0.5],[0.5,0.5,0.5])
])

# -----------------------------
# Slot management
# -----------------------------
camera_slots = {}

def iou(boxA, boxB):
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    interArea = max(0, xB - xA) * max(0, yB - yA)
    boxAArea = (boxA[2]-boxA[0])*(boxA[3]-boxA[1])
    boxBArea = (boxB[2]-boxB[0])*(boxB[3]-boxB[1])
    return interArea / float(boxAArea + boxBArea - interArea + 1e-6)

def draw_block_dashboard(slots, block_size=50, padding=10):
    total_slots = len(slots)
    if total_slots == 0:
        return np.zeros((200,600,3), dtype=np.uint8)
    cols = min(10, total_slots)
    rows = (total_slots + cols - 1) // cols
    canvas_width = cols*(block_size+padding)+padding
    canvas_height = rows*(block_size+padding)+padding
    canvas = np.zeros((canvas_height, canvas_width,3), dtype=np.uint8)
    for idx, slot in enumerate(slots):
        row = idx // cols
        col = idx % cols
        x1 = padding + col*(block_size+padding)
        y1 = padding + row*(block_size+padding)
        x2 = x1 + block_size
        y2 = y1 + block_size
        color = (0,255,0) if slot["status"]=="Free" else (0,0,255)
        cv2.rectangle(canvas,(x1,y1),(x2,y2),color,-1)
        cv2.putText(canvas, slot["slot_id"].split("_")[-1], (x1+5,y1+block_size-5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5,(255,255,255),1)
    return canvas

# -----------------------------
# Open video
# -----------------------------
cap = cv2.VideoCapture(video_path)
camera_name = "Cam1"
if camera_name not in camera_slots:
    camera_slots[camera_name] = []

cv2.namedWindow("Parking Slot Video", cv2.WINDOW_NORMAL)
cv2.resizeWindow("Parking Slot Video", 1000, 750)
cv2.namedWindow("Block Dashboard", cv2.WINDOW_NORMAL)
cv2.resizeWindow("Block Dashboard", 800, 400)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = yolo_model.predict(source=img_rgb, imgsz=1000, conf=0.3, verbose=False)
    detections = results[0].boxes if len(results)>0 else []
    
    for box in detections:
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        slot_crop = img_rgb[y1:y2, x1:x2]
        if slot_crop.size == 0:
            continue
        slot_pil = Image.fromarray(slot_crop)
        slot_tensor = transform(slot_pil).unsqueeze(0).to(device)
        with torch.no_grad():
            output = cnn_model(slot_tensor)
            pred = torch.argmax(output, dim=1).item()
        status = "Occupied" if pred==1 else "Free"
        
        # Match with existing slots
        matched=False
        for slot in camera_slots[camera_name]:
            if iou(slot["coords"],[x1,y1,x2,y2])>0.5:
                slot["status"]=status
                slot["coords"]=[x1,y1,x2,y2]
                matched=True
                break
        if not matched:
            slot_id = f"{camera_name}_{len(camera_slots[camera_name])+1}"
            camera_slots[camera_name].append({
                "slot_id": slot_id,
                "coords":[x1,y1,x2,y2],
                "status":status
            })
    
    # Draw main video
    for slot in camera_slots[camera_name]:
        x1, y1, x2, y2 = slot["coords"]
        color = (0,255,0) if slot["status"]=="Free" else (0,0,255)
        cv2.rectangle(frame,(x1,y1),(x2,y2),color,2)
        cv2.putText(frame,f"{slot['slot_id']} ({slot['status']})",(x1,y1-20),
                    cv2.FONT_HERSHEY_SIMPLEX,0.6,color,2)
        width, height = x2-x1, y2-y1
        cv2.putText(frame,f"{width}x{height}",(x1,y2+20),
                    cv2.FONT_HERSHEY_SIMPLEX,0.5,(255,255,0),2)
    
    # Dashboard counts
    free_count = sum(1 for s in camera_slots[camera_name] if s["status"]=="Free")
    occ_count = sum(1 for s in camera_slots[camera_name] if s["status"]=="Occupied")
    total_slots = len(camera_slots[camera_name])
    cv2.rectangle(frame,(10,10),(320,110),(0,0,0),-1)
    cv2.putText(frame,f"Total: {total_slots}",(20,40),cv2.FONT_HERSHEY_SIMPLEX,0.7,(255,255,255),2)
    cv2.putText(frame,f"Free: {free_count}",(20,70),cv2.FONT_HERSHEY_SIMPLEX,0.7,(0,255,0),2)
    cv2.putText(frame,f"Occupied: {occ_count}",(20,100),cv2.FONT_HERSHEY_SIMPLEX,0.7,(0,0,255),2)
    
    cv2.imshow("Parking Slot Video",frame)
    dashboard_img = draw_block_dashboard(camera_slots[camera_name])
    cv2.imshow("Block Dashboard",dashboard_img)
    
    key = cv2.waitKey(30)
    if key==27:  # ESC
        break

cap.release()
cv2.destroyAllWindows()
