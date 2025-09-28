/**
 * Fullscreen Handler Module
 * Handles fullscreen state detection and changes.
 */

/**
 * Checks if the document is currently in fullscreen mode.
 * @returns {boolean} True if in fullscreen, false otherwise.
 */
export function checkFullscreen() {
    const fullscreenElement = document.fullscreenElement ||
                              document.webkitFullscreenElement ||
                              document.mozFullScreenElement ||
                              document.msFullscreenElement;

    console.log('checkFullscreen result:', !!fullscreenElement, 'fullscreenElement:', fullscreenElement);
    return !!fullscreenElement;
}

/**
 * Handles fullscreen change events.
 * This function should be called with the current state and callback functions.
 * @param {boolean} isFullscreen - Current fullscreen state.
 * @param {HTMLElement|null} chatOverlay - Current chat overlay element.
 * @param {Function} setIsFullscreen - Function to update fullscreen state.
 * @param {Function} setChatOverlay - Function to update chat overlay.
 * @param {Function} showChatOverlay - Function to show chat overlay.
 * @param {Function} hideChatOverlay - Function to hide chat overlay.
 * @param {Function} updateChatSource - Function to update chat source.
 */
export function handleFullscreenChange(isFullscreen, chatOverlay, setIsFullscreen, setChatOverlay, showChatOverlay, hideChatOverlay, updateChatSource) {
    // Debounce function to prevent rapid toggling issues
    let fullscreenToggleTimeout = null;

    // Clear any existing timeout
    if (fullscreenToggleTimeout) {
        clearTimeout(fullscreenToggleTimeout);
    }

    // Use a small delay to handle rapid toggling
    fullscreenToggleTimeout = setTimeout(() => {
        const newIsFullscreen = checkFullscreen();
        console.log('Fullscreen handler: old state:', isFullscreen, 'new state:', newIsFullscreen);
        console.log('Current URL in handler:', window.location.href);

        // Only update if the state actually changed
        if (isFullscreen !== newIsFullscreen) {
            setIsFullscreen(newIsFullscreen);
            console.log('Fullscreen state changed to:', newIsFullscreen);

            if (newIsFullscreen) {
                // Check if we're on a YouTube video page
                if (window.location.href.includes('youtube.com/watch')) {
                    console.log('On YouTube video page in fullscreen, showing chat...');
                    const newOverlay = showChatOverlay();
                    setChatOverlay(newOverlay);
                    console.log('Created chat overlay:', newOverlay);
                    if (newOverlay) {
                        updateChatSource(newOverlay);
                    }
                } else {
                    console.log('Not on YouTube video page, not showing chat');
                }
            } else {
                console.log('Exited fullscreen, hiding chat...');
                hideChatOverlay();
                setChatOverlay(null);
            }
        } else {
            console.log('Fullscreen state unchanged, no action needed');
        }
    }, 100); // Small delay to prevent rapid toggling
}