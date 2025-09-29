/**
 * Overlay Positioning Module
 * Handles position and size management, constraints, and localStorage persistence.
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
 * Loads the saved size from localStorage.
 * @returns {Object} The saved size object with width and height properties, or empty object if none.
 */
export function loadSavedSize() {
    let savedSize = {};
    try {
        savedSize = JSON.parse(localStorage.getItem('ytChatSize') || '{}');
    } catch (e) {
        console.error('Error parsing saved size:', e);
        localStorage.removeItem('ytChatSize');
    }
    return savedSize;
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

/**
 * Constrains the size within min and max bounds.
 * @param {number} width - The desired width.
 * @param {number} height - The desired height.
 * @returns {Object} Object with constrained width and height.
 */
export function constrainSize(width, height) {
    const minWidth = 200;
    const minHeight = 150;
    const maxWidth = 800;
    const maxHeight = 600;
    return {
        width: Math.max(minWidth, Math.min(width, maxWidth)),
        height: Math.max(minHeight, Math.min(height, maxHeight))
    };
}

/**
 * Applies the saved size to the overlay element.
 * @param {HTMLElement} overlay - The overlay element.
 * @param {Object} savedSize - The saved size object.
 */
export function applySavedSize(overlay, savedSize) {
    if (savedSize.width !== undefined && savedSize.height !== undefined) {
        const constrained = constrainSize(savedSize.width, savedSize.height);
        overlay.style.width = constrained.width + 'px';
        overlay.style.height = constrained.height + 'px';
        console.log('Applied saved size:', constrained);
    }
}

/**
 * Saves the current size to localStorage.
 * @param {number} width - The width.
 * @param {number} height - The height.
 */
export function saveSize(width, height) {
    const size = { width, height };
    localStorage.setItem('ytChatSize', JSON.stringify(size));
}