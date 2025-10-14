#!/usr/bin/env python3
"""
Create perfect AEYE.NG logo icons for PWA
This script generates high-quality, crisp icons that will look amazing on all devices
"""

import os
from PIL import Image, ImageDraw, ImageFont
import math

def create_gradient_background(width, height):
    """Create a professional gradient background"""
    image = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Create radial gradient effect
    center_x, center_y = width // 2, height // 3
    max_radius = int(math.sqrt(width**2 + height**2) * 0.7)
    
    for i in range(max_radius, 0, -2):
        # Calculate color interpolation
        progress = 1 - (i / max_radius)
        
        # Dark blue to darker blue gradient
        r = int(26 + (15 - 26) * progress)  # 1a365d to 0f172a
        g = int(54 + (23 - 54) * progress)
        b = int(93 + (42 - 93) * progress)
        
        color = (r, g, b, 255)
        
        # Draw concentric circles for gradient effect
        left = center_x - i
        top = center_y - i
        right = center_x + i
        bottom = center_y + i
        
        if left >= 0 and top >= 0 and right < width and bottom < height:
            draw.ellipse([left, top, right, bottom], fill=color)
    
    return image

def create_aeye_logo(size, maskable=False):
    """Create the AEYE.NG logo with professional styling"""
    
    # If maskable, add 20% padding for safe zone
    if maskable:
        content_size = int(size * 0.6)
        padding = (size - content_size) // 2
    else:
        content_size = size
        padding = 0
    
    # Create base image
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    # Create gradient background
    if maskable:
        # Full bleed background for maskable
        bg = create_gradient_background(size, size)
        image.paste(bg, (0, 0))
    else:
        # Background with rounded corners
        bg = create_gradient_background(content_size, content_size)
        if padding > 0:
            temp_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            temp_img.paste(bg, (padding, padding))
            image = temp_img
        else:
            image = bg
    
    # Create drawing context
    draw = ImageDraw.Draw(image)
    
    # Calculate positions (center everything)
    center_x = size // 2
    
    if maskable:
        # Scale down for safe zone
        eye_y = center_x - int(content_size * 0.15)
        text_y = center_x + int(content_size * 0.05)
        subtitle_y = center_x + int(content_size * 0.25)
        
        # Scale sizes for safe zone
        eye_rx = int(content_size * 0.12)
        eye_ry = int(content_size * 0.07)
        font_size = max(12, int(content_size * 0.12))
        sub_font_size = max(8, int(content_size * 0.07))
    else:
        eye_y = int(size * 0.37)
        text_y = int(size * 0.55)
        subtitle_y = int(size * 0.65)
        
        eye_rx = int(size * 0.14)
        eye_ry = int(size * 0.08)
        font_size = max(12, int(size * 0.14))
        sub_font_size = max(8, int(size * 0.08))
    
    # Draw eye symbol with gold gradient effect
    # Outer eye (golden)
    draw.ellipse([center_x - eye_rx, eye_y - eye_ry, 
                  center_x + eye_rx, eye_y + eye_ry], 
                 fill=(255, 215, 0, 230))  # Gold
    
    # Inner eye (dark)
    inner_rx = int(eye_rx * 0.65)
    inner_ry = int(eye_ry * 0.65)
    draw.ellipse([center_x - inner_rx, eye_y - inner_ry, 
                  center_x + inner_rx, eye_y + inner_ry], 
                 fill=(15, 23, 42, 255))  # Dark blue
    
    # Pupil (golden)
    pupil_r = max(3, int(eye_rx * 0.18))
    draw.ellipse([center_x - pupil_r, eye_y - pupil_r, 
                  center_x + pupil_r, eye_y + pupil_r], 
                 fill=(255, 215, 0, 255))  # Gold
    
    # Highlight (white)
    highlight_r = max(2, int(pupil_r * 0.4))
    highlight_x = center_x + int(pupil_r * 0.3)
    highlight_y = eye_y - int(pupil_r * 0.3)
    draw.ellipse([highlight_x - highlight_r, highlight_y - highlight_r, 
                  highlight_x + highlight_r, highlight_y + highlight_r], 
                 fill=(255, 255, 255, 200))  # White highlight
    
    # Try to load a font, fallback to default if not available
    try:
        # Try to find system fonts
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        sub_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", sub_font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", font_size)
            sub_font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans.ttf", sub_font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
            sub_font = ImageFont.load_default()
    
    # Draw "AEYE" text with shadow effect
    text = "AEYE"
    
    # Get text size for centering
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
    except:
        # Fallback for older Pillow versions
        text_width, _ = draw.textsize(text, font=font)
    
    text_x = center_x - text_width // 2
    
    # Draw shadow
    shadow_offset = max(1, int(size * 0.003))
    draw.text((text_x + shadow_offset, text_y + shadow_offset * 2), text, 
              fill=(0, 0, 0, 100), font=font)
    
    # Draw main text in gold
    draw.text((text_x, text_y), text, fill=(255, 215, 0, 255), font=font)
    
    # Draw ".NG" subtitle
    subtitle = ".NG"
    try:
        bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
        sub_width = bbox[2] - bbox[0]
    except:
        sub_width, _ = draw.textsize(subtitle, font=sub_font)
    
    sub_x = center_x - sub_width // 2
    draw.text((sub_x, subtitle_y), subtitle, fill=(148, 163, 184, 230), font=sub_font)
    
    # Add subtle accent lines for tech feel (only for larger icons)
    if size >= 128 and not maskable:
        line_y1 = int(size * 0.73)
        line_y2 = int(size * 0.76)
        line_start = int(size * 0.29)
        line_end = int(size * 0.71)
        
        draw.line([line_start, line_y1, line_end, line_y1], 
                  fill=(55, 65, 81, 150), width=max(1, int(size * 0.002)))
        
        draw.line([int(size * 0.34), line_y2, int(size * 0.66), line_y2], 
                  fill=(55, 65, 81, 100), width=max(1, int(size * 0.001)))
    
    return image

