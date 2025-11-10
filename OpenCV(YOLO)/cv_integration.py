import cv2
import numpy as np
import requests
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import asyncio
import aiohttp

class CVParkingIntegration:
    """Integration service to connect Computer Vision system with Parking Prediction"""
    
    def __init__(self, backend_url: str = "http://localhost:3000", cv_endpoint: str = "http://localhost:8080"):
        self.backend_url = backend_url
        self.cv_endpoint = cv_endpoint
        self.is_running = False
        
        # PICT parking areas with camera configurations
        self.parking_areas = {
            "main_gate": {
                "camera_id": "cam_001",
                "rtsp_url": "rtsp://admin:password@camera1_ip:554/stream",
                "total_slots": 150,
                "roi_coordinates": [(100, 100), (800, 600)]  # Region of Interest
            },
            "sports_complex": {
                "camera_id": "cam_002", 
                "rtsp_url": "rtsp://admin:password@camera2_ip:554/stream",
                "total_slots": 100,
                "roi_coordinates": [(150, 120), (750, 580)]
            },
            "auditorium": {
                "camera_id": "cam_003",
                "rtsp_url": "rtsp://admin:password@camera3_ip:554/stream", 
                "total_slots": 80,
                "roi_coordinates": [(120, 80), (700, 520)]
            },
            "hostel_area": {
                "camera_id": "cam_004",
                "rtsp_url": "rtsp://admin:password@camera4_ip:554/stream",
                "total_slots": 120,
                "roi_coordinates": [(80, 90), (720, 550)]
            },
            "library": {
                "camera_id": "cam_005",
                "rtsp_url": "rtsp://admin:password@camera5_ip:554/stream",
                "total_slots": 60,
                "roi_coordinates": [(200, 150), (600, 450)]
            }
        }
    
    async def start_monitoring(self):
        """Start continuous monitoring of all parking areas"""
        print("🚗 Starting CV Parking Monitoring System...")
        self.is_running = True
        
        # Create monitoring tasks for each parking area
        tasks = []
        for area_id, config in self.parking_areas.items():
            task = asyncio.create_task(self._monitor_parking_area(area_id, config))
            tasks.append(task)
        
        # Wait for all monitoring tasks
        await asyncio.gather(*tasks)
    
    async def stop_monitoring(self):
        """Stop monitoring system"""
        print("🛑 Stopping CV Parking Monitoring...")
        self.is_running = False
    
    async def _monitor_parking_area(self, area_id: str, config: Dict):
        """Monitor specific parking area using computer vision"""
        print(f"📹 Starting monitoring for {area_id}")
        
        while self.is_running:
            try:
                # Get occupancy data from CV system
                occupancy_data = await self._get_cv_occupancy_data(area_id, config)
                
                if occupancy_data:
                    # Send data to backend
                    await self._send_occupancy_to_backend(area_id, occupancy_data)
                    
                    # Update prediction system with real-time data
                    await self._update_prediction_system(area_id, occupancy_data)
                
                # Wait before next check (every 30 seconds)
                await asyncio.sleep(30)
                
            except Exception as e:
                print(f"❌ Error monitoring {area_id}: {e}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def _get_cv_occupancy_data(self, area_id: str, config: Dict) -> Optional[Dict]:
        """Get real-time occupancy data from computer vision system"""
        try:
            # For demo purposes, we'll simulate CV data
            # In real implementation, this would connect to your CV system
            
            # Simulate processing camera feed
            occupied_slots, total_slots = await self._process_camera_feed(config)
            
            free_slots = total_slots - occupied_slots
            occupancy_rate = occupied_slots / total_slots if total_slots > 0 else 0
            
            return {
                "area_id": area_id,
                "total_slots": total_slots,
                "occupied_slots": occupied_slots,
                "free_slots": free_slots,
                "occupancy_rate": round(occupancy_rate, 3),
                "camera_id": config["camera_id"],
                "timestamp": datetime.now().isoformat(),
                "data_source": "CV_SYSTEM",
                "confidence": 0.95  # CV confidence score
            }
            
        except Exception as e:
            print(f"❌ CV processing error for {area_id}: {e}")
            return None
    
    async def _process_camera_feed(self, config: Dict) -> Tuple[int, int]:
        """Process camera feed to detect parking occupancy"""
        try:
            # In real implementation, this would:
            # 1. Connect to RTSP stream
            # 2. Apply YOLOv8 vehicle detection
            # 3. Track parking slot occupancy
            # 4. Return actual counts
            
            # For now, simulate realistic data based on time
            current_hour = datetime.now().hour
            total_slots = config["total_slots"]
            
            # Time-based occupancy simulation
            if 8 <= current_hour <= 10:  # Morning rush
                occupancy_rate = 0.85 + np.random.uniform(-0.1, 0.1)
            elif 10 <= current_hour <= 16:  # Peak college hours
                occupancy_rate = 0.75 + np.random.uniform(-0.15, 0.1)
            elif 17 <= current_hour <= 19:  # Evening
                occupancy_rate = 0.6 + np.random.uniform(-0.2, 0.1)
            else:  # Off hours
                occupancy_rate = 0.25 + np.random.uniform(-0.1, 0.2)
            
            # Add weekend adjustment
            if datetime.now().weekday() >= 5:  # Weekend
                occupancy_rate *= 0.4
            
            occupancy_rate = max(0.02, min(0.98, occupancy_rate))
            occupied_slots = int(total_slots * occupancy_rate)
            
            return occupied_slots, total_slots
            
        except Exception as e:
            print(f"❌ Camera processing error: {e}")
            return 0, config["total_slots"]
    
    async def _send_occupancy_to_backend(self, area_id: str, occupancy_data: Dict):
        """Send occupancy data to backend for storage"""
        try:
            async with aiohttp.ClientSession() as session:
                # Create occupancy snapshot in database
                snapshot_data = {
                    "area_id": area_id,
                    "total_slots": occupancy_data["total_slots"],
                    "occupied_slots": occupancy_data["occupied_slots"],
                    "free_slots": occupancy_data["free_slots"],
                    "occupancy_rate": occupancy_data["occupancy_rate"],
                    "data_source": "CV_SYSTEM",
                    "timestamp": occupancy_data["timestamp"]
                }
                
                async with session.post(
                    f"{self.backend_url}/api/parking/occupancy-snapshot",
                    json=snapshot_data,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        print(f"✅ Sent occupancy data for {area_id}")
                    else:
                        print(f"❌ Failed to send data for {area_id}: {response.status}")
                        
        except Exception as e:
            print(f"❌ Backend communication error: {e}")
    
    async def _update_prediction_system(self, area_id: str, occupancy_data: Dict):
        """Update ML prediction system with real-time data"""
        try:
            # Send real-time data to prediction system for model updates
            prediction_update = {
                "area_id": area_id,
                "current_occupancy": occupancy_data["occupancy_rate"],
                "free_slots": occupancy_data["free_slots"],
                "timestamp": occupancy_data["timestamp"],
                "confidence": occupancy_data.get("confidence", 0.9)
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.cv_endpoint}/update-realtime-data",
                    json=prediction_update,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        print(f"✅ Updated prediction system for {area_id}")
                    
        except Exception as e:
            print(f"❌ Prediction system update error: {e}")
    
    def get_area_status(self, area_id: str) -> Dict:
        """Get current status of specific parking area"""
        if area_id not in self.parking_areas:
            return {"error": "Invalid area ID"}
        
        config = self.parking_areas[area_id]
        
        # Get latest data (in real implementation, this would query latest CV data)
        occupied_slots, total_slots = asyncio.run(self._process_camera_feed(config))
        free_slots = total_slots - occupied_slots
        
        return {
            "area_id": area_id,
            "area_name": config.get("name", area_id.replace("_", " ").title()),
            "total_slots": total_slots,
            "occupied_slots": occupied_slots,
            "free_slots": free_slots,
            "occupancy_percentage": round((occupied_slots / total_slots) * 100, 1),
            "camera_id": config["camera_id"],
            "status": "available" if free_slots > 10 else "limited" if free_slots > 0 else "full",
            "last_updated": datetime.now().isoformat()
        }
    
    def get_all_areas_status(self) -> List[Dict]:
        """Get status of all parking areas"""
        statuses = []
        for area_id in self.parking_areas:
            statuses.append(self.get_area_status(area_id))
        return statuses

# Integration with FastAPI prediction system
async def update_prediction_with_cv_data():
    """Update prediction system with latest CV data"""
    cv_integration = CVParkingIntegration()
    
    while True:
        try:
            # Get all areas status
            all_statuses = cv_integration.get_all_areas_status()
            
            # Send to prediction system
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "http://localhost:8000/update-cv-data",
                    json={"areas_status": all_statuses},
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        print("✅ Updated prediction system with CV data")
            
            # Update every 2 minutes
            await asyncio.sleep(120)
            
        except Exception as e:
            print(f"❌ CV-ML integration error: {e}")
            await asyncio.sleep(300)  # Wait 5 minutes on error

if __name__ == "__main__":
    # Start CV monitoring system
    cv_system = CVParkingIntegration()
    
    print("🚗 PICT Parking CV Integration System")
    print("=" * 50)
    print("Monitoring Areas:")
    for area_id, config in cv_system.parking_areas.items():
        print(f"  - {area_id}: {config['total_slots']} slots")
    
    try:
        # Run monitoring system
        asyncio.run(cv_system.start_monitoring())
    except KeyboardInterrupt:
        print("\\n🛑 Stopping monitoring system...")
        asyncio.run(cv_system.stop_monitoring())