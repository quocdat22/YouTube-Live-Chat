/**
 * Overlay Resize Module
 * Handles resizing functionality for mouse and touch events.
 */

import { constrainSize, saveSize } from './overlayPositioning.js';

/**
 * Sets up resizing functionality for the overlay.
 * @param {HTMLElement} overlay - The chat overlay element.
 */
export function setupResizing(overlay) {
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

  function getResizeDirection(handle) {
    if (handle.classList.contains('resize-handle-nw')) return 'nw';
    if (handle.classList.contains('resize-handle-ne')) return 'ne';
    if (handle.classList.contains('resize-handle-sw')) return 'sw';
    if (handle.classList.contains('resize-handle-se')) return 'se';
    if (handle.classList.contains('resize-handle-n')) return 'n';
    if (handle.classList.contains('resize-handle-s')) return 's';
    if (handle.classList.contains('resize-handle-w')) return 'w';
    if (handle.classList.contains('resize-handle-e')) return 'e';
    return '';
  }

  function startResize(e, direction) {
    isResizing = true;
    resizeDirection = direction;
    resizeStartX = e.clientX || e.touches[0].clientX;
    resizeStartY = e.clientY || e.touches[0].clientY;
    initialWidth = overlay.offsetWidth;
    initialHeight = overlay.offsetHeight;
    initialLeft = overlay.offsetLeft;
    initialTop = overlay.offsetTop;
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
    e.preventDefault();

    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', endResize);
    document.addEventListener('touchmove', resize, { passive: false });
    document.addEventListener('touchend', endResize);
  }

  function performResize(clientX, clientY) {
    const deltaX = clientX - resizeStartX;
    const deltaY = clientY - resizeStartY;

    let newWidth = initialWidth;
    let newHeight = initialHeight;
    let newLeft = initialLeft;
    let newTop = initialTop;

    switch (resizeDirection) {
      case 'nw':
        newWidth = initialWidth - deltaX;
        newHeight = initialHeight - deltaY;
        newLeft = initialLeft + deltaX;
        newTop = initialTop + deltaY;
        break;
      case 'ne':
        newWidth = initialWidth + deltaX;
        newHeight = initialHeight - deltaY;
        newTop = initialTop + deltaY;
        break;
      case 'sw':
        newWidth = initialWidth - deltaX;
        newHeight = initialHeight + deltaY;
        newLeft = initialLeft + deltaX;
        break;
      case 'se':
        newWidth = initialWidth + deltaX;
        newHeight = initialHeight + deltaY;
        break;
      case 'n':
        newHeight = initialHeight - deltaY;
        newTop = initialTop + deltaY;
        break;
      case 's':
        newHeight = initialHeight + deltaY;
        break;
      case 'w':
        newWidth = initialWidth - deltaX;
        newLeft = initialLeft + deltaX;
        break;
      case 'e':
        newWidth = initialWidth + deltaX;
        break;
    }

    // Constrain size
    const constrainedSize = constrainSize(newWidth, newHeight);
    newWidth = constrainedSize.width;
    newHeight = constrainedSize.height;

    // Adjust position if necessary to keep within viewport
    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft + newWidth > window.innerWidth)
      newLeft = window.innerWidth - newWidth;
    if (newTop + newHeight > window.innerHeight)
      newTop = window.innerHeight - newHeight;

    overlay.style.width = newWidth + 'px';
    overlay.style.height = newHeight + 'px';
    overlay.style.left = newLeft + 'px';
    overlay.style.top = newTop + 'px';
  }

  function resize(e) {
    if (!isResizing) return;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(() =>
      performResize(clientX, clientY)
    );
  }

  function endResize() {
    if (!isResizing) return;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    isResizing = false;
    overlay.style.transition =
      'left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease';
    overlay.style.userSelect = '';
    document.body.style.userSelect = '';
    document.body.style.cursor = ''; // Reset cursor
    // Re-enable pointer events on iframe
    const iframe = overlay.querySelector('#yt-chat-iframe');
    if (iframe) iframe.style.pointerEvents = '';
    // Trigger resize event to ensure iframe content adjusts
    window.dispatchEvent(new Event('resize'));

    // Save size
    saveSize(overlay.offsetWidth, overlay.offsetHeight);

    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', endResize);
    document.removeEventListener('touchmove', resize);
    document.removeEventListener('touchend', endResize);
  }

  // Mouse events
  resizeHandles.forEach((handle) => {
    const direction = getResizeDirection(handle);
    handle.addEventListener('mousedown', (e) => startResize(e, direction));
  });

  // Touch events for mobile
  resizeHandles.forEach((handle) => {
    const direction = getResizeDirection(handle);
    handle.addEventListener('touchstart', (e) => startResize(e, direction), {
      passive: false,
    });
  });
}

export function adjustOverlayForWindowResize(overlay) {
  const currentWidth = parseFloat(overlay.style.width);
  const currentHeight = overlay.style.height;
  const newWidth = window.innerWidth < 800 ? 250 : 400;
  const newHeightPercent = window.innerWidth < 800 ? 0.5 : 0.7;
  const newHeightPx = window.innerHeight * newHeightPercent;

  // Preserve custom width but clamp to new max
  overlay.style.width = Math.min(currentWidth, newWidth) + 'px';

  // Preserve custom height if in px, else update to new %
  if (String(currentHeight).includes('%')) {
    overlay.style.height = newHeightPercent * 100 + '%';
  } else {
    const currentHeightPx = parseFloat(currentHeight);
    overlay.style.height = Math.min(currentHeightPx, newHeightPx) + 'px';
  }

  // Adjust position if outside viewport
  const rect = overlay.getBoundingClientRect();
  let newLeft = rect.left;
  let newTop = rect.top;

  if (rect.right > window.innerWidth) {
    newLeft = window.innerWidth - rect.width;
  }
  if (rect.left < 0) {
    newLeft = 0;
  }
  if (rect.bottom > window.innerHeight) {
    newTop = window.innerHeight - rect.height;
  }
  if (rect.top < 0) {
    newTop = 0;
  }

  overlay.style.left = newLeft + 'px';
  overlay.style.top = newTop + 'px';
}
