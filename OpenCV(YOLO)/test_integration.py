#!/usr/bin/env python3
"""
Test script for the CV number plate scanner integration
This script tests the complete flow: detection → backend → database
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:3000"
TEST_PARKING_SPOT_ID = "d38431ce-1925-4d7b-abb7-82478e1b9684"  # PICT Pune Smart Parking

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend is not reachable: {e}")
        return False

def test_cv_endpoint():
    """Test the CV ALPR endpoint"""
    test_data = {
        "vehicleNumber": "TEST123",
        "eventType": "ENTRY",
        "confidence": 0.85,
        "cameraId": "test_camera_001",
        "parkingSpotId": TEST_PARKING_SPOT_ID
    }
    
    try:
        print(f"🧪 Testing CV endpoint with data: {json.dumps(test_data, indent=2)}")
        response = requests.post(
            f"{BACKEND_URL}/api/cv/alpr",
            json=test_data,
            timeout=10
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ CV endpoint is working")
            return True
        else:
            print(f"❌ CV endpoint failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ CV endpoint test failed: {e}")
        return False

def test_cv_logs():
    """Test fetching CV logs"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/cv/logs?limit=5", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ CV logs endpoint working. Found {data.get('count', 0)} logs")
            if data.get('data'):
                print("Recent logs:")
                for log in data['data'][:3]:
                    print(f"  - {log['vehicleNumber']} | {log['eventType']} | {log['timestamp']}")
            return True
        else:
            print(f"❌ CV logs endpoint failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ CV logs test failed: {e}")
        return False

def test_activity_endpoint():
    """Test the activity endpoint for dashboard"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/cv/activity", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Activity endpoint working")
            stats = data.get('data', {}).get('stats', {})
            print(f"Event stats: {json.dumps(stats, indent=2)}")
            return True
        else:
            print(f"❌ Activity endpoint failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Activity endpoint test failed: {e}")
        return False

def simulate_vehicle_flow():
    """Simulate a complete vehicle entry and exit flow"""
    vehicle_number = f"TEST{int(time.time())}"
    
    print(f"\n🚗 Simulating vehicle flow for {vehicle_number}")
    
    # Simulate entry
    entry_data = {
        "vehicleNumber": vehicle_number,
        "eventType": "ENTRY",
        "confidence": 0.92,
        "cameraId": "entrance_cam_001",
        "parkingSpotId": TEST_PARKING_SPOT_ID
    }
    
    print("1. Simulating vehicle ENTRY...")
    try:
        response = requests.post(f"{BACKEND_URL}/api/cv/alpr", json=entry_data, timeout=10)
        if response.status_code == 200:
            print("✅ Entry recorded successfully")
        else:
            print(f"❌ Entry failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Entry simulation failed: {e}")
        return False
    
    # Wait a bit
    print("2. Waiting 3 seconds...")
    time.sleep(3)
    
    # Simulate exit
    exit_data = {
        "vehicleNumber": vehicle_number,
        "eventType": "EXIT", 
        "confidence": 0.88,
        "cameraId": "exit_cam_001",
        "parkingSpotId": TEST_PARKING_SPOT_ID
    }
    
    print("3. Simulating vehicle EXIT...")
    try:
        response = requests.post(f"{BACKEND_URL}/api/cv/alpr", json=exit_data, timeout=10)
        if response.status_code == 200:
            print("✅ Exit recorded successfully")
            return True
        else:
            print(f"❌ Exit failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exit simulation failed: {e}")
        return False

def main():
    print("🔧 Testing CV Number Plate Scanner Integration")
    print("=" * 50)
    
    # Test backend connectivity
    if not test_backend_health():
        print("\n❌ Backend is not running. Please start the backend server first.")
        print("Run: cd backend && npm run dev")
        return
    
    print("\n🧪 Testing CV Endpoints...")
    
    # Test individual endpoints
    test_cv_endpoint()
    print()
    test_cv_logs()
    print()
    test_activity_endpoint()
    
    # Test complete flow
    print("\n🔄 Testing Complete Vehicle Flow...")
    simulate_vehicle_flow()
    
    print("\n📊 Final Status Check...")
    test_activity_endpoint()
    
    print("\n✅ Integration test completed!")
    print("\nNext steps:")
    print("1. Start the admin dashboard: cd admin-dashboard && npm run dev")
    print("2. Visit http://localhost:3001/dashboard/activity")
    print("3. Run the CV scanner: python enhanced_alpr.py")
    print("4. Check the setup guide: SETUP_GUIDE.md")

if __name__ == "__main__":
    main()