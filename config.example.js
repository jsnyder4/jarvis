// Jarvis Dashboard - Configuration
// ====================================
// This file contains all user-configurable settings for the dashboard.
// Edit these values to customize the app for your location and preferences.

const CONFIG = {
  
  // ====================
  // LOCATION SETTINGS
  // ====================
  location: {
    // Your coordinates for weather data
    // Find yours at: https://www.latlong.net/
    latitude: 40.7128,  // Example: New York City
    longitude: -74.0060,
    
    // Display name for your location (future use)
    name: 'Your City',
    
    // Timezone (auto-detected by Open-Meteo, but can override)
    // timezone: 'America/New_York'
  },

  // ====================
  // WEATHER SETTINGS
  // ====================
  weather: {
    // How often to refresh weather data (in minutes)
    refreshInterval: 15,
    
    // Temperature unit: 'fahrenheit' or 'celsius'
    temperatureUnit: 'fahrenheit',
    
    // Wind speed unit: 'mph', 'kmh', 'ms', 'kn'
    windSpeedUnit: 'mph',
    
    // Precipitation unit: 'inch' or 'mm'
    precipitationUnit: 'inch',
    
    // Number of forecast days to show (1-16, default: 7)
    forecastDays: 14
  },

  // ====================
  // TIME/DATE SETTINGS
  // ====================
  time: {
    // 12-hour or 24-hour format
    use24Hour: false,
    
    // Show seconds in the time display
    showSeconds: false,
    
    // Date format options
    dateFormat: {
      weekday: 'long',    // 'short' (Mon) or 'long' (Monday)
      month: 'long',      // 'short' (Jan) or 'long' (January)
      day: 'numeric',     // 1, 2, 3...
      year: 'numeric'     // 2024
    }
  },

  // ====================
  // CALENDAR SETTINGS
  // ====================
  calendar: {
    // iCal feed URLs - add your calendar URLs here
    feeds: [
      // Example Google Calendar:
      // 1. Go to Google Calendar settings
      // 2. Find "Integrate calendar" section
      // 3. Copy the "Secret address in iCal format" URL
      // {
      //   url: 'https://calendar.google.com/calendar/ical/YOUR_CALENDAR_ID%40group.calendar.google.com/private-XXXXX/basic.ics',
      //   name: 'Family Calendar',
      //   color: '#3b82f6'  // Blue
      // },
      
      // Example Outlook/Office 365:
      // 1. Go to Outlook.com calendar
      // 2. Settings → View all Outlook settings → Calendar → Shared calendars
      // 3. Publish calendar and copy ICS link
      // {
      //   url: 'https://outlook.office365.com/owa/calendar/XXXXX@outlook.com/YYYY/calendar.ics',
      //   name: 'Work Calendar',
      //   color: '#ef4444'  // Red
      // },
      
      // Example Apple iCloud Calendar:
      // {
      //   url: 'webcal://p##-caldav.icloud.com/published/2/XXXXX',
      //   name: 'Personal',
      //   color: '#10b981'  // Green
      // }
    ],
    
    // How often to refresh calendar data (in minutes)
    refreshInterval: 30,
    
    // Default view: 'month', 'week', 'day'
    defaultView: 'month',
    
    // First day of week: 0 (Sunday) or 1 (Monday)
    firstDayOfWeek: 0
  },

  // ====================
  // SPORTS SETTINGS
  // ====================
  sports: {
    // Favorite teams (ESPN team IDs - we'll help you find these)
    favorites: {
      mls: [],           // e.g., ['CLB', 'SEA'] for Columbus Crew, Seattle Sounders
      premierLeague: [], // e.g., ['LIV', 'MUN'] for Liverpool, Manchester United
      laLiga: [],        // e.g., ['BAR', 'RMA'] for Barcelona, Real Madrid
      nfl: []            // e.g., ['CLE', 'CIN'] for Cleveland Browns, Cincinnati Bengals
    },
    
    // Which leagues to display (in order of preference)
    leagues: ['mls', 'premierLeague', 'laLiga', 'nfl'],
    
    // How often to refresh scores during active games (in minutes)
    liveRefreshInterval: 5,
    
    // How often to refresh when no games are active (in minutes)
    idleRefreshInterval: 60
  },

  // ====================
  // DISPLAY SETTINGS
  // ====================
  display: {
    // Theme: 'light' or 'dark' (only light implemented currently)
    theme: 'light',
    
    // Screen brightness (future use - would need hardware integration)
    // brightness: 80,
    
    // Enable animations
    animations: true,
    
    // Animation speed: 'slow', 'normal', 'fast'
    animationSpeed: 'normal'
  },

  // ====================
  // PHOTO GALLERY SETTINGS
  // ====================
  photos: {
    // Photo slideshow settings
    // Photos are auto-discovered from subdirectories in public/photos/
    // No manual configuration needed! Just:
    //   1. Create folders in public/photos/ (e.g., "wedding", "vacation")
    //   2. Add photos to those folders
    //   3. Run: npm run photos
    
    // Slideshow interval in seconds
    slideshowInterval: 5,
    
    // Transition duration in milliseconds
    transitionDuration: 1000,
    
    // Photo order: 'random' or 'sequential'
    photoOrder: 'sequential',
    
    // Screensaver inactivity timeout in minutes
    // After this many minutes of no interaction, the app will:
    //   - Navigate to photos page
    //   - Enter fullscreen mode
    //   - Start slideshow automatically
    // Set to 0 to disable screensaver
    screensaverInactivityMinutes: 5
  },

  // ====================
  // VOICE SETTINGS (Phase 9 - Future)
  // ====================
  voice: {
    // Enable voice control
    enabled: false,
    
    // Wake word (when Porcupine is integrated)
    wakeWord: 'jarvis',
    
    // Voice model language
    language: 'en-us'
  },

  // ====================
  // DEVELOPER SETTINGS
  // ====================
  dev: {
    // Show console logs
    debug: false,
    
    // Show component refresh indicators
    showRefreshIndicators: false
  }
};

// Make config available globally
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
