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
    // Try new key first
    let stored = localStorage.getItem('youtube_chat_position');
    if (!stored) {
      // Fallback to old key for migration
      stored = localStorage.getItem('ytChatPosition');
      if (stored) {
        // Migrate old data to new key
        localStorage.setItem('youtube_chat_position', stored);
        localStorage.removeItem('ytChatPosition');
      }
    }
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Loaded position from localStorage:', parsed);
      // Convert from {x, y} to {left, top}
      if (parsed.x !== undefined && parsed.y !== undefined) {
        savedPosition = { left: parsed.x, top: parsed.y };
      } else if (parsed.left !== undefined && parsed.top !== undefined) {
        // Handle old format if migration didn't work
        savedPosition = { left: parsed.left, top: parsed.top };
      }
    } else {
      console.log('No saved position found in localStorage');
    }
  } catch (e) {
    console.error('Error parsing saved position:', e);
    try {
      localStorage.removeItem('youtube_chat_position');
      localStorage.removeItem('ytChatPosition');
    } catch (removeError) {
      console.error('Error removing corrupted position data:', removeError);
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

    // Save as {x, y} format as requested
    const position = { x: left, y: top };
    localStorage.setItem('youtube_chat_position', JSON.stringify(position));
    console.log('Saved position to localStorage:', position);
  } catch (error) {
    console.error('Error saving position to localStorage:', error);
  }
}

/**
 * Gets dynamic max size constraints based on viewport.
 * @returns {Object} Object with maxWidth and maxHeight based on viewport.
 */
export function getMaxSizeForViewport() {
  try {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Use 90% of viewport as max, but ensure reasonable minimums
    const maxWidth = Math.max(400, Math.floor(viewportWidth * 0.9));
    const maxHeight = Math.max(300, Math.floor(viewportHeight * 0.9));
    
    console.log('Calculated max size for viewport:', {
      viewport: { width: viewportWidth, height: viewportHeight },
      max: { width: maxWidth, height: maxHeight }
    });
    
    return { maxWidth, maxHeight };
  } catch (error) {
    console.error('Error calculating max size for viewport:', error);
    return { maxWidth: 800, maxHeight: 600 };
  }
}

/**
 * Centralized size constraint function that applies consistent logic.
 * @param {number} width - The desired width.
 * @param {number} height - The desired height.
 * @param {Object} viewport - Optional viewport object {width, height}, defaults to window.
 * @returns {Object} Object with constrained width and height.
 */
export function constrainSizeForViewport(width, height, viewport = null) {
  try {
    // Validate inputs
    if (typeof width !== 'number' || typeof height !== 'number') {
      console.warn('Invalid size parameters:', { width, height });
      return { width: 200, height: 150 };
    }
    
    const minWidth = 200;
    const minHeight = 150;
    
    // Get viewport-specific max constraints
    const viewportToUse = viewport || { width: window.innerWidth, height: window.innerHeight };
    const { maxWidth, maxHeight } = getMaxSizeForViewport();
    
    const originalSize = { width, height };
    const constrainedSize = {
      width: Math.max(minWidth, Math.min(width, maxWidth)),
      height: Math.max(minHeight, Math.min(height, maxHeight)),
    };
    
    // Log if constraint was applied
    const widthConstrained = originalSize.width !== constrainedSize.width;
    const heightConstrained = originalSize.height !== constrainedSize.height;
    
    if (widthConstrained || heightConstrained) {
      console.log('Size constraint applied:', {
        original: originalSize,
        constrained: constrainedSize,
        limits: { minWidth, maxWidth, minHeight, maxHeight },
        viewport: viewportToUse
      });
    }
    
    return constrainedSize;
  } catch (error) {
    console.error('Error in constrainSizeForViewport:', error);
    return { width: 200, height: 150 };
  }
}

/**
 * Legacy constrainSize function for backward compatibility.
 * @param {number} width - The desired width.
 * @param {number} height - The desired height.
 * @returns {Object} Object with constrained width and height.
 */
export function constrainSize(width, height) {
  console.warn('Using legacy constrainSize() - consider using constrainSizeForViewport() for consistent behavior');
  return constrainSizeForViewport(width, height);
}

