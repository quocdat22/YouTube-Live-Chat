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
    try {
      localStorage.removeItem('ytChatPosition');
    } catch (removeError) {
      console.error('Error removing corrupted ytChatPosition:', removeError);
    }
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
    try {
      localStorage.removeItem('ytChatSize');
    } catch (removeError) {
      console.error('Error removing corrupted ytChatSize:', removeError);
    }
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
  try {
    // Validate inputs
    if (typeof left !== 'number' || typeof top !== 'number') {
      console.warn('Invalid position parameters:', { left, top });
      return { left: 0, top: 0 };
    }
    
    if (!overlay || !overlay.offsetWidth || !overlay.offsetHeight) {
      console.warn('Invalid overlay element for position constraint');
      return { left: 0, top: 0 };
    }
    
    const maxLeft = window.innerWidth - overlay.offsetWidth;
    const maxTop = window.innerHeight - overlay.offsetHeight;
    return {
      left: Math.max(0, Math.min(left, maxLeft)),
      top: Math.max(0, Math.min(top, maxTop)),
    };
  } catch (error) {
    console.error('Error in constrainPosition:', error);
    return { left: 0, top: 0 };
  }
}

/**
 * Applies the saved position to the overlay element.
 * @param {HTMLElement} overlay - The overlay element.
 * @param {Object} savedPosition - The saved position object.
 */
export function applySavedPosition(overlay, savedPosition) {
  try {
    if (!overlay) {
      console.warn('Overlay element is null or undefined');
      return;
    }
    
    if (savedPosition.left !== undefined && savedPosition.top !== undefined) {
      const constrained = constrainPosition(
        savedPosition.left,
        savedPosition.top,
        overlay
      );
      overlay.style.left = constrained.left + 'px';
      overlay.style.top = constrained.top + 'px';
      overlay.style.right = 'auto';
      console.log('Applied saved position:', constrained);
    }
  } catch (error) {
    console.error('Error in applySavedPosition:', error);
  }
}

/**
 * Saves the current position to localStorage.
 * @param {number} left - The left position.
 * @param {number} top - The top position.
 */
export function savePosition(left, top) {
  try {
    // Validate inputs
    if (typeof left !== 'number' || typeof top !== 'number') {
      console.warn('Invalid position parameters for saving:', { left, top });
      return;
    }
    
    const position = { left, top };
    localStorage.setItem('ytChatPosition', JSON.stringify(position));
  } catch (error) {
    console.error('Error saving position to localStorage:', error);
  }
}

/**
 * Constrains the size within min and max bounds.
 * @param {number} width - The desired width.
 * @param {number} height - The desired height.
 * @returns {Object} Object with constrained width and height.
 */
export function constrainSize(width, height) {
  try {
    // Validate inputs
    if (typeof width !== 'number' || typeof height !== 'number') {
      console.warn('Invalid size parameters:', { width, height });
      return { width: 200, height: 150 };
    }
    
    const minWidth = 200;
    const minHeight = 150;
    const maxWidth = 800;
    const maxHeight = 600;
    return {
      width: Math.max(minWidth, Math.min(width, maxWidth)),
      height: Math.max(minHeight, Math.min(height, maxHeight)),
    };
  } catch (error) {
    console.error('Error in constrainSize:', error);
    return { width: 200, height: 150 };
  }
}

/**
 * Applies the saved size to the overlay element.
 * @param {HTMLElement} overlay - The overlay element.
 * @param {Object} savedSize - The saved size object.
 */
export function applySavedSize(overlay, savedSize) {
  try {
    if (!overlay) {
      console.warn('Overlay element is null or undefined');
      return;
    }
    
    if (savedSize.width !== undefined && savedSize.height !== undefined) {
      const constrained = constrainSize(savedSize.width, savedSize.height);
      overlay.style.width = constrained.width + 'px';
      overlay.style.height = constrained.height + 'px';
      console.log('Applied saved size:', constrained);
    }
  } catch (error) {
    console.error('Error in applySavedSize:', error);
  }
}

/**
 * Saves the current size to localStorage.
 * @param {number} width - The width.
 * @param {number} height - The height.
 */
export function saveSize(width, height) {
  try {
    // Validate inputs
    if (typeof width !== 'number' || typeof height !== 'number') {
      console.warn('Invalid size parameters for saving:', { width, height });
      return;
    }
    
    const size = { width, height };
    localStorage.setItem('ytChatSize', JSON.stringify(size));
  } catch (error) {
    console.error('Error saving size to localStorage:', error);
  }
}
