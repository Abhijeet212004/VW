import cv2
import requests
import json
import time
import os
import re
from datetime import datetime
import pytesseract
from PIL import Image
import numpy as np

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

def preprocess_plate_image(plate_img):
    """Preprocess license plate image for better OCR"""
    # Convert to grayscale
    gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Apply adaptive threshold
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                   cv2.THRESH_BINARY, 11, 2)
    
    # Apply morphological operations to clean up
    kernel = np.ones((3,3), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel)
    
    # Resize image for better OCR (make it larger)
    height, width = cleaned.shape
    cleaned = cv2.resize(cleaned, (width * 3, height * 3), interpolation=cv2.INTER_CUBIC)
    
    return cleaned

def normalize_plate_text(text):
    """Normalize OCR text to fix common character recognition errors"""
    if not text:
        return text
    
    # Common OCR character corrections for license plates
    corrections = {
        ')': 'Q',  # ) is often misread Q
        '(': 'C',  # ( is often misread C
        '0': 'O',  # Only for letter positions (we'll be more selective)
        '8': 'B',  # Only when context suggests it
        '5': 'S',  # Only when context suggests it
        '1': 'I',  # Only when context suggests it
        '|': 'I',  # Vertical bar to I
        '/': '7',  # Forward slash to 7
        '\\': '7', # Backslash to 7
    }
    
    normalized = text
    for wrong, correct in corrections.items():
        normalized = normalized.replace(wrong, correct)
    
    # For Indian plates, apply some rules:
    # First 2 chars should be letters (state code)
    if len(normalized) >= 2:
        # Convert first 2 positions to likely letters if they're digits
        if normalized[0].isdigit():
            if normalized[0] == '0':
                normalized = 'O' + normalized[1:]
            elif normalized[0] == '5':
                normalized = 'S' + normalized[1:]
        
        if len(normalized) >= 2 and normalized[1].isdigit():
            if normalized[1] == '0':
                normalized = normalized[0] + 'O' + normalized[2:]
            elif normalized[1] == '5':
                normalized = normalized[0] + 'S' + normalized[2:]
    
    return normalized

def normalize_plate_text(text):
    """Normalize common OCR errors in license plate text"""
    if not text:
        return text
    
    # Common OCR character substitutions for Indian license plates
    text = text.replace(')', 'Q')  # ) is often misread Q
    text = text.replace('(', 'C')  # ( is often misread C
    text = text.replace('|', 'I')  # | is often misread I
    text = text.replace(']', 'D')  # ] is often misread D
    text = text.replace('[', 'C')  # [ is often misread C
    
    # For Indian plates format: MH12QB2053
    # First 2 chars: letters (state code)
    # Next 2-4 chars: digits 
    # Next 1-2 chars: letters
    # Last 4 chars: digits
    
    if len(text) >= 10:
        chars = list(text)
        
        # Position-specific corrections for Indian plate format
        # Positions 0-1: Should be letters (state code like MH)
        for i in range(0, min(2, len(chars))):
            if chars[i] == '0':
                chars[i] = 'O'
            elif chars[i] == '5':
                chars[i] = 'S'
            elif chars[i] == '8':
                chars[i] = 'B'
            elif chars[i] == '1':
                chars[i] = 'I'
        
        # Positions 2-5: Should be digits (like 12QB -> 12 digits, QB letters)
        # For MH12QB2053, positions 2-3 should be digits (12)
        for i in range(2, min(4, len(chars))):
            if chars[i] == 'O':
                chars[i] = '0'
            elif chars[i] == 'S':
                chars[i] = '5'
            elif chars[i] == 'B':
                chars[i] = '8'
            elif chars[i] == 'I':
                chars[i] = '1'
        
        # Positions 4-5: Could be letters (like QB)
        for i in range(4, min(6, len(chars))):
            if chars[i] == '0':
                chars[i] = 'Q'  # Special case: 0 often represents Q in this position
            elif chars[i] == '5':
                chars[i] = 'S'
            elif chars[i] == '8':
                chars[i] = 'B'
            elif chars[i] == '1':
                chars[i] = 'I'
        
        # Last 4 positions: Should be digits (like 2053)
        for i in range(len(chars)-4, len(chars)):
            if i >= 0 and i < len(chars):
                if chars[i] == 'O':
                    chars[i] = '0'
                elif chars[i] == 'S':
                    chars[i] = '5'
                elif chars[i] == 'B':
                    chars[i] = '8'
                elif chars[i] == 'I':
                    chars[i] = '1'
        
        text = ''.join(chars)
    
    return text