/**
 * Loads and validates saved size with viewport adjustment.
 * @returns {Object} Object with validated width and height.
 */
export function loadAndValidateSize() {
  try {
    const savedSize = loadSavedSize();
    
    if (!savedSize.width || !savedSize.height) {
      console.log('No valid saved size found, using default');
      return { width: 400, height: 300 };
    }
    
    console.log('Loaded saved size:', savedSize);
    
    // Validate against current viewport constraints
    const { maxWidth, maxHeight } = getMaxSizeForViewport();
    const minWidth = 200;
    const minHeight = 150;
    
    let validatedWidth = savedSize.width;
    let validatedHeight = savedSize.height;
    let wasAdjusted = false;
    
    // Apply constraints
    if (validatedWidth < minWidth) {
      console.log(`Width ${validatedWidth} below minimum ${minWidth}, adjusting`);
      validatedWidth = minWidth;
      wasAdjusted = true;
    }
    if (validatedWidth > maxWidth) {
      console.log(`Width ${validatedWidth} above maximum ${maxWidth}, adjusting`);
      validatedWidth = maxWidth;
      wasAdjusted = true;
    }
    if (validatedHeight < minHeight) {
      console.log(`Height ${validatedHeight} below minimum ${minHeight}, adjusting`);
      validatedHeight = minHeight;
      wasAdjusted = true;
    }
    if (validatedHeight > maxHeight) {
      console.log(`Height ${validatedHeight} above maximum ${maxHeight}, adjusting`);
      validatedHeight = maxHeight;
      wasAdjusted = true;
    }
    
    const validatedSize = { width: validatedWidth, height: validatedHeight };
    
    if (wasAdjusted) {
      console.log('Size was validated and adjusted:', {
        original: savedSize,
        validated: validatedSize,
        constraints: { minWidth, maxWidth, minHeight, maxHeight }
      });
      
      // Save the adjusted size so it's consistent next time
      saveSize(validatedWidth, validatedHeight);
    } else {
      console.log('Size validation passed:', validatedSize);
    }
    
    return validatedSize;
  } catch (error) {
    console.error('Error in loadAndValidateSize:', error);
    return { width: 400, height: 300 };
  }
}

/**
 * Size state management object for tracking different size states.
 */
