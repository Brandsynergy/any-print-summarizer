#!/bin/bash

# Update PWA Icons with Preferred AEYE Logo
# This script replaces all icons with your beautiful AEYE.NG logo

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 Updating PWA Icons with Your Preferred AEYE Logo${NC}"
echo "============================================================"

# Check if preferred logo exists
SOURCE_LOGO="public/images/aeye-logo-preferred.png"
if [ ! -f "$SOURCE_LOGO" ]; then
    echo -e "${RED}❌ Preferred logo not found: $SOURCE_LOGO${NC}"
    echo -e "${YELLOW}💡 Please save your AEYE.NG logo as: $SOURCE_LOGO${NC}"
    echo -e "${YELLOW}   1. Right-click the logo image and save it${NC}"
    echo -e "${YELLOW}   2. Name it: aeye-logo-preferred.png${NC}"
    echo -e "${YELLOW}   3. Put it in: public/images/ folder${NC}"
    echo -e "${YELLOW}   4. Run this script again${NC}"
    exit 1
fi

# Icons directory
ICONS_DIR="public/icons"
mkdir -p "$ICONS_DIR"

echo -e "${GREEN}📁 Found your preferred logo: $SOURCE_LOGO${NC}"
echo -e "${BLUE}🔄 Generating all icon sizes with your beautiful logo...${NC}"

# Define all required sizes for PWA
declare -a SIZES=(
    "16:favicon-16x16.png"
    "32:favicon-32x32.png" 
    "48:icon-48x48.png"
    "72:icon-72x72.png"
    "96:icon-96x96.png"
    "128:icon-128x128.png"
    "144:icon-144x144.png"
    "152:icon-152x152.png"
    "167:icon-167x167.png"
    "180:apple-touch-icon.png"
    "192:icon-192x192.png"
    "256:icon-256x256.png"
    "384:icon-384x384.png"
    "512:icon-512x512.png"
    "1024:icon-1024x1024.png"
)

# Generate each size using sips (built into macOS)
for size_info in "${SIZES[@]}"; do
    IFS=':' read -ra PARTS <<< "$size_info"
    SIZE="${PARTS[0]}"
    FILENAME="${PARTS[1]}"
    
    echo -e "  📐 Creating ${SIZE}x${SIZE} → $FILENAME"
    
    # Use sips to resize your preferred logo
    if sips -z "$SIZE" "$SIZE" "$SOURCE_LOGO" --out "$ICONS_DIR/$FILENAME" > /dev/null 2>&1; then
        echo -e "    ${GREEN}✅ $FILENAME created with your logo!${NC}"
    else
        echo -e "    ${RED}❌ Failed to generate $FILENAME${NC}"
    fi
done

# Create maskable version
echo -e "${BLUE}🎭 Creating maskable icon...${NC}"
if [ -f "$ICONS_DIR/icon-512x512.png" ]; then
    cp "$ICONS_DIR/icon-512x512.png" "$ICONS_DIR/icon-512x512-maskable.png"
    echo -e "${GREEN}✅ Maskable icon created${NC}"
fi

# Create favicon.ico
echo -e "${BLUE}🌐 Creating favicon.ico...${NC}"
if [ -f "$ICONS_DIR/favicon-32x32.png" ]; then
    cp "$ICONS_DIR/favicon-32x32.png" "public/favicon.ico"
    echo -e "${GREEN}✅ favicon.ico created${NC}"
fi

# List generated files
echo -e "${BLUE}📋 Generated PWA icons with your preferred logo:${NC}"
find "$ICONS_DIR" -name "*.png" -exec basename {} \; | sort | while read file; do
    echo -e "  📱 $file"
done

echo ""
echo -e "${GREEN}🎉 All icons updated with your beautiful AEYE.NG logo!${NC}"
echo -e "${YELLOW}📤 Next steps:${NC}"
echo "   1. Upload to website: git add . && git commit -m 'Update icons' && git push"
echo "   2. Wait for Render deployment (2-3 minutes)"
echo "   3. Delete old app from iPhone and reinstall"
echo "   4. Enjoy your beautiful logo on all devices!"
echo ""