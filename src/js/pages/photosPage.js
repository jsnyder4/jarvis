// Photos Page - Photo gallery with slideshow

class PhotosPage extends BasePage {
  constructor() {
    super('photos', 'page-photos');
    this.photoService = null;
    this.photos = [];
    this.currentIndex = 0;
    this.slideshowInterval = null;
    this.isPlaying = false;
    this.isFullscreen = false;
  }

  render() {
    if (!this.container) return;

    const config = window.CONFIG?.photos || {};
    const interval = config.slideshowInterval || 5;

    this.container.innerHTML = `
      <div class="h-full flex flex-col pb-20 px-8 pt-6 bg-white">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 flex-shrink-0">
          <h1 class="text-2xl font-bold text-gray-800">Photos</h1>
          <div class="flex gap-2">
            <button id="fullscreen-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg">
              ⛶ Fullscreen
            </button>
            <button id="play-pause-btn" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-lg">
              ▶ Play Slideshow
            </button>
          </div>
        </div>

        <!-- Photo display area -->
        <div class="flex-1 flex items-center justify-center bg-gray-900 rounded-xl overflow-hidden relative min-h-0">
          <div id="photo-container" class="w-full h-full flex items-center justify-center relative">
            <!-- Photos will be inserted here -->
            <div class="text-white text-2xl">Loading photos...</div>
          </div>

          <!-- Navigation arrows -->
          <button id="prev-photo" class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full transition hidden">
            ‹
          </button>
          <button id="next-photo" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full transition hidden">
            ›
          </button>

          <!-- Photo info overlay -->
          <div id="photo-info" class="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hidden">
            <div class="text-sm" id="photo-count"></div>
            <div class="text-xs opacity-75" id="album-name"></div>
          </div>
        </div>
      </div>
    `;
  }

  async onShow() {
    // Initialize photo service
    if (!this.photoService) {
      this.photoService = photoService.getInstance();
    }

    // Setup button handlers
    this.setupEventHandlers();

    // Fetch photos
    try {
      this.photos = await this.photoService.fetchAllPhotos();
      
      if (this.photos.length === 0) {
        this.showNoPhotos();
      } else {
        this.currentIndex = 0;
        this.displayPhoto(this.currentIndex);
        this.showNavigationButtons();
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      this.showError(error);
    }

    // Setup global reference
    window.photosPage = this;
  }

  onHide() {
    this.stopSlideshow();
    if (this.isFullscreen) {
      this.exitFullscreen();
    }
  }

  setupEventHandlers() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-photo');
    const nextBtn = document.getElementById('next-photo');

    if (fullscreenBtn) {
      fullscreenBtn.onclick = () => this.toggleFullscreen();
    }

    if (playPauseBtn) {
      playPauseBtn.onclick = () => this.toggleSlideshow();
    }

    if (prevBtn) {
      prevBtn.onclick = () => this.previousPhoto();
    }

    if (nextBtn) {
      nextBtn.onclick = () => this.nextPhoto();
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (!this.isVisible) return;
      
      if (e.key === 'ArrowLeft') {
        this.previousPhoto();
      } else if (e.key === 'ArrowRight') {
        this.nextPhoto();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.toggleSlideshow();
      } else if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      }
    });
  }

  displayPhoto(index) {
    if (!this.photos || this.photos.length === 0) return;

    const photo = this.photos[index];
    const container = document.getElementById('photo-container');
    const photoInfo = document.getElementById('photo-info');
    const photoCount = document.getElementById('photo-count');
    const albumName = document.getElementById('album-name');

    if (container) {
      const config = window.CONFIG?.photos || {};
      const transitionDuration = config.transitionDuration || 1000;

      // Create new image
      const img = document.createElement('img');
      img.className = 'max-w-full max-h-full object-contain';
      img.style.opacity = '0';
      img.style.transition = `opacity ${transitionDuration}ms ease-in-out`;

      // Show loading message
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'text-white text-xl';
      loadingDiv.textContent = 'Loading photo...';
      container.innerHTML = '';
      container.appendChild(loadingDiv);

      // Load high-res image
      img.onload = () => {
        // Clear container and show image
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

      // Start loading
      img.src = photo.url;
    }

    // Update info
    if (photoCount) {
      photoCount.textContent = `${index + 1} of ${this.photos.length}`;
    }
    if (albumName) {
      albumName.textContent = photo.albumName;
    }
    if (photoInfo) {
      photoInfo.classList.remove('hidden');
    }
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
      playPauseBtn.innerHTML = '▶ Play Slideshow';
      playPauseBtn.className = 'px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-lg';
    }

    console.log('Slideshow stopped');
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  enterFullscreen() {
    const elem = document.documentElement;
    
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }

    this.isFullscreen = true;
    const btn = document.getElementById('fullscreen-btn');
    if (btn) {
      btn.innerHTML = '⛶ Exit Fullscreen';
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

    this.isFullscreen = false;
    const btn = document.getElementById('fullscreen-btn');
    if (btn) {
      btn.innerHTML = '⛶ Fullscreen';
    }
  }

  showNavigationButtons() {
    const prevBtn = document.getElementById('prev-photo');
    const nextBtn = document.getElementById('next-photo');
    
    if (prevBtn) prevBtn.classList.remove('hidden');
    if (nextBtn) nextBtn.classList.remove('hidden');
  }

  showNoPhotos() {
    const container = document.getElementById('photo-container');
    if (container) {
      container.innerHTML = `
        <div class="text-center text-white">
          <div class="text-6xl mb-4">📷</div>
          <h2 class="text-2xl font-bold mb-2">No Photos Found</h2>
          <p class="text-gray-400">Check your Google Photos album links in config.js</p>
        </div>
      `;
    }
  }

  showError(error) {
    const container = document.getElementById('photo-container');
    if (container) {
      container.innerHTML = `
        <div class="text-center text-white">
          <div class="text-6xl mb-4">⚠️</div>
          <h2 class="text-2xl font-bold mb-2 text-red-500">Error Loading Photos</h2>
          <p class="text-gray-400">${error.message}</p>
        </div>
      `;
    }
  }
}
