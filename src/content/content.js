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
function onFullscreenChange() {
  // Clear any existing timeout
  if (fullscreenToggleTimeout) {
    clearTimeout(fullscreenToggleTimeout);
  }

  // Use a small delay to handle rapid toggling
  fullscreenToggleTimeout = setTimeout(() => {
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
        // Check if we're on a YouTube video page
        const videoId = getYouTubeVideoId(window.location.href);
        if (videoId) {
          console.log(
            'On YouTube video page in fullscreen, showing chat... Video ID:',
            videoId
          );
          chatOverlay = showChatOverlay();
          console.log('Created chat overlay:', chatOverlay);
          if (chatOverlay) {
            updateChatSource(chatOverlay);
          }
        } else {
          console.log(
            'Not on YouTube video page, not showing chat. URL:',
            window.location.href
          );
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
window.addEventListener('load', function () {
  console.log('Page loaded, checking fullscreen status...');
  setTimeout(() => {
    isFullscreen = checkFullscreen();
    console.log('Current fullscreen status:', isFullscreen);
    console.log('Current URL:', window.location.href);
    const videoId = getYouTubeVideoId(window.location.href);
    if (isFullscreen && videoId) {
      console.log(
        'In fullscreen mode on YouTube, showing chat overlay... Video ID:',
        videoId
      );
      chatOverlay = showChatOverlay();
      console.log('Chat overlay created:', chatOverlay);
      if (chatOverlay) {
        updateChatSource(chatOverlay);
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
