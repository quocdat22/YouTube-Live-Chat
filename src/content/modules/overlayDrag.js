/**
 * Overlay Drag Module
 * Handles dragging functionality using modern Pointer Events API with comprehensive
 * focus loss prevention and sticky movement issue fixes.
 */

/**
 * Sets up dragging functionality for the overlay.
 * @param {HTMLElement} overlay - The chat overlay element.
 * @param {Function} savePosition - Function to save the position.
 * @param {Function} constrainPosition - Function to constrain the position.
 */
export function setupDragging(overlay, savePosition, constrainPosition) {
  const chatHeader = overlay.querySelector('#chat-header');
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialLeft = 0;
  let initialTop = 0;
  let currentPointerId = null;
  let dragTimeout = null;

  // Track event listeners for proper cleanup
  const dragListeners = {
    pointermove: null,
    pointerup: null,
    pointercancel: null,
    blur: null,
    keydown: null
  };

  /**
   * Starts the drag operation with pointer capture.
   * @param {PointerEvent} e - The pointer event.
   */
  function startDrag(e) {
    // Only handle primary pointer (left mouse button or touch)
    if (e.isPrimary && e.button === 0) {
      console.log('Drag started: isDragging = true, pointerId =', e.pointerId);
      
      isDragging = true;
      currentPointerId = e.pointerId;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      initialLeft = overlay.offsetLeft;
      initialTop = overlay.offsetTop;
      
      // Disable transitions and user selection during drag
      overlay.style.transition = 'none';
      overlay.style.userSelect = 'none';
      overlay.style.webkitUserSelect = 'none';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      e.preventDefault();
      
      // Set pointer capture to ensure we receive all pointer events
      // even when pointer moves outside the header element
      try {
        chatHeader.setPointerCapture(e.pointerId);
        console.log('Pointer capture set for pointerId:', e.pointerId);
      } catch (error) {
        console.warn('Failed to set pointer capture:', error);
      }
      
      // Add event listeners
      addDragListeners();
      
      // Set auto-reset timeout as fallback (5 seconds)
      dragTimeout = setTimeout(() => {
        if (isDragging) {
          console.warn('Auto-reset timeout triggered - ending drag');
          endDrag();
        }
      }, 5000);
    }
  }

  /**
   * Handles the drag movement.
   * @param {PointerEvent} e - The pointer move event.
   */
  function drag(e) {
    // State validation - prevent processing if not in dragging state
    if (!isDragging) {
      console.warn('Drag called but isDragging is false - ignoring');
      return;
    }
    
    // Only process events for the current pointer
    if (e.pointerId !== currentPointerId) {
      return;
    }
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    let newLeft = initialLeft + (clientX - dragStartX);
    let newTop = initialTop + (clientY - dragStartY);

    // Constrain to viewport
    const constrained = constrainPosition(newLeft, newTop, overlay);
    newLeft = constrained.left;
    newTop = constrained.top;

    overlay.style.left = newLeft + 'px';
    overlay.style.top = newTop + 'px';
  }

  /**
   * Ends the drag operation with comprehensive cleanup.
   */
  function endDrag() {
    // Prevent multiple calls to endDrag
    if (!isDragging) {
      console.log('endDrag called but isDragging is already false - ignoring');
      return;
    }
    
    console.log('Drag ended: isDragging = false');
    
    // Reset dragging state first
    isDragging = false;
    const pointerId = currentPointerId;
    currentPointerId = null;
    
    // Clear auto-reset timeout
    if (dragTimeout) {
      clearTimeout(dragTimeout);
      dragTimeout = null;
    }
    
    // Release pointer capture
    if (pointerId !== null) {
      try {
        chatHeader.releasePointerCapture(pointerId);
        console.log('Pointer capture released for pointerId:', pointerId);
      } catch (error) {
        console.warn('Failed to release pointer capture:', error);
      }
    }
    
    // Remove event listeners before restoring styles
    removeDragListeners();
    
    // Re-enable transitions and user selection
    overlay.style.transition = 'left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease';
    overlay.style.userSelect = '';
    overlay.style.webkitUserSelect = '';
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';

    // Save final position
    try {
      savePosition(overlay.offsetLeft, overlay.offsetTop);
    } catch (error) {
      console.error('Error saving position:', error);
    }
  }

  /**
   * Handles pointer cancel events (e.g., pointer leaves surface, system gesture).
   * @param {PointerEvent} e - The pointer cancel event.
   */
  function handlePointerCancel(e) {
    if (e.pointerId === currentPointerId) {
      console.log('Pointer cancel event received - ending drag');
      endDrag();
    }
  }

  /**
   * Handles window blur events to stop dragging when window loses focus.
   */
  function handleWindowBlur() {
    if (isDragging) {
      console.log('Window lost focus during drag - ending drag');
      endDrag();
    }
  }

  /**
   * Handles key down events to allow escape key cancellation.
   * @param {KeyboardEvent} e - The keyboard event.
   */
  function handleKeyDown(e) {
    if (isDragging && e.key === 'Escape') {
      console.log('Escape key pressed during drag - cancelling drag');
      e.preventDefault();
      endDrag();
    }
  }

  /**
   * Adds all necessary event listeners for drag operations.
   */
  function addDragListeners() {
    // Pointer events (replaces mouse and touch events)
    dragListeners.pointermove = drag;
    dragListeners.pointerup = endDrag;
    dragListeners.pointercancel = handlePointerCancel;
    
    // Window and keyboard events for edge cases
    dragListeners.blur = handleWindowBlur;
    dragListeners.keydown = handleKeyDown;
    
    // Add listeners to document for global capture
    document.addEventListener('pointermove', dragListeners.pointermove);
    document.addEventListener('pointerup', dragListeners.pointerup);
    document.addEventListener('pointercancel', dragListeners.pointercancel);
    
    // Add window and document listeners for edge cases
    window.addEventListener('blur', dragListeners.blur);
    document.addEventListener('keydown', dragListeners.keydown);
    
    console.log('All drag listeners added');
  }

  /**
   * Removes all event listeners to prevent memory leaks.
   */
  function removeDragListeners() {
    // Remove pointer event listeners
    document.removeEventListener('pointermove', dragListeners.pointermove);
    document.removeEventListener('pointerup', dragListeners.pointerup);
    document.removeEventListener('pointercancel', dragListeners.pointercancel);
    
    // Remove window and document listeners
    window.removeEventListener('blur', dragListeners.blur);
    document.removeEventListener('keydown', dragListeners.keydown);
    
    // Clear references
    dragListeners.pointermove = null;
    dragListeners.pointerup = null;
    dragListeners.pointercancel = null;
    dragListeners.blur = null;
    dragListeners.keydown = null;
    
    console.log('All drag listeners removed');
  }

  // Add pointer event listener for starting drag (replaces mousedown and touchstart)
  chatHeader.addEventListener('pointerdown', startDrag);
  
  // Set CSS pointer-events property for better handling
  chatHeader.style.touchAction = 'none'; // Prevent default touch actions
  
  console.log('Drag functionality initialized with Pointer Events API');
}
