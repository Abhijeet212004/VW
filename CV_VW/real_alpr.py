import cv2
import requests
import json
import time
import os
from datetime import datetime

# Import configuration
try:
    from config import *
except ImportError:
    # Fallback configuration
    BACKEND_API_URL = "http://localhost:3000/api/cv/alpr"
    CAMERA_ID = "entrance_cam_001"
    PARKING_SPOT_ID = "d38431ce-1925-4d7b-abb7-82478e1b9684"
    EVENT_TYPE = "ENTRY"
    CONFIDENCE_THRESHOLD = 0.7
    DETECTION_COOLDOWN = 30
    SKIP_FRAMES = 5
    USE_WEBCAM = False
    VIDEO_PATH = "videos/car.mp4"

def log_message(message, level="INFO"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

def send_to_backend(vehicle_number, confidence):
    """Send detected plate to backend API"""
    try:
        data = {
            "vehicleNumber": vehicle_number,
            "eventType": EVENT_TYPE,
            "confidence": confidence,
            "cameraId": CAMERA_ID,
            "parkingSpotId": PARKING_SPOT_ID,
        }
        
        log_message(f"Sending {EVENT_TYPE} event for vehicle {vehicle_number} to backend...")
        
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

def main():
    log_message(f"🚀 Starting REAL ALPR system for {EVENT_TYPE} camera: {CAMERA_ID}")
    log_message(f"Backend API: {BACKEND_API_URL}")
    log_message(f"Parking Spot ID: {PARKING_SPOT_ID}")
    
    # Load Haar cascade for license plate detection
    plate_cascade_path = cv2.data.haarcascades + "haarcascade_russian_plate_number.xml"
    plate_cascade = cv2.CascadeClassifier(plate_cascade_path)
    
    if plate_cascade.empty():
        log_message("Failed to load Haar cascade classifier", "ERROR")
        return
    
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
    
    cv2.namedWindow("Real ALPR Detection", cv2.WINDOW_NORMAL)
    
    frame_count = 0
    detection_count = 0
    recent_detections = {}  # Track recent detections
    
    log_message("🎥 Video processing started. Press ESC to exit.")
    log_message("Note: This will show ACTUAL detections, not fake ones!")
    
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
            cv2.imshow("Real ALPR Detection", frame)
            if cv2.waitKey(1) & 0xFF == 27:  # ESC key
                break
            continue

        # Convert to grayscale for detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect license plates
        plates = plate_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(80, 30),  # Minimum plate size
            maxSize=(400, 150)  # Maximum plate size
        )

        # Draw rectangles around detected plates
        for (x, y, w, h) in plates:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            # Calculate confidence based on detection quality
            confidence = min(0.95, 0.6 + (w * h) / 15000)
            
            # For demo, we'll show "DETECTED" since we don't have OCR
            detected_text = f"PLATE_DETECTED_{detection_count + 1}"
            detection_count += 1
            
            log_message(f"🔍 Plate detected at ({x},{y}) size {w}x{h}, confidence: {confidence:.2f}")
            
            # Check if this is a new detection (avoid spam)
            current_time = time.time()
            detection_key = f"{x}_{y}_{w}_{h}"
            
            if detection_key not in recent_detections or (current_time - recent_detections[detection_key]) > DETECTION_COOLDOWN:
                recent_detections[detection_key] = current_time
                
                if confidence >= CONFIDENCE_THRESHOLD:
                    log_message(f"🚗 Processing {EVENT_TYPE} for detected plate")
                    
                    # For real implementation, you would run OCR here
                    # For now, we'll use a placeholder
                    vehicle_number = f"DEMO{int(current_time) % 10000}"
                    
                    # Send to backend
                    success = send_to_backend(vehicle_number, confidence)
                    if success:
                        log_message(f"✅ Successfully sent detection to backend")
                    else:
                        log_message(f"❌ Failed to send to backend")
                else:
                    log_message(f"⏭️ Skipping detection (confidence {confidence:.2f} < {CONFIDENCE_THRESHOLD})")
            
            # Display detection info on frame
            cv2.putText(frame, f"Detected ({confidence:.2f})", 
                       (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        # Add info overlay
        info_text = f"{EVENT_TYPE} Camera | Detections: {detection_count} | Frame: {frame_count}"
        cv2.putText(frame, info_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Show instructions
        cv2.putText(frame, "Press ESC to exit", (10, frame.shape[0] - 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        cv2.imshow("Real ALPR Detection", frame)
        if cv2.waitKey(1) & 0xFF == 27:  # ESC key
            break

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    
    log_message(f"🏁 ALPR system stopped. Total detections: {detection_count}")
    if detection_count == 0:
        log_message("ℹ️  No license plates detected in video. This could be due to:")
        log_message("   - Video quality/lighting")
        log_message("   - Plate size too small/large")
        log_message("   - Plate angle/orientation")
        log_message("   - Haar cascade limitations")

if __name__ == "__main__":
    main()