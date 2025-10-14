#!/usr/bin/env python3
"""
Create a professional, corporate-quality AEYE.NG logo
This will be a modern, clean design that looks professional on all devices
"""

import os
from PIL import Image, ImageDraw, ImageFont
import math

def create_professional_gradient(width, height, colors):
    """Create a smooth professional gradient"""
    image = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    
    for y in range(height):
        # Calculate gradient position (0 to 1)
        progress = y / height
        
        # Interpolate between colors
        if progress < 0.5:
            # First half: color1 to color2
            t = progress * 2
            r = int(colors[0][0] * (1-t) + colors[1][0] * t)
            g = int(colors[0][1] * (1-t) + colors[1][1] * t)
            b = int(colors[0][2] * (1-t) + colors[1][2] * t)
        else:
            # Second half: color2 to color3
            t = (progress - 0.5) * 2
            r = int(colors[1][0] * (1-t) + colors[2][0] * t)
            g = int(colors[1][1] * (1-t) + colors[2][1] * t)
            b = int(colors[1][2] * (1-t) + colors[2][2] * t)
        
        # Draw horizontal line
        for x in range(width):
            image.putpixel((x, y), (r, g, b, 255))
    
    return image

def create_professional_logo(size, maskable=False):
    """Create a professional, corporate-quality AEYE.NG logo"""
    
    # Professional color scheme
    # Modern blue gradient: Light blue -> Deep blue -> Navy
    gradient_colors = [
        (59, 130, 246),   # Blue-500
        (37, 99, 235),    # Blue-600  
        (30, 64, 175),    # Blue-700
    ]
    
    # Gold accent color
    gold_color = (255, 193, 7)  # Professional gold
    text_color = (255, 255, 255)  # White text
    
    # If maskable, add safe zone
    if maskable:
        content_size = int(size * 0.8)  # 80% of size for better safe zone
        padding = (size - content_size) // 2
    else:
        content_size = size
        padding = 0
    
    # Create base image
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    # Create gradient background
    bg = create_professional_gradient(size, size, gradient_colors)
    image.paste(bg, (0, 0))
    
    # Create rounded corners for non-maskable
    if not maskable:
        # Create mask for rounded corners
        mask = Image.new('L', (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        corner_radius = size // 8
        mask_draw.rounded_rectangle([0, 0, size, size], radius=corner_radius, fill=255)
        
        # Apply mask
        rounded_bg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        rounded_bg.paste(image, (0, 0))
        image = Image.composite(rounded_bg, Image.new('RGBA', (size, size), (0, 0, 0, 0)), mask)
    
    draw = ImageDraw.Draw(image)
    
    # Calculate positions
    center_x = size // 2
    
    if maskable:
        # Scale everything for safe zone
        scale = 0.6
        eye_y = int(center_x * 0.75)
        text_y = int(center_x * 1.15)
        subtitle_y = int(center_x * 1.35)
        
        font_size = max(16, int(size * 0.08))
        sub_font_size = max(12, int(size * 0.045))
    else:
        # Full size design
        eye_y = int(size * 0.35)
        text_y = int(size * 0.58)
        subtitle_y = int(size * 0.72)
        
        font_size = max(16, int(size * 0.12))
        sub_font_size = max(10, int(size * 0.065))
    
    # Create professional eye symbol
    eye_width = int(size * (0.2 if maskable else 0.25))
    eye_height = int(eye_width * 0.6)
    
    # Outer eye shape with subtle shadow
    shadow_offset = max(2, size // 200)
    draw.ellipse([center_x - eye_width//2 + shadow_offset, 
                  eye_y - eye_height//2 + shadow_offset,
                  center_x + eye_width//2 + shadow_offset, 
                  eye_y + eye_height//2 + shadow_offset], 
                 fill=(0, 0, 0, 40))
    
    # Main eye shape - gold gradient effect
    draw.ellipse([center_x - eye_width//2, eye_y - eye_height//2,
                  center_x + eye_width//2, eye_y + eye_height//2], 
                 fill=gold_color)
    
    # Inner eye (iris)
    inner_width = int(eye_width * 0.7)
    inner_height = int(eye_height * 0.7)
    draw.ellipse([center_x - inner_width//2, eye_y - inner_height//2,
                  center_x + inner_width//2, eye_y + inner_height//2], 
                 fill=(20, 30, 60))  # Dark blue
    
    # Pupil
    pupil_size = int(inner_width * 0.35)
    draw.ellipse([center_x - pupil_size//2, eye_y - pupil_size//2,
                  center_x + pupil_size//2, eye_y + pupil_size//2], 
                 fill=(0, 0, 0))
    
    # Eye highlight
    highlight_size = int(pupil_size * 0.4)
    highlight_x = center_x + int(pupil_size * 0.25)
    highlight_y = eye_y - int(pupil_size * 0.25)
    draw.ellipse([highlight_x - highlight_size//2, highlight_y - highlight_size//2,
                  highlight_x + highlight_size//2, highlight_y + highlight_size//2], 
                 fill=(255, 255, 255, 200))
    
    # Load professional font
    try:
        # Try system fonts
        font_paths = [
            "/System/Library/Fonts/SF-Pro-Display-Bold.otf",
            "/System/Library/Fonts/Helvetica.ttc",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
        ]
        
        font = None
        sub_font = None
        
        for font_path in font_paths:
            try:
                font = ImageFont.truetype(font_path, font_size)
                sub_font = ImageFont.truetype(font_path, sub_font_size)
                break
            except:
                continue
                
        if not font:
            font = ImageFont.load_default()
            sub_font = ImageFont.load_default()
            
    except:
        font = ImageFont.load_default()
        sub_font = ImageFont.load_default()
    
    # Draw "AEYE" text with professional styling
    text = "AEYE"
    
    # Get text dimensions
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    except:
        text_width, text_height = draw.textsize(text, font=font)
    
    text_x = center_x - text_width // 2
    
    # Text shadow for depth
    shadow_offset = max(1, size // 300)
    draw.text((text_x + shadow_offset, text_y + shadow_offset), text, 
              fill=(0, 0, 0, 120), font=font)
    
    # Main text
    draw.text((text_x, text_y), text, fill=text_color, font=font)
    
    # Add subtle text outline for better readability
    outline_offset = 1
    if size >= 256:
        for dx in [-outline_offset, 0, outline_offset]:
            for dy in [-outline_offset, 0, outline_offset]:
                if dx != 0 or dy != 0:
                    draw.text((text_x + dx, text_y + dy), text, 
                             fill=(0, 0, 0, 60), font=font)
        draw.text((text_x, text_y), text, fill=text_color, font=font)
    
    # Draw ".NG" subtitle
    subtitle = ".NG"
    try:
        bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
        sub_width = bbox[2] - bbox[0]
    except:
        sub_width, _ = draw.textsize(subtitle, font=sub_font)
    
    sub_x = center_x - sub_width // 2
    draw.text((sub_x, subtitle_y), subtitle, fill=(255, 255, 255, 200), font=sub_font)
    
    # Add professional accent line
    if size >= 128:
        line_y = int(size * (0.85 if maskable else 0.82))
        line_width = int(size * (0.4 if maskable else 0.5))
        line_start = center_x - line_width // 2
        line_end = center_x + line_width // 2
        
        # Gradient line effect
        for i in range(3):
            alpha = 80 - (i * 20)
            draw.line([line_start, line_y + i, line_end, line_y + i], 
                     fill=(255, 255, 255, alpha), width=1)
    
    return image

def create_all_professional_icons():
    """Create all icon sizes with professional quality"""
    
    os.makedirs('public/icons', exist_ok=True)
    
    # Icon specifications
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
    
    print("🎨 Creating professional AEYE.NG corporate logo...")
    print("✨ Features: Modern gradient, professional typography, clean design")
    
    for size, filename, maskable in sizes:
        print(f"📱 Creating {filename} ({size}x{size}) {'[MASKABLE]' if maskable else ''}")
        
        # Create the professional icon
        icon = create_professional_logo(size, maskable)
        
        # Save with maximum quality
        filepath = f'public/icons/{filename}'
        icon.save(filepath, 'PNG', optimize=True, quality=100, dpi=(300, 300))
        
        file_size = os.path.getsize(filepath)
        print(f"✅ Created: {filepath} ({file_size} bytes)")
    
    # Create high-quality favicon.ico
    try:
        icon_32 = Image.open('public/icons/favicon-32x32.png')
        icon_16 = Image.open('public/icons/favicon-16x16.png')
        icon_32.save('public/favicon.ico', format='ICO', 
                    sizes=[(32, 32), (16, 16)], quality=100)
        print("✅ Created: public/favicon.ico (multi-size)")
    except Exception as e:
        print(f"⚠️ Favicon creation issue: {e}")
        try:
            icon_32.save('public/favicon.ico', 'PNG')
            print("✅ Created: public/favicon.ico (PNG fallback)")
        except:
            print("❌ Could not create favicon.ico")
    
    print()
    print("🎉 PROFESSIONAL AEYE.NG LOGO COMPLETE!")
    print("🏢 Corporate-quality design with:")
    print("   • Modern blue gradient background")  
    print("   • Professional gold eye symbol")
    print("   • Clean white typography")
    print("   • Subtle shadows and highlights")
    print("   • Proper safe zones for maskable")
    print("   • High-resolution output (300 DPI)")
    print()
    print("📱 This will look stunning on all devices!")

if __name__ == "__main__":
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("Installing Pillow...")
        os.system("python3 -m pip install Pillow --user")
        from PIL import Image, ImageDraw, ImageFont
    
    create_all_professional_icons()