const overlaySizeState = {
  // Normal mode sizes (when not minimized)
  normalWidth: 400,
  normalHeight: 300,
  
  // Minimized mode sizes
  minimizedWidth: 300,
  minimizedHeight: 40,
  
  // Current mode
  isMinimized: false,
  
  // Metadata
  lastSaveTime: Date.now(),
  lastViewportSize: { width: window.innerWidth, height: window.innerHeight },
  
  // Getters for current size based on mode
  get currentWidth() {
    return this.isMinimized ? this.minimizedWidth : this.normalWidth;
  },
  
  get currentHeight() {
    return this.isMinimized ? this.minimizedHeight : this.normalHeight;
  },
  
  // Update normal size
  updateNormalSize(width, height) {
    console.log('Updating normal size:', { current: { width: this.normalWidth, height: this.normalHeight }, new: { width, height } });
    this.normalWidth = width;
    this.normalHeight = height;
    this.lastSaveTime = Date.now();
  },
  
  // Update minimized size
  updateMinimizedSize(width, height) {
    console.log('Updating minimized size:', { current: { width: this.minimizedWidth, height: this.minimizedHeight }, new: { width, height } });
    this.minimizedWidth = width;
    this.minimizedHeight = height;
    this.lastSaveTime = Date.now();
  },
  
  // Switch to minimized state
  minimize() {
    console.log('Switching to minimized state, saving normal size:', { width: this.normalWidth, height: this.normalHeight });
    this.isMinimized = true;
  },
  
  // Switch to normal state
  expand() {
    console.log('Switching to expanded state, restoring normal size:', { width: this.normalWidth, height: this.normalHeight });
    this.isMinimized = false;
  },
  
  // Save current state to localStorage
  saveToStorage() {
    try {
      const sizeData = {
        normalWidth: this.normalWidth,
        normalHeight: this.normalHeight,
        minimizedWidth: this.minimizedWidth,
        minimizedHeight: this.minimizedHeight,
        isMinimized: this.isMinimized,
        lastSaveTime: this.lastSaveTime,
        lastViewportSize: this.lastViewportSize
      };
      
      // For backward compatibility, also save simple size
      const simpleSize = { 
        width: this.normalWidth, 
        height: this.normalHeight 
      };
      
      localStorage.setItem('ytChatSizeAdvanced', JSON.stringify(sizeData));
      localStorage.setItem('ytChatSize', JSON.stringify(simpleSize));
      
      console.log('Size state saved to storage:', sizeData);
    } catch (error) {
      console.error('Error saving size state to storage:', error);
    }
  },
  
  // Load current state from localStorage
  loadFromStorage() {
    try {
      // Try advanced format first
      let stored = localStorage.getItem('ytChatSizeAdvanced');
      if (stored) {
        const data = JSON.parse(stored);
        this.normalWidth = data.normalWidth || 400;
        this.normalHeight = data.normalHeight || 300;
        this.minimizedWidth = data.minimizedWidth || 300;
        this.minimizedHeight = data.minimizedHeight || 40;
        this.isMinimized = data.isMinimized || false;
        this.lastSaveTime = data.lastSaveTime || Date.now();
        this.lastViewportSize = data.lastViewportSize || { width: window.innerWidth, height: window.innerHeight };
        
        console.log('Size state loaded from advanced storage:', data);
        return;
      }
      
      // Fallback to simple format
      const simpleSize = loadSavedSize();
      if (simpleSize.width && simpleSize.height) {
        this.normalWidth = simpleSize.width;
        this.normalHeight = simpleSize.height;
        this.isMinimized = false;
        
        console.log('Size state loaded from simple storage:', simpleSize);
      }
    } catch (error) {
      console.error('Error loading size state from storage:', error);
    }
  }
};

/**
 * Enhanced save size function that tracks normal vs minimized states.
 * @param {number} width - The width.
 * @param {param} height - The height.
 * @param {boolean} isMinimized - Whether the overlay is currently minimized.
 */
export function saveEnhancedSize(width, height, isMinimized = false) {
  try {
    if (typeof width !== 'number' || typeof height !== 'number') {
      console.warn('Invalid size parameters for enhanced saving:', { width, height });
      return;
    }
    
    // Update state based on current mode
    if (isMinimized) {
      overlaySizeState.updateMinimizedSize(width, height);
    } else {
      overlaySizeState.updateNormalSize(width, height);
    }
    overlaySizeState.isMinimized = isMinimized;
    overlaySizeState.lastViewportSize = { width: window.innerWidth, height: window.innerHeight };
    
    // Save to storage
    overlaySizeState.saveToStorage();
    
    console.log('Enhanced size saved:', {
      size: { width, height },
      isMinimized,
      state: {
        normal: { width: overlaySizeState.normalWidth, height: overlaySizeState.normalHeight },
        minimized: { width: overlaySizeState.minimizedWidth, height: overlaySizeState.minimizedHeight }
      }
    });
  } catch (error) {
    console.error('Error in saveEnhancedSize:', error);
  }
}

/**
 * Gets the appropriate size based on current minimization state.
 * @param {boolean} isMinimized - Whether the overlay is minimized.
 * @returns {Object} Object with width and height.
 */
export function getSizeForState(isMinimized) {
  if (isMinimized) {
    return { width: overlaySizeState.minimizedWidth, height: overlaySizeState.minimizedHeight };
  } else {
    return { width: overlaySizeState.normalWidth, height: overlaySizeState.normalHeight };
  }
}

/**
 * Initialize size state from storage on module load.
 */
export function initializeSizeState() {
  try {
    overlaySizeState.loadFromStorage();
    console.log('Size state initialized:', {
      current: { width: overlaySizeState.currentWidth, height: overlaySizeState.currentHeight },
      isMinimized: overlaySizeState.isMinimized,
      lastViewportSize: overlaySizeState.lastViewportSize
    });
  } catch (error) {
    console.error('Error initializing size state:', error);
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
    console.log('Saved size to localStorage:', size);
  } catch (error) {
    console.error('Error saving size to localStorage:', error);
  }
}

