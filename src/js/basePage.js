// Base Page Class - All pages extend this

class BasePage {
  constructor(id, containerId) {
    this.id = id;
    this.container = document.getElementById(containerId);
    this.isVisible = false;
    this.hasRendered = false; // Track if page has been rendered
  }

  async show(direction = 'none') {
    if (!this.container) return;

    // Set initial state based on direction
    if (direction === 'left') {
      this.container.style.transform = 'translateX(100%)';
    } else if (direction === 'right') {
      this.container.style.transform = 'translateX(-100%)';
    } else {
      this.container.style.transform = 'translateX(0)';
    }

    this.container.classList.remove('hidden');
    this.isVisible = true;

    // Only render once (unless page explicitly calls render again)
    if (!this.hasRendered) {
      this.render();
      this.hasRendered = true;
    }

    // Animate in
    await this.animateIn();
    
    // Call lifecycle hook
    this.onShow();
  }

  async hide(direction = 'none') {
    if (!this.container) return;

    // Call lifecycle hook
    this.onHide();

    // Animate out
    await this.animateOut(direction);

    this.container.classList.add('hidden');
    this.isVisible = false;
  }

  async animateIn() {
    return new Promise(resolve => {
      this.container.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      this.container.style.opacity = '1';
      this.container.style.transform = 'translateX(0)';
      setTimeout(resolve, 300);
    });
  }

  async animateOut(direction) {
    return new Promise(resolve => {
      this.container.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
      this.container.style.opacity = '0';
      
      if (direction === 'left') {
        this.container.style.transform = 'translateX(-100%)';
      } else if (direction === 'right') {
        this.container.style.transform = 'translateX(100%)';
      }
      
      setTimeout(resolve, 300);
    });
  }

  render() {
    // Override in subclasses
  }

  onShow() {
    // Lifecycle hook - override in subclasses
  }

  onHide() {
    // Lifecycle hook - override in subclasses
  }
}
