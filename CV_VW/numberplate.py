import cv2
import subprocess
import requests
import json
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

# -----------------------------
# Configuration
# -----------------------------
BACKEND_API_URL = "http://localhost:3000/api/cv/alpr"
CAMERA_ID = "entrance_cam_001"  # Change this based on camera location
PARKING_SPOT_ID = "your-parking-spot-uuid"  # Replace with actual parking spot ID
EVENT_TYPE = "ENTRY"  # Change to "EXIT" for exit camera
CONFIDENCE_THRESHOLD = 0.7

# -----------------------------
# Paths
# -----------------------------
video_path = r"videos/car.mp4"  # or 0 for webcam
lpr_infer_script = r"D:\CV_VW\Indian_LPR\infer_objectdet.py"

# -----------------------------
# Haar Cascade for plate detection
# -----------------------------
plate_cascade_path = cv2.data.haarcascades + "haarcascade_russian_plate_number.xml"
plate_cascade = cv2.CascadeClassifier(plate_cascade_path)

# -----------------------------
# Thread pool for LPRNet
# -----------------------------
executor = ThreadPoolExecutor(max_workers=2)

def send_to_backend(vehicle_number, confidence, image_path=None):
    """Send detected plate to backend API"""
    try:
        # Prepare data for backend
        data = {
            "vehicleNumber": vehicle_number,
            "eventType": EVENT_TYPE,
            "confidence": confidence,
            "cameraId": CAMERA_ID,
            "parkingSpotId": PARKING_SPOT_ID,
        }
        
        # Add image URL if available (you might want to upload image to cloud storage first)
        if image_path:
            data["imageUrl"] = f"file://{image_path}"
        
        # Send to backend
        response = requests.post(
            BACKEND_API_URL,
            json=data,
            timeout=10,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Successfully sent to backend: {result.get('message', '')}")
            return True
        else:
            print(f"❌ Backend error {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error sending to backend: {e}")
        return False
    except Exception as e:
        print(f"❌ Error sending to backend: {e}")
        return False

def extract_plate_text(img_crop, save_image=False):
    """Run LPRNet on cropped plate image"""
    timestamp = int(time.time())
    temp_path = f"temp_plate_{timestamp}.jpg"
    
    if save_image:
        cv2.imwrite(temp_path, img_crop)
    else:
        cv2.imwrite(temp_path, img_crop)
    
    result = subprocess.run(
        ["python", lpr_infer_script, "--source", temp_path],
        capture_output=True, text=True
    )
    output = result.stdout.strip()
    
    plate_number = None
    for line in output.splitlines():
        if "Predicted Plate:" in line:
            plate_number = line.split(":")[-1].strip()
            break
    
    # Clean up temp file
    try:
        import os
        os.remove(temp_path)
    except:
        pass
        
    return plate_number

def async_extract_plate_text(img_crop):
    return executor.submit(extract_plate_text, img_crop, save_image=True)

# -----------------------------
# Recently detected plates tracking
# -----------------------------
recent_detections = {}  # vehicle_number -> last_detection_time
DETECTION_COOLDOWN = 30  # seconds before sending same plate again

def should_process_detection(vehicle_number):
    """Check if we should process this detection (avoid spam)"""
    current_time = time.time()
    if vehicle_number in recent_detections:
        time_diff = current_time - recent_detections[vehicle_number]
        if time_diff < DETECTION_COOLDOWN:
            return False
    
    recent_detections[vehicle_number] = current_time
    return True

# -----------------------------
# Video Processing
# -----------------------------
cap = cv2.VideoCapture(video_path)
cv2.namedWindow("LPR Detection", cv2.WINDOW_NORMAL)

frame_count = 0
skip_frames = 5  # process every 5th frame

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1
    if frame_count % skip_frames != 0:
        cv2.imshow("LPR Detection", frame)
        if cv2.waitKey(1) & 0xFF == 27:
            break
        continue

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    plates = plate_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 20))

    futures = []
    plate_coords = []

    for (x, y, w, h) in plates:
        plate_crop = frame[y:y+h, x:x+w]
        plate_coords.append((x, y, w, h))
        futures.append(async_extract_plate_text(plate_crop))
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

    for i, future in enumerate(futures):
        plate_number = future.result()
        if plate_number:
            print("Detected Plate:", plate_number)
            x, y, w, h = plate_coords[i]
            
            # Calculate confidence (you might want to get this from the LPRNet output)
            confidence = 0.85  # Default confidence, modify based on actual LPRNet output
            
            # Check if we should process this detection
            if should_process_detection(plate_number) and confidence >= CONFIDENCE_THRESHOLD:
                print(f"🚗 Processing {EVENT_TYPE} for vehicle: {plate_number}")
                
                # Send to backend in a separate thread to avoid blocking video processing
                def send_async():
                    send_to_backend(plate_number, confidence)
                
                # Use thread pool to send to backend without blocking
                executor.submit(send_async)
            else:
                print(f"⏭️  Skipping {plate_number} (recent detection or low confidence)")
            
            cv2.putText(frame, plate_number, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    cv2.imshow("LPR Detection", frame)
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
executor.shutdown()