/**
 * Saves the final position before overlay is hidden or removed.
 * @param {HTMLElement} overlay - The overlay element.
 */
export function saveFinalPosition(overlay) {
  try {
    if (!overlay) {
      console.warn('Overlay element is null or undefined in saveFinalPosition');
      return;
    }
    const left = overlay.offsetLeft;
    const top = overlay.offsetTop;
    const position = { x: left, y: top };
    localStorage.setItem('youtube_chat_position', JSON.stringify(position));
    console.log('Final position saved before hiding:', position);
  } catch (error) {
    console.error('Error saving final position:', error);
  }
}

/**
 * Verifies that position data exists and is valid in localStorage.
 * @returns {boolean} True if valid position data exists, false otherwise.
 */
export function verifyPositionSaved() {
  try {
    const stored = localStorage.getItem('youtube_chat_position');
    if (stored) {
      const pos = JSON.parse(stored);
      const isValid = pos && typeof pos.x === 'number' && typeof pos.y === 'number';
      console.log('Position verification result:', isValid, 'Data:', pos);
      return isValid;
    }
    console.log('No position data found in localStorage');
    return false;
  } catch (error) {
    console.error('Error verifying position:', error);
    return false;
  }
}

/**
 * Applies the initial saved position without transition animation.
 * This should be called right after element is added to DOM.
 * @param {HTMLElement} overlay - The overlay element.
 * @param {Object} savedPosition - The saved position object.
 */
export function applyInitialPosition(overlay, savedPosition) {
  try {
    if (!overlay) {
      console.warn('Overlay element is null or undefined');
      return;
    }
    
    // Temporarily disable transition
    const originalTransition = overlay.style.transition;
    overlay.style.transition = 'none';
    
    // Apply saved position
    if (savedPosition.left !== undefined && savedPosition.top !== undefined) {
      const constrained = constrainPosition(
        savedPosition.left,
        savedPosition.top,
        overlay
      );
      overlay.style.left = constrained.left + 'px';
      overlay.style.top = constrained.top + 'px';
      overlay.style.right = 'auto';
      console.log('Applied initial position without animation:', constrained);
    }
    
    // Re-enable transition after a frame to ensure position has been applied
    requestAnimationFrame(() => {
      overlay.style.transition = originalTransition || 'left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease';
    });
  } catch (error) {
    console.error('Error in applyInitialPosition:', error);
  }
}

/**
 * Applies saved size without transition animation.
 * @param {HTMLElement} overlay - The overlay element.
 * @param {Object} savedSize - The saved size object.
 */
export function applyInitialSize(overlay, savedSize) {
  try {
    if (!overlay) {
      console.warn('Overlay element is null or undefined');
      return;
    }
    
    // Temporarily disable transition
    const originalTransition = overlay.style.transition;
    overlay.style.transition = 'none';
    
    if (savedSize.width !== undefined && savedSize.height !== undefined) {
      const constrained = constrainSize(savedSize.width, savedSize.height);
      overlay.style.width = constrained.width + 'px';
      overlay.style.height = constrained.height + 'px';
      console.log('Applied initial size without animation:', constrained);
    }
    
    // Re-enable transition
    requestAnimationFrame(() => {
      overlay.style.transition = originalTransition || 'left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease';
    });
  } catch (error) {
    console.error('Error in applyInitialSize:', error);
  }
}

/**
 * Verifies that size data exists and is valid in localStorage.
 * @returns {boolean} True if valid size data exists, false otherwise.
 */
export function verifySizeSaved() {
  try {
    const stored = localStorage.getItem('ytChatSize');
    if (stored) {
      const size = JSON.parse(stored);
      const isValid = size && typeof size.width === 'number' && typeof size.height === 'number';
      console.log('Size verification result:', isValid, 'Data:', size);
      return isValid;
    }
    console.log('No size data found in localStorage');
    return false;
  } catch (error) {
    console.error('Error verifying size:', error);
    return false;
  }
}
