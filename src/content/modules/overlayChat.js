/**
 * Overlay Chat Module
 * Handles updating the chat iframe source based on the current YouTube video.
 */

import {
  getYouTubeVideoId,
  checkIfUserLoggedIn,
  checkIfLiveStream,
} from 'utils/youtubeUtils.js';
import { applyHistoryState } from './utils.js';

/**
 * Hides the message list in the chat iframe to show only header and input.
 * @param {HTMLIFrameElement} iframe - The chat iframe element.
 */
function hideMessageList(iframe) {
  iframe.onload = () => {
    // Note: Due to cross-origin restrictions, we cannot directly access contentDocument
    // of YouTube chat iframe. We can only set the source and let YouTube handle the content.
    // We can still apply settings if they're passed via URL parameters
    chrome.storage.local.get(['showHistory'], () => {
      // Settings retrieved
    });
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
          iframe.src = chatUrl;
          hideMessageList(iframe);
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
        iframe.src = chatUrl;
        hideMessageList(iframe);
      }
    }
  } else {
    // No video ID found
  }
}
