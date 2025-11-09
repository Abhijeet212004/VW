#!/usr/bin/env node

/**
 * CarPlay Disabler Script
 * Run this to disable CarPlay if it causes crashes
 */

const fs = require('fs');
const path = require('path');

console.log('📱 Disabling CarPlay Configuration...\n');

// Remove CarPlay scene configuration from Info.plist
const infoPlistPath = path.join(__dirname, '../ios/Uber/Info.plist');
let infoPlist = fs.readFileSync(infoPlistPath, 'utf8');

// Remove CarPlay scene configuration
const carPlayConfigRegex = /\s*<key>UIApplicationSceneManifest<\/key>[\s\S]*?<\/dict>/;
if (infoPlist.match(carPlayConfigRegex)) {
  infoPlist = infoPlist.replace(carPlayConfigRegex, '');
  fs.writeFileSync(infoPlistPath, infoPlist);
  console.log('✅ CarPlay scene configuration removed from Info.plist');
} else {
  console.log('ℹ️ CarPlay scene configuration not found');
}

// Disable CarPlay entitlements
const entitlementsPath = path.join(__dirname, '../ios/Uber/Uber.entitlements');
const emptyEntitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict/>
</plist>`;

fs.writeFileSync(entitlementsPath, emptyEntitlements);
console.log('✅ CarPlay entitlements disabled');

console.log('\n📱 CarPlay Disabled Successfully');
console.log('🔧 Now run: npx expo run:ios');
console.log('✅ App should work normally without CarPlay');