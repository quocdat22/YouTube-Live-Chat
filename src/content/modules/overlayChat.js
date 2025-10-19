/**
 * Overlay Chat Module
 * Handles updating the chat iframe source based on the current YouTube video.
 */

import {
  getYouTubeVideoId,
  checkIfLiveStream,
} from 'utils/youtubeUtils.js';

/**
 * Applies settings to the chat iframe on load.
 * @param {HTMLIFrameElement} iframe - The chat iframe element.
 * @param {HTMLElement} chatOverlay - The chat overlay element.
 */
function applySettingsToIframe(iframe, chatOverlay) {
  iframe.onload = async () => {
    try {
      if (iframe.contentDocument) {
        // Import and apply settings
        const { applyHistoryState } = await import('./utils.js');
        await applyHistoryState(iframe.contentDocument);
      } else {
        console.warn('[OverlayChat] Cannot access iframe contentDocument - cross-origin restrictions');
      }
    } catch (error) {
      console.error('[OverlayChat] Error applying settings to iframe:', error);
    } finally {
      // Hide loading spinner after iframe loads and settings are applied
      const spinner = chatOverlay.querySelector('#loading-spinner');
      if (spinner) {
        spinner.style.display = 'none';
      }
    }
  };
}

/**
 * Updates the chat iframe source based on the current YouTube video.
 * @param {HTMLElement} chatOverlay - The chat overlay element.
 */
export async function updateChatSource(chatOverlay) {
  if (!chatOverlay) {
    return;
  }

  const videoId = getYouTubeVideoId(window.location.href);

  if (videoId) {
    try {
      const isLive = await checkIfLiveStream(videoId);
      if (isLive) {
        const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}`;
        const iframe = chatOverlay.querySelector('#yt-chat-iframe');
        if (iframe && iframe.src !== chatUrl) {
          // Show loading spinner
          const spinner = chatOverlay.querySelector('#loading-spinner');
          if (spinner) {
            spinner.style.display = 'flex';
          }
          iframe.src = chatUrl;
          applySettingsToIframe(iframe, chatOverlay);
        }
      } else {
        // For non-live streams, show a message or hide the chat
        const iframe = chatOverlay.querySelector('#yt-chat-iframe');
        if (iframe) {
          iframe.src = 'about:blank';
          // Or display a message that chat is not available for this video
          const messageDiv = document.createElement('div');
          messageDiv.style.cssText =
            'display:flex; align-items:center; justify-content:center; height:100%; text-align:center; padding:20px;';
          messageDiv.textContent =
            'Chat is not available for non-live videos';
          iframe.parentElement.innerHTML = '';
          iframe.parentElement.appendChild(messageDiv);
        }
      }
    } catch (error) {
      console.error('Error checking if live stream:', error);
      // If there's an error checking if it's a live stream, try loading the chat anyway
      const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;
      const iframe = chatOverlay.querySelector('#yt-chat-iframe');
      if (iframe && iframe.src !== chatUrl) {
        // Show loading spinner
        const spinner = chatOverlay.querySelector('#loading-spinner');
        if (spinner) {
          spinner.style.display = 'flex';
        }
        iframe.src = chatUrl;
        applySettingsToIframe(iframe, chatOverlay);
      }
    }
  } else {
    // No video ID found
  }
}
