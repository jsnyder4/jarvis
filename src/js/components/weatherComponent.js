// Weather Component - Displays current weather and forecast

class WeatherComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.weatherData = null;
    this.updateInterval = null;
  }

  async fetchAndRender() {
    try {
      this.weatherData = await weatherService.getCurrentWeather();
      this.render();
    } catch (error) {
      this.renderError();
    }
  }

  render() {
    if (!this.container || !this.weatherData) return;

    const { current, forecast } = this.weatherData;

    this.container.innerHTML = `
      <!-- Current Weather -->
      <div class="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-8 text-white shadow-xl mb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-6xl font-bold mb-2">${current.temperature}°F</div>
            <div class="text-2xl mb-1">${current.condition}</div>
            <div class="text-lg opacity-90">Feels like ${current.feelsLike}°F</div>
          </div>
          <div class="text-9xl">${current.icon}</div>
        </div>
        <div class="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-sm opacity-75">Humidity</div>
            <div class="text-xl font-semibold">${current.humidity}%</div>
          </div>
          <div>
            <div class="text-sm opacity-75">Wind</div>
            <div class="text-xl font-semibold">${current.windSpeed} mph</div>
          </div>
          <div>
            <div class="text-sm opacity-75">Precip</div>
            <div class="text-xl font-semibold">${current.precipitation}"</div>
          </div>
        </div>
      </div>

      <!-- 7-Day Forecast -->
      <div class="grid grid-cols-7 gap-3">
        ${forecast.map(day => `
          <div class="bg-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div class="font-semibold text-gray-700 mb-2">${day.dayName}</div>
            <div class="text-4xl mb-2">${day.icon}</div>
            <div class="text-sm text-gray-600 mb-1">${day.condition}</div>
            <div class="flex justify-center gap-2 text-lg">
              <span class="font-bold text-red-600">${day.tempMax}°</span>
              <span class="text-blue-600">${day.tempMin}°</span>
            </div>
            ${day.precipProbability ? `
              <div class="text-xs text-blue-500 mt-1">
                ${day.precipProbability}% 💧
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  renderError() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="bg-red-100 border border-red-400 text-red-700 rounded-xl p-6 text-center">
        <div class="text-4xl mb-2">⚠️</div>
        <div class="text-xl font-semibold mb-2">Weather Unavailable</div>
        <div>Unable to fetch weather data. Please check your connection.</div>
      </div>
    `;
  }

  start() {
    this.fetchAndRender();
    // Update every 15 minutes
    this.updateInterval = setInterval(() => this.fetchAndRender(), 15 * 60 * 1000);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async refresh() {
    await this.fetchAndRender();
  }
}
