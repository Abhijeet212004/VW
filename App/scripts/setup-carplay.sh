#!/bin/bash

# CarPlay Setup Script - Optional Installation
# Run this only if you want CarPlay support

echo "🚗 ParkEasy CarPlay Setup"
echo "========================"

read -p "Do you want to enable CarPlay support? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "📦 Installing CarPlay dependencies..."
    
    # Install React Native CarPlay
    npm install react-native-carplay
    
    # Install Siri Shortcuts (optional)
    npm install react-native-siri-shortcut
    
    echo "📱 Installing iOS dependencies..."
    cd ios && pod install && cd ..
    
    echo "✅ CarPlay setup complete!"
    echo "ℹ️  Your app will now support CarPlay when connected to a compatible car."
    echo "ℹ️  The app works normally on mobile devices as before."
    
else
    echo "📱 CarPlay setup skipped - app will run in mobile-only mode."
    echo "ℹ️  You can run this script later to add CarPlay support."
fi

echo ""
echo "🚀 Starting app..."
npx expo start