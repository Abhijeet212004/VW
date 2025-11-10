#!/usr/bin/env node

/**
 * CarPlay Test Script
 * Run this to verify CarPlay configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚗 Testing CarPlay Configuration...\n');

// Check if react-native-carplay is installed
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const hasCarPlay = packageJson.dependencies['react-native-carplay'];
  
  if (hasCarPlay) {
    console.log('✅ react-native-carplay is installed:', hasCarPlay);
  } else {
    console.log('❌ react-native-carplay is NOT installed');
    console.log('   Run: npm install react-native-carplay');
  }
} catch (error) {
  console.log('❌ Could not read package.json');
}

// Check Info.plist configuration
try {
  const infoPlistPath = path.join(__dirname, '../ios/Uber/Info.plist');
  const infoPlist = fs.readFileSync(infoPlistPath, 'utf8');
  
  if (infoPlist.includes('CPTemplateApplicationSceneSessionRoleApplication')) {
    console.log('✅ CarPlay scene configuration found in Info.plist');
  } else {
    console.log('❌ CarPlay scene configuration missing in Info.plist');
  }
  
  if (infoPlist.includes('RNCarPlaySceneDelegate')) {
    console.log('✅ CarPlay scene delegate configured');
  } else {
    console.log('❌ CarPlay scene delegate missing');
  }
  
  if (infoPlist.includes('public.app-category.navigation')) {
    console.log('✅ Navigation app category set');
  } else {
    console.log('❌ Navigation app category missing');
  }
} catch (error) {
  console.log('❌ Could not read Info.plist:', error.message);
}

// Check entitlements
try {
  const entitlementsPath = path.join(__dirname, '../ios/Uber/Uber.entitlements');
  const entitlements = fs.readFileSync(entitlementsPath, 'utf8');
  
  if (entitlements.includes('com.apple.developer.carplay-navigation')) {
    console.log('✅ CarPlay navigation entitlement found');
  } else {
    console.log('❌ CarPlay navigation entitlement missing');
  }
  
  if (entitlements.includes('com.apple.developer.carplay-parking')) {
    console.log('✅ CarPlay parking entitlement found');
  } else {
    console.log('❌ CarPlay parking entitlement missing');
  }
} catch (error) {
  console.log('❌ Could not read entitlements:', error.message);
}

console.log('\n🔧 CarPlay Setup Steps:');
console.log('1. Build and run the app on iOS Simulator');
console.log('2. In Simulator: Device → External Displays → CarPlay (⌘+Shift+C)');
console.log('3. Look for "Uber" app icon in CarPlay dashboard');
console.log('4. Tap the app icon to launch in CarPlay mode');
console.log('5. You should see "TechWagon Parking" interface');

console.log('\n🐛 Troubleshooting:');
console.log('- Make sure you\'re using iOS Simulator (not physical device)');
console.log('- CarPlay requires iOS 12.0+ simulator');
console.log('- Check Xcode console for CarPlay logs');
console.log('- Verify app has navigation category in Info.plist');