/**
 * YouTube Live Chat Fullscreen - Popup Controller
 * Main entry point for the popup interface
 */

import { SettingsManager } from './modules/settingsManager.js';
import { MessageHandler } from './modules/messageHandler.js';

class PopupController {
  constructor() {
    this.settingsManager = new SettingsManager();
    this.messageHandler = new MessageHandler();
    this.autoShowTimeout = null;
  }

  /**
   * Initialize the popup controller
   */
  async init() {
    console.log('[Popup] Initializing popup controller...');

    try {
      // Load settings from storage
      await this.settingsManager.loadSettings();

      // Attach event listeners
      this.attachEventListeners();

      console.log('[Popup] Popup controller initialized successfully');
    } catch (error) {
      console.error('[Popup] Error initializing popup controller:', error);
    }
  }


  /**
   * Attach event listeners to UI elements
   */
  attachEventListeners() {
    // Auto-show fullscreen toggle
    const autoShowToggle = document.getElementById('auto-show-fullscreen');
    if (autoShowToggle) {
      autoShowToggle.addEventListener('change', (e) => {
        this.handleAutoShowChange(e.target.checked);
      });
    }

    // Other setting changes
    const settingInputs = document.querySelectorAll(
      'input[type="checkbox"]:not(#auto-show-fullscreen), select'
    );
    settingInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.handleSettingChange(input);
      });
    });

    // Listen for storage changes from other sources
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        this.handleStorageChange(changes);
      }
    });
  }

  /**
   * Handle auto-show fullscreen toggle change
   * @param {boolean} enabled - New toggle state
   */
  async handleAutoShowChange(enabled) {
    console.log('[Popup] Auto-show fullscreen changed to:', enabled);

    // Clear any existing timeout to handle rapid toggling
    if (this.autoShowTimeout) {
      clearTimeout(this.autoShowTimeout);
    }

    // Debounce rapid changes with a small delay
    this.autoShowTimeout = setTimeout(async () => {
      try {
        // Show saving indicator
        this.showSaveIndicator();

        // Save to storage
        await this.settingsManager.saveSetting('autoShowFullscreen', enabled);

        // Verify all settings in storage
        const allSettings = await chrome.storage.local.get(null);
        console.log('[Popup] All settings in storage after save:', allSettings);

        // Notify all YouTube tabs
        await this.messageHandler.broadcastToYouTubeTabs({
          action: 'updateSettings',
          settings: { autoShowFullscreen: enabled }
        });

        console.log('[Popup] Auto-show setting updated successfully');
      } catch (error) {
        console.error('[Popup] Error updating auto-show setting:', error);
      }
    }, 200); // 200ms debounce to handle rapid toggling
  }

  /**
   * Handle other setting changes
   * @param {HTMLElement} input - Input element that changed
   */
  async handleSettingChange(input) {
    const settingKey = this.settingsManager.getSettingKey(input.id);
    const value = input.type === 'checkbox' ? input.checked : input.value;

    console.log(`Setting ${settingKey} changed to:`, value);

    try {
      // Show saving indicator
      this.showSaveIndicator();

      // Save to storage
      await this.settingsManager.saveSetting(settingKey, value);

      // Notify content scripts
      await this.messageHandler.broadcastToYouTubeTabs({
        action: 'updateSettings',
        settings: { [settingKey]: value }
      });

      console.log(`Setting ${settingKey} updated successfully`);
    } catch (error) {
      console.error(`Error updating setting ${settingKey}:`, error);
    }
  }

  /**
   * Handle storage changes from external sources
   * @param {Object} changes - Storage changes
   */
  handleStorageChange(changes) {
    console.log('[Popup] Storage changed externally:', changes);

    // Update UI when storage changes from other sources
    for (const [key, { newValue }] of Object.entries(changes)) {
      this.settingsManager.updateUI(key, newValue);
    }
  }

  /**
   * Show save indicator with animation
   */
  showSaveIndicator() {
    const indicator = document.getElementById('save-indicator');
    if (indicator) {
      // Remove any existing show class
      indicator.classList.remove('show');

      // Force reflow to restart animation
      void indicator.offsetWidth;

      // Add show class
      indicator.classList.add('show');

      // Remove after 2 seconds
      setTimeout(() => {
        indicator.classList.remove('show');
      }, 2000);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.autoShowTimeout) {
      clearTimeout(this.autoShowTimeout);
      console.log('[Popup] Auto-show timeout cleared');
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing popup...');

  try {
    const controller = new PopupController();
    controller.init();

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
      controller.cleanup();
    });
  } catch (error) {
    console.error('Error creating popup controller:', error);
  }
});
