# CarPlay Setup Instructions

## Current Issue
The app is crashing because CarPlay initialization is happening too early. Here's how to fix it:

## Steps to Test CarPlay Safely

### 1. First, make sure the app works normally
```bash
cd /Users/abhijeet/Documents/TechWagon/uber-clone
npx expo run:ios --clear
```

### 2. Test the app on phone first
- Make sure the app opens normally on iPhone simulator
- Navigate through the app to ensure it's working
- Check that all screens load properly

### 3. Once app is stable, test CarPlay
- In iOS Simulator: Device → External Displays → CarPlay (⌘+Shift+C)
- Look for "Uber" app icon in CarPlay dashboard
- Tap the icon to test CarPlay launch

### 4. If CarPlay crashes, check logs
- Open Xcode and check the console for error messages
- Look for CarPlay-related errors

## Debugging CarPlay Issues

### Check if CarPlay module is properly installed:
```bash
cd /Users/abhijeet/Documents/TechWagon/uber-clone
node scripts/test-carplay.js
```

### Common Issues:
1. **App crashes on launch**: CarPlay initialization too early
2. **CarPlay opens then closes**: Missing proper scene delegate
3. **App not visible in CarPlay**: Missing entitlements or wrong category

### Safe CarPlay Testing:
1. Remove all CarPlay imports from main app
2. Test app functionality first
3. Add CarPlay gradually with proper error handling
4. Test each CarPlay feature individually

## Current Configuration Status:
- ✅ CarPlay entitlements added
- ✅ Scene delegate configured  
- ✅ Info.plist updated
- ✅ Navigation category set
- ⚠️ CarPlay initialization removed from app startup (safer)

## Next Steps:
1. Test app without CarPlay first
2. Once stable, add CarPlay initialization to a specific screen
3. Test CarPlay functionality gradually
4. Add proper error handling for all CarPlay operations