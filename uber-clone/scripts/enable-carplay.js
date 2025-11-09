#!/usr/bin/env node

/**
 * CarPlay Enabler Script
 * Run this to enable CarPlay after the app is working
 */

const fs = require('fs');
const path = require('path');

console.log('🚗 Enabling CarPlay Configuration...\n');

// Add CarPlay scene configuration to Info.plist
const infoPlistPath = path.join(__dirname, '../ios/Uber/Info.plist');
let infoPlist = fs.readFileSync(infoPlistPath, 'utf8');

const carPlayConfig = `    <key>UIApplicationSceneManifest</key>
    <dict>
      <key>UIApplicationSupportsMultipleScenes</key>
      <true/>
      <key>UISceneConfigurations</key>
      <dict>
        <key>CPTemplateApplicationSceneSessionRoleApplication</key>
        <array>
          <dict>
            <key>UISceneConfigurationName</key>
            <string>CarPlay</string>
            <key>UISceneDelegateClassName</key>
            <string>RNCarPlaySceneDelegate</string>
          </dict>
        </array>
      </dict>
    </dict>`;

// Insert before closing </dict></plist>
if (!infoPlist.includes('UIApplicationSceneManifest')) {
  infoPlist = infoPlist.replace(
    '  </dict>\n</plist>',
    `${carPlayConfig}\n  </dict>\n</plist>`
  );
  
  fs.writeFileSync(infoPlistPath, infoPlist);
  console.log('✅ CarPlay scene configuration added to Info.plist');
} else {
  console.log('✅ CarPlay scene configuration already exists');
}

console.log('\n🔧 Next Steps:');
console.log('1. Build and run the app: npx expo run:ios');
console.log('2. Verify app works on iPhone first');
console.log('3. Enable CarPlay in simulator: ⌘+Shift+C');
console.log('4. Look for app in CarPlay dashboard');

console.log('\n⚠️ Important:');
console.log('- Only run this AFTER the app works normally');
console.log('- If app crashes, run: node scripts/disable-carplay.js');