def create_all_icons():
    """Create all required icon sizes"""
    
    # Ensure icons directory exists
    os.makedirs('public/icons', exist_ok=True)
    
    # Icon sizes to create
    sizes = [
        (16, 'favicon-16x16.png', False),
        (32, 'favicon-32x32.png', False),
        (48, 'icon-48x48.png', False),
        (72, 'icon-72x72.png', False),
        (96, 'icon-96x96.png', False),
        (128, 'icon-128x128.png', False),
        (144, 'icon-144x144.png', False),
        (152, 'icon-152x152.png', False),
        (167, 'icon-167x167.png', False),
        (180, 'apple-touch-icon.png', False),
        (192, 'icon-192x192.png', False),
        (256, 'icon-256x256.png', False),
        (384, 'icon-384x384.png', False),
        (512, 'icon-512x512.png', False),
        (512, 'icon-512x512-maskable.png', True),
        (1024, 'icon-1024x1024.png', False),
    ]
    
    print("🎨 Creating perfect AEYE.NG logo icons with Python/Pillow...")
    
    for size, filename, maskable in sizes:
        print(f"📱 Creating {filename} ({size}x{size}{'maskable' if maskable else ''})")
        
        # Create the icon
        icon = create_aeye_logo(size, maskable)
        
        # Save with high quality
        filepath = f'public/icons/{filename}'
        icon.save(filepath, 'PNG', optimize=True, quality=95)
        
        print(f"✅ Created: {filepath}")
    
    # Create favicon.ico from 32x32 icon
    try:
        icon_32 = Image.open('public/icons/favicon-32x32.png')
        icon_16 = Image.open('public/icons/favicon-16x16.png')
        icon_32.save('public/favicon.ico', format='ICO', sizes=[(32, 32), (16, 16)])
        print("✅ Created: public/favicon.ico")
    except Exception as e:
        print(f"⚠️ Could not create favicon.ico: {e}")
        # Fallback: just copy 32x32 as favicon
        try:
            icon_32 = Image.open('public/icons/favicon-32x32.png')
            icon_32.save('public/favicon.ico', 'PNG')
            print("✅ Created: public/favicon.ico (PNG format)")
        except:
            print("❌ Could not create favicon.ico")
    
    print()
    print("🎉 Perfect AEYE.NG logo icons created successfully!")
    print("📱 All icons are high-resolution with professional styling")
    print("🔍 Features: gradient background, golden AEYE text, stylized eye symbol")
    print("🛡️ Maskable icons have proper safe zone padding")
    print()
    print("Icon sizes created:")
    print("  • Favicons: 16x16, 32x32")
    print("  • PWA Icons: 48x48, 72x72, 96x96, 128x128, 144x144, 152x152, 167x167, 192x192, 256x256, 384x384, 512x512, 1024x1024")
    print("  • Apple Touch: 180x180") 
    print("  • Maskable: 512x512")

if __name__ == "__main__":
    # Install PIL if not present
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("Installing Pillow...")
        os.system("python3 -m pip install Pillow")
        from PIL import Image, ImageDraw, ImageFont
    
    create_all_icons()