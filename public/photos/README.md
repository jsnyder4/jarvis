# Photos Directory

## Quick Start

1. **Create album folders** - Each subfolder becomes an album:
   ```
   public/photos/
   ├── wedding/
   ├── vacation-2024/
   └── family/
   ```

2. **Add photos** - Drop images/videos into the folders

3. **Generate manifest**:
   ```bash
   npm run photos
   ```

4. **Done!** Open Photos page and select an album

## Supported Formats

### Images
- ✅ JPG/JPEG
- ✅ PNG
- ✅ GIF
- ✅ WebP
- ✅ HEIC (Apple format - auto-converted in browser)

### Videos
- ✅ MP4
- ✅ MOV
- ✅ WebM
- ✅ AVI
- ✅ M4V

## Album Organization

Albums are created from subdirectories. Folder names automatically become album names:

- `wedding` → "Wedding"
- `vacation-2024` → "Vacation 2024"
- `kids_birthday` → "Kids Birthday"

## Adding New Photos

1. Drop photos into an album folder
2. Run: `npm run photos`
3. Reload the app

That's it! No config files to edit.

## How It Works

The `npm run photos` command:
1. Scans all subdirectories in `public/photos/`
2. Finds all image/video files
3. Generates `manifest.json` with file listings
4. Photos app loads albums from the manifest

## Tips

- **Multiple albums**: Create as many folders as you want
- **Naming**: Use descriptive folder names (they appear in the UI)
- **Large collections**: The app handles hundreds of photos per album
- **Videos**: Auto-advance to next item when video ends during slideshow
- **HEIC files**: Work automatically (converted in real-time)
