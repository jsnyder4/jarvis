// Weather Page - Full weather display

class WeatherPage extends BasePage {
  constructor() {
    super('weather', 'page-weather');
    this.weatherComponent = null;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto pb-24 px-8 pt-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Weather</h1>
        <div id="weather-full-container"></div>
      </div>
    `;
  }

  onShow() {
    if (!this.weatherComponent) {
      this.weatherComponent = new WeatherComponent('weather-full-container');
    }
    this.weatherComponent.start();
  }

  onHide() {
    if (this.weatherComponent) {
      this.weatherComponent.stop();
    }
  }
}
