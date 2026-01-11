# Photos Setup Guide - Zero Configuration

## Overview
The Photos page auto-discovers albums from subdirectories. No manual configuration needed!

## Quick Setup (3 Steps)

### Step 1: Create Album Folders
```bash
cd jarvis-app/public/photos
mkdir wedding
mkdir vacation-2024
mkdir family
```

### Step 2: Add Photos
Drag and drop your photos/videos into the album folders. All formats supported:
- **Images**: JPG, PNG, GIF, WebP, HEIC (auto-converted)
- **Videos**: MP4, MOV, WebM, AVI, M4V

### Step 3: Generate Manifest
```bash
npm run photos
```

**Done!** Open the Photos page and select an album from the dropdown.

---

## Features

✅ **Zero Configuration** - No config files to edit
✅ **Auto-Discovery** - Albums created from folders
✅ **Album Selector** - Dropdown to switch between albums  
✅ **HEIC Support** - Apple photos converted automatically
✅ **Video Playback** - MP4/MOV with controls
✅ **Slideshow Mode** - Auto-advance with configurable timing
✅ **Keyboard Controls** - Arrow keys and spacebar
✅ **Touch Friendly** - Swipe navigation (coming soon)

---

## Adding More Photos Later

1. Add photos to existing album folders (or create new folders)
2. Run: `npm run photos`
3. Reload the app

The manifest updates instantly.

---

## Album Organization Tips

### Folder Naming
Folder names become album names with smart formatting:
- `wedding` → "Wedding"
- `vacation-2024` → "Vacation 2024"
- `kids_birthday_party` → "Kids Birthday Party"

### Recommended Structure
```
public/photos/
├── wedding/
│   ├── ceremony/
│   ├── reception/
│   └── portraits/
├── vacation-2024/
│   ├── beach/
│   └── mountains/
└── family/
    ├── holidays/
    └── birthdays/
```

**Note**: Only the first level of subdirectories becomes albums. Nested folders are treated as part of the parent album.

---

## Configuration Options

Edit `config.js` to customize:

```javascript
photos: {
  slideshowInterval: 5,        // Seconds per photo
  transitionDuration: 1000,    // Fade transition (ms)
  photoOrder: 'sequential'     // or 'random'
}
```

---

## Keyboard Shortcuts

- **Space** - Play/Pause slideshow
- **Left Arrow** - Previous photo
- **Right Arrow** - Next photo
- **Escape** - Stop slideshow

---

## Performance Tips

- **Optimize file sizes** - Use JPG with 80-90% quality
- **Resize large images** - 1920x1080 is ideal for most displays
- **Video files** - Keep under 50MB for smooth playback
- **HEIC conversion** - Happens in browser (may take 1-2 seconds per image)

---

## Troubleshooting

**"No Albums Found" message?**
1. Verify folders exist in `public/photos/`
2. Run `npm run photos` to generate manifest
3. Check console for errors

**Photos not showing?**
1. Verify manifest.json exists: `public/photos/manifest.json`
2. Check browser console (F12) for error messages
3. Verify file extensions are supported

**Album dropdown empty?**
- Run `npm run photos` after adding new folders
- Refresh the browser page

---

## Technical Details

### How It Works
1. `generate-photo-manifest.js` scans `public/photos/` subdirectories
2. Creates `manifest.json` with album names and file lists
3. Photos page loads albums from manifest at runtime
4. No server-side processing needed - pure client-side

### Manifest Format
```json
{
  "generated": "2026-01-11T18:00:00.000Z",
  "albums": [
    {
      "name": "wedding",
      "displayName": "Wedding",
      "path": "wedding",
      "files": ["photo1.jpg", "photo2.jpg"],
      "count": 2
    }
  ]
}
```

### Why A Manifest?
Browsers can't list directory contents for security reasons. The manifest provides a file index that works client-side without a backend server.

---

## Deployment Notes

When deploying to Raspberry Pi:
1. Copy photo folders to Pi
2. Run `npm run photos` on the Pi
3. Restart the app

The manifest is gitignored (photos stay private), but committed to track structure.

---

## HEIC Files - Recommended Approach

**Problem**: HEIC files (especially Live Photos) can have inconsistent browser support.

**Solution**: Convert HEIC to JPG during manifest generation:

```bash
npm run photos --convert-heic
```

Or directly:
```bash
node generate-photo-manifest.js --convert-heic
```

### What It Does:
- Scans for `.heic` files
- Converts each to `.jpg` using macOS `sips` command
- Skips files if JPG already exists
- Updates manifest to reference JPG files
- Original HEIC files remain untouched

### Benefits:
- ✅ 100% browser compatibility
- ✅ Faster loading (no real-time conversion)
- ✅ Consistent quality
- ✅ Extracts still frame from Live Photos

**Recommended**: Run with `--convert-heic` flag once, then use regular `npm run photos` for updates.
