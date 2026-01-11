// Bible Page - Verse of the Day

class BiblePage extends BasePage {
  constructor() {
    super('bible', 'page-bible');
    this.verseData = null;
    this.isLoading = false;
  }

  async onShow() {
    this.render();
    await this.loadVerseOfTheDay();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="h-full bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col pb-24 px-8 pt-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Verse of the Day</h1>
        
        <div class="flex-1 flex items-center justify-center">
          <!-- Verse Card -->
          <div id="verse-card" class="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
            <div class="flex items-center justify-center h-64">
              <div class="animate-pulse text-gray-400 text-xl">Loading verse...</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async loadVerseOfTheDay() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    const verseCard = document.getElementById('verse-card');

    try {
      const response = await fetch('https://beta.ourmanna.com/api/v1/get/?format=json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.verseData = data.verse.details;
      this.displayVerse();

    } catch (error) {
      console.error('Failed to load verse:', error);
      verseCard.innerHTML = `
        <div class="text-center py-12">
          <div class="text-6xl mb-4">📖</div>
          <p class="text-xl text-gray-600 mb-2">Unable to load verse</p>
          <p class="text-sm text-gray-500">Please check your internet connection</p>
          <button 
            onclick="pageManager.currentPage.loadVerseOfTheDay()" 
            class="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      `;
    } finally {
      this.isLoading = false;
    }
  }

  displayVerse() {
    if (!this.verseData || !this.container) return;

    const verseCard = document.getElementById('verse-card');
    verseCard.innerHTML = `
      <div class="text-center">
        <!-- Verse Text -->
        <div class="mb-8">
          <p class="text-2xl md:text-3xl leading-relaxed text-gray-800 font-serif italic">
            "${this.verseData.text}"
          </p>
        </div>

        <!-- Reference -->
        <div class="border-t-2 border-gray-200 pt-6">
          <p class="text-xl font-semibold text-gray-700">
            ${this.verseData.reference}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            ${this.verseData.version}
          </p>
        </div>

        <!-- Refresh Button -->
        <div class="mt-8">
          <button 
            onclick="pageManager.currentPage.loadVerseOfTheDay()" 
            class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            🔄 Refresh Verse
          </button>
        </div>
      </div>
    `;
  }

  onHide() {
    // No cleanup needed
  }
}
