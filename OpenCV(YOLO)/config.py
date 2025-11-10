# CV Number Plate Scanner Configuration

# Backend API Configuration
BACKEND_API_URL = "http://localhost:3000/api/cv/alpr"

# Camera Configuration
CAMERA_ID = "entrance_cam_001"  # Change this for each camera
PARKING_SPOT_ID = "d38431ce-1925-4d7b-abb7-82478e1b9684"  # PICT Pune Smart Parking

# Event Type - Change based on camera location
EVENT_TYPE = "ENTRY"  # Options: "ENTRY" or "EXIT"

# Detection Settings
CONFIDENCE_THRESHOLD = 0.7  # Minimum confidence to process detection
DETECTION_COOLDOWN = 30  # Seconds before processing same plate again

# Video Processing Settings
SKIP_FRAMES = 5  # Process every Nth frame for performance
USE_WEBCAM = False  # Set to True to use webcam instead of video file
VIDEO_PATH = "/Users/abhijeet/Documents/TechWagon/CV_VW/videos/car.mp4"  # Path to video file if not using webcam

# LPR Settings
LPR_SCRIPT_PATH = r"D:\CV_VW\Indian_LPR\infer_objectdet.py"  # Update this path

# For multiple cameras, create separate config files:
# entrance_config.py - CAMERA_ID="entrance_cam_001", EVENT_TYPE="ENTRY"
# exit_config.py - CAMERA_ID="exit_cam_001", EVENT_TYPE="EXIT"