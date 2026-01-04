// Weather Service - Open-Meteo API Integration

class WeatherService {
  constructor() {
    // Get location from config
    const config = window.CONFIG || {};
    const location = config.location || {};
    const weatherConfig = config.weather || {};
    
    console.log('WeatherService config:', { config: window.CONFIG, weatherConfig, forecastDays: weatherConfig.forecastDays });
    
    this.latitude = location.latitude || 40.0150;
    this.longitude = location.longitude || -83.0758;
    this.temperatureUnit = weatherConfig.temperatureUnit || 'fahrenheit';
    this.windSpeedUnit = weatherConfig.windSpeedUnit || 'mph';
    this.precipitationUnit = weatherConfig.precipitationUnit || 'inch';
    this.forecastDays = weatherConfig.forecastDays || 7;
    
    console.log('WeatherService initialized with forecastDays:', this.forecastDays);
    
    this.cache = null;
    this.lastFetch = null;
    this.cacheDuration = (weatherConfig.refreshInterval || 15) * 60 * 1000;
  }

  setLocation(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.cache = null; // Clear cache when location changes
  }

  async getCurrentWeather() {
    // Check cache first
    if (this.cache && this.lastFetch && (Date.now() - this.lastFetch < this.cacheDuration)) {
      console.log('Using cached weather data');
      return this.cache;
    }

    try {
      console.log(`Fetching weather for ${this.forecastDays} days...`);
      const url = `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${this.latitude}&` +
        `longitude=${this.longitude}&` +
        `current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,pressure_msl,uv_index&` +
        `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max&` +
        `temperature_unit=${this.temperatureUnit}&` +
        `wind_speed_unit=${this.windSpeedUnit}&` +
        `precipitation_unit=${this.precipitationUnit}&` +
        `timezone=auto&` +
        `forecast_days=${this.forecastDays}`;

      console.log('Weather API URL:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.cache = this.formatWeatherData(data);
      this.lastFetch = Date.now();
      
      console.log(`Weather data formatted: ${this.cache.forecast.length} days`);
      
      return this.cache;
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      throw error;
    }
  }

  formatWeatherData(data) {
    const current = data.current;
    const daily = data.daily;
    const tempUnit = this.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
    const windUnit = this.windSpeedUnit;
    const precipUnit = this.precipitationUnit === 'inch' ? '"' : 'mm';

    return {
      current: {
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        precipitation: current.precipitation,
        pressure: Math.round(current.pressure_msl),
        uvIndex: Math.round(current.uv_index || 0),
        weatherCode: current.weather_code,
        isDay: current.is_day === 1,
        condition: this.getWeatherCondition(current.weather_code),
        icon: this.getWeatherIcon(current.weather_code, current.is_day === 1),
        tempUnit: tempUnit,
        windUnit: windUnit,
        precipUnit: precipUnit
      },
      forecast: daily.time.map((date, index) => ({
        date: date,
        dayName: this.getDayName(date),
        dateShort: this.getShortDate(date),
        tempMax: Math.round(daily.temperature_2m_max[index]),
        tempMin: Math.round(daily.temperature_2m_min[index]),
        precipProbability: daily.precipitation_probability_max[index],
        windSpeed: Math.round(daily.wind_speed_10m_max[index]),
        uvIndex: Math.round(daily.uv_index_max[index] || 0),
        weatherCode: daily.weather_code[index],
        condition: this.getWeatherCondition(daily.weather_code[index]),
        icon: this.getWeatherIcon(daily.weather_code[index], true),
        tempUnit: tempUnit,
        windUnit: windUnit
      }))
    };
  }

  getDayName(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  }

  getShortDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  getWeatherCondition(code) {
    // WMO Weather interpretation codes
    const conditions = {
      0: 'Clear',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light Drizzle',
      53: 'Drizzle',
      55: 'Heavy Drizzle',
      61: 'Light Rain',
      63: 'Rain',
      65: 'Heavy Rain',
      71: 'Light Snow',
      73: 'Snow',
      75: 'Heavy Snow',
      77: 'Snow Grains',
      80: 'Light Showers',
      81: 'Showers',
      82: 'Heavy Showers',
      85: 'Light Snow Showers',
      86: 'Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Hail',
      99: 'Heavy Thunderstorm'
    };
    return conditions[code] || 'Unknown';
  }

  getWeatherIcon(code, isDay = true) {
    // Emoji weather icons
    const icons = {
      0: isDay ? '☀️' : '🌙',      // Clear
      1: isDay ? '🌤️' : '🌙',     // Mainly clear
      2: '⛅',                      // Partly cloudy
      3: '☁️',                      // Overcast
      45: '🌫️',                    // Fog
      48: '🌫️',                    // Fog
      51: '🌦️',                    // Drizzle
      53: '🌦️',                    // Drizzle
      55: '🌧️',                    // Heavy drizzle
      61: '🌧️',                    // Light rain
      63: '🌧️',                    // Rain
      65: '🌧️',                    // Heavy rain
      71: '🌨️',                    // Light snow
      73: '❄️',                     // Snow
      75: '❄️',                     // Heavy snow
      77: '❄️',                     // Snow grains
      80: '🌦️',                    // Light showers
      81: '🌧️',                    // Showers
      82: '⛈️',                     // Heavy showers
      85: '🌨️',                    // Light snow showers
      86: '❄️',                     // Snow showers
      95: '⛈️',                     // Thunderstorm
      96: '⛈️',                     // Thunderstorm with hail
      99: '⛈️'                      // Heavy thunderstorm
    };
    return icons[code] || '🌡️';
  }
}

// Lazy singleton - only create when first accessed
let weatherServiceInstance = null;
const weatherService = {
  getInstance() {
    if (!weatherServiceInstance) {
      weatherServiceInstance = new WeatherService();
    }
    return weatherServiceInstance;
  }
};
