/**
 * Overlay Controls Module
 * Handles button event listeners for close, minimize, and maximize.
 */

/**
 * Sets up the control buttons for the overlay.
 * @param {HTMLElement} overlay - The chat overlay element.
 * @param {Function} hideChatOverlay - Function to hide the overlay.
 */
export function setupControls(overlay, hideChatOverlay) {

    let isMinimized = false;

    let originalSize = { width: overlay.style.width, height: overlay.style.height };

    const closeChatBtn = overlay.querySelector('#close-chat-btn');

    const minimizeChatBtn = overlay.querySelector('#minimize-chat-btn');

    if (closeChatBtn) {
        console.log('Adding close button event listener');
        closeChatBtn.addEventListener('click', () => {
            console.log('Close button clicked');
            hideChatOverlay();
        });
    } else {
        console.error('Close button not found in overlay');
    }

    if (minimizeChatBtn) {
        minimizeChatBtn.addEventListener('click', () => {
            if (isMinimized) {
                // Restore from minimized
                overlay.style.width = originalSize.width;
                overlay.style.height = originalSize.height;
                overlay.style.right = '10px';
                overlay.style.left = 'auto';
                isMinimized = false;
                minimizeChatBtn.textContent = '−';
                minimizeChatBtn.setAttribute('aria-label', 'Minimize chat');
            } else {
                // Minimize: dock to right edge, reduce height
                originalSize = { width: overlay.style.width, height: overlay.style.height };
                overlay.style.width = '300px';
                overlay.style.height = '40px';
                overlay.style.right = '0px';
                overlay.style.left = 'auto';
                overlay.style.top = '50%';
                isMinimized = true;
                minimizeChatBtn.textContent = '+';
                minimizeChatBtn.setAttribute('aria-label', 'Restore chat');
            }
        });
    }

    return { isMinimized, originalSize };
}