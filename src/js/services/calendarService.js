// Calendar Service - iCal integration with ical.js
// Note: Requires ical.js to be loaded via script tag

class CalendarService {
  constructor() {
    // Check if ICAL is available
    if (typeof ICAL === 'undefined') {
      console.error('ical.js not loaded! Include it via script tag.');
      return;
    }

    // Get calendar config
    const config = window.CONFIG || {};
    const calendarConfig = config.calendar || {};
    
    this.feeds = calendarConfig.feeds || [];
    this.refreshInterval = (calendarConfig.refreshInterval || 30) * 60 * 1000; // Convert to ms
    
    this.events = [];
    this.cache = new Map(); // Cache per feed URL
    this.lastFetch = new Map();
    
    console.log('CalendarService initialized with', this.feeds.length, 'feeds');
  }

  async fetchAllCalendars() {
    if (this.feeds.length === 0) {
      console.warn('No calendar feeds configured');
      return [];
    }

    const fetchPromises = this.feeds.map(feed => this.fetchCalendar(feed));
    const results = await Promise.allSettled(fetchPromises);
    
    // Combine all events
    this.events = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.events.push(...result.value);
      } else {
        console.error(`Failed to fetch calendar ${this.feeds[index].name}:`, result.reason);
      }
    });

    // Sort events by start time
    this.events.sort((a, b) => a.startDate - b.startDate);
    
    console.log(`Fetched ${this.events.length} events from ${this.feeds.length} calendars`);
    return this.events;
  }

  async fetchCalendar(feed) {
    // Check cache
    const now = Date.now();
    const lastFetch = this.lastFetch.get(feed.url);
    if (lastFetch && (now - lastFetch < this.refreshInterval)) {
      const cached = this.cache.get(feed.url);
      if (cached) {
        console.log(`Using cached data for ${feed.name}`);
        return cached;
      }
    }

    try {
      // Convert webcal:// to https://
      let url = feed.url;
      if (url.startsWith('webcal://')) {
        url = url.replace('webcal://', 'https://');
      } else if (url.startsWith('webcal:')) {
        url = url.replace('webcal:', 'https:');
      }
      
      console.log(`Fetching calendar: ${feed.name} from ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const icalData = await response.text();
      const events = this.parseICalData(icalData, feed);
      
      // Cache results
      this.cache.set(feed.url, events);
      this.lastFetch.set(feed.url, now);
      
      return events;
    } catch (error) {
      console.error(`Error fetching calendar ${feed.name}:`, error);
      throw error;
    }
  }

  parseICalData(icalData, feed) {
    try {
      const jcalData = ICAL.parse(icalData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');
      
      const events = [];
      const now = new Date();
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      vevents.forEach(vevent => {
        const event = new ICAL.Event(vevent);
        
        // Handle recurring events
        if (event.isRecurring()) {
          const expand = event.iterator();
          let next;
          let count = 0;
          const maxOccurrences = 100; // Limit recurring events
          
          while ((next = expand.next()) && count < maxOccurrences) {
            const occurrence = this.createEventObject(event, feed, next);
            if (occurrence.startDate > oneYearFromNow) break;
            if (occurrence.endDate >= now) {
              events.push(occurrence);
            }
            count++;
          }
        } else {
          // Single event
          const eventObj = this.createEventObject(event, feed);
          if (eventObj.endDate >= now && eventObj.startDate <= oneYearFromNow) {
            events.push(eventObj);
          }
        }
      });

      return events;
    } catch (error) {
      console.error('Error parsing iCal data:', error);
      return [];
    }
  }

  createEventObject(event, feed, occurrenceTime = null) {
    const startDate = occurrenceTime ? occurrenceTime.toJSDate() : event.startDate.toJSDate();
    const duration = event.duration.toSeconds() * 1000; // Convert to milliseconds
    const endDate = new Date(startDate.getTime() + duration);

    return {
      id: event.uid + (occurrenceTime ? `-${occurrenceTime.toUnixTime()}` : ''),
      title: event.summary || '(No title)',
      description: event.description || '',
      location: event.location || '',
      startDate: startDate,
      endDate: endDate,
      isAllDay: this.isAllDayEvent(event),
      calendarName: feed.name,
      calendarColor: feed.color,
      raw: event
    };
  }

  isAllDayEvent(event) {
    // Check if event is all-day (no time component)
    const start = event.startDate;
    return start.isDate; // ical.js property for all-day events
  }

  getEventsForDate(date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return this.events.filter(event => {
      return (event.startDate <= dayEnd && event.endDate >= dayStart);
    });
  }

  getEventsForMonth(year, month) {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return this.events.filter(event => {
      return (event.startDate <= monthEnd && event.endDate >= monthStart);
    });
  }

  getEventsForWeek(date) {
    const config = window.CONFIG?.calendar || {};
    const firstDayOfWeek = config.firstDayOfWeek || 0; // 0 = Sunday
    
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = day - firstDayOfWeek;
    weekStart.setDate(weekStart.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return this.events.filter(event => {
      return (event.startDate <= weekEnd && event.endDate >= weekStart);
    });
  }
}

// Lazy singleton
let calendarServiceInstance = null;
const calendarService = {
  getInstance() {
    if (!calendarServiceInstance) {
      calendarServiceInstance = new CalendarService();
    }
    return calendarServiceInstance;
  }
};
