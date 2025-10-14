#!/bin/bash

echo "🎨 Creating perfect AEYE.NG logo icons..."

# Create the perfect AEYE.NG logo SVG with proper contrast and maskable design
cat > /tmp/aeye-perfect-logo.svg << 'EOF'
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Professional gradient for depth -->
    <radialGradient id="bgGradient" cx="50%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:#1a365d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </radialGradient>
    
    <!-- Gold gradient for the text -->
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ffed4e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
    
    <!-- Shadow filter for depth -->
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>
  
  <!-- Background with gradient -->
  <rect width="1024" height="1024" rx="120" ry="120" fill="url(#bgGradient)"/>
  
  <!-- Subtle border for definition -->
  <rect width="1024" height="1024" rx="120" ry="120" fill="none" stroke="#2d3748" stroke-width="3"/>
  
  <!-- Eye symbol (stylized) -->
  <ellipse cx="512" cy="380" rx="140" ry="80" fill="url(#goldGradient)" opacity="0.9"/>
  <ellipse cx="512" cy="380" rx="90" ry="50" fill="#0f172a"/>
  <circle cx="512" cy="380" r="25" fill="url(#goldGradient)"/>
  <circle cx="520" cy="372" r="8" fill="#ffffff" opacity="0.8"/>
  
  <!-- AEYE text - larger and more prominent -->
  <text x="512" y="560" text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="140" 
        font-weight="bold" 
        fill="url(#goldGradient)" 
        filter="url(#textShadow)">AEYE</text>
  
  <!-- .NG subtitle -->
  <text x="512" y="660" text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="80" 
        font-weight="600" 
        fill="#94a3b8" 
        opacity="0.9">.NG</text>
        
  <!-- Subtle accent lines for tech feel -->
  <line x1="300" y1="750" x2="724" y2="750" stroke="#374151" stroke-width="2" opacity="0.6"/>
  <line x1="350" y1="780" x2="674" y2="780" stroke="#374151" stroke-width="1" opacity="0.4"/>
</svg>
EOF

echo "✅ Perfect AEYE.NG logo SVG created"

# Create maskable version (with safe zone padding)
cat > /tmp/aeye-perfect-maskable.svg << 'EOF'
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGradient" cx="50%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:#1a365d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </radialGradient>
    
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ffed4e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
    
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>
  
  <!-- Full bleed background for maskable -->
  <rect width="1024" height="1024" fill="url(#bgGradient)"/>
  
  <!-- Content centered in safe zone (20% padding) -->
  <g transform="translate(512, 512) scale(0.6) translate(-512, -512)">
    <!-- Eye symbol -->
    <ellipse cx="512" cy="380" rx="140" ry="80" fill="url(#goldGradient)" opacity="0.9"/>
    <ellipse cx="512" cy="380" rx="90" ry="50" fill="#0f172a"/>
    <circle cx="512" cy="380" r="25" fill="url(#goldGradient)"/>
    <circle cx="520" cy="372" r="8" fill="#ffffff" opacity="0.8"/>
    
    <!-- AEYE text -->
    <text x="512" y="560" text-anchor="middle" 
          font-family="Arial, sans-serif" 
          font-size="140" 
          font-weight="bold" 
          fill="url(#goldGradient)" 
          filter="url(#textShadow)">AEYE</text>
    
    <!-- .NG subtitle -->
    <text x="512" y="660" text-anchor="middle" 
          font-family="Arial, sans-serif" 
          font-size="80" 
          font-weight="600" 
          fill="#94a3b8" 
          opacity="0.9">.NG</text>
  </g>
</svg>
EOF

echo "✅ Perfect maskable AEYE.NG logo SVG created"

