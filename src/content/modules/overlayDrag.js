/**
 * Overlay Drag Module
 * Handles dragging functionality using modern Pointer Events API with comprehensive
 * focus loss prevention and sticky movement issue fixes.
 * Includes smart drag vs click detection to prevent button interference.
 */

/**
 * Sets up dragging functionality for the overlay.
 * @param {HTMLElement} overlay - The chat overlay element.
 * @param {Function} savePosition - Function to save the position.
 * @param {Function} constrainPosition - Function to constrain the position.
 */
export function setupDragging(overlay, savePosition, constrainPosition) {
  const chatHeader = overlay.querySelector('#chat-header');
  const chatTitle = overlay.querySelector('#chat-title');
  let isDragging = false;
  let isDragInitiated = false;
  let isDragTracking = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialLeft = 0;
  let initialTop = 0;
  let currentPointerId = null;
  let dragTimeout = null;
  let totalMovementDistance = 0;

  // Drag threshold: minimum movement (in pixels) before drag is initiated
  const DRAG_THRESHOLD = 8;
  // Time threshold: maximum time (in ms) before drag is initiated without movement
  const TIME_THRESHOLD = 300;

  // Track event listeners for proper cleanup
  const dragListeners = {
    pointermove: null,
    pointerup: null,
    pointercancel: null,
    blur: null,
    keydown: null
  };

  /**
   * Determines if a pointer event target is a button or within a button.
   * @param {Element} target - The event target element.
   * @returns {boolean} True if target is a button or within a button.
   */
  function isButtonTarget(target) {
    return target.tagName === 'BUTTON' || target.closest('button');
  }

  /**
   * Starts tracking potential drag operation (no pointer capture yet).
   * @param {PointerEvent} e - The pointer event.
   */
  function startDragTracking(e) {
    // Only handle primary pointer (left mouse button or touch)
    if (!e.isPrimary || e.button !== 0) {
      return;
    }

    // Check if clicking on a button - if so, let the button handle the click
    if (isButtonTarget(e.target)) {
      console.log('Button click detected - skipping drag initiation');
      return;
    }

    console.log('Drag tracking started: pointerId =', e.pointerId);
    
    isDragTracking = true;
    currentPointerId = e.pointerId;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    initialLeft = overlay.offsetLeft;
    initialTop = overlay.offsetTop;
    totalMovementDistance = 0;
    
    // Add event listeners for tracking
    addDragListeners();
    
    // Set timeout to cancel drag tracking if no movement occurs
    dragTimeout = setTimeout(() => {
      if (isDragTracking && !isDragInitiated) {
        console.log('Drag tracking timeout - was likely a click');
        cancelDragTracking();
      }
    }, TIME_THRESHOLD);
  }

  /**
   * Initiates actual drag with pointer capture.
   */
  function initiateActualDrag() {
    if (isDragInitiated) return;
    
    console.log('Drag initiated: isDragging = true, pointerId =', currentPointerId);
    
    isDragInitiated = true;
    isDragging = true;
    
    // Clear the timeout since we're now in drag mode
    if (dragTimeout) {
      clearTimeout(dragTimeout);
      dragTimeout = null;
    }
    
    // Disable transitions and user selection during drag
    overlay.style.transition = 'none';
    overlay.style.userSelect = 'none';
    overlay.style.webkitUserSelect = 'none';
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    // Set pointer capture to ensure we receive all pointer events
    // even when pointer moves outside the header element
    try {
      chatHeader.setPointerCapture(currentPointerId);
      console.log('Pointer capture set for pointerId:', currentPointerId);
    } catch (error) {
      console.warn('Failed to set pointer capture:', error);
    }
    
    // Set auto-reset timeout as fallback (5 seconds)
    dragTimeout = setTimeout(() => {
      if (isDragging) {
        console.warn('Auto-reset timeout triggered - ending drag');
        endDrag();
      }
    }, 5000);
  }

  /**
   * Cancels drag tracking without initiating drag.
   */
  function cancelDragTracking() {
    if (!isDragTracking) return;
    
    console.log('Drag tracking cancelled');
    
    isDragTracking = false;
    currentPointerId = null;
    totalMovementDistance = 0;
    
    // Clear timeout
    if (dragTimeout) {
      clearTimeout(dragTimeout);
      dragTimeout = null;
    }
    
    // Remove listeners
    removeDragListeners();
  }

  /**
   * Handles the drag movement during both tracking and actual drag phases.
   * @param {PointerEvent} e - The pointer move event.
   */
  function drag(e) {
    // Only process events for the current pointer
    if (!isDragTracking || e.pointerId !== currentPointerId) {
      return;
    }

    // Calculate movement distance
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    const movementDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    totalMovementDistance += movementDistance;

    // If we haven't initiated drag yet, check if we should
    if (!isDragInitiated) {
      if (totalMovementDistance > DRAG_THRESHOLD) {
        // Movement exceeds threshold - initiate actual drag
        initiateActualDrag();
      } else {
        // Still in tracking phase - don't move overlay yet
        return;
      }
    }

    // State validation - prevent processing if not in dragging state
    if (!isDragging) {
      console.warn('Drag called but isDragging is false - ignoring');
      return;
    }

    // Calculate new position
    let newLeft = initialLeft + deltaX;
    let newTop = initialTop + deltaY;

    // Constrain to viewport
    const constrained = constrainPosition(newLeft, newTop, overlay);
    newLeft = constrained.left;
    newTop = constrained.top;

    overlay.style.left = newLeft + 'px';
    overlay.style.top = newTop + 'px';
  }

  /**
   * Ends the drag operation with comprehensive cleanup.
   * Handles both tracking phase and initiated drag phase.
   */
  function endDrag() {
    // Prevent multiple calls
    if (!isDragTracking) {
      console.log('endDrag called but not tracking - ignoring');
      return;
    }
    
    const wasInitiated = isDragInitiated;
    const pointerId = currentPointerId;
    
    console.log('Drag ended: wasInitiated =', wasInitiated, ', pointerId =', pointerId);
    
    // Reset all drag states
    isDragTracking = false;
    isDragInitiated = false;
    isDragging = false;
    currentPointerId = null;
    totalMovementDistance = 0;
    
    // Clear timeout
    if (dragTimeout) {
      clearTimeout(dragTimeout);
      dragTimeout = null;
    }
    
    // Release pointer capture only if we had set it
    if (wasInitiated && pointerId !== null) {
      try {
        chatHeader.releasePointerCapture(pointerId);
        console.log('Pointer capture released for pointerId:', pointerId);
      } catch (error) {
        console.warn('Failed to release pointer capture:', error);
      }
      
      // Re-enable transitions and user selection only if drag was initiated
      overlay.style.transition = 'left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease';
      overlay.style.userSelect = '';
      overlay.style.webkitUserSelect = '';
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';

      // Save final position only if drag was initiated (i.e., user actually dragged)
      try {
        savePosition(overlay.offsetLeft, overlay.offsetTop);
      } catch (error) {
        console.error('Error saving position:', error);
      }
    }
    
    // Remove event listeners
    removeDragListeners();
  }

  /**
   * Handles pointer cancel events (e.g., pointer leaves surface, system gesture).
   * @param {PointerEvent} e - The pointer cancel event.
   */
  function handlePointerCancel(e) {
    if (isDragTracking && e.pointerId === currentPointerId) {
      console.log('Pointer cancel event received - ending drag');
      endDrag();
    }
  }

  /**
   * Handles window blur events to stop dragging when window loses focus.
   */
  function handleWindowBlur() {
    if (isDragTracking) {
      console.log('Window lost focus during drag - ending drag');
      endDrag();
    }
  }

  /**
   * Handles key down events to allow escape key cancellation.
   * @param {KeyboardEvent} e - The keyboard event.
   */
  function handleKeyDown(e) {
    if (isDragTracking && e.key === 'Escape') {
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

  // Add pointer event listener for starting drag tracking (replaces mousedown and touchstart)
  chatHeader.addEventListener('pointerdown', startDragTracking);
  
  // Set CSS properties for better handling
  chatHeader.style.touchAction = 'none'; // Prevent default touch actions
  
  // Add visual feedback - make title area draggable and buttons clickable
  if (chatTitle) {
    chatTitle.style.cursor = 'move'; // Show move cursor over title
    chatTitle.classList.add('draggable-area');
  }
  
  // Ensure buttons have pointer cursor
  const buttons = chatHeader.querySelectorAll('button');
  buttons.forEach(button => {
    button.style.cursor = 'pointer';
  });
  
  console.log('Drag functionality initialized with smart click vs drag detection');
}
