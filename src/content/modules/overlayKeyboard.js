/**
 * Overlay Keyboard Module
 * Handles keyboard navigation for moving the overlay.
 */

/**
 * Sets up keyboard navigation for the overlay.
 * @param {HTMLElement} overlay - The chat overlay element.
 * @param {Function} savePosition - Function to save the position.
 * @param {Function} constrainPosition - Function to constrain the position.
 */
export function setupKeyboard(overlay, savePosition, constrainPosition) {
  const chatHeader = overlay.querySelector('#chat-header');

  // Make header focusable
  chatHeader.setAttribute('tabindex', '0');

  chatHeader.addEventListener('keydown', (e) => {
    let newLeft = overlay.offsetLeft;
    let newTop = overlay.offsetTop;
    const step = 10;

    switch (e.key) {
      case 'ArrowUp':
        newTop = Math.max(0, newTop - step);
        break;
      case 'ArrowDown':
        newTop = Math.min(
          window.innerHeight - overlay.offsetHeight,
          newTop + step
        );
        break;
      case 'ArrowLeft':
        newLeft = Math.max(0, newLeft - step);
        break;
      case 'ArrowRight':
        newLeft = Math.min(
          window.innerWidth - overlay.offsetWidth,
          newLeft + step
        );
        break;
      default:
        return;
    }
    e.preventDefault();

    // Apply constrained position
    const constrained = constrainPosition(newLeft, newTop, overlay);
    overlay.style.left = constrained.left + 'px';
    overlay.style.top = constrained.top + 'px';

    // Save position
    savePosition(constrained.left, constrained.top);
  });
}
