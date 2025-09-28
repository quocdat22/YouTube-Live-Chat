// YouTube Live Chat Fullscreen Extension - Content Script

(function() {
    'use strict';

    console.log('Content script loaded');

    // Use dynamic imports to load ES6 modules
    (async () => {
        try {
            const { showChatOverlay, hideChatOverlay, updateChatSource } = await import(chrome.runtime.getURL('./modules/chatOverlay.js'));
            const { checkFullscreen } = await import(chrome.runtime.getURL('./modules/fullscreenHandler.js'));

/*************
 * Main Execution
 *************/
let isFullscreen = false;
let chatOverlay = null;

// Debounce function to prevent rapid toggling issues
let fullscreenToggleTimeout = null;

// Function to handle fullscreen change events
function onFullscreenChange() {
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
            isFullscreen = newIsFullscreen;
            console.log('Fullscreen state changed to:', newIsFullscreen);

            if (newIsFullscreen) {
                // Check if we're on a YouTube video page
                if (window.location.href.includes('youtube.com/watch')) {
                    console.log('On YouTube video page in fullscreen, showing chat...');
                    chatOverlay = showChatOverlay();
                    console.log('Created chat overlay:', chatOverlay);
                    if (chatOverlay) {
                        updateChatSource(chatOverlay);
                    }
                } else {
                    console.log('Not on YouTube video page, not showing chat');
                }
            } else {
                console.log('Exited fullscreen, hiding chat...');
                hideChatOverlay();
                chatOverlay = null;
            }
        } else {
            console.log('Fullscreen state unchanged, no action needed');
        }
    }, 100); // Small delay to prevent rapid toggling
}

// Listen for fullscreen change events
document.addEventListener('fullscreenchange', () => {
    console.log('Fullscreen change event detected');
    onFullscreenChange();
});
document.addEventListener('webkitfullscreenchange', () => {
    console.log('Webkit fullscreen change event detected');
    onFullscreenChange();
});
document.addEventListener('mozfullscreenchange', () => {
    console.log('Moz fullscreen change event detected');
    onFullscreenChange();
});
document.addEventListener('MSFullscreenChange', () => {
    console.log('MS fullscreen change event detected');
    onFullscreenChange();
});

// Initialize - check current fullscreen state on load
window.addEventListener('load', function() {
    console.log('Page loaded, checking fullscreen status...');
    setTimeout(() => {
        isFullscreen = checkFullscreen();
        console.log('Current fullscreen status:', isFullscreen);
        console.log('Current URL:', window.location.href);
        if (isFullscreen && window.location.href.includes('youtube.com/watch')) {
            console.log('In fullscreen mode on YouTube, showing chat overlay...');
            chatOverlay = showChatOverlay();
            console.log('Chat overlay created:', chatOverlay);
            if (chatOverlay) {
                updateChatSource(chatOverlay);
            }
        } else {
            console.log('Not in fullscreen or not on YouTube, skipping chat overlay');
        }
    }, 1000); // Slight delay to ensure page is loaded
});

// Observe for URL changes in single-page applications
const observer = new MutationObserver(function(mutations) {
    if (isFullscreen && !window.location.href.includes('youtube.com/watch')) {
        // If we're fullscreen but not on a YouTube watch page, hide the chat
        if (chatOverlay) {
            hideChatOverlay();
        } else {
            hideChatOverlay(); // fallback to ID-based removal
        }
    }
});

observer.observe(document, { childList: true, subtree: true });

// Watch for URL changes (for single-page applications)
let currentHref = location.href;
new MutationObserver(function() {
    if (currentHref !== location.href) {
        currentHref = location.href;

        // If we're on a YouTube watch page and in fullscreen, make sure chat is updated
        if (isFullscreen && location.href.includes('youtube.com/watch')) {
            if (chatOverlay) {
                updateChatSource(chatOverlay);
            }
        } else if (isFullscreen && !window.location.href.includes('youtube.com/watch')) {
            // If we've navigated away from YouTube while in fullscreen, hide chat
            if (chatOverlay) {
                hideChatOverlay();
            } else {
                hideChatOverlay(); // fallback to ID-based removal
            }
        }
    }
}).observe(document.querySelector('base') || document.body, {
    attributes: true,
    childList: true,
    subtree: true
});

// Adjust the chat overlay size and position when window resizes
window.addEventListener('resize', function() {
    if (chatOverlay && isFullscreen) {
        const overlay = document.getElementById('yt-fullscreen-chat-overlay');
        if (overlay) {
            const newWidth = window.innerWidth < 800 ? 250 : 400;
            overlay.style.width = newWidth + 'px';
            overlay.style.height = window.innerWidth < 800 ? '50%' : '70%';

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
    }
});

// Cleanup when the page is unloaded
window.addEventListener('beforeunload', function() {
    if (chatOverlay) {
        hideChatOverlay();
    }
    if (fullscreenToggleTimeout) {
        clearTimeout(fullscreenToggleTimeout);
    }
    observer.disconnect();
});
        } catch (error) {
            console.error('Error loading modules:', error);
        }
    })();
})();