/**
 * Utility Functions Module
 * Provides shared utility functions for the YouTube Live Chat Fullscreen Extension.
 */

/**
 * Applies chat history state settings to the iframe document.
 * @param {Document} doc - The iframe document.
 */
export function applyHistoryState(doc) {
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