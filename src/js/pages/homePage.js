// Home Page - Dashboard overview

class HomePage extends BasePage {
  constructor() {
    super('home', 'page-home');
    this.timeComponent = null;
    this.weatherComponent = null;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto pb-24 px-8 pt-8">
        <!-- Time Display -->
        <div id="home-time-container" class="mb-6"></div>
        
        <!-- Weather Summary -->
        <div id="home-weather-container"></div>
        
        <!-- Quick Links Grid -->
        <div class="mt-8 grid grid-cols-3 gap-6">
          <button onclick="pageManager.navigateTo('calendar')" class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-purple-200">
            <div class="text-5xl mb-3">📅</div>
            <h3 class="text-2xl font-bold text-purple-800">Calendar</h3>
            <p class="text-purple-600 text-sm mt-1">View events</p>
          </button>
          
          <button onclick="pageManager.navigateTo('sports')" class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-green-200">
            <div class="text-5xl mb-3">⚽</div>
            <h3 class="text-2xl font-bold text-green-800">Sports</h3>
            <p class="text-green-600 text-sm mt-1">Scores & standings</p>
          </button>
          
          <button onclick="pageManager.navigateTo('lists')" class="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-orange-200">
            <div class="text-5xl mb-3">📝</div>
            <h3 class="text-2xl font-bold text-orange-800">Lists</h3>
            <p class="text-orange-600 text-sm mt-1">Shopping & tasks</p>
          </button>
        </div>
      </div>
    `;
  }

  onShow() {
    // Initialize time component
    if (!this.timeComponent) {
      this.timeComponent = new TimeComponent('home-time-container');
    }
    this.timeComponent.start();

    // Initialize weather component (compact version)
    if (!this.weatherComponent) {
      this.weatherComponent = new WeatherComponent('home-weather-container');
    }
    this.weatherComponent.start();
  }

  onHide() {
    if (this.timeComponent) {
      this.timeComponent.stop();
    }
    if (this.weatherComponent) {
      this.weatherComponent.stop();
    }
  }
}
