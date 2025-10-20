/**
 * Overlay Resize Module
 * Handles resizing functionality for mouse and touch events.
 */

import { constrainSizeForViewport, saveEnhancedSize, savePosition, getMaxSizeForViewport } from './overlayPositioning.js';

/**
 * Sets up resizing functionality for the overlay.
 * @param {HTMLElement} overlay - The chat overlay element.
 */
export function setupResizing(overlay) {
  try {
    if (!overlay) {
      console.warn('Overlay element is null or undefined');
      return;
    }
    
    const resizeHandles = overlay.querySelectorAll('.resize-handle');
    let isResizing = false;
    let resizeStartX = 0;
    let resizeStartY = 0;
    let initialWidth = 0;
    let initialHeight = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let resizeDirection = '';
    let animationFrameId = null;
    
    // Track intended vs displayed size
    let intendedWidth = 0;
    let intendedHeight = 0;
    let displayWidth = 0;
    let displayHeight = 0;

    function getResizeDirection(handle) {
      try {
        if (!handle || !handle.classList) {
          return '';
        }
        if (handle.classList.contains('resize-handle-nw')) return 'nw';
        if (handle.classList.contains('resize-handle-ne')) return 'ne';
        if (handle.classList.contains('resize-handle-sw')) return 'sw';
        if (handle.classList.contains('resize-handle-se')) return 'se';
        if (handle.classList.contains('resize-handle-n')) return 'n';
        if (handle.classList.contains('resize-handle-s')) return 's';
        if (handle.classList.contains('resize-handle-w')) return 'w';
        if (handle.classList.contains('resize-handle-e')) return 'e';
        return '';
      } catch (error) {
        console.error('Error in getResizeDirection:', error);
        return '';
      }
    }

    function startResize(e, direction) {
      try {
        if (!e) {
          console.warn('Event object is null or undefined');
          return;
        }
        
        console.log('Resize started:', {
          direction,
          initialSize: { width: overlay.offsetWidth, height: overlay.offsetHeight },
          position: { left: overlay.offsetLeft, top: overlay.offsetTop }
        });
        
        isResizing = true;
        resizeDirection = direction;
        resizeStartX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
        resizeStartY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || 0;
        initialWidth = overlay.offsetWidth || 0;
        initialHeight = overlay.offsetHeight || 0;
        initialLeft = overlay.offsetLeft || 0;
        initialTop = overlay.offsetTop || 0;
        
        // Initialize tracking variables
        intendedWidth = initialWidth;
        intendedHeight = initialHeight;
        displayWidth = initialWidth;
        displayHeight = initialHeight;
        
        overlay.style.transition = 'none';
        overlay.style.userSelect = 'none';
        document.body.style.userSelect = 'none';
        // Disable pointer events on iframe to prevent interference
        const iframe = overlay.querySelector('#yt-chat-iframe');
        if (iframe) iframe.style.pointerEvents = 'none';
        // Set cursor for entire document during resize
        const cursorMap = {
          nw: 'nw-resize',
          ne: 'ne-resize',
          sw: 'sw-resize',
          se: 'se-resize',
          n: 'n-resize',
          s: 's-resize',
          w: 'w-resize',
          e: 'e-resize',
        };
        document.body.style.cursor = cursorMap[direction] || 'default';
        e.preventDefault && e.preventDefault();

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', endResize);
        document.addEventListener('touchmove', resize, { passive: false });
        document.addEventListener('touchend', endResize);
      } catch (error) {
        console.error('Error in startResize:', error);
        isResizing = false;
      }
    }

    function performResize(clientX, clientY) {
      try {
        const deltaX = clientX - resizeStartX;
        const deltaY = clientY - resizeStartY;

        // Calculate intended dimensions (what user is trying to drag to)
        intendedWidth = initialWidth;
        intendedHeight = initialHeight;
        let newLeft = initialLeft;
        let newTop = initialTop;

        switch (resizeDirection) {
          case 'nw':
            intendedWidth = initialWidth - deltaX;
            intendedHeight = initialHeight - deltaY;
            newLeft = initialLeft + deltaX;
            newTop = initialTop + deltaY;
            break;
          case 'ne':
            intendedWidth = initialWidth + deltaX;
            intendedHeight = initialHeight - deltaY;
            newTop = initialTop + deltaY;
            break;
          case 'sw':
            intendedWidth = initialWidth - deltaX;
            intendedHeight = initialHeight + deltaY;
            newLeft = initialLeft + deltaX;
            break;
          case 'se':
            intendedWidth = initialWidth + deltaX;
            intendedHeight = initialHeight + deltaY;
            break;
          case 'n':
            intendedHeight = initialHeight - deltaY;
            newTop = initialTop + deltaY;
            break;
          case 's':
            intendedHeight = initialHeight + deltaY;
            break;
          case 'w':
            intendedWidth = initialWidth - deltaX;
            newLeft = initialLeft + deltaX;
            break;
          case 'e':
            intendedWidth = initialWidth + deltaX;
            break;
        }

        // Constrain size for display (what user actually sees)
        const constrainedSize = constrainSizeForViewport(intendedWidth, intendedHeight);
        displayWidth = constrainedSize.width;
        displayHeight = constrainedSize.height;

        // Adjust position if necessary to keep within viewport
        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft + displayWidth > window.innerWidth)
          newLeft = window.innerWidth - displayWidth;
        if (newTop + displayHeight > window.innerHeight)
          newTop = window.innerHeight - displayHeight;

        // Apply constrained display size and position
        overlay.style.width = displayWidth + 'px';
        overlay.style.height = displayHeight + 'px';
        overlay.style.left = newLeft + 'px';
        overlay.style.top = newTop + 'px';
        
        // Log size differences if there's a constraint
        if (intendedWidth !== displayWidth || intendedHeight !== displayHeight) {
          console.log('Resize in progress - size constraint applied:', {
            intended: { width: intendedWidth, height: intendedHeight },
            displayed: { width: displayWidth, height: displayHeight },
            direction: resizeDirection
          });
        }
      } catch (error) {
        console.error('Error in performResize:', error);
      }
    }

    function resize(e) {
      try {
        if (!isResizing) return;
        const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || 0;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() =>
          performResize(clientX, clientY)
        );
      } catch (error) {
        console.error('Error in resize:', error);
      }
    }

    function endResize() {
      try {
        if (!isResizing) return;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        
        const finalIntendedSize = { width: intendedWidth, height: intendedHeight };
        const finalDisplayedSize = { width: displayWidth, height: displayHeight };
        
        console.log('Resize ended:', {
          intended: finalIntendedSize,
          displayed: finalDisplayedSize,
          wasConstrained: finalIntendedSize.width !== finalDisplayedSize.width || finalIntendedSize.height !== finalDisplayedSize.height
        });
        
        isResizing = false;
        
        // Re-enable transitions for smooth positioning after resize
        overlay.style.transition = 'left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease';
        overlay.style.userSelect = '';
        document.body.style.userSelect = '';
        document.body.style.cursor = ''; // Reset cursor
        // Re-enable pointer events on iframe
        const iframe = overlay.querySelector('#yt-chat-iframe');
        if (iframe) iframe.style.pointerEvents = '';
        // Trigger resize event to ensure iframe content adjusts
        window.dispatchEvent(new Event('resize'));

        // Save the intended size (what user actually dragged to), not the constrained display size
        // This ensures consistency when loading back - the same constraints will be applied again
        saveEnhancedSize(finalIntendedSize.width, finalIntendedSize.height, false);
        
        console.log('Size saved after resize:', finalIntendedSize);

        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', endResize);
        document.removeEventListener('touchmove', resize);
        document.removeEventListener('touchend', endResize);
      } catch (error) {
        console.error('Error in endResize:', error);
      }
    }

    // Mouse events
    resizeHandles.forEach((handle) => {
      try {
        const direction = getResizeDirection(handle);
        handle.addEventListener('mousedown', (e) => startResize(e, direction));
      } catch (error) {
        console.error('Error setting up mouse event for resize handle:', error);
      }
    });

    // Touch events for mobile
    resizeHandles.forEach((handle) => {
      try {
        const direction = getResizeDirection(handle);
        handle.addEventListener('touchstart', (e) => startResize(e, direction), {
          passive: false,
        });
      } catch (error) {
        console.error('Error setting up touch event for resize handle:', error);
      }
    });
  } catch (error) {
    console.error('Error in setupResizing:', error);
  }
}

