# PWA Icons Setup Instructions

## Your AEYE.NG Logo

Please save your logo image as the following sizes:

1. **Save your logo as `source-logo.png`** (largest size, e.g., 512x512 or higher)

2. **Create these icon sizes:**
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

## Quick Command to Generate All Sizes

If you have your logo as `source-logo.png`, you can use this command to generate all sizes:

```bash
# On macOS (using sips - built-in)
sips -z 72 72 source-logo.png --out icon-72x72.png
sips -z 96 96 source-logo.png --out icon-96x96.png
sips -z 128 128 source-logo.png --out icon-128x128.png
sips -z 144 144 source-logo.png --out icon-144x144.png
sips -z 152 152 source-logo.png --out icon-152x152.png
sips -z 192 192 source-logo.png --out icon-192x192.png
sips -z 384 384 source-logo.png --out icon-384x384.png
sips -z 512 512 source-logo.png --out icon-512x512.png
```

## Alternative: Online PWA Icon Generator

Visit: https://www.pwabuilder.com/imageGenerator
Upload your logo and it will generate all required sizes automatically.

## Icon Requirements

- **Background**: Your logo has a dark background, which will work great
- **Format**: PNG with transparency support
- **Quality**: High resolution for best results across all devices
- **Padding**: Ensure there's some padding around the logo for better appearance