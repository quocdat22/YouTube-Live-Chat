/**
 * Overlay Controls Module
 * Handles button event listeners for close, minimize, and maximize.
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

/**
 * Sets up the control buttons for the overlay.
 * @param {HTMLElement} overlay - The chat overlay element.
 * @param {Function} hideChatOverlay - Function to hide the overlay.
 */
export function setupControls(overlay, hideChatOverlay) {
  let isMinimized = false;

  let originalSize = {
    width: overlay.style.width,
    height: overlay.style.height,
  };

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
        originalSize = {
          width: overlay.style.width,
          height: overlay.style.height,
        };
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
  const showChatHeaderCheckbox = overlay.querySelector(
    '#show-chat-header-checkbox'
  );
  const showChatBannerCheckbox = overlay.querySelector(
    '#show-chat-banner-checkbox'
  );
  const hideSuperChatButtonsCheckbox = overlay.querySelector(
    '#hide-super-chat-buttons-checkbox'
  );
  const showChatTickerCheckbox = overlay.querySelector(
    '#show-chat-ticker-checkbox'
  );

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

  // Load showChatHeader from storage, default to true
  chrome.storage.local.get(['showChatHeader'], (result) => {
    const showChatHeader = result.showChatHeader !== false; // default true
    showChatHeaderCheckbox.checked = showChatHeader;
  });

  // Load showChatBanner from storage, default to true
  chrome.storage.local.get(['showChatBanner'], (result) => {
    const showChatBanner = result.showChatBanner !== false; // default true
    showChatBannerCheckbox.checked = showChatBanner;
  });

  // Load hideSuperChatButtons from storage, default to false
  chrome.storage.local.get(['hideSuperChatButtons'], (result) => {
    const hideSuperChatButtons = result.hideSuperChatButtons === true; // default false
    hideSuperChatButtonsCheckbox.checked = hideSuperChatButtons;
  });

  // Load showChatTicker from storage, default to true
  chrome.storage.local.get(['showChatTicker'], (result) => {
    const showChatTicker = result.showChatTicker !== false; // default true
    showChatTickerCheckbox.checked = showChatTicker;
  });

  if (showHistoryCheckbox) {
    showHistoryCheckbox.addEventListener('change', () => {
      const showHistory = showHistoryCheckbox.checked;
      chrome.storage.local.set({ showHistory: showHistory });

      // Apply to iframe
      const iframe = overlay.querySelector('#yt-chat-iframe');
      if (iframe && iframe.contentDocument) {
        applyHistoryState(iframe.contentDocument);
      }

      // Adjust overlay height
      if (showHistory) {
        overlay.style.height = window.innerWidth < 800 ? '50%' : '70%';
      } else {
        overlay.style.height = '285px';
      }
    });
  }

  if (showChatHeaderCheckbox) {
    showChatHeaderCheckbox.addEventListener('change', () => {
      const showChatHeader = showChatHeaderCheckbox.checked;
      chrome.storage.local.set({ showChatHeader: showChatHeader });

      // Apply to iframe
      const iframe = overlay.querySelector('#yt-chat-iframe');
      if (iframe && iframe.contentDocument) {
        applyHistoryState(iframe.contentDocument);
      }
    });
  }

  if (showChatBannerCheckbox) {
    showChatBannerCheckbox.addEventListener('change', () => {
      const showChatBanner = showChatBannerCheckbox.checked;
      chrome.storage.local.set({ showChatBanner: showChatBanner });

      // Apply to iframe
      const iframe = overlay.querySelector('#yt-chat-iframe');
      if (iframe && iframe.contentDocument) {
        applyHistoryState(iframe.contentDocument);
      }
    });
  }

  if (hideSuperChatButtonsCheckbox) {
    hideSuperChatButtonsCheckbox.addEventListener('change', () => {
      const hideSuperChatButtons = hideSuperChatButtonsCheckbox.checked;
      chrome.storage.local.set({ hideSuperChatButtons: hideSuperChatButtons });

      // Apply to iframe
      const iframe = overlay.querySelector('#yt-chat-iframe');
      if (iframe && iframe.contentDocument) {
        applyHistoryState(iframe.contentDocument);
      }
    });
  }

  if (showChatTickerCheckbox) {
    showChatTickerCheckbox.addEventListener('change', () => {
      const showChatTicker = showChatTickerCheckbox.checked;
      chrome.storage.local.set({ showChatTicker: showChatTicker });

      // Apply to iframe
      const iframe = overlay.querySelector('#yt-chat-iframe');
      if (iframe && iframe.contentDocument) {
        applyHistoryState(iframe.contentDocument);
      }
    });
  }

  return { isMinimized, originalSize };
}
