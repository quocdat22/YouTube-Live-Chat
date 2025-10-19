// YouTube Live Chat Fullscreen Extension - Content Script

'use strict';

import {
  showChatOverlay,
  hideChatOverlay,
  updateChatSource,
} from './modules/chatOverlay.js';
import { checkFullscreen } from './modules/fullscreenHandler.js';
import { getYouTubeVideoId } from 'utils/youtubeUtils.js';
import { throttle } from 'utils/throttle.js';
import { adjustOverlayForWindowResize } from './modules/overlayResize.js';
import { startObserving, stopObserving } from './modules/pageObserver.js';

console.log('Content script loaded');

/*************
 * Main Execution
 *************/
let isFullscreen = false;
let chatOverlay = null;

// Debounce function to prevent rapid toggling issues
let fullscreenToggleTimeout = null;

// Function to handle fullscreen change events
async function onFullscreenChange() {
  // Clear any existing timeout
  if (fullscreenToggleTimeout) {
    clearTimeout(fullscreenToggleTimeout);
  }

  // Use a small delay to handle rapid toggling
  fullscreenToggleTimeout = setTimeout(async () => {
    const newIsFullscreen = checkFullscreen();
    console.log(
      'Fullscreen handler: old state:',
      isFullscreen,
      'new state:',
      newIsFullscreen
    );
    console.log('Current URL in handler:', window.location.href);

    // Only update if the state actually changed
    if (isFullscreen !== newIsFullscreen) {
      isFullscreen = newIsFullscreen;
      console.log('Fullscreen state changed to:', newIsFullscreen);

      if (newIsFullscreen) {
        try {
          console.log('Fullscreen entered, checking auto-show setting...');
          const result = await chrome.storage.local.get(['autoShowFullscreen']);
          console.log('Storage result for autoShowFullscreen:', result.autoShowFullscreen, 'Type:', typeof result.autoShowFullscreen);
          // Only show if the setting is explicitly true
          if (result.autoShowFullscreen === true) {
            const videoId = getYouTubeVideoId(window.location.href);
            console.log('Video ID detected:', videoId, 'Current URL:', window.location.href);
            if (videoId) {
              console.log(
                'On YouTube video page in fullscreen, showing chat... Video ID:',
                videoId
              );
              chatOverlay = await showChatOverlay();
              console.log('Created chat overlay:', chatOverlay);
              if (chatOverlay) {
                await updateChatSource(chatOverlay);
              }
            } else {
              console.log(
                'Not on YouTube video page, not showing chat. URL:',
                window.location.href
              );
            }
          } else {
            console.log('Auto-show is disabled (value:', result.autoShowFullscreen, '), not showing chat overlay.');
          }
        } catch (error) {
          console.error('Error handling fullscreen change:', error);
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
window.addEventListener('load', async function () {
  console.log('Page loaded, checking fullscreen status...');
  setTimeout(async () => {
    isFullscreen = checkFullscreen();
    console.log('Current fullscreen status:', isFullscreen);
    console.log('Current URL:', window.location.href);
    const videoId = getYouTubeVideoId(window.location.href);
    if (isFullscreen && videoId) {
      console.log('In fullscreen mode on YouTube, checking auto-show setting...');
      const result = await chrome.storage.local.get(['autoShowFullscreen']);
      console.log('Storage result for autoShowFullscreen:', result.autoShowFullscreen, 'Type:', typeof result.autoShowFullscreen);
      if (result.autoShowFullscreen === true) {
        console.log(
          'Auto-show enabled, showing chat overlay... Video ID:',
          videoId
        );
        chatOverlay = await showChatOverlay();
        console.log('Chat overlay created:', chatOverlay);
        if (chatOverlay) {
          await updateChatSource(chatOverlay);
        }
      } else {
        console.log('Auto-show is disabled (value:', result.autoShowFullscreen, '), not showing chat overlay.');
      }
    } else {
      console.log(
        'Not in fullscreen or not on YouTube, skipping chat overlay. Video ID:',
        videoId,
        'Fullscreen:',
        isFullscreen
      );
    }
  }, 1000); // Slight delay to ensure page is loaded
});

startObserving(isFullscreen, chatOverlay, hideChatOverlay, updateChatSource);

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('[Content] Received message:', message);

  if (message.action === 'updateSettings' && message.settings) {
    console.log('[Content] Settings updated:', message.settings);

    // If overlay exists, update it with new settings
    if (chatOverlay) {
      try {
        // Update checkboxes in modal
        for (const [key, value] of Object.entries(message.settings)) {
          const checkboxId = key.replace(/([A-Z])/g, '-$1').toLowerCase() + '-checkbox';
          const checkbox = chatOverlay.querySelector(`#${checkboxId}`);
          if (checkbox) {
            checkbox.checked = value;
          }
        }

        // Apply settings to iframe if accessible
        const iframe = chatOverlay.querySelector('#yt-chat-iframe');
        if (iframe && iframe.contentDocument) {
          const { applyHistoryState } = await import('./modules/utils.js');
          applyHistoryState(iframe.contentDocument);
        }

        // Handle showHistory height adjustment
        if (message.settings.showHistory !== undefined) {
          if (message.settings.showHistory) {
            chatOverlay.style.height = window.innerWidth < 800 ? '50%' : '70%';
          } else {
            chatOverlay.style.height = '285px';
          }
        }

        console.log('[Content] Overlay updated with new settings');
      } catch (error) {
        console.error('[Content] Error updating overlay:', error);
      }
    }

    sendResponse({ success: true });
  }

  return true; // Keep the message channel open for async response
});

// Adjust the chat overlay size and position when window resizes
window.addEventListener(
  'resize',
  throttle(function () {
    if (chatOverlay && isFullscreen) {
      adjustOverlayForWindowResize(chatOverlay);
    }
  }, 100)
);

// Cleanup when the page is unloaded
window.addEventListener('beforeunload', function () {
  if (chatOverlay) {
    hideChatOverlay();
  }
  if (fullscreenToggleTimeout) {
    clearTimeout(fullscreenToggleTimeout);
  }
  stopObserving();
});
