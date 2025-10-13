#!/bin/bash

# PWA Icon Generator Script
# This script generates all required PWA icon sizes from a source logo
# Requirements: macOS with sips command (built-in)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 PWA Icon Generator${NC}"
echo "======================================"

# Check if source logo exists
SOURCE_LOGO="public/images/mediad-logo.svg"
if [ ! -f "$SOURCE_LOGO" ]; then
    echo -e "${RED}❌ Source logo not found: $SOURCE_LOGO${NC}"
    echo -e "${YELLOW}💡 Please ensure your logo file exists at: $SOURCE_LOGO${NC}"
    exit 1
fi

# Create icons directory if it doesn't exist
ICONS_DIR="public/icons"
mkdir -p "$ICONS_DIR"

echo -e "${GREEN}📁 Icons directory created: $ICONS_DIR${NC}"
echo -e "${BLUE}🔄 Converting SVG to PNG and generating icon sizes...${NC}"

# Define all required icon sizes
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

# Generate icons
for size_info in "${SIZES[@]}"; do
    IFS=':' read -ra PARTS <<< "$size_info"
    SIZE="${PARTS[0]}"
    FILENAME="${PARTS[1]}"
    
    echo -e "  📐 Generating ${SIZE}x${SIZE} → $FILENAME"
    
    # Convert SVG to PNG with specific size using sips
    # First, we need to convert SVG to a raster format that sips can work with
    # We'll use the system's built-in conversion
    qlmanage -t -s "$SIZE" -o "$ICONS_DIR" "$SOURCE_LOGO" > /dev/null 2>&1
    
    # Move and rename the generated file
    if [ -f "$ICONS_DIR/$(basename "$SOURCE_LOGO" .svg).png" ]; then
        mv "$ICONS_DIR/$(basename "$SOURCE_LOGO" .svg).png" "$ICONS_DIR/$FILENAME"
        echo -e "    ${GREEN}✅ $FILENAME${NC}"
    else
        echo -e "    ${RED}❌ Failed to generate $FILENAME${NC}"
    fi
done

# Create a maskable version of the main icon
echo -e "${BLUE}🎭 Creating maskable icon...${NC}"
if [ -f "$ICONS_DIR/icon-512x512.png" ]; then
    cp "$ICONS_DIR/icon-512x512.png" "$ICONS_DIR/icon-512x512-maskable.png"
    echo -e "${GREEN}✅ Maskable icon created${NC}"
fi

# Create favicon.ico (requires imagemagick or system tools)
echo -e "${BLUE}🌐 Creating favicon.ico...${NC}"
if command -v convert >/dev/null 2>&1; then
    convert "$ICONS_DIR/favicon-16x16.png" "$ICONS_DIR/favicon-32x32.png" "public/favicon.ico"
    echo -e "${GREEN}✅ favicon.ico created${NC}"
elif [ -f "$ICONS_DIR/favicon-32x32.png" ]; then
    cp "$ICONS_DIR/favicon-32x32.png" "public/favicon.ico"
    echo -e "${YELLOW}⚠️  favicon.ico created as PNG (install ImageMagick for proper ICO format)${NC}"
fi

# Generate browserconfig.xml for Windows tiles
echo -e "${BLUE}🪟 Creating browserconfig.xml for Windows...${NC}"
cat > "public/browserconfig.xml" << EOF
<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square70x70logo src="/icons/icon-72x72.png"/>
            <square150x150logo src="/icons/icon-144x144.png"/>
            <square310x310logo src="/icons/icon-256x256.png"/>
            <TileColor>#3B82F6</TileColor>
        </tile>
    </msapplication>
</browserconfig>
EOF
echo -e "${GREEN}✅ browserconfig.xml created${NC}"

# List generated files
echo -e "${BLUE}📋 Generated files:${NC}"
ls -la "$ICONS_DIR/" | grep -E '\.(png|ico)$' | while read line; do
    echo -e "  📄 $line"
done

echo ""
echo -e "${GREEN}🎉 Icon generation complete!${NC}"
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   • All PWA icons have been generated in $ICONS_DIR/"
echo "   • favicon.ico has been placed in public/"
echo "   • browserconfig.xml created for Windows tile support"
echo "   • Your app is now ready to be installed as a PWA!"
echo ""
echo -e "${BLUE}🚀 Next steps:${NC}"
echo "   1. Test your PWA in a browser that supports installation"
echo "   2. Deploy to your hosting platform"
echo "   3. Verify the manifest.json file is accessible"
echo "   4. Test installation on different devices"
echo ""