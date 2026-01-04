// Calendar Week View Component

class CalendarWeekView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentDate = new Date();
    this.events = [];
    this.onEventClick = null;
  }

  setEvents(events) {
    this.events = events;
  }

  setEventClickHandler(callback) {
    this.onEventClick = callback;
  }

  render() {
    if (!this.container) return;

    const config = window.CONFIG?.calendar || {};
    const firstDayOfWeek = config.firstDayOfWeek || 0; // 0 = Sunday

    // Get week start and end
    const weekStart = new Date(this.currentDate);
    const day = weekStart.getDay();
    const diff = day - firstDayOfWeek;
    weekStart.setDate(weekStart.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Generate week days
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDays.push(date);
    }

    const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    // Full 24-hour day (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    this.container.innerHTML = `
      <div class="calendar-week h-full flex flex-col">
        <!-- Header with navigation -->
        <div class="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 class="text-3xl font-bold text-gray-800">${weekLabel}</h2>
          <div class="flex gap-2">
            <button onclick="calendarWeekView.previousWeek()" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              ← Prev
            </button>
            <button onclick="calendarWeekView.today()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
              Today
            </button>
            <button onclick="calendarWeekView.nextWeek()" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Next →
            </button>
          </div>
        </div>

        <!-- Week grid -->
        <div class="flex-1 overflow-auto min-h-0" id="week-grid-container">
          <div class="grid grid-cols-8 gap-0">
            <!-- Header row with day names -->
            <div class="sticky top-0 bg-gray-50 z-10 border-b-2 border-gray-300"></div>
            ${weekDays.map(date => {
              const isToday = this.isToday(date);
              return `
                <div class="sticky top-0 bg-gray-50 z-10 text-center p-2 border-b-2 border-gray-300">
                  <div class="font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div class="text-2xl ${isToday ? 'text-blue-600 font-bold' : 'text-gray-800'}">${date.getDate()}</div>
                </div>
              `;
            }).join('')}

            <!-- Time slots (all 24 hours) -->
            ${hours.map(hour => `
              <div class="text-right pr-2 text-sm text-gray-600 border-t border-gray-200 py-1 flex items-start" style="height: 60px;">
                ${this.formatHour(hour)}
              </div>
              ${weekDays.map(date => {
                const isToday = this.isToday(date);
                return `
                  <div class="border-t border-l border-gray-200 ${isToday ? 'bg-blue-50' : 'bg-white'} relative" style="height: 60px;" data-date="${date.toISOString()}" data-hour="${hour}">
                  </div>
                `;
              }).join('')}
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // After rendering, position events and scroll to 8 AM
    setTimeout(() => {
      this.positionEvents(weekDays, hours);
      this.scrollToBusinessHours();
    }, 10);
  }

  scrollToBusinessHours() {
    // Scroll to 8 AM (index 8, with 60px per hour)
    const container = document.getElementById('week-grid-container');
    if (container) {
      const scrollPosition = 8 * 60; // 8 AM * 60px per hour
      container.scrollTop = scrollPosition;
      console.log('Scrolled to 8 AM, scrollTop:', container.scrollTop);
    } else {
      console.log('Container not found for scrolling');
    }
  }

  positionEvents(weekDays, hours) {
    // Get all events for the week
    const weekStart = new Date(weekDays[0]);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekDays[6]);
    weekEnd.setHours(23, 59, 59, 999);

    const weekEvents = this.events.filter(event => {
      return event.startDate <= weekEnd && event.endDate >= weekStart && !event.isAllDay;
    });

    // Position each event
    weekEvents.forEach(event => {
      const eventDay = new Date(event.startDate);
      eventDay.setHours(0, 0, 0, 0);
      
      // Find which day column
      const dayIndex = weekDays.findIndex(d => {
        const day = new Date(d);
        day.setHours(0, 0, 0, 0);
        return day.getTime() === eventDay.getTime();
      });

      if (dayIndex === -1) return;

      const startHour = event.startDate.getHours();
      const startMinute = event.startDate.getMinutes();
      const endHour = event.endDate.getHours();
      const endMinute = event.endDate.getMinutes();

      // Find the starting cell (now 0-23 hours)
      const cell = document.querySelector(`[data-date="${weekDays[dayIndex].toISOString()}"][data-hour="${startHour}"]`);
      if (!cell) return;

      // Calculate position and height (60px per hour)
      const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      const startOffset = startMinute / 60; // Fraction of hour
      const height = (totalMinutes / 60) * 60; // 60px per hour
      const top = startOffset * 60;

      // Create event element
      const eventEl = document.createElement('div');
      eventEl.className = 'absolute left-0 right-0 mx-1 rounded cursor-pointer overflow-hidden z-10';
      eventEl.style.backgroundColor = event.calendarColor;
      eventEl.style.color = 'white';
      eventEl.style.top = `${top}px`;
      eventEl.style.height = `${Math.max(height, 20)}px`;
      eventEl.style.padding = '2px 4px';
      eventEl.onclick = () => window.showEventDetail(event.id);

      eventEl.innerHTML = `
        <div class="text-xs font-semibold truncate">${event.title}</div>
        ${height > 25 ? `<div class="text-xs opacity-90">${this.formatTime(event.startDate)}</div>` : ''}
      `;

      cell.appendChild(eventEl);
    });
  }

  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  formatHour(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour} ${period}`;
  }

  formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  previousWeek() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.render();
  }

  nextWeek() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.render();
  }

  today() {
    this.currentDate = new Date();
    this.render();
  }

  goToDate(date) {
    this.currentDate = new Date(date);
    this.render();
  }
}
