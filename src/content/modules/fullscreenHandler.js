/**
 * Fullscreen Handler Module
 * Handles fullscreen state detection and changes.
 */

/**
 * Checks if the document is currently in fullscreen mode.
 * @returns {boolean} True if in fullscreen, false otherwise.
 */
export function checkFullscreen() {
  const fullscreenElement =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  console.log(
    'checkFullscreen result:',
    !!fullscreenElement,
    'fullscreenElement:',
    fullscreenElement
  );
  return !!fullscreenElement;
}
