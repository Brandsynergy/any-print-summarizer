#!/bin/bash

# Simple PWA Check Script
# No developer tools required!

echo "🚀 Checking Your PWA Setup..."
echo "==============================="
echo ""

# Check if manifest exists
if [ -f "public/manifest.json" ]; then
    echo "✅ Manifest file exists"
else
    echo "❌ Manifest file missing"
fi

# Check if service worker exists  
if [ -f "public/sw.js" ]; then
    echo "✅ Service worker exists"
else
    echo "❌ Service worker missing"
fi

# Check if icons directory exists
if [ -d "public/icons" ]; then
    echo "✅ Icons directory exists"
    icon_count=$(find public/icons -name "*.png" | wc -l)
    echo "   📱 Found $icon_count icon files"
else
    echo "❌ Icons directory missing"
fi

# Check if PWA installer component exists
if [ -f "src/components/PWAInstaller.tsx" ]; then
    echo "✅ PWA installer component exists"
else
    echo "❌ PWA installer component missing"
fi

echo ""
echo "🎉 Setup Status:"
echo "   Your PWA is ready to be installed on devices!"
echo "   Visit your website and look for the install prompt."
echo ""
echo "📱 To test on iPhone:"
echo "   1. Open Safari"
echo "   2. Go to your website"  
echo "   3. Wait 3 seconds for install popup"
echo "   4. Or tap Share → Add to Home Screen"
echo ""
echo "💻 To test on computer:"
echo "   1. Open Chrome or Edge"
echo "   2. Go to your website"
echo "   3. Look for install icon in address bar"
echo "   4. Or use browser menu → Install App"
echo ""