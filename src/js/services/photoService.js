// Photo Gallery Service - Fetches photos from Google Photos shared albums

class PhotoService {
  constructor() {
    const config = window.CONFIG || {};
    const photoConfig = config.photos || {};
    
    this.albums = photoConfig.albums || [];
    this.refreshInterval = (photoConfig.refreshInterval || 60) * 60 * 1000;
    this.photoOrder = photoConfig.photoOrder || 'random';
    
    this.photos = [];
    this.lastFetch = null;
    
    console.log('PhotoService initialized with', this.albums.length, 'albums');
  }

  async fetchAllPhotos() {
    if (!this.albums || this.albums.length === 0) {
      console.warn('No photo albums configured');
      return [];
    }

    // Check if we need to refresh
    if (this.lastFetch && (Date.now() - this.lastFetch < this.refreshInterval)) {
      console.log('Using cached photos');
      return this.photos;
    }

    console.log('Fetching photos from', this.albums.length, 'albums');
    
    const fetchPromises = this.albums.map(album => this.fetchAlbumPhotos(album));
    const results = await Promise.allSettled(fetchPromises);
    
    this.photos = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.photos.push(...result.value);
      } else {
        console.error(`Failed to fetch album ${this.albums[index].name}:`, result.reason);
      }
    });

    // Shuffle if random order
    if (this.photoOrder === 'random') {
      this.shuffleArray(this.photos);
    }

    this.lastFetch = Date.now();
    console.log(`Fetched ${this.photos.length} photos total`);
    
    return this.photos;
  }

  async fetchAlbumPhotos(album) {
    // Google Photos shared album URL format
    // We need to extract photos by scraping the page since there's no public API for shared links
    
    try {
      console.log(`Fetching album: ${album.name}`);
      
      // For now, we'll use a CORS proxy to fetch the album page
      // In production, you'd want to run this through your own backend
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(album.url));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Extract photo URLs from the HTML
      // Google Photos embeds data in a specific format
      const photos = this.extractPhotosFromHTML(html, album);
      
      console.log(`Found ${photos.length} photos in ${album.name}`);
      return photos;
      
    } catch (error) {
      console.error(`Error fetching album ${album.name}:`, error);
      throw error;
    }
  }

  extractPhotosFromHTML(html, album) {
    const photos = [];
    
    // Google Photos shared albums embed photo URLs in specific patterns
    // URLs look like: https://lh3.googleusercontent.com/pw/XXXXX or /d/XXXXX
    // Sometimes with size parameters like =w1024-h768-no
    
    // Match full googleusercontent URLs (including pw/ and d/ patterns)
    const imageRegex = /https:\/\/lh3\.googleusercontent\.com\/[a-zA-Z0-9_\/-]+/g;
    const matches = html.match(imageRegex);
    
    if (matches) {
      // Deduplicate
      const uniqueUrls = [...new Set(matches)];
      
      // Filter to only include actual photos (not tiny profile pics)
      const photoUrls = uniqueUrls.filter(url => {
        // Remove URLs that have small size indicators (profile pics)
        if (url.includes('=s64') || url.includes('=s96') || url.includes('=s128') || url.includes('=s40')) {
          return false;
        }
        
        // Keep URLs with pw/ or d/ (these are actual photos)
        if (url.includes('/pw/') || url.includes('/d/')) {
          return true;
        }
        
        return false;
      });
      
      console.log(`Found ${uniqueUrls.length} image URLs, filtered to ${photoUrls.length} photos`);
      
      photoUrls.forEach((url, index) => {
        // Clean the URL - remove any existing size parameters
        let cleanUrl = url;
        if (url.includes('=')) {
          cleanUrl = url.substring(0, url.indexOf('='));
        }
        
        // Request high quality version (add size parameter)
        const highResUrl = cleanUrl + '=w2048-h2048-no';
        
        photos.push({
          id: `${album.name}-${index}`,
          url: highResUrl,
          albumName: album.name,
          albumUrl: album.url
        });
      });
    }
    
    return photos;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  getPhotos() {
    return this.photos;
  }

  // Singleton pattern
  static getInstance() {
    if (!PhotoService.instance) {
      PhotoService.instance = new PhotoService();
    }
    return PhotoService.instance;
  }
}

// Export for use
const photoService = {
  getInstance: () => PhotoService.getInstance()
};
