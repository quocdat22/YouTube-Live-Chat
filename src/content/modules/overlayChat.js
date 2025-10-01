/**
 * Overlay Chat Module
 * Handles updating the chat iframe source based on the current YouTube video.
 */

import {
  getYouTubeVideoId,
  checkIfUserLoggedIn,
  checkIfLiveStream,
} from 'utils/youtubeUtils.js';

/**
 * Hides the message list in the chat iframe to show only header and input.
 * @param {HTMLIFrameElement} iframe - The chat iframe element.
 */
function applyHistoryState(doc) {
  chrome.storage.local.get(
    [
      'showHistory',
      'showChatHeader',
      'showChatBanner',
      'hideSuperChatButtons',
      'showChatTicker',
    ],
    (result) => {
      const showHistory = result.showHistory !== false; // default true
      const showChatHeader = result.showChatHeader !== false; // default true
      const showChatBanner = result.showChatBanner !== false; // default true
      const hideSuperChatButtons = result.hideSuperChatButtons === true; // default false
      const showChatTicker = result.showChatTicker !== false; // default true

      const messageList = doc.querySelector(
        '#items.yt-live-chat-item-list-renderer'
      );
      const inputRenderer = doc.querySelector(
        'yt-live-chat-message-input-renderer'
      );
      const headerRenderer = doc.querySelector('yt-live-chat-header-renderer');
      const bannerManager = doc.querySelector('yt-live-chat-banner-manager');

      if (showHistory) {
        if (messageList) messageList.style.display = '';
        if (inputRenderer) {
          inputRenderer.style.position = '';
          inputRenderer.style.top = '';
          inputRenderer.style.left = '';
          inputRenderer.style.right = '';
          inputRenderer.style.bottom = '';
        }
      } else {
        if (messageList) messageList.style.display = 'none';
        if (inputRenderer) {
          inputRenderer.style.position = 'absolute';
          inputRenderer.style.top = '0';
          inputRenderer.style.left = '0';
          inputRenderer.style.right = '0';
          inputRenderer.style.bottom = 'auto';
        }
      }

      // Always apply chat header visibility
      if (headerRenderer) {
        headerRenderer.style.display = showChatHeader ? '' : 'none';
      }

      // Always apply chat banner visibility
      if (bannerManager) {
        bannerManager.style.display = showChatBanner ? '' : 'none';
      }

      // Hide super chat buttons if enabled
      const rightContainer = doc.querySelector(
        '#right.style-scope.yt-live-chat-message-input-renderer'
      );
      if (rightContainer) {
        rightContainer.style.display = hideSuperChatButtons ? 'none' : '';
      }

      // Always apply chat ticker visibility
      const ticker = doc.querySelector(
        '#ticker.style-scope.yt-live-chat-renderer'
      );
      if (ticker) {
        ticker.style.display = showChatTicker ? '' : 'none';
      }
    }
  );
}

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
