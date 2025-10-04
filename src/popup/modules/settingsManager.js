/**
 * Settings Manager Module
 * Handles all settings-related operations
 */

export class SettingsManager {
  constructor() {
    this.settings = {};
    
    // Map HTML element IDs to setting keys
    this.settingKeyMap = {
      'auto-show-fullscreen': 'autoShowFullscreen',
      'show-history': 'showHistory',
      'show-chat-header': 'showChatHeader',
      'show-chat-banner': 'showChatBanner',
      'hide-super-chat-buttons': 'hideSuperChatButtons',
      'show-chat-ticker': 'showChatTicker',
      'chat-language': 'chatLanguage'
    };
    
    // Default settings
    this.defaultSettings = {
      autoShowFullscreen: true,
      showHistory: true,
      showChatHeader: true,
      showChatBanner: true,
      hideSuperChatButtons: false,
      showChatTicker: true,
      chatLanguage: 'en'
    };
  }

  /**
   * Load all settings from chrome.storage.local
   * @returns {Promise<void>}
   */
  async loadSettings() {
    try {
      const stored = await chrome.storage.local.get(this.defaultSettings);
      this.settings = { ...this.defaultSettings, ...stored };
      console.log('[SettingsManager] Raw settings from storage:', stored);
      console.log('[SettingsManager] Final merged settings:', this.settings);
      
      // Ensure UI is populated after settings are loaded
      this.populateUI();
      
      // Verify UI state matches stored values
      this.verifyUIState();
      
      console.log('[SettingsManager] Settings loaded and UI populated:', this.settings);
    } catch (error) {
      console.error('[SettingsManager] Error loading settings:', error);
      this.settings = { ...this.defaultSettings };
      this.populateUI();
    }
  }

  /**
   * Populate UI elements with current settings
   */
  populateUI() {
    for (const [elementId, settingKey] of Object.entries(this.settingKeyMap)) {
      const element = document.getElementById(elementId);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = this.settings[settingKey];
          console.log(`[SettingsManager] Set ${elementId} checkbox to:`, this.settings[settingKey]);
        } else {
          element.value = this.settings[settingKey];
          console.log(`[SettingsManager] Set ${elementId} value to:`, this.settings[settingKey]);
        }
      } else {
        console.warn(`[SettingsManager] Element not found for ID: ${elementId}`);
      }
    }
  }
  
  /**
   * Verify UI state matches stored values
   */
  verifyUIState() {
    for (const [elementId, settingKey] of Object.entries(this.settingKeyMap)) {
      const element = document.getElementById(elementId);
      if (element) {
        const uiValue = element.type === 'checkbox' ? element.checked : element.value;
        const storedValue = this.settings[settingKey];
        
        if (uiValue !== storedValue) {
          console.warn(`[SettingsManager] Mismatch for ${elementId}: UI=${uiValue}, Storage=${storedValue}`);
        } else {
          console.log(`[SettingsManager] Verified ${elementId}: UI=${uiValue} matches storage`);
        }
      }
    }
  }

  /**
   * Save a single setting to storage
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   * @returns {Promise<void>}
   */
  async saveSetting(key, value) {
    try {
      this.settings[key] = value;
      await chrome.storage.local.set({ [key]: value });
      console.log(`Setting ${key} saved:`, value);
      
      // Verify the setting was actually saved
      const verify = await chrome.storage.local.get([key]);
      console.log(`Verification for ${key}:`, verify[key], 'Matches saved value:', verify[key] === value);
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get setting key from element ID
   * @param {string} elementId - HTML element ID
   * @returns {string} Setting key
   */
  getSettingKey(elementId) {
    return this.settingKeyMap[elementId] || elementId;
  }

  /**
   * Update UI element when setting changes externally
   * @param {string} settingKey - Setting key
   * @param {*} value - New value
   */
  updateUI(settingKey, value) {
    // Find element ID from setting key
    const elementId = Object.keys(this.settingKeyMap).find(
      id => this.settingKeyMap[id] === settingKey
    );
    
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = value;
        } else {
          element.value = value;
        }
      }
    }
    
    // Update internal settings
    this.settings[settingKey] = value;
  }

  /**
   * Get all current settings
   * @returns {Object} All settings
   */
  getAll() {
    return { ...this.settings };
  }

  /**
   * Reset all settings to defaults
   * @returns {Promise<void>}
   */
  async resetToDefaults() {
    try {
      await chrome.storage.local.clear();
      this.settings = { ...this.defaultSettings };
      this.populateUI();
      console.log('Settings reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }
}