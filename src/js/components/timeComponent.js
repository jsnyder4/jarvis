// Time Component - Displays current time and date

class TimeComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.updateInterval = null;
    
    // Get time config
    const config = window.CONFIG || {};
    const timeConfig = config.time || {};
    this.use24Hour = timeConfig.use24Hour || false;
    this.showSeconds = timeConfig.showSeconds || false;
    this.dateFormat = timeConfig.dateFormat || {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };
  }

  render() {
    if (!this.container) return;

    const now = new Date();
    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !this.use24Hour
    };
    
    if (this.showSeconds) {
      timeOptions.second = '2-digit';
    }
    
    const timeString = now.toLocaleTimeString('en-US', timeOptions);
    const dateString = now.toLocaleDateString('en-US', this.dateFormat);

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
