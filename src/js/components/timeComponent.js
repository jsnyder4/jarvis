// Time Component - Displays current time and date

class TimeComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.updateInterval = null;
  }

  render() {
    if (!this.container) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    this.container.innerHTML = `
      <div class="text-center">
        <div class="text-8xl font-bold text-gray-800 mb-2">
          ${timeString}
        </div>
        <div class="text-3xl text-gray-600">
          ${dateString}
        </div>
      </div>
    `;
  }

  start() {
    this.render();
    // Update every second
    this.updateInterval = setInterval(() => this.render(), 1000);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}
