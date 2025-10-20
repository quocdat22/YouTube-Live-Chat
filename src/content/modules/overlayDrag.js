/**
 * Overlay Drag Module
 * Handles dragging functionality for mouse and touch events.
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

  function startDrag(e) {
    isDragging = true;
    dragStartX = e.clientX || e.touches[0].clientX;
    dragStartY = e.clientY || e.touches[0].clientY;
    initialLeft = overlay.offsetLeft;
    initialTop = overlay.offsetTop;
    overlay.style.transition = 'none';
    overlay.style.userSelect = 'none';
    document.body.style.userSelect = 'none';
    e.preventDefault();

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
  }

  function drag(e) {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    let newLeft = initialLeft + (clientX - dragStartX);
    let newTop = initialTop + (clientY - dragStartY);

    // Constrain to viewport
    const constrained = constrainPosition(newLeft, newTop, overlay);
    newLeft = constrained.left;
    newTop = constrained.top;

    overlay.style.left = newLeft + 'px';
    overlay.style.top = newTop + 'px';
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    
    // Re-enable transitions for smooth positioning after drag
    overlay.style.transition = 'left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease';
    overlay.style.userSelect = '';
    document.body.style.userSelect = '';

    // Save position
    savePosition(overlay.offsetLeft, overlay.offsetTop);

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', endDrag);
  }

  // Mouse events
  chatHeader.addEventListener('mousedown', startDrag);

  // Touch events for mobile
  chatHeader.addEventListener('touchstart', startDrag, { passive: false });
}
