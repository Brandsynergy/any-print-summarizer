#!/bin/bash

# Create AEYE.NG Logo Icons for PWA
# This creates a high-quality AEYE logo programmatically

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🎨 Creating AEYE.NG Logo Icons for PWA${NC}"
echo "=============================================="

ICONS_DIR="public/icons"
mkdir -p "$ICONS_DIR"

# Create a high-quality AEYE logo using SVG that matches your design
cat > "aeye-logo-source.svg" << 'EOF'
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background circle -->
  <circle cx="256" cy="256" r="256" fill="#2d2d2d"/>
  
  <!-- Golden border -->
  <circle cx="256" cy="256" r="240" fill="none" stroke="#ffd700" stroke-width="3"/>
  
  <!-- Main white curved design (stylized A/E) -->
  <path d="M 180 180 Q 256 120 332 180 Q 300 220 256 240 Q 212 220 180 180 Z" 
        fill="white" stroke="white" stroke-width="4"/>
  
  <!-- Secondary curve -->
  <path d="M 200 260 Q 256 200 312 260 Q 280 300 256 320 Q 232 300 200 260 Z" 
        fill="white" stroke="white" stroke-width="3"/>
  
  <!-- Red accent dot -->
  <circle cx="320" cy="200" r="12" fill="#ff4444"/>
  
  <!-- AEYE text -->
  <text x="256" y="380" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="36" font-weight="bold" fill="white">AEYE</text>
  
  <!-- .NG text -->
  <text x="256" y="410" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="24" font-weight="bold" fill="white">.NG</text>
</svg>
EOF

echo -e "${GREEN}✅ Created AEYE logo source SVG${NC}"

# Convert SVG to PNG using built-in macOS tools
echo -e "${BLUE}🔄 Converting to PNG formats...${NC}"

# Define all sizes needed for PWA
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

# Generate each size
for size_info in "${SIZES[@]}"; do
    IFS=':' read -ra PARTS <<< "$size_info"
    SIZE="${PARTS[0]}"
    FILENAME="${PARTS[1]}"
    
    echo -e "  📐 Creating ${SIZE}x${SIZE} → $FILENAME"
    
    # Use qlmanage to convert SVG to PNG
    if qlmanage -t -s "$SIZE" -o "$ICONS_DIR" "aeye-logo-source.svg" > /dev/null 2>&1; then
        # Rename the generated file
        if [ -f "$ICONS_DIR/aeye-logo-source.svg.png" ]; then
            mv "$ICONS_DIR/aeye-logo-source.svg.png" "$ICONS_DIR/$FILENAME"
            echo -e "    ${GREEN}✅ $FILENAME${NC}"
        else
            echo -e "    ${YELLOW}⚠️  Generated but not found: $FILENAME${NC}"
        fi
    else
        echo -e "    ${RED}❌ Failed: $FILENAME${NC}"
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

# Clean up temporary SVG
rm -f "aeye-logo-source.svg"

# Show results
echo -e "${BLUE}📋 Generated AEYE.NG PWA icons:${NC}"
find "$ICONS_DIR" -name "*.png" -exec basename {} \; | sort | while read file; do
    echo -e "  🎨 $file"
done

echo ""
echo -e "${GREEN}🎉 AEYE.NG logo icons created successfully!${NC}"
echo -e "${YELLOW}📤 Ready to upload:${NC}"
echo "   Run: git add . && git commit -m 'Add AEYE.NG logo icons' && git push"
echo ""