# Function to create high-quality PNG from SVG
create_png() {
    local size=$1
    local input_svg=$2
    local output_file=$3
    local description=$4
    
    echo "📱 Creating ${description} (${size}x${size})"
    
    # Use rsvg-convert for highest quality conversion
    if command -v rsvg-convert &> /dev/null; then
        rsvg-convert -w $size -h $size "$input_svg" > "$output_file"
    elif command -v convert &> /dev/null; then
        # ImageMagick fallback with high quality settings
        convert -background transparent -density 300 -resize ${size}x${size} "$input_svg" "$output_file"
    else
        echo "⚠️  No SVG converter found. Installing rsvg-convert..."
        if command -v brew &> /dev/null; then
            brew install librsvg 2>/dev/null || echo "Please install librsvg manually"
        fi
        # Try again
        if command -v rsvg-convert &> /dev/null; then
            rsvg-convert -w $size -h $size "$input_svg" > "$output_file"
        else
            echo "❌ Could not convert SVG. Please install librsvg or imagemagick."
            return 1
        fi
    fi
    
    # Optimize PNG for smaller file size while maintaining quality
    if command -v pngcrush &> /dev/null; then
        pngcrush -reduce -brute "$output_file" "${output_file}.tmp" 2>/dev/null && mv "${output_file}.tmp" "$output_file" 2>/dev/null
    fi
    
    echo "✅ Created: $output_file"
}

# Create icons directory
mkdir -p "public/icons"

# Standard icons (non-maskable)
create_png 16 "/tmp/aeye-perfect-logo.svg" "public/icons/favicon-16x16.png" "Favicon 16x16"
create_png 32 "/tmp/aeye-perfect-logo.svg" "public/icons/favicon-32x32.png" "Favicon 32x32"
create_png 48 "/tmp/aeye-perfect-logo.svg" "public/icons/icon-48x48.png" "Icon 48x48"
create_png 72 "/tmp/aeye-perfect-logo.svg" "public/icons/icon-72x72.png" "Icon 72x72"
create_png 96 "/tmp/aeye-perfect-logo.svg" "public/icons/icon-96x96.png" "Icon 96x96"
create_png 128 "/tmp/aeye-perfect-logo.svg" "public/icons/icon-128x128.png" "Icon 128x128"
create_png 144 "/tmp/aeye-perfect-logo.svg" "public/icons/icon-144x144.png" "Icon 144x144"
create_png 152 "/tmp/aeye-perfect-logo.svg" "public/icons/icon-152x152.png" "Icon 152x152"
create_png 167 "/tmp/aeye-perfect-logo.svg" "public/icons/icon-167x167.png" "Icon 167x167"
create_png 180 "/tmp/aeye-perfect-logo.svg" "public/icons/apple-touch-icon.png" "Apple Touch Icon"
create_png 192 "/tmp/aeye-perfect-logo.svg" "public/icons/icon-192x192.png" "Icon 192x192"
create_png 256 "/tmp/aeye-perfect-logo.svg" "public/icons/icon-256x256.png" "Icon 256x256"
create_png 384 "/tmp/aeye-perfect-logo.svg" "public/icons/icon-384x384.png" "Icon 384x384"
create_png 512 "/tmp/aeye-perfect-logo.svg" "public/icons/icon-512x512.png" "Icon 512x512"
create_png 1024 "/tmp/aeye-perfect-logo.svg" "public/icons/icon-1024x1024.png" "Icon 1024x1024"

# Maskable icons (with safe zone)
create_png 512 "/tmp/aeye-perfect-maskable.svg" "public/icons/icon-512x512-maskable.png" "Maskable Icon 512x512"

# Create favicon.ico
if command -v convert &> /dev/null; then
    convert "public/icons/favicon-32x32.png" "public/icons/favicon-16x16.png" "public/favicon.ico"
    echo "✅ Created: public/favicon.ico"
else
    cp "public/icons/favicon-32x32.png" "public/favicon.ico"
    echo "✅ Created: public/favicon.ico (from PNG)"
fi

# Clean up temp files
rm -f /tmp/aeye-perfect-logo.svg /tmp/aeye-perfect-maskable.svg

echo ""
echo "🎉 Perfect AEYE.NG logo icons created successfully!"
echo "📱 All icons are high-resolution and optimized for all devices"
echo "🔍 Icons feature professional gradients, proper contrast, and clean design"
echo "🛡️  Maskable icons have proper safe zone padding"
echo ""
echo "Icon sizes created:"
echo "  • Favicons: 16x16, 32x32"
echo "  • PWA Icons: 48x48, 72x72, 96x96, 128x128, 144x144, 152x152, 167x167, 192x192, 256x256, 384x384, 512x512, 1024x1024"
echo "  • Apple Touch: 180x180"
echo "  • Maskable: 512x512"
echo ""