def extract_plate_text_ocr(plate_image):
    """Extract text from license plate using Tesseract OCR with enhanced preprocessing"""
    try:
        # Save original for debugging
        original = plate_image.copy()
        
        # Convert to grayscale
        if len(plate_image.shape) == 3:
            gray = cv2.cvtColor(plate_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = plate_image
        
        # Resize for better OCR (make it larger)
        height, width = gray.shape
        if width < 300:
            scale_factor = 300 / width
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            gray = cv2.resize(gray, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
        
        # Apply bilateral filter to reduce noise while keeping edges sharp
        filtered = cv2.bilateralFilter(gray, 11, 17, 17)
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(filtered)
        
        # Try multiple threshold methods
        results = []
        
        # Method 1: OTSU thresholding
        _, thresh1 = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Method 2: Adaptive thresholding
        thresh2 = cv2.adaptiveThreshold(enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        
        # Method 3: Manual threshold (for dark text on light background)
        _, thresh3 = cv2.threshold(enhanced, 127, 255, cv2.THRESH_BINARY)
        
        # Method 4: Inverted threshold (for light text on dark background)
        _, thresh4 = cv2.threshold(enhanced, 127, 255, cv2.THRESH_BINARY_INV)
        
        thresholded_images = [thresh1, thresh2, thresh3, thresh4]
        
        # Try OCR on each processed image
        for i, thresh in enumerate(thresholded_images):
            # Clean up with morphological operations
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 1))
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel)
            
            # OCR configurations to try
            configs = [
                r'--oem 3 --psm 8 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                r'--oem 3 --psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            ]
            
            for config in configs:
                try:
                    text = pytesseract.image_to_string(cleaned, config=config).strip()
                    # Clean the text
                    text = ''.join(char for char in text if char.isalnum())
                    text = text.upper()
                    
                    # Apply OCR error corrections
                    text = normalize_plate_text(text)
                    
                    # Indian license plate format validation
                    if len(text) >= 8 and len(text) <= 13:
                        # Check if it starts with state code (2 letters)
                        if text[:2].isalpha() and any(char.isdigit() for char in text):
                            results.append((text, i, config))
                            log_message(f"OCR attempt {i}: '{text}' using config {config}")
                
                except Exception as e:
                    continue
        
        # Return the most likely result (prefer longer, well-formatted results)
        if results:
            # Sort by length and format quality
            results.sort(key=lambda x: (len(x[0]), x[0].count('MH')), reverse=True)
            best_result = results[0][0]
            log_message(f"Best OCR result: '{best_result}'")
            return best_result
        
        return None
        
    except Exception as e:
        log_message(f"OCR error: {e}", "ERROR")
        return None

