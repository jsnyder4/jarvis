// Screensaver Manager - Tracks user inactivity and triggers photo slideshow

class ScreensaverManager {
  constructor() {
    this.inactivityTimeout = null;
    this.inactivityDelay = null;
    this.isScreensaverActive = false;
    this.photosPage = null;
  }

  init(photosPage) {
    this.photosPage = photosPage;
    
    // Get inactivity delay from config (in minutes), default to 5 minutes
    const config = window.CONFIG?.photos || {};
    const inactivityMinutes = config.screensaverInactivityMinutes !== undefined 
      ? config.screensaverInactivityMinutes 
      : 5;
    
    // If set to 0, disable screensaver
    if (inactivityMinutes === 0) {
      return;
    }
    
    this.inactivityDelay = inactivityMinutes * 60 * 1000; // Convert to milliseconds
    
    this.setupActivityListeners();
    this.resetInactivityTimer();
  }

  setupActivityListeners() {
    // Listen for any user interaction
    const events = ['mousedown', 'keydown', 'touchstart', 'touchmove', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.onActivity();
      }, { passive: true });
    });
    
    // Handle mousemove separately with debouncing to avoid excessive resets
    let mouseMoveTimeout = null;
    document.addEventListener('mousemove', () => {
      if (!mouseMoveTimeout) {
        mouseMoveTimeout = setTimeout(() => {
          this.onActivity();
          mouseMoveTimeout = null;
        }, 1000); // Only reset timer once per second of mouse movement
      }
    }, { passive: true });
    
    // Handle scroll separately with debouncing
    let scrollTimeout = null;
    document.addEventListener('scroll', () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          this.onActivity();
          scrollTimeout = null;
        }, 1000);
      }
    }, { passive: true });
  }

  onActivity() {
    // If screensaver is active, exit it
    if (this.isScreensaverActive) {
      this.exitScreensaver();
    }
    
    // Reset the inactivity timer
    this.resetInactivityTimer();
  }

  resetInactivityTimer() {
    // Don't reset if screensaver is disabled
    if (!this.inactivityDelay) return;
    
    // Clear existing timer
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }

    // Start new timer
    this.inactivityTimeout = setTimeout(() => {
      this.startScreensaver();
    }, this.inactivityDelay);
  }

  async startScreensaver() {
    if (this.isScreensaverActive) return;
    
    this.isScreensaverActive = true;
    
    // Trigger photo slideshow
    if (this.photosPage) {
      await this.photosPage.startScreensaver();
    }
  }

  exitScreensaver() {
    if (!this.isScreensaverActive) return;
    
    this.isScreensaverActive = false;
    
    // Exit fullscreen if in photos page
    if (this.photosPage && this.photosPage.isFullscreen) {
      this.photosPage.exitFullscreen();
    }
  }

  cleanup() {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
  }
}

// Create global instance
window.screensaverManager = new ScreensaverManager();
