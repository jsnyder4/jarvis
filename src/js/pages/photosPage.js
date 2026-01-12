// Photos Page - Album-based photo slideshow with auto-discovery

class PhotosPage extends BasePage {
  constructor() {
    super('photos', 'page-photos');
    this.manifest = null;
    this.albums = [];
    this.currentAlbum = null;
    this.photos = [];
    this.currentIndex = 0;
    this.slideshowInterval = null;
    this.isPlaying = false;
    this.isFullscreen = false;
    this.lastUsedAlbum = null;
  }

  async render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="h-full flex flex-col pb-20 bg-white" id="photos-normal-view">
        <!-- Header -->
        <div class="flex items-center justify-between px-8 pt-6 pb-4 flex-shrink-0">
          <h1 class="text-2xl font-bold text-gray-800">Photos</h1>
          <div class="flex gap-2">
            <select id="album-selector" class="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 font-semibold hover:bg-gray-200 transition">
              <option value="">Loading albums...</option>
            </select>
            <button id="fullscreen-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg">
              ⛶ Fullscreen
            </button>
            <button id="play-pause-btn" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-lg">
              ▶ Play
            </button>
          </div>
        </div>

        <!-- Photo display area -->
        <div class="flex-1 flex items-center justify-center bg-gray-900 rounded-xl overflow-hidden relative min-h-0 mx-8 mb-6">
          <div id="photo-container" class="w-full h-full flex items-center justify-center relative">
            <div class="text-white text-2xl">Loading albums...</div>
          </div>

          <!-- Navigation arrows -->
          <button id="prev-photo" class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full transition text-3xl hidden z-10">
            ‹
          </button>
          <button id="next-photo" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full transition text-3xl hidden z-10">
            ›
          </button>

          <!-- Photo info overlay -->
          <div id="photo-info" class="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hidden">
            <div class="text-sm font-semibold" id="album-name"></div>
            <div class="text-xs" id="photo-count"></div>
          </div>
        </div>
      </div>

      <!-- Fullscreen Mode -->
      <div id="photos-fullscreen-view" class="hidden fixed inset-0 bg-black z-50">
        <div id="fullscreen-photo-container" class="w-full h-full flex items-center justify-center relative">
          <!-- Photo will be inserted here -->
        </div>

        <!-- Exit button (shown on interaction) -->
        <button id="exit-fullscreen-btn" class="hidden absolute top-8 right-8 bg-red-600 bg-opacity-80 hover:bg-opacity-100 text-white px-8 py-4 rounded-full transition text-2xl font-bold shadow-2xl z-20">
          ✕ Exit
        </button>

        <!-- Navigation arrows for fullscreen -->
        <button id="fullscreen-prev-photo" class="hidden absolute left-8 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-6 rounded-full transition text-4xl z-10">
          ‹
        </button>
        <button id="fullscreen-next-photo" class="hidden absolute right-8 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-6 rounded-full transition text-4xl z-10">
          ›
        </button>
      </div>
    `;
  }

  async onShow() {
    await this.loadManifest();
    this.setupEventHandlers();
    
    if (this.albums.length > 0) {
      this.loadAlbum(this.albums[0].name);
    } else {
      this.showNoAlbums();
    }
  }

  onHide() {
    this.stopSlideshow();
    // Exit fullscreen if active
    if (this.isFullscreen) {
      this.exitFullscreen();
    }
  }

  async loadManifest() {
    try {
      const response = await fetch('public/photos/manifest.json');
      if (!response.ok) {
        throw new Error('Manifest file not found. Run: node generate-photo-manifest.js');
      }
      
      this.manifest = await response.json();
      this.albums = this.manifest.albums || [];
      
      console.log(`Loaded ${this.albums.length} album(s) from manifest`);
      
      // Populate album selector
      this.renderAlbumSelector();
      
    } catch (error) {
      console.error('Error loading photo manifest:', error);
      this.showManifestError(error);
    }
  }

  renderAlbumSelector() {
    const selector = document.getElementById('album-selector');
    if (!selector) return;

    if (this.albums.length === 0) {
      selector.innerHTML = '<option value="">No albums found</option>';
      selector.disabled = true;
      return;
    }

    selector.innerHTML = this.albums.map(album => `
      <option value="${album.name}">${album.displayName} (${album.count})</option>
    `).join('');
    
    selector.disabled = false;
  }

  loadAlbum(albumName) {
    const album = this.albums.find(a => a.name === albumName);
    if (!album) {
      console.error('Album not found:', albumName);
      return;
    }

    this.currentAlbum = album;
    this.lastUsedAlbum = albumName; // Track last used album for screensaver
    this.currentIndex = 0;
    
    // Build photo list
    const basePath = album.path ? `public/photos/${album.path}` : 'public/photos';
    this.photos = album.files.map((filename, index) => ({
      id: index,
      filename: filename,
      url: `${basePath}/${filename}`
    }));

    // Optionally shuffle
    const config = window.CONFIG?.photos || {};
    if (config.photoOrder === 'random') {
      this.shuffleArray(this.photos);
    }

    console.log(`Loaded album "${album.displayName}" with ${this.photos.length} files`);
    
    // Update album selector
    const selector = document.getElementById('album-selector');
    if (selector) {
      selector.value = albumName;
    }

    // Display first photo
    if (this.photos.length > 0) {
      this.displayPhoto(0);
      this.showNavigationButtons();
    } else {
      this.showNoPhotos();
    }
  }

  setupEventHandlers() {
    const albumSelector = document.getElementById('album-selector');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const prevBtn = document.getElementById('prev-photo');
    const nextBtn = document.getElementById('next-photo');
    const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');
    const fullscreenPrevBtn = document.getElementById('fullscreen-prev-photo');
    const fullscreenNextBtn = document.getElementById('fullscreen-next-photo');
    const fullscreenView = document.getElementById('photos-fullscreen-view');

    if (albumSelector) {
      albumSelector.onchange = (e) => {
        this.stopSlideshow();
        this.loadAlbum(e.target.value);
      };
    }

    if (playPauseBtn) {
      playPauseBtn.onclick = () => this.toggleSlideshow();
    }

    if (fullscreenBtn) {
      fullscreenBtn.onclick = () => this.enterFullscreen();
    }

    if (exitFullscreenBtn) {
      exitFullscreenBtn.onclick = () => this.exitFullscreen();
    }

    if (prevBtn) {
      prevBtn.onclick = () => this.previousPhoto();
    }

    if (nextBtn) {
      nextBtn.onclick = () => this.nextPhoto();
    }

    if (fullscreenPrevBtn) {
      fullscreenPrevBtn.onclick = () => this.previousPhoto();
    }

    if (fullscreenNextBtn) {
      fullscreenNextBtn.onclick = () => this.nextPhoto();
    }

    // Fullscreen interaction - show controls on touch/click
    if (fullscreenView) {
      fullscreenView.onclick = (e) => {
        // Don't trigger if clicking on buttons
        if (e.target.tagName === 'BUTTON') return;
        this.showFullscreenControls();
      };
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.container && !this.container.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') {
          this.previousPhoto();
        } else if (e.key === 'ArrowRight') {
          this.nextPhoto();
        } else if (e.key === ' ') {
          e.preventDefault();
          this.toggleSlideshow();
        }
      }
    });
  }

  displayPhoto(index) {
    if (!this.photos || this.photos.length === 0) return;

    const photo = this.photos[index];
    
    // Choose container based on fullscreen mode
    const containerId = this.isFullscreen ? 'fullscreen-photo-container' : 'photo-container';
    const container = document.getElementById(containerId);
    
    const photoInfo = document.getElementById('photo-info');
    const photoCount = document.getElementById('photo-count');
    const albumNameEl = document.getElementById('album-name');

    if (container) {
      const config = window.CONFIG?.photos || {};
      const transitionDuration = config.transitionDuration || 1000;

      // Detect file type
      const isVideo = this.isVideoFile(photo.filename);
      const isHEIC = photo.filename.toLowerCase().endsWith('.heic');

      // Show loading message
      container.innerHTML = '<div class="text-white text-xl">Loading...</div>';

      if (isHEIC) {
        // Convert HEIC to displayable format using heic2any
        this.displayHEIC(photo, container, transitionDuration);
        
      } else if (isVideo) {
        // Create video element
        const video = document.createElement('video');
        video.className = 'max-w-full max-h-full object-contain';
        video.style.opacity = '0';
        video.style.transition = `opacity ${transitionDuration}ms ease-in-out`;
        video.controls = true;
        video.autoplay = true;
        video.loop = false; // Don't loop videos
        video.muted = true; // Mute by default for autoplay

        video.onloadedmetadata = () => {
          container.innerHTML = '';
          container.appendChild(video);
          
          // Fade in
          requestAnimationFrame(() => {
            video.style.opacity = '1';
          });
        };

        video.onerror = () => {
          console.error('Failed to load video:', photo.url);
          container.innerHTML = '<div class="text-white text-xl">Failed to load video</div>';
        };

        // Auto-advance to next when video ends (during slideshow)
        video.onended = () => {
          if (this.isPlaying) {
            this.nextPhoto();
          }
        };

        video.src = photo.url;
        
      } else {
        // Create image element
        const img = document.createElement('img');
        img.className = 'max-w-full max-h-full object-contain';
        img.style.opacity = '0';
        img.style.transition = `opacity ${transitionDuration}ms ease-in-out`;

        img.onload = () => {
          container.innerHTML = '';
          container.appendChild(img);
          
          // Fade in
          requestAnimationFrame(() => {
            img.style.opacity = '1';
          });
        };

        img.onerror = () => {
          console.error('Failed to load photo:', photo.url);
          container.innerHTML = '<div class="text-white text-xl">Failed to load photo</div>';
        };

        img.src = photo.url;
      }
    }

    // Update info
    if (albumNameEl && this.currentAlbum) {
      albumNameEl.textContent = this.currentAlbum.displayName;
    }
    if (photoCount) {
      photoCount.textContent = `${index + 1} of ${this.photos.length}`;
    }
    if (photoInfo) {
      photoInfo.classList.remove('hidden');
    }
  }

  async displayHEIC(photo, container, transitionDuration) {
    try {
      // Show loading with more detail
      container.innerHTML = '<div class="text-white text-xl">Converting HEIC...</div>';
      
      // Fetch the HEIC file as a blob
      const response = await fetch(photo.url);
      const blob = await response.blob();
      
      // Convert HEIC to JPEG using heic2any
      // For Live Photos, this extracts the still image frame
      const convertedBlob = await heic2any({
        blob: blob,
        toType: 'image/jpeg',
        quality: 0.9,
        multiple: false  // Force single image output (not animation)
      });
      
      // Handle array result (heic2any sometimes returns array)
      const imageBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      
      // Create object URL from converted blob
      const url = URL.createObjectURL(imageBlob);
      
      // Display the converted image
      const img = document.createElement('img');
      img.className = 'max-w-full max-h-full object-contain';
      img.style.opacity = '0';
      img.style.transition = `opacity ${transitionDuration}ms ease-in-out`;
      
      img.onload = () => {
        container.innerHTML = '';
        container.appendChild(img);
        
        // Fade in
        requestAnimationFrame(() => {
          img.style.opacity = '1';
        });
        
        // Clean up object URL after image loads
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
      
      img.onerror = () => {
        console.error('Failed to display converted HEIC:', photo.url);
        this.showHEICError(photo, container, 'Failed to display converted image');
      };
      
      img.src = url;
      
    } catch (error) {
      console.error('Failed to convert HEIC:', photo.url, error);
      
      // Try fallback: some browsers (Safari) can display HEIC natively
      if (this.isSafariBrowser()) {
        console.log('Attempting native HEIC display (Safari)...');
        const img = document.createElement('img');
        img.className = 'max-w-full max-h-full object-contain';
        img.style.opacity = '0';
        img.style.transition = `opacity ${transitionDuration}ms ease-in-out`;
        
        img.onload = () => {
          container.innerHTML = '';
          container.appendChild(img);
          requestAnimationFrame(() => {
            img.style.opacity = '1';
          });
        };
        
        img.onerror = () => {
          this.showHEICError(photo, container, error.message);
        };
        
        img.src = photo.url;
      } else {
        this.showHEICError(photo, container, error.message);
      }
    }
  }

  isSafariBrowser() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  showHEICError(photo, container, errorMessage) {
    container.innerHTML = `
      <div class="text-center text-white">
        <div class="text-6xl mb-4">⚠️</div>
        <h2 class="text-2xl font-bold mb-2">HEIC Conversion Failed</h2>
        <p class="text-gray-400">${photo.filename}</p>
        <p class="text-gray-400 text-sm mt-2">${errorMessage}</p>
        <p class="text-gray-500 text-xs mt-4">Tip: Convert to JPG for best compatibility</p>
        <button 
          onclick="photosPage.nextPhoto()" 
          class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Skip to Next →
        </button>
      </div>
    `;
    
    // Make photosPage globally accessible for the button
    window.photosPage = this;
    
    // Auto-skip after 3 seconds
    setTimeout(() => this.nextPhoto(), 3000);
  }

  isVideoFile(filename) {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return videoExtensions.includes(ext);
  }

  previousPhoto() {
    if (this.photos.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
    this.displayPhoto(this.currentIndex);
  }

  nextPhoto() {
    if (this.photos.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
    this.displayPhoto(this.currentIndex);
  }

  toggleSlideshow() {
    if (this.isPlaying) {
      this.stopSlideshow();
    } else {
      this.startSlideshow();
    }
  }

  startSlideshow() {
    const config = window.CONFIG?.photos || {};
    const interval = (config.slideshowInterval || 5) * 1000;

    this.isPlaying = true;
    
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.innerHTML = '⏸ Pause';
      playPauseBtn.className = 'px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold shadow-lg';
    }

    this.slideshowInterval = setInterval(() => {
      this.nextPhoto();
    }, interval);

    console.log(`Slideshow started (${interval / 1000}s per photo)`);
  }

  stopSlideshow() {
    this.isPlaying = false;
    
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
      this.slideshowInterval = null;
    }

    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.innerHTML = '▶ Play';
      playPauseBtn.className = 'px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-lg';
    }

    console.log('Slideshow stopped');
  }

  enterFullscreen(autoplay = false) {
    this.isFullscreen = true;
    
    const normalView = document.getElementById('photos-normal-view');
    const fullscreenView = document.getElementById('photos-fullscreen-view');
    const bottomNav = document.getElementById('bottom-nav');
    
    if (normalView) normalView.classList.add('hidden');
    if (fullscreenView) fullscreenView.classList.remove('hidden');
    if (bottomNav) bottomNav.classList.add('hidden');
    
    // Display current photo in fullscreen
    this.displayPhoto(this.currentIndex);
    
    // Start slideshow if autoplay requested
    if (autoplay && !this.isPlaying) {
      this.startSlideshow();
    }
  }

  exitFullscreen() {
    this.isFullscreen = false;
    
    const normalView = document.getElementById('photos-normal-view');
    const fullscreenView = document.getElementById('photos-fullscreen-view');
    const bottomNav = document.getElementById('bottom-nav');
    const exitBtn = document.getElementById('exit-fullscreen-btn');
    const prevBtn = document.getElementById('fullscreen-prev-photo');
    const nextBtn = document.getElementById('fullscreen-next-photo');
    
    if (normalView) normalView.classList.remove('hidden');
    if (fullscreenView) fullscreenView.classList.add('hidden');
    if (bottomNav) bottomNav.classList.remove('hidden');
    if (exitBtn) exitBtn.classList.add('hidden');
    if (prevBtn) prevBtn.classList.add('hidden');
    if (nextBtn) nextBtn.classList.add('hidden');
    
    // Redisplay current photo in normal view
    this.displayPhoto(this.currentIndex);
    
    // Reset inactivity timer when exiting fullscreen
    if (window.screensaverManager) {
      window.screensaverManager.resetInactivityTimer();
    }
  }

  showFullscreenControls() {
    if (!this.isFullscreen) return;
    
    const exitBtn = document.getElementById('exit-fullscreen-btn');
    const prevBtn = document.getElementById('fullscreen-prev-photo');
    const nextBtn = document.getElementById('fullscreen-next-photo');
    
    if (exitBtn) exitBtn.classList.remove('hidden');
    if (prevBtn) prevBtn.classList.remove('hidden');
    if (nextBtn) nextBtn.classList.remove('hidden');
    
    // Auto-hide controls after 3 seconds
    setTimeout(() => {
      if (this.isFullscreen) {
        if (exitBtn) exitBtn.classList.add('hidden');
        if (prevBtn) prevBtn.classList.add('hidden');
        if (nextBtn) nextBtn.classList.add('hidden');
      }
    }, 3000);
  }

  async startScreensaver() {
    // Ensure manifest is loaded
    if (!this.manifest || this.albums.length === 0) {
      await this.loadManifest();
    }
    
    // Load last used album or first album
    const albumToLoad = this.lastUsedAlbum || (this.albums.length > 0 ? this.albums[0].name : null);
    
    if (!albumToLoad) return;
    
    // Navigate to photos page if not already there
    if (pageManager.getCurrentPageId() !== 'photos') {
      await pageManager.navigateTo('photos');
      // Wait a bit for page to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Load album if needed
    if (!this.currentAlbum || this.currentAlbum.name !== albumToLoad) {
      this.loadAlbum(albumToLoad);
    }
    
    // Wait for photos to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enter fullscreen with autoplay
    this.enterFullscreen(true);
  }

  showNavigationButtons() {
    const prevBtn = document.getElementById('prev-photo');
    const nextBtn = document.getElementById('next-photo');
    
    if (prevBtn) prevBtn.classList.remove('hidden');
    if (nextBtn) nextBtn.classList.remove('hidden');
  }

  showNoAlbums() {
    const container = document.getElementById('photo-container');
    if (container) {
      container.innerHTML = `
        <div class="text-center text-white">
          <div class="text-6xl mb-4">📁</div>
          <h2 class="text-2xl font-bold mb-2">No Albums Found</h2>
          <p class="text-gray-400">Create folders in public/photos/</p>
          <p class="text-gray-400 text-sm mt-2">Then run: node generate-photo-manifest.js</p>
        </div>
      `;
    }
  }

  showNoPhotos() {
    const container = document.getElementById('photo-container');
    if (container) {
      container.innerHTML = `
        <div class="text-center text-white">
          <div class="text-6xl mb-4">📷</div>
          <h2 class="text-2xl font-bold mb-2">No Photos in Album</h2>
          <p class="text-gray-400">Add photos to this album folder</p>
          <p class="text-gray-400 text-sm mt-2">Then run: node generate-photo-manifest.js</p>
        </div>
      `;
    }
  }

  showManifestError(error) {
    const container = document.getElementById('photo-container');
    if (container) {
      container.innerHTML = `
        <div class="text-center text-white">
          <div class="text-6xl mb-4">⚠️</div>
          <h2 class="text-2xl font-bold mb-2">Manifest Not Found</h2>
          <p class="text-gray-400 mb-4">Run the manifest generator:</p>
          <code class="bg-gray-800 px-4 py-2 rounded text-sm">node generate-photo-manifest.js</code>
          <p class="text-gray-500 text-xs mt-4">${error.message}</p>
        </div>
      `;
    }
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
