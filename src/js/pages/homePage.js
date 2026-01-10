// Home Page - Dashboard with navigation tiles

class HomePage extends BasePage {
  constructor() {
    super('home', 'page-home');
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="h-full flex items-center justify-center pb-24 px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <!-- Navigation Tiles Grid -->
        <div class="grid grid-cols-3 gap-8 max-w-6xl w-full">
          <!-- Weather Tile -->
          <button onclick="pageManager.navigateTo('weather')" class="bg-gradient-to-br from-sky-400 to-blue-500 p-10 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all transform">
            <div class="text-7xl mb-4">🌤️</div>
            <h3 class="text-3xl font-bold text-white mb-2">Weather</h3>
            <p class="text-blue-100 text-base">Forecast & conditions</p>
          </button>
          
          <!-- Calendar Tile -->
          <button onclick="pageManager.navigateTo('calendar')" class="bg-gradient-to-br from-purple-400 to-purple-600 p-10 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all transform">
            <div class="text-7xl mb-4">📅</div>
            <h3 class="text-3xl font-bold text-white mb-2">Calendar</h3>
            <p class="text-purple-100 text-base">Events & schedule</p>
          </button>
          
          <!-- Photos Tile -->
          <button onclick="pageManager.navigateTo('photos')" class="bg-gradient-to-br from-pink-400 to-rose-500 p-10 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all transform">
            <div class="text-7xl mb-4">📷</div>
            <h3 class="text-3xl font-bold text-white mb-2">Photos</h3>
            <p class="text-pink-100 text-base">Family memories</p>
          </button>
          
          <!-- Sports Tile -->
          <button onclick="pageManager.navigateTo('sports')" class="bg-gradient-to-br from-green-400 to-emerald-600 p-10 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all transform">
            <div class="text-7xl mb-4">⚽</div>
            <h3 class="text-3xl font-bold text-white mb-2">Sports</h3>
            <p class="text-green-100 text-base">Scores & standings</p>
          </button>
          
          <!-- Lists Tile -->
          <button onclick="pageManager.navigateTo('lists')" class="bg-gradient-to-br from-orange-400 to-amber-500 p-10 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all transform">
            <div class="text-7xl mb-4">📝</div>
            <h3 class="text-3xl font-bold text-white mb-2">Lists</h3>
            <p class="text-orange-100 text-base">Shopping & tasks</p>
          </button>

          <!-- Placeholder for future -->
          <div class="bg-gradient-to-br from-gray-200 to-gray-300 p-10 rounded-2xl shadow-xl opacity-50">
            <div class="text-7xl mb-4">➕</div>
            <h3 class="text-3xl font-bold text-gray-600 mb-2">More</h3>
            <p class="text-gray-500 text-base">Coming soon</p>
          </div>
        </div>
      </div>
    `;
  }

  onShow() {
    // No components to initialize - just static tiles
  }

  onHide() {
    // Nothing to clean up
  }
}
