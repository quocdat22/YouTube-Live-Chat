/**
 * Overlay Controls Module
 * Handles button event listeners for close, minimize, and maximize.
 */

import { applyHistoryState } from './utils.js';
import { loadAllSettings, updateSetting, setMinimizationState, getOriginalSize, setOriginalSize } from './stateManager.js';

/**
 * Sets up the control buttons for the overlay.
 * @param {HTMLElement} overlay - The chat overlay element.
 * @param {Function} hideChatOverlay - Function to hide the overlay.
 */
export async function setupControls(overlay, hideChatOverlay) {
  try {
    // Load all settings
    const settings = await loadAllSettings();
    let isMinimized = settings.isMinimized;

    let originalSize = settings.originalSize;
    if (!originalSize.width || !originalSize.height) {
      originalSize = {
        width: overlay.style.width,
        height: overlay.style.height,
      };
    }

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
      minimizeChatBtn.addEventListener('click', async () => {
        try {
          if (isMinimized) {
            // Restore from minimized
            const savedOriginalSize = await getOriginalSize();
            if (savedOriginalSize.width && savedOriginalSize.height) {
              overlay.style.width = savedOriginalSize.width;
              overlay.style.height = savedOriginalSize.height;
            }
            overlay.style.right = '10px';
            overlay.style.left = 'auto';
            isMinimized = false;
            await setMinimizationState(false);
            minimizeChatBtn.textContent = '−';
            minimizeChatBtn.setAttribute('aria-label', 'Minimize chat');
          } else {
            // Minimize: dock to right edge, reduce height
            const currentSize = {
              width: overlay.style.width,
              height: overlay.style.height,
            };
            await setOriginalSize(currentSize);
            overlay.style.width = '300px';
            overlay.style.height = '40px';
            overlay.style.right = '0px';
            overlay.style.left = 'auto';
            overlay.style.top = '50%';
            isMinimized = true;
            await setMinimizationState(true);
            minimizeChatBtn.textContent = '+';
            minimizeChatBtn.setAttribute('aria-label', 'Restore chat');
          }
        } catch (error) {
          console.error('Error in minimize toggle:', error);
        }
      });
    }

    // Settings modal
    const settingsModal = overlay.querySelector('#settings-modal');
    const closeSettingsModalBtn = overlay.querySelector('#close-settings-modal');
    const showHistoryCheckbox = overlay.querySelector('#show-history-checkbox');
    const showChatHeaderCheckbox = overlay.querySelector('#show-chat-header-checkbox');
    const showChatBannerCheckbox = overlay.querySelector('#show-chat-banner-checkbox');
    const hideSuperChatButtonsCheckbox = overlay.querySelector('#hide-super-chat-buttons-checkbox');
    const showChatTickerCheckbox = overlay.querySelector('#show-chat-ticker-checkbox');

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

    // Set initial checkbox states
    if (showHistoryCheckbox) {
      showHistoryCheckbox.checked = settings.showHistory;
    }
    if (showChatHeaderCheckbox) {
      showChatHeaderCheckbox.checked = settings.showChatHeader;
    }
    if (showChatBannerCheckbox) {
      showChatBannerCheckbox.checked = settings.showChatBanner;
    }
    if (hideSuperChatButtonsCheckbox) {
      hideSuperChatButtonsCheckbox.checked = settings.hideSuperChatButtons;
    }
    if (showChatTickerCheckbox) {
      showChatTickerCheckbox.checked = settings.showChatTicker;
    }

    // Event listeners for settings changes
    if (showHistoryCheckbox) {
      showHistoryCheckbox.addEventListener('change', async () => {
        try {
          const showHistory = showHistoryCheckbox.checked;
          await updateSetting('showHistory', showHistory);

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
        } catch (error) {
          console.error('Error updating showHistory setting:', error);
        }
      });
    }

    if (showChatHeaderCheckbox) {
      showChatHeaderCheckbox.addEventListener('change', async () => {
        try {
          const showChatHeader = showChatHeaderCheckbox.checked;
          await updateSetting('showChatHeader', showChatHeader);

          // Apply to iframe
          const iframe = overlay.querySelector('#yt-chat-iframe');
          if (iframe && iframe.contentDocument) {
            applyHistoryState(iframe.contentDocument);
          }
        } catch (error) {
          console.error('Error updating showChatHeader setting:', error);
        }
      });
    }

    if (showChatBannerCheckbox) {
      showChatBannerCheckbox.addEventListener('change', async () => {
        try {
          const showChatBanner = showChatBannerCheckbox.checked;
          await updateSetting('showChatBanner', showChatBanner);

          // Apply to iframe
          const iframe = overlay.querySelector('#yt-chat-iframe');
          if (iframe && iframe.contentDocument) {
            applyHistoryState(iframe.contentDocument);
          }
        } catch (error) {
          console.error('Error updating showChatBanner setting:', error);
        }
      });
    }

    if (hideSuperChatButtonsCheckbox) {
      hideSuperChatButtonsCheckbox.addEventListener('change', async () => {
        try {
          const hideSuperChatButtons = hideSuperChatButtonsCheckbox.checked;
          await updateSetting('hideSuperChatButtons', hideSuperChatButtons);

          // Apply to iframe
          const iframe = overlay.querySelector('#yt-chat-iframe');
          if (iframe && iframe.contentDocument) {
            applyHistoryState(iframe.contentDocument);
          }
        } catch (error) {
          console.error('Error updating hideSuperChatButtons setting:', error);
        }
      });
    }

    if (showChatTickerCheckbox) {
      showChatTickerCheckbox.addEventListener('change', async () => {
        try {
          const showChatTicker = showChatTickerCheckbox.checked;
          await updateSetting('showChatTicker', showChatTicker);

          // Apply to iframe
          const iframe = overlay.querySelector('#yt-chat-iframe');
          if (iframe && iframe.contentDocument) {
            applyHistoryState(iframe.contentDocument);
          }
        } catch (error) {
          console.error('Error updating showChatTicker setting:', error);
        }
      });
    }

    return { isMinimized, originalSize };
  } catch (error) {
    console.error('Error in setupControls:', error);
    return { isMinimized: false, originalSize: { width: '', height: '' } };
  }
}
