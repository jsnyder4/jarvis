# Third-Party Libraries

This directory contains vendored third-party JavaScript libraries that are used by the application.

## Why vendor libraries here?

Instead of loading from `node_modules/`, we copy libraries to `src/lib/` for several reasons:

1. **Electron compatibility** - The renderer process can easily load these via script tags
2. **Simple deployment** - No build step required, just `git pull` and run
3. **Version control** - Libraries are committed with the app code
4. **Raspberry Pi friendly** - Works identically on Mac and Pi without npm build steps

## Current Libraries

### ical.js (v2.1.0)
- **Source:** https://github.com/kewisch/ical.js
- **License:** Mozilla Public License 2.0
- **Purpose:** Parse iCalendar (.ics) format for calendar integration
- **File:** `ical.min.js` (76KB minified)

## Updating Libraries

When updating a library:

1. Update via npm: `npm update ical.js`
2. Copy new version: `cp node_modules/ical.js/dist/ical.min.js src/lib/`
3. Test the application
4. Commit the updated file
5. Update version number in this README
