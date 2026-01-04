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
    latitude: 39.264874137394095,
    longitude: -84.33681636832196,
    
    // Display name for your location (future use)
    name: 'Cincinnati, OH',
    
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
      // Example:
      // {
      //   url: 'https://calendar.google.com/calendar/ical/YOUR_CALENDAR_ID/basic.ics',
      //   name: 'Family Calendar',
      //   color: '#3b82f6'  // Blue
      // },
      // {
      //   url: 'https://outlook.office365.com/owa/calendar/YOUR_CALENDAR/calendar.ics',
      //   name: 'Work Calendar',
      //   color: '#ef4444'  // Red
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