def send_to_backend(vehicle_number, confidence, image_path=None):
    """Send detected plate to backend API"""
    try:
        data = {
            "vehicleNumber": vehicle_number,
            "eventType": EVENT_TYPE,
            "confidence": confidence,
            "cameraId": CAMERA_ID,
            "parkingSpotId": PARKING_SPOT_ID,
        }
        
        if image_path and os.path.exists(image_path):
            data["imageUrl"] = f"file://{os.path.abspath(image_path)}"
        
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
    log_message(f"🚀 Starting OCR ALPR system for {EVENT_TYPE} camera: {CAMERA_ID}")
    log_message(f"Backend API: {BACKEND_API_URL}")
    log_message(f"Parking Spot ID: {PARKING_SPOT_ID}")
    log_message("🔍 Using Tesseract OCR for license plate recognition")
    
    # Test tesseract installation
    try:
        pytesseract.get_tesseract_version()
        log_message("✅ Tesseract OCR is available")
    except:
        log_message("❌ Tesseract OCR not found. Install with: brew install tesseract", "ERROR")
        return
    
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
    
    cv2.namedWindow("OCR ALPR Detection", cv2.WINDOW_NORMAL)
    
    frame_count = 0
    detection_count = 0
    successful_ocr_count = 0
    recent_detections = {}  # Track recent detections
    
    # Create directory for saving detected plates
    os.makedirs("detected_plates", exist_ok=True)
    
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
            cv2.imshow("OCR ALPR Detection", frame)
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
            minSize=(100, 30),  # Minimum plate size
            maxSize=(400, 150)  # Maximum plate size
        )

        # Process each detected plate
        for (x, y, w, h) in plates:
            detection_count += 1
            
            # Extract plate region
            plate_img = frame[y:y+h, x:x+w]
            
            # Draw rectangle around detected plate
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            # Run OCR on the plate
            plate_text = extract_plate_text_ocr(plate_img)
            
            if plate_text:
                # Calculate confidence based on text quality
                ocr_confidence = min(0.95, 0.8 + len(plate_text) / 100)
                
                if ocr_confidence >= CONFIDENCE_THRESHOLD:
                    successful_ocr_count += 1
                    
                    log_message(f"🔍 OCR Result: {plate_text} (confidence: {ocr_confidence:.2f})")
                    
                    # Check if this is a new detection (avoid spam)
                    current_time = time.time()
                    if plate_text not in recent_detections or (current_time - recent_detections[plate_text]) > DETECTION_COOLDOWN:
                        recent_detections[plate_text] = current_time
                    
                    # Save detected plate image
                    plate_filename = f"detected_plates/{plate_text}_{int(current_time)}.jpg"
                    cv2.imwrite(plate_filename, plate_img)
                    
                    log_message(f"🚗 Processing {EVENT_TYPE} for vehicle: {plate_text}")
                    
                    # Send to backend
                    success = send_to_backend(plate_text, ocr_confidence, plate_filename)
                    if success:
                        log_message(f"✅ Successfully sent {plate_text} to backend")
                    else:
                        log_message(f"❌ Failed to send {plate_text} to backend")
                else:
                    log_message(f"⏭️ Skipping {plate_text} (recent detection)")
                
                # Display OCR result on frame
                cv2.putText(frame, f"{plate_text} ({ocr_confidence:.2f})", 
                           (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            else:
                # Show that a plate was detected but OCR failed
                cv2.putText(frame, f"DETECTED (OCR failed)", 
                           (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                
                if plate_text:
                    log_message(f"❌ OCR low confidence: {plate_text} ({ocr_confidence:.2f})")

        # Add info overlay
        info_text = f"OCR {EVENT_TYPE} | Detections: {detection_count} | OCR Success: {successful_ocr_count} | Frame: {frame_count}"
        cv2.putText(frame, info_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Show instructions
        cv2.putText(frame, "Press ESC to exit", (10, frame.shape[0] - 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        cv2.imshow("OCR ALPR Detection", frame)
        if cv2.waitKey(1) & 0xFF == 27:  # ESC key
            break

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    
    log_message(f"🏁 OCR ALPR system stopped.")
    log_message(f"📊 Statistics:")
    log_message(f"   Total detections: {detection_count}")
    log_message(f"   Successful OCR: {successful_ocr_count}")
    log_message(f"   OCR Success Rate: {(successful_ocr_count/detection_count*100) if detection_count > 0 else 0:.1f}%")
    
    if successful_ocr_count == 0:
        log_message("ℹ️  No successful OCR readings. This could be due to:")
        log_message("   - License plate text not clear enough")
        log_message("   - Plate format not matching Indian standards")
        log_message("   - OCR preprocessing needs adjustment")
        log_message("   - Tesseract configuration needs tuning")

if __name__ == "__main__":
    main()