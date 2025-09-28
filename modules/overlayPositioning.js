/**
 * Overlay Positioning Module
 * Handles position management, constraints, and localStorage persistence.
 */

/**
 * Loads the saved position from localStorage.
 * @returns {Object} The saved position object with left and top properties, or empty object if none.
 */
export function loadSavedPosition() {
    let savedPosition = {};
    try {
        savedPosition = JSON.parse(localStorage.getItem('ytChatPosition') || '{}');
    } catch (e) {
        console.error('Error parsing saved position:', e);
        localStorage.removeItem('ytChatPosition');
    }
    return savedPosition;
}

/**
 * Constrains the position within the viewport bounds.
 * @param {number} left - The desired left position.
 * @param {number} top - The desired top position.
 * @param {HTMLElement} overlay - The overlay element to constrain.
 * @returns {Object} Object with constrained left and top.
 */
export function constrainPosition(left, top, overlay) {
    const maxLeft = window.innerWidth - overlay.offsetWidth;
    const maxTop = window.innerHeight - overlay.offsetHeight;
    return {
        left: Math.max(0, Math.min(left, maxLeft)),
        top: Math.max(0, Math.min(top, maxTop))
    };
}

/**
 * Applies the saved position to the overlay element.
 * @param {HTMLElement} overlay - The overlay element.
 * @param {Object} savedPosition - The saved position object.
 */
export function applySavedPosition(overlay, savedPosition) {
    if (savedPosition.left !== undefined && savedPosition.top !== undefined) {
        const constrained = constrainPosition(savedPosition.left, savedPosition.top, overlay);
        overlay.style.left = constrained.left + 'px';
        overlay.style.top = constrained.top + 'px';
        overlay.style.right = 'auto';
        console.log('Applied saved position:', constrained);
    }
}

/**
 * Saves the current position to localStorage.
 * @param {number} left - The left position.
 * @param {number} top - The top position.
 */
export function savePosition(left, top) {
    const position = { left, top };
    localStorage.setItem('ytChatPosition', JSON.stringify(position));
}