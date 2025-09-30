/**
 * Overlay Controls Module
 * Handles button event listeners for close, minimize, and maximize.
 */

function applyHistoryState(doc, show) {
    const messageList = doc.querySelector('#items.yt-live-chat-item-list-renderer');
    const inputRenderer = doc.querySelector('yt-live-chat-message-input-renderer');
    const headerRenderer = doc.querySelector('yt-live-chat-header-renderer');
    if (show) {
        if (messageList) messageList.style.display = '';
        if (inputRenderer) {
            inputRenderer.style.position = '';
            inputRenderer.style.top = '';
            inputRenderer.style.left = '';
            inputRenderer.style.right = '';
            inputRenderer.style.bottom = '';
        }
        if (headerRenderer) headerRenderer.style.display = '';
    } else {
        if (messageList) messageList.style.display = 'none';
        if (inputRenderer) {
            inputRenderer.style.position = 'absolute';
            inputRenderer.style.top = '0';
            inputRenderer.style.left = '0';
            inputRenderer.style.right = '0';
            inputRenderer.style.bottom = 'auto';
        }
        if (headerRenderer) headerRenderer.style.display = 'none';
    }
}

/**
 * Sets up the control buttons for the overlay.
 * @param {HTMLElement} overlay - The chat overlay element.
 * @param {Function} hideChatOverlay - Function to hide the overlay.
 */
export function setupControls(overlay, hideChatOverlay) {

    let isMinimized = false;

    let originalSize = { width: overlay.style.width, height: overlay.style.height };

    const settingsBtn = overlay.querySelector('#settings-btn');

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

    // Settings modal
    const settingsModal = overlay.querySelector('#settings-modal');
    const closeSettingsModalBtn = overlay.querySelector('#close-settings-modal');
    const showHistoryCheckbox = overlay.querySelector('#show-history-checkbox');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            console.log('Settings button clicked');
            settingsModal.style.display = 'block';
        });
    }

    if (closeSettingsModalBtn) {
        closeSettingsModalBtn.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });
    }

    // Load showHistory from storage, default to true
    chrome.storage.local.get(['showHistory'], (result) => {
        const showHistory = result.showHistory !== false; // default true
        showHistoryCheckbox.checked = showHistory;
    });

    if (showHistoryCheckbox) {
        showHistoryCheckbox.addEventListener('change', () => {
            const showHistory = showHistoryCheckbox.checked;
            chrome.storage.local.set({ showHistory: showHistory });

            // Apply to iframe
            const iframe = overlay.querySelector('#yt-chat-iframe');
            if (iframe && iframe.contentDocument) {
                applyHistoryState(iframe.contentDocument, showHistory);
            }

            // Adjust overlay height
            if (showHistory) {
                overlay.style.height = window.innerWidth < 800 ? '50%' : '70%';
            } else {
                overlay.style.height = '285px';
            }
        });
    }

    return { isMinimized, originalSize };
}