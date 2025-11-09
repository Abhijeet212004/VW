# tools/booking_tool.py (UPDATED)
from typing import Dict, Any

# Define a dummy rate for calculation
HOURLY_RATE = 5.00 

def create_new_booking(location_name: str, start_time: str, duration_hours: float) -> Dict[str, Any]:
    """
    Simulates the creation of a new booking, calculating cost based on duration.
    
    The tool requires the location, start time, and duration of the booking.
    
    Args:
        location_name: The name or ID of the location to book (e.g., 'West Garage A', 'P123').
        start_time: The specific time for the booking in YYYY-MM-DD HH:MM format.
        duration_hours: The length of the booking in hours (e.g., 2.5 for two and a half hours).
        
    Returns:
        A dictionary confirming the booking status, details, and the total cost.
    """
    # *** Dummy Response Logic ***
    
    # Simple validation
    if not location_name or not start_time or duration_hours is None or duration_hours <= 0:
        return {
            "status": "failed",
            "message": "Missing required details: Please provide location, time, and a valid duration.",
        }
        
    # Calculate dummy cost
    total_cost = duration_hours * HOURLY_RATE
    
    # Simulate a successful booking with a unique ID
    booking_id = f"RES-{hash(location_name + start_time) % 10000}"
    
    return {
        "status": "success",
        "booking_id": booking_id,
        "location": location_name,
        "time": start_time,
        "duration_hours": duration_hours,
        "total_cost": f"${total_cost:.2f}",
        "message": f"✅ Booking successfully confirmed! Your ID is {booking_id}. Total cost for {duration_hours} hours is ${total_cost:.2f}.",
    }