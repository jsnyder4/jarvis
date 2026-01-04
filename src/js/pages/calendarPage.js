// Calendar Page - iCal integration with month and week views

class CalendarPage extends BasePage {
  constructor() {
    super('calendar', 'page-calendar');
    this.calendarService = null;
    this.monthView = null;
    this.weekView = null;
    this.gestureManager = null;
    this.currentView = 'month'; // 'month' or 'week'
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="h-full flex flex-col pb-20 px-8 pt-6">
        <div class="flex items-center justify-between mb-4 flex-shrink-0">
          <h1 class="text-4xl font-bold text-gray-800">Calendar</h1>
          
          <!-- Modern segmented control for view switcher -->
          <div class="inline-flex bg-gray-100 rounded-xl p-1 shadow-inner">
            <button onclick="calendarPage.switchView('month')" 
                    id="view-month-btn"
                    class="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${this.currentView === 'month' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'}">
              Month
            </button>
            <button onclick="calendarPage.switchView('week')" 
                    id="view-week-btn"
                    class="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${this.currentView === 'week' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'}">
              Week
            </button>
          </div>
        </div>
        
        <div id="calendar-view-container" class="flex-1 min-h-0"></div>
        
        <!-- Event Detail Modal (hidden by default) -->
        <div id="event-detail-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div id="event-detail-content"></div>
            <button onclick="window.hideEventDetail()" class="mt-6 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async onShow() {
    // Initialize calendar service
    if (!this.calendarService) {
      this.calendarService = calendarService.getInstance();
    }

    // Check if calendars are configured
    const config = window.CONFIG?.calendar || {};
    if (!config.feeds || config.feeds.length === 0) {
      this.renderNoCalendars();
      return;
    }

    // Fetch calendar data
    try {
      await this.calendarService.fetchAllCalendars();
      this.renderCurrentView();
    } catch (error) {
      console.error('Error loading calendars:', error);
      this.renderError(error);
    }

    // Setup global event detail functions
    window.showEventDetail = (eventId) => this.showEventDetail(eventId);
    window.hideEventDetail = () => this.hideEventDetail();
    
    // Expose page instance globally for button clicks
    window.calendarPage = this;
    
    // Initialize gesture manager for swipe navigation
    if (!this.gestureManager) {
      this.gestureManager = new CalendarGestureManager(this.monthView, this.weekView);
    }
  }

  renderNoCalendars() {
    const container = document.getElementById('calendar-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-20">
        <div class="text-8xl mb-6">📅</div>
        <h2 class="text-3xl font-bold text-gray-800 mb-4">No Calendars Configured</h2>
        <p class="text-xl text-gray-600 mb-6">Add your calendar feeds in config.js</p>
        <div class="bg-gray-100 rounded-xl p-6 max-w-2xl mx-auto text-left">
          <p class="text-sm text-gray-700 mb-2">Example configuration:</p>
          <pre class="text-xs bg-white p-4 rounded overflow-x-auto"><code>calendar: {
  feeds: [
    {
      url: 'https://calendar.google.com/calendar/ical/...',
      name: 'Family Calendar',
      color: '#3b82f6'
    }
  ]
}</code></pre>
        </div>
      </div>
    `;
  }

  renderError(error) {
    const container = document.getElementById('calendar-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-20">
        <div class="text-8xl mb-6">⚠️</div>
        <h2 class="text-3xl font-bold text-red-600 mb-4">Calendar Error</h2>
        <p class="text-xl text-gray-600">${error.message}</p>
      </div>
    `;
  }

  renderCurrentView() {
    if (this.currentView === 'month') {
      this.renderMonthView();
    } else {
      this.renderWeekView();
    }
  }

  renderMonthView() {
    if (!this.monthView) {
      this.monthView = new CalendarMonthView('calendar-view-container');
      window.calendarMonthView = this.monthView; // Expose for button clicks
    }
    
    this.monthView.setEvents(this.calendarService.events);
    this.monthView.render();
  }

  renderWeekView() {
    if (!this.weekView) {
      this.weekView = new CalendarWeekView('calendar-view-container');
      window.calendarWeekView = this.weekView; // Expose for button clicks
    }
    
    this.weekView.setEvents(this.calendarService.events);
    this.weekView.render();
  }

  switchView(view) {
    this.currentView = view;
    
    // Update button states with modern styling
    const monthBtn = document.getElementById('view-month-btn');
    const weekBtn = document.getElementById('view-week-btn');
    
    if (monthBtn && weekBtn) {
      if (view === 'month') {
        monthBtn.className = 'px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 bg-white text-blue-600 shadow-md';
        weekBtn.className = 'px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 text-gray-600 hover:text-gray-900';
      } else {
        monthBtn.className = 'px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 text-gray-600 hover:text-gray-900';
        weekBtn.className = 'px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 bg-white text-blue-600 shadow-md';
      }
    }
    
    // Update gesture manager
    if (this.gestureManager) {
      this.gestureManager.setCurrentView(view);
    }
    
    this.renderCurrentView();
  }

  showEventDetail(eventId) {
    const event = this.calendarService.events.find(e => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById('event-detail-modal');
    const content = document.getElementById('event-detail-content');

    const startTime = event.isAllDay ? 'All day' : event.startDate.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    content.innerHTML = `
      <div class="border-l-4 pl-4 mb-4" style="border-color: ${event.calendarColor}">
        <div class="text-sm text-gray-500 mb-1">${event.calendarName}</div>
        <h2 class="text-3xl font-bold text-gray-800 mb-2">${event.title}</h2>
      </div>
      
      <div class="space-y-3">
        <div>
          <div class="text-sm font-semibold text-gray-600">When</div>
          <div class="text-lg">${startTime}</div>
        </div>
        
        ${event.location ? `
          <div>
            <div class="text-sm font-semibold text-gray-600">Where</div>
            <div class="text-lg">${event.location}</div>
          </div>
        ` : ''}
        
        ${event.description ? `
          <div>
            <div class="text-sm font-semibold text-gray-600">Description</div>
            <div class="text-base text-gray-700 whitespace-pre-wrap">${event.description}</div>
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.remove('hidden');
  }

  hideEventDetail() {
    const modal = document.getElementById('event-detail-modal');
    modal.classList.add('hidden');
  }

  onHide() {
    // Clean up
    window.showEventDetail = null;
    window.hideEventDetail = null;
    window.calendarPage = null;
    window.calendarMonthView = null;
    window.calendarWeekView = null;
    
    if (this.gestureManager) {
      this.gestureManager.destroy();
    }
  }
}
