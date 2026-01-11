#!/usr/bin/env node

/**
 * Photo Manifest Generator
 * 
 * Scans public/photos directory and generates a manifest file
 * listing all albums and their photos.
 * 
 * Run: node generate-photo-manifest.js
 * With HEIC conversion: node generate-photo-manifest.js --convert-heic
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PHOTOS_DIR = path.join(__dirname, 'public', 'photos');
const OUTPUT_FILE = path.join(PHOTOS_DIR, 'manifest.json');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
const MEDIA_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS];

// Check for --convert-heic flag
const CONVERT_HEIC = process.argv.includes('--convert-heic');

function isMediaFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return MEDIA_EXTENSIONS.includes(ext);
}

function isDirectory(dirPath, item) {
  try {
    return fs.statSync(path.join(dirPath, item)).isDirectory();
  } catch (e) {
    return false;
  }
}

function isHEIC(filename) {
  return path.extname(filename).toLowerCase() === '.heic';
}

function convertHEICtoJPG(filePath) {
  const jpgPath = filePath.replace(/\.heic$/i, '.jpg');
  
  // Skip if JPG already exists
  if (fs.existsSync(jpgPath)) {
    console.log(`  ⏭  Skipping ${path.basename(filePath)} (JPG exists)`);
    return path.basename(jpgPath);
  }
  
  try {
    console.log(`  🔄 Converting ${path.basename(filePath)}...`);
    
    // Use sips on macOS
    if (process.platform === 'darwin') {
      execSync(`sips -s format jpeg "${filePath}" --out "${jpgPath}"`, { stdio: 'pipe' });
    } else {
      // Try ImageMagick as fallback
      execSync(`convert "${filePath}" "${jpgPath}"`, { stdio: 'pipe' });
    }
    
    console.log(`  ✅ Created ${path.basename(jpgPath)}`);
    return path.basename(jpgPath);
  } catch (error) {
    console.error(`  ❌ Failed to convert ${path.basename(filePath)}:`, error.message);
    return path.basename(filePath); // Return original if conversion fails
  }
}

function scanDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    const files = [];
    
    for (const item of items) {
      if (item.startsWith('.') || item.startsWith('_')) continue;
      
      const fullPath = path.join(dirPath, item);
      
      if (isMediaFile(item)) {
        // Convert HEIC if flag is set
        if (CONVERT_HEIC && isHEIC(item)) {
          const convertedFile = convertHEICtoJPG(fullPath);
          files.push(convertedFile);
        } else {
          files.push(item);
        }
      }
    }
    
    return files.sort();
  } catch (e) {
    console.error(`Error scanning directory ${dirPath}:`, e.message);
    return [];
  }
}

function generateManifest() {
  console.log('🔍 Scanning photos directory...');
  console.log(`📁 Location: ${PHOTOS_DIR}`);
  if (CONVERT_HEIC) {
    console.log('🔄 HEIC conversion enabled\n');
  } else {
    console.log('💡 Tip: Add --convert-heic to convert HEIC files to JPG\n');
  }

  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error('❌ Photos directory not found!');
    process.exit(1);
  }

  const manifest = {
    generated: new Date().toISOString(),
    albums: []
  };

  // Get all subdirectories (albums)
  const items = fs.readdirSync(PHOTOS_DIR);
  const subdirs = items.filter(item => 
    isDirectory(PHOTOS_DIR, item) && 
    !item.startsWith('.') && 
    !item.startsWith('_')
  );

  // Scan each album
  for (const albumName of subdirs) {
    const albumPath = path.join(PHOTOS_DIR, albumName);
    const files = scanDirectory(albumPath);
    
    if (files.length > 0) {
      manifest.albums.push({
        name: albumName,
        displayName: albumName
          .split(/[-_]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        path: albumName,
        files: files,
        count: files.length
      });
      
      console.log(`📷 ${albumName.padEnd(20)} → ${files.length} files`);
    }
  }

  // Check for photos in root directory (no album)
  const rootFiles = scanDirectory(PHOTOS_DIR);
  if (rootFiles.length > 0) {
    manifest.albums.unshift({
      name: 'all',
      displayName: 'All Photos',
      path: '',
      files: rootFiles,
      count: rootFiles.length
    });
    console.log(`📷 ${'(root)'.padEnd(20)} → ${rootFiles.length} files`);
  }

  // Write manifest file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  
  console.log(`\n✅ Generated manifest with ${manifest.albums.length} album(s)`);
  console.log(`📝 Output: ${OUTPUT_FILE}`);
  
  // Summary
  const totalFiles = manifest.albums.reduce((sum, album) => sum + album.count, 0);
  console.log(`\n📊 Total: ${totalFiles} media files across ${manifest.albums.length} album(s)`);
}

// Run
try {
  generateManifest();
} catch (error) {
  console.error('❌ Error generating manifest:', error.message);
  process.exit(1);
}
