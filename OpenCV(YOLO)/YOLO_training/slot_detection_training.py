from ultralytics import YOLO

# Load pre-trained YOLOv8 nano model
model = YOLO("yolov8n.pt")

# Train
model.train(
    data="parking.yaml",  # dataset yaml
    epochs=10,            # adjust for accuracy
    imgsz=640,            # image size
    batch=8,              # adjust to memory
    name="parking_yolo"   # model save name
)
