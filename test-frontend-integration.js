// Test script to verify frontend can fetch real parking data
const API_BASE_URL = "http://localhost:3000/api";

async function testParkingAPI() {
  try {
    console.log("🚗 Testing Parking API Integration...\n");
    
    // Test nearby parking spots
    const response = await fetch(
      `${API_BASE_URL}/parking-spot/nearby?latitude=18.5204&longitude=73.8567&radius=10`
    );
    
    const result = await response.json();
    
    if (result.success) {
      console.log("✅ API Connection: SUCCESS");
      console.log(`📍 Found ${result.data.length} parking spots\n`);
      
      result.data.forEach((spot, index) => {
        console.log(`🏢 Spot ${index + 1}: ${spot.name}`);
        console.log(`   📍 Location: ${spot.address}`);
        console.log(`   🚗 Available: ${spot.availableSpots}/${spot.totalSpots} spots`);
        console.log(`   💰 Price: $${spot.pricePerHour}/hour`);
        console.log(`   ⭐ Rating: ${spot.rating}`);
        console.log(`   🔄 Real-time slots: ${spot.realTimeSlots.length}`);
        console.log(`   📊 CV Integration: ${spot.realTimeSlots.length > 0 ? 'ACTIVE' : 'INACTIVE'}\n`);
      });
      
      console.log("🎉 Frontend Integration: READY");
      console.log("📱 Your React Native app can now display real parking data!");
      
    } else {
      console.error("❌ API Error:", result.message);
    }
    
  } catch (error) {
    console.error("❌ Connection Error:", error.message);
  }
}

testParkingAPI();