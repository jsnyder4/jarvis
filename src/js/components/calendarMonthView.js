// Calendar Month View Component

class CalendarMonthView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentDate = new Date();
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.currentDate.getMonth();
    this.events = [];
    this.onEventClick = null; // Callback for event clicks
  }

  setEvents(events) {
    this.events = events;
  }

  setEventClickHandler(callback) {
    this.onEventClick = callback;
  }

  render() {
    if (!this.container) return;

    const monthName = new Date(this.currentYear, this.currentMonth).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    const config = window.CONFIG?.calendar || {};
    const firstDayOfWeek = config.firstDayOfWeek || 0; // 0 = Sunday

    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const startingDayOfWeek = (firstDay - firstDayOfWeek + 7) % 7;

    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (firstDayOfWeek === 1) {
      dayNames.push(dayNames.shift()); // Monday first
    }

    this.container.innerHTML = `
      <div class="calendar-month h-full flex flex-col">
        <!-- Header with navigation -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-3xl font-bold text-gray-800">${monthName}</h2>
          <div class="flex gap-2">
            <button onclick="calendarMonthView.previousMonth()" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              ← Prev
            </button>
            <button onclick="calendarMonthView.today()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
              Today
            </button>
            <button onclick="calendarMonthView.nextMonth()" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Next →
            </button>
          </div>
        </div>

        <!-- Day headers -->
        <div class="grid grid-cols-7 gap-2 mb-2">
          ${dayNames.map(day => `
            <div class="text-center font-semibold text-gray-600 py-2">${day}</div>
          `).join('')}
        </div>

        <!-- Calendar grid - auto-rows-fr makes all rows equal height -->
        <div class="grid grid-cols-7 auto-rows-fr gap-2 flex-1">
          ${this.renderCalendarDays(startingDayOfWeek, daysInMonth)}
        </div>
      </div>
    `;
  }

  renderCalendarDays(startingDayOfWeek, daysInMonth) {
    let html = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      html += '<div class="calendar-day bg-gray-50 rounded-lg p-2"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      date.setHours(0, 0, 0, 0);
      
      const isToday = date.getTime() === today.getTime();
      const dayEvents = this.getEventsForDay(date);

      html += `
        <div class="calendar-day bg-white rounded-lg p-2 border ${
          isToday ? 'border-blue-500 border-2 bg-blue-50' : 'border-gray-200'
        } hover:shadow-lg transition-shadow flex flex-col min-h-0">
          <div class="text-right mb-1 flex-shrink-0">
            <span class="text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}">${day}</span>
          </div>
          <div class="space-y-1 flex-1 overflow-y-auto">
            ${dayEvents.slice(0, 4).map(event => `
              <div class="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition flex-shrink-0"
                   style="background-color: ${event.calendarColor}20; border-left: 3px solid ${event.calendarColor}"
                   onclick="window.showEventDetail('${event.id}')">
                ${event.isAllDay ? '🕐 ' : this.formatTime(event.startDate)}${event.title}
              </div>
            `).join('')}
            ${dayEvents.length > 4 ? `
              <div class="text-xs text-gray-500 text-center flex-shrink-0">+${dayEvents.length - 4} more</div>
            ` : ''}
          </div>
        </div>
      `;
    }

    return html;
  }

  getEventsForDay(date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return this.events.filter(event => {
      return (event.startDate <= dayEnd && event.endDate >= dayStart);
    });
  }

  formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).replace(' ', '').toLowerCase() + ' ';
  }

  previousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.render();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.render();
  }

  today() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.render();
  }

  goToDate(date) {
    this.currentYear = date.getFullYear();
    this.currentMonth = date.getMonth();
    this.render();
  }
}
