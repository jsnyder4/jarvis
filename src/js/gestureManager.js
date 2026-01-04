// Gesture Manager - Handles swipe gestures for calendar navigation

class CalendarGestureManager {
  constructor(monthView, weekView) {
    this.monthView = monthView;
    this.weekView = weekView;
    this.currentView = 'month'; // Track which view is active
    
    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.pointerTarget = null;
    this.isTrackpadSwipe = false;
    this.isNavigating = false;
    this.wheelDeltaX = 0;
    this.wheelTimeout = null;
    this.gestureDirectionDetermined = false;
    this.isHorizontalGesture = false;
    
    this.minSwipeDistance = 50;
    this.wheelThreshold = 25;
    
    this.setupListeners();
  }

  setCurrentView(view) {
    this.currentView = view;
  }

  setupListeners() {
    // Pointer events (touch and mouse)
    document.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    document.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    document.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    
    // Wheel events (trackpad)
    document.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
  }

  handlePointerDown(e) {
    console.log('[POINTER DOWN]', {
      type: e.pointerType,
      target: e.target.className,
      closest_week_grid: !!e.target.closest('#week-grid-container'),
      closest_calendar: !!e.target.closest('.calendar-month, .calendar-week'),
      x: e.clientX,
      y: e.clientY
    });
    
    // Capture gestures in calendar views (both month and week)
    const target = e.target.closest('.calendar-month, .calendar-week');
    
    if (target) {
      console.log('[TRACKING] Pointer - will determine direction on move');
      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;
      this.pointerTarget = target;
      this.isTrackpadSwipe = false;
      this.gestureDirectionDetermined = false; // Track if we've decided vertical vs horizontal
    } else {
      console.log('[IGNORING] Not in calendar area');
    }
  }

  handlePointerMove(e) {
    if (this.pointerTarget) {
      const deltaX = Math.abs(e.clientX - this.pointerStartX);
      const deltaY = Math.abs(e.clientY - this.pointerStartY);
      
      console.log('[POINTER MOVE]', { deltaX, deltaY, determined: this.gestureDirectionDetermined });
      
      // Determine gesture direction once we have enough movement (15px threshold)
      if (!this.gestureDirectionDetermined && (deltaX > 15 || deltaY > 15)) {
        this.gestureDirectionDetermined = true;
        
        if (deltaX > deltaY) {
          // Horizontal gesture - we'll handle it for week/month navigation
          console.log('[DIRECTION] Horizontal - will capture for navigation');
          this.isHorizontalGesture = true;
          e.preventDefault(); // Prevent scrolling for horizontal swipes
        } else {
          // Vertical gesture - allow native scrolling
          console.log('[DIRECTION] Vertical - allowing native scroll');
          this.isHorizontalGesture = false;
          // Don't preventDefault - let it scroll naturally
        }
      }
      
      // Continue preventing default if we determined this is horizontal
      if (this.gestureDirectionDetermined && this.isHorizontalGesture) {
        e.preventDefault();
      }
    }
  }

  handlePointerUp(e) {
    console.log('[POINTER UP]', { 
      hadTarget: !!this.pointerTarget,
      wasTrackpad: this.isTrackpadSwipe,
      wasHorizontal: this.isHorizontalGesture
    });
    
    if (this.pointerTarget && !this.isTrackpadSwipe && this.isHorizontalGesture) {
      const pointerEndX = e.clientX;
      const swipeDistance = pointerEndX - this.pointerStartX;
      
      console.log('[SWIPE CHECK]', { distance: swipeDistance, threshold: this.minSwipeDistance });
      
      if (Math.abs(swipeDistance) > this.minSwipeDistance && !this.isNavigating) {
        this.isNavigating = true;
        console.log('[NAVIGATING]', swipeDistance > 0 ? 'PREVIOUS' : 'NEXT');
        
        if (swipeDistance > 0) {
          // Swipe right - previous
          this.navigatePrevious();
        } else {
          // Swipe left - next
          this.navigateNext();
        }
        
        // Cooldown to prevent consecutive swipes
        setTimeout(() => {
          this.isNavigating = false;
        }, 50);
      }
    }
    
    this.pointerTarget = null;
    this.gestureDirectionDetermined = false;
    this.isHorizontalGesture = false;
  }

  handleWheel(e) {
    // Block ALL wheel events during cooldown period
    if (this.isNavigating) {
      return;
    }
    
    // Only handle wheel events within the calendar view containers
    const target = e.target.closest('.calendar-month, .calendar-week');
    if (!target) return;

    // Detect horizontal scroll (trackpad swipe)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      this.isTrackpadSwipe = true;
      this.handleTrackpadSwipe(e.deltaX);
    }
  }

  handleTrackpadSwipe(deltaX) {
    // Block if we're in cooldown from a previous navigation
    if (this.isNavigating) {
      return;
    }
    
    this.wheelDeltaX += deltaX;
    
    // Check threshold IMMEDIATELY - navigate as soon as threshold is crossed
    if (Math.abs(this.wheelDeltaX) > this.wheelThreshold) {
      // CRITICAL: Check again before navigating (events may be queued)
      if (this.isNavigating) {
        return;
      }
      
      // Set flag IMMEDIATELY to block all subsequent events
      this.isNavigating = true;
      clearTimeout(this.wheelTimeout);
      
      // Navigate right away
      if (this.wheelDeltaX < 0) {
        this.navigateNext();
      } else {
        this.navigatePrevious();
      }
      
      this.wheelDeltaX = 0;
      
      // Very long cooldown to absorb ALL trailing events from trackpad gesture
      // Some trackpads continue sending events for up to 1 second after swipe
      setTimeout(() => {
        this.isNavigating = false;
        this.wheelDeltaX = 0;
      }, 800);
      
      return;
    }
    
    // If threshold not reached yet, set up debounce to clean up abandoned swipes
    clearTimeout(this.wheelTimeout);
    this.wheelTimeout = setTimeout(() => {
      this.wheelDeltaX = 0;
    }, 100);
  }

  navigatePrevious() {
    if (this.currentView === 'month' && this.monthView) {
      this.monthView.previousMonth();
    } else if (this.currentView === 'week' && this.weekView) {
      this.weekView.previousWeek();
    }
  }

  navigateNext() {
    if (this.currentView === 'month' && this.monthView) {
      this.monthView.nextMonth();
    } else if (this.currentView === 'week' && this.weekView) {
      this.weekView.nextWeek();
    }
  }

  destroy() {
    // Clean up if needed
    clearTimeout(this.wheelTimeout);
  }
}
