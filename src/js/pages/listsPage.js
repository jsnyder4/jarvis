// Lists Page - Placeholder for Phase 5

class ListsPage extends BasePage {
  constructor() {
    super('lists', 'page-lists');
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="h-full flex items-center justify-center pb-24">
        <div class="text-center">
          <div class="text-9xl mb-6">📝</div>
          <h1 class="text-2xl font-bold text-gray-800 mb-4">Lists</h1>
          <p class="text-2xl text-gray-600">Coming in Phase 5</p>
          <p class="text-lg text-gray-500 mt-4">Shopping lists and task management</p>
        </div>
      </div>
    `;
  }
}
