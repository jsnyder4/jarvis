# Centralized Configuration

The `config.js` file contains all user-configurable settings for the Jarvis Dashboard. This file is ignored by git so you can customize it without creating merge conflicts.

## Setup

1. If `config.js` doesn't exist, copy from the example:
   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` with your preferences

## Configuration Sections

### Location Settings
- `latitude` / `longitude` - Your coordinates for weather data
- Find yours at: https://www.latlong.net/

### Weather Settings
- `refreshInterval` - How often to update weather (minutes)
- `temperatureUnit` - `fahrenheit` or `celsius`
- `windSpeedUnit` - `mph`, `kmh`, `ms`, or `kn`
- `precipitationUnit` - `inch` or `mm`
- `forecastDays` - Number of forecast days (1-16)

### Time/Date Settings
- `use24Hour` - 12-hour (false) or 24-hour (true) format
- `showSeconds` - Show seconds in time display
- `dateFormat` - Customize date display format

### Calendar Settings (Phase 3)
- `feeds` - Array of iCal URLs with names and colors
- `refreshInterval` - How often to sync calendars
- `defaultView` - `month`, `week`, or `day`

### Sports Settings (Phase 4)
- `favorites` - Your favorite teams by league
- `leagues` - Which leagues to display
- `refreshInterval` - How often to update scores

## Example: Changing Location

```javascript
location: {
  latitude: 40.7128,   // New York City
  longitude: -74.0060,
  name: 'New York, NY'
}
```

## Example: Using Celsius

```javascript
weather: {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  precipitationUnit: 'mm'
}
```

## Note

The `config.js` file is gitignored to prevent accidental commits of personal settings. Always edit `config.js`, not `config.example.js`.
