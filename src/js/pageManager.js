// Page Manager - Handles navigation and page switching

class PageManager {
  constructor() {
    this.pages = new Map();
    this.currentPage = null;
    this.isTransitioning = false;
  }

  registerPage(id, page) {
    this.pages.set(id, page);
  }

  async navigateTo(pageId, direction = 'none') {
    if (this.isTransitioning || !this.pages.has(pageId)) {
      return;
    }

    const newPage = this.pages.get(pageId);
    
    if (this.currentPage === newPage) {
      return;
    }

    this.isTransitioning = true;

    // Hide current page with animation
    if (this.currentPage) {
      await this.currentPage.hide(direction);
    }

    // Show new page with animation
    await newPage.show(direction);
    
    this.currentPage = newPage;
    this.isTransitioning = false;

    // Update navigation bar active state
    this.updateNavigation(pageId);
    
    console.log(`Navigated to: ${pageId}`);
  }

  updateNavigation(activePageId) {
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.dataset.page === activePageId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  getCurrentPageId() {
    for (const [id, page] of this.pages.entries()) {
      if (page === this.currentPage) {
        return id;
      }
    }
    return null;
  }

  getPageIds() {
    return Array.from(this.pages.keys());
  }
}

// Create global page manager instance
const pageManager = new PageManager();