export function adjustOverlayForWindowResize(overlay) {
  try {
    if (!overlay) {
      console.warn('Overlay element is null or undefined');
      return;
    }
    
    console.log('Window resize detected - adjusting overlay:', {
      oldViewport: { width: overlay.lastViewportWidth || 'unknown', height: overlay.lastViewportHeight || 'unknown' },
      newViewport: { width: window.innerWidth, height: window.innerHeight }
    });
    
    const currentWidth = overlay.offsetWidth;
    const currentHeight = overlay.offsetHeight;
    
    // Get new max constraints based on current viewport
    const { maxWidth, maxHeight } = getMaxSizeForViewport();
    
    console.log('Current overlay size vs new constraints:', {
      current: { width: currentWidth, height: currentHeight },
      constraints: { maxWidth, maxHeight }
    });
    
    let adjustedWidth = currentWidth;
    let adjustedHeight = currentHeight;
    let wasAdjusted = false;
    
    // Only adjust if current size exceeds new constraints
    if (currentWidth > maxWidth) {
      adjustedWidth = maxWidth;
      wasAdjusted = true;
      console.log(`Width adjusted from ${currentWidth} to ${maxWidth} due to viewport constraints`);
    }
    
    if (currentHeight > maxHeight) {
      adjustedHeight = maxHeight;
      wasAdjusted = true;
      console.log(`Height adjusted from ${currentHeight} to ${maxHeight} due to viewport constraints`);
    }
    
    // Apply size adjustments only if needed
    if (wasAdjusted) {
      overlay.style.width = adjustedWidth + 'px';
      overlay.style.height = adjustedHeight + 'px';
      
      // Save the new adjusted size
      saveEnhancedSize(adjustedWidth, adjustedHeight, false);
      
      console.log('Overlay size adjusted for viewport:', {
        before: { width: currentWidth, height: currentHeight },
        after: { width: adjustedWidth, height: adjustedHeight }
      });
    }

    // Always adjust position to ensure overlay stays within viewport
    const rect = overlay.getBoundingClientRect();
    let newLeft = rect.left || 0;
    let newTop = rect.top || 0;
    let positionAdjusted = false;

    if (rect.right > window.innerWidth) {
      newLeft = window.innerWidth - rect.width;
      positionAdjusted = true;
    }
    if (rect.left < 0) {
      newLeft = 0;
      positionAdjusted = true;
    }
    if (rect.bottom > window.innerHeight) {
      newTop = window.innerHeight - rect.height;
      positionAdjusted = true;
    }
    if (rect.top < 0) {
      newTop = 0;
      positionAdjusted = true;
    }

    if (positionAdjusted) {
      overlay.style.left = newLeft + 'px';
      overlay.style.top = newTop + 'px';
      
      // Save new position
      savePosition(newLeft, newTop);
      
      console.log('Overlay position adjusted for viewport:', {
        before: { left: rect.left, top: rect.top },
        after: { left: newLeft, top: newTop }
      });
    }
    
    // Store viewport size for detection of significant changes
    overlay.lastViewportWidth = window.innerWidth;
    overlay.lastViewportHeight = window.innerHeight;
    
    if (!wasAdjusted && !positionAdjusted) {
      console.log('No adjustments needed for window resize');
    }
  } catch (error) {
    console.error('Error in adjustOverlayForWindowResize:', error);
  }
}
