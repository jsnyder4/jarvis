// Sports Page - Placeholder for Phase 4

class SportsPage extends BasePage {
  constructor() {
    super('sports', 'page-sports');
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="h-full flex items-center justify-center pb-24">
        <div class="text-center">
          <div class="text-9xl mb-6">⚽</div>
          <h1 class="text-6xl font-bold text-gray-800 mb-4">Sports</h1>
          <p class="text-2xl text-gray-600">Coming in Phase 4</p>
          <p class="text-lg text-gray-500 mt-4">Live scores, standings, and schedules</p>
        </div>
      </div>
    `;
  }
}
