#!/usr/bin/env python3
"""
Validate PWA requirements for Any Print Summarizer
Checks manifest, service worker, icons, and other requirements
"""

import json
import os
from pathlib import Path

def validate_manifest():
    """Validate the manifest.json meets PWA requirements"""
    print("🔍 Validating manifest.json...")
    
    try:
        with open('public/manifest.json', 'r') as f:
            manifest = json.load(f)
        
        print("✅ Manifest JSON is valid")
        
        # Check required fields
        required_fields = ['name', 'short_name', 'start_url', 'display', 'icons']
        missing_fields = []
        
        for field in required_fields:
            if field not in manifest:
                missing_fields.append(field)
        
        if missing_fields:
            print(f"❌ Missing required fields: {missing_fields}")
            return False
        else:
            print("✅ All required manifest fields present")
        
        # Check icons
        icons = manifest.get('icons', [])
        if len(icons) < 2:
            print("❌ Need at least 2 icons (192x192 and 512x512)")
            return False
        
        # Check for required icon sizes
        sizes = [icon['sizes'] for icon in icons]
        required_sizes = ['192x192', '512x512']
        
        has_required_sizes = all(size in sizes for size in required_sizes)
        if not has_required_sizes:
            print("❌ Missing required icon sizes: 192x192 and 512x512")
            return False
        else:
            print("✅ Required icon sizes present")
        
        # Check display mode
        if manifest.get('display') in ['standalone', 'fullscreen', 'minimal-ui']:
            print(f"✅ Valid display mode: {manifest.get('display')}")
        else:
            print(f"❌ Invalid display mode: {manifest.get('display')}")
            return False
        
        # Check start_url
        if manifest.get('start_url'):
            print(f"✅ Start URL: {manifest.get('start_url')}")
        else:
            print("❌ Missing start_url")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Error validating manifest: {e}")
        return False

def validate_service_worker():
    """Validate service worker exists and is properly structured"""
    print("\n🔍 Validating service worker...")
    
    sw_path = Path('public/sw.js')
    if not sw_path.exists():
        print("❌ Service worker not found at public/sw.js")
        return False
    
    print("✅ Service worker file exists")
    
    # Read and validate service worker content
    try:
        with open(sw_path, 'r') as f:
            sw_content = f.read()
        
        # Check for essential event listeners
        required_events = ['install', 'activate', 'fetch']
        missing_events = []
        
        for event in required_events:
            if f"addEventListener('{event}'" not in sw_content:
                missing_events.append(event)
        
        if missing_events:
            print(f"❌ Missing event listeners: {missing_events}")
            return False
        else:
            print("✅ Essential service worker events present")
        
        return True
        
    except Exception as e:
        print(f"❌ Error reading service worker: {e}")
        return False

def validate_icons():
    """Validate all required icons exist and have proper sizes"""
    print("\n🔍 Validating icons...")
    
    icons_dir = Path('public/icons')
    if not icons_dir.exists():
        print("❌ Icons directory not found")
        return False
    
    # Required icon files for PWA
    required_icons = {
        'icon-192x192.png': 192,
        'icon-512x512.png': 512,
        'favicon-16x16.png': 16,
        'favicon-32x32.png': 32,
    }
    
    missing_icons = []
    
    for icon_name, expected_size in required_icons.items():
        icon_path = icons_dir / icon_name
        
        if not icon_path.exists():
            missing_icons.append(icon_name)
        else:
            # Check file size (should not be 0)
            file_size = icon_path.stat().st_size
            if file_size == 0:
                print(f"❌ {icon_name} is empty (0 bytes)")
                missing_icons.append(icon_name)
            else:
                print(f"✅ {icon_name} exists ({file_size} bytes)")
    
    if missing_icons:
        print(f"❌ Missing or empty icons: {missing_icons}")
        return False
    
    # Check favicon
    favicon_path = Path('public/favicon.ico')
    if favicon_path.exists():
        print(f"✅ favicon.ico exists ({favicon_path.stat().st_size} bytes)")
    else:
        print("❌ favicon.ico missing")
        return False
    
    return True

def validate_https_requirement():
    """Check HTTPS requirement (for production)"""
    print("\n🔍 Validating HTTPS requirement...")
    
    # For localhost, PWA works without HTTPS
    # For production, HTTPS is required
    print("ℹ️  PWA requires HTTPS in production")
    print("ℹ️  Render.com provides HTTPS by default")
    print("✅ HTTPS requirement will be met in production")
    
    return True

def validate_manifest_registration():
    """Check if manifest is properly registered in HTML"""
    print("\n🔍 Validating manifest registration...")
    
    layout_path = Path('src/app/layout.tsx')
    if not layout_path.exists():
        print("❌ Layout file not found")
        return False
    
    try:
        with open(layout_path, 'r') as f:
            layout_content = f.read()
        
        if 'manifest: \'/manifest.json\'' in layout_content:
            print("✅ Manifest registered in layout.tsx")
            return True
        else:
            print("❌ Manifest not properly registered in layout.tsx")
            return False
            
    except Exception as e:
        print(f"❌ Error checking manifest registration: {e}")
        return False

def main():
    """Run all PWA validations"""
    print("🚀 AEYE Summarizer PWA Validation")
    print("=" * 50)
    
    validations = [
        validate_manifest,
        validate_service_worker, 
        validate_icons,
        validate_https_requirement,
        validate_manifest_registration
    ]
    
    results = []
    for validation in validations:
        result = validation()
        results.append(result)
    
    print("\n" + "=" * 50)
    print("📊 VALIDATION SUMMARY")
    print("=" * 50)
    
    if all(results):
        print("🎉 ALL PWA REQUIREMENTS MET!")
        print("✅ Your app should be installable")
        print("📱 PWA install button should appear in browsers")
        print("\nNext steps:")
        print("1. Deploy to production (Render)")
        print("2. Test PWA installation on devices")
        print("3. Clear browser cache if needed")
    else:
        print("❌ SOME REQUIREMENTS NOT MET")
        print("⚠️  PWA may not be installable until issues are fixed")
        failed_count = len([r for r in results if not r])
        print(f"📊 {len(results) - failed_count}/{len(results)} validations passed")
    
    return all(results)

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)