import cv2
import subprocess
import requests
import json
import time
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

# Import configuration
try:
    from config import *
except ImportError:
    # Fallback configuration
    BACKEND_API_URL = "http://localhost:3000/api/cv/alpr"
    CAMERA_ID = "entrance_cam_001"
    PARKING_SPOT_ID = "your-parking-spot-uuid"
    EVENT_TYPE = "ENTRY"
    CONFIDENCE_THRESHOLD = 0.7
    DETECTION_COOLDOWN = 30
    SKIP_FRAMES = 5
    USE_WEBCAM = False
    VIDEO_PATH = "videos/car.mp4"
    LPR_SCRIPT_PATH = r"D:\CV_VW\Indian_LPR\infer_objectdet.py"

# -----------------------------
# Logging Setup
# -----------------------------
def log_message(message, level="INFO"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

# -----------------------------
# Haar Cascade for plate detection
# -----------------------------
plate_cascade_path = cv2.data.haarcascades + "haarcascade_russian_plate_number.xml"
plate_cascade = cv2.CascadeClassifier(plate_cascade_path)

if plate_cascade.empty():
    log_message("Failed to load Haar cascade classifier", "ERROR")
    exit(1)

# -----------------------------
# Thread pool for LPRNet and API calls
# -----------------------------
executor = ThreadPoolExecutor(max_workers=4)

# -----------------------------
# Recently detected plates tracking
# -----------------------------
recent_detections = {}  # vehicle_number -> last_detection_time

def should_process_detection(vehicle_number):
    """Check if we should process this detection (avoid spam)"""
    current_time = time.time()
    if vehicle_number in recent_detections:
        time_diff = current_time - recent_detections[vehicle_number]
        if time_diff < DETECTION_COOLDOWN:
            return False
    
    recent_detections[vehicle_number] = current_time
    return True

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
        
        # Add image URL if available
        if image_path and os.path.exists(image_path):
            data["imageUrl"] = f"file://{os.path.abspath(image_path)}"
        
        log_message(f"Sending {EVENT_TYPE} event for vehicle {vehicle_number} to backend...")
        
        # Send to backend
        response = requests.post(
            BACKEND_API_URL,
            json=data,
            timeout=10,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            log_message(f"✅ Backend success: {result.get('message', '')}")
            if 'data' in result:
                log_message(f"Booking ID: {result['data'].get('bookingId', 'N/A')}")
            return True
        else:
            log_message(f"❌ Backend error {response.status_code}: {response.text}", "ERROR")
            return False
            
    except requests.exceptions.RequestException as e:
        log_message(f"❌ Network error: {e}", "ERROR")
        return False
    except Exception as e:
        log_message(f"❌ Error sending to backend: {e}", "ERROR")
        return False

def extract_plate_text(img_crop, save_image=False):
    """Run LPRNet on cropped plate image"""
    timestamp = int(time.time())
    temp_path = f"temp_plates/plate_{timestamp}_{CAMERA_ID}.jpg"
    
    # Create temp directory if it doesn't exist
    os.makedirs("temp_plates", exist_ok=True)
    
    cv2.imwrite(temp_path, img_crop)
    
    try:
        result = subprocess.run(
            ["python", LPR_SCRIPT_PATH, "--source", temp_path],
            capture_output=True, text=True, timeout=10
        )
        output = result.stdout.strip()
        
        plate_number = None
        for line in output.splitlines():
            if "Predicted Plate:" in line:
                plate_number = line.split(":")[-1].strip()
                break
        
        if not save_image:
            # Clean up temp file if not saving
            try:
                os.remove(temp_path)
            except:
                pass
        
        return plate_number, temp_path if save_image else None
        
    except subprocess.TimeoutExpired:
        log_message("LPR inference timeout", "WARN")
        return None, None
    except Exception as e:
        log_message(f"LPR inference error: {e}", "ERROR")
        return None, None

def async_extract_plate_text(img_crop):
    return executor.submit(extract_plate_text, img_crop, save_image=True)

# -----------------------------
# Video Processing
# -----------------------------
def main():
    log_message(f"🚀 Starting ALPR system for {EVENT_TYPE} camera: {CAMERA_ID}")
    log_message(f"Backend API: {BACKEND_API_URL}")
    log_message(f"Parking Spot ID: {PARKING_SPOT_ID}")
    
    # Initialize video capture
    if USE_WEBCAM:
        cap = cv2.VideoCapture(0)
        log_message("Using webcam for video input")
    else:
        cap = cv2.VideoCapture(VIDEO_PATH)
        log_message(f"Using video file: {VIDEO_PATH}")
    
    if not cap.isOpened():
        log_message("Failed to open video source", "ERROR")
        return
    
    cv2.namedWindow("ALPR Detection", cv2.WINDOW_NORMAL)
    
    frame_count = 0
    detection_count = 0
    
    log_message("🎥 Video processing started. Press ESC to exit.")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            if not USE_WEBCAM:
                log_message("Video ended", "INFO")
                break
            else:
                continue

        frame_count += 1
        if frame_count % SKIP_FRAMES != 0:
            cv2.imshow("ALPR Detection", frame)
            if cv2.waitKey(1) & 0xFF == 27:  # ESC key
                break
            continue

        # Convert to grayscale for detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        plates = plate_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=4, 
            minSize=(60, 20)
        )

        if len(plates) == 0:
            cv2.imshow("ALPR Detection", frame)
            if cv2.waitKey(1) & 0xFF == 27:
                break
            continue

        futures = []
        plate_coords = []

        # Process detected plates
        for (x, y, w, h) in plates:
            plate_crop = frame[y:y+h, x:x+w]
            plate_coords.append((x, y, w, h))
            futures.append(async_extract_plate_text(plate_crop))
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

        # Process results
        for i, future in enumerate(futures):
            plate_result = future.result()
            if plate_result[0]:  # plate_number
                plate_number, image_path = plate_result
                detection_count += 1
                
                x, y, w, h = plate_coords[i]
                
                # Calculate confidence (you might want to enhance this)
                confidence = min(0.95, 0.75 + (w * h) / 10000)  # Simple confidence based on detection size
                
                log_message(f"🔍 Detected plate: {plate_number} (confidence: {confidence:.2f})")
                
                # Check if we should process this detection
                if should_process_detection(plate_number) and confidence >= CONFIDENCE_THRESHOLD:
                    log_message(f"🚗 Processing {EVENT_TYPE} for vehicle: {plate_number}")
                    
                    # Send to backend asynchronously
                    executor.submit(send_to_backend, plate_number, confidence, image_path)
                else:
                    log_message(f"⏭️ Skipping {plate_number} (recent detection or low confidence)")
                
                # Display on frame
                cv2.putText(frame, f"{plate_number} ({confidence:.2f})", 
                           (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        # Add info overlay
        info_text = f"{EVENT_TYPE} Cam | Detections: {detection_count} | Frame: {frame_count}"
        cv2.putText(frame, info_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        cv2.imshow("ALPR Detection", frame)
        if cv2.waitKey(1) & 0xFF == 27:  # ESC key
            break

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    executor.shutdown(wait=True)
    
    log_message(f"🏁 ALPR system stopped. Total detections: {detection_count}")

if __name__ == "__main__":
    main()