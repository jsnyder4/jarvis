// Touch Scroll Helper - Reusable drag-to-scroll functionality
// Provides smooth pointer-based scrolling for touch and mouse interactions

class TouchScrollHelper {
  /**
   * Setup touch/drag scrolling for an element
   * @param {string|HTMLElement} elementOrId - DOM element or element ID
   * @param {Object} options - Configuration options
   * @param {string} options.grabCursor - Cursor style when not dragging (default: 'grab')
   * @param {string} options.grabbingCursor - Cursor style when dragging (default: 'grabbing')
   * @param {boolean} options.preventDefault - Whether to prevent default pointer behavior (default: true)
   * @returns {Function|null} Cleanup function to remove event listeners, or null if element not found
   */
  static setupTouchScroll(elementOrId, options = {}) {
    const element = typeof elementOrId === 'string' 
      ? document.getElementById(elementOrId) 
      : elementOrId;
      
    if (!element) {
      console.warn(`[TouchScrollHelper] Element not found:`, elementOrId);
      return null;
    }

    const config = {
      grabCursor: options.grabCursor || 'grab',
      grabbingCursor: options.grabbingCursor || 'grabbing',
      preventDefault: options.preventDefault !== false
    };

    let startY = 0;
    let startScrollTop = 0;
    let isDragging = false;

    const handlePointerDown = (e) => {
      isDragging = true;
      startY = e.clientY;
      startScrollTop = element.scrollTop;
      element.style.cursor = config.grabbingCursor;
      
      if (config.preventDefault) {
        e.preventDefault();
      }
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;
      
      const deltaY = startY - e.clientY;
      element.scrollTop = startScrollTop + deltaY;
      
      if (config.preventDefault) {
        e.preventDefault();
      }
    };

    const handlePointerEnd = () => {
      isDragging = false;
      element.style.cursor = config.grabCursor;
    };

    // Attach event listeners
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerEnd);
    element.addEventListener('pointerleave', handlePointerEnd);
    element.addEventListener('pointercancel', handlePointerEnd);

    // Return cleanup function
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerEnd);
      element.removeEventListener('pointerleave', handlePointerEnd);
      element.removeEventListener('pointercancel', handlePointerEnd);
    };
  }
}
