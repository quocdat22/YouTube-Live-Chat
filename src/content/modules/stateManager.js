/**
 * State Management Module
 * Centralizes all state management for the YouTube Live Chat Fullscreen Extension.
 */

/**
 * Default settings for the chat overlay
 */
const DEFAULT_SETTINGS = {
  showHistory: true,
  showChatHeader: true,
  showChatBanner: true,
  hideSuperChatButtons: false,
  showChatTicker: true,
  isMinimized: false,
  originalSize: { width: '', height: '' }
};

/**
 * Loads a setting from chrome.storage.local with a default value.
 * @param {string} key - The setting key to load
 * @param {*} defaultValue - The default value if not found
 * @returns {Promise<*>} The setting value
 */
export function loadSetting(key, defaultValue) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([key], (result) => {
        const value = result[key];
        // For boolean settings, we need to check if the value is explicitly set
        if (key === 'showHistory' || key === 'showChatHeader' || key === 'showChatBanner' || key === 'showChatTicker') {
          resolve(value !== false); // default true
        } else if (key === 'hideSuperChatButtons') {
          resolve(value === true); // default false
        } else {
          resolve(value !== undefined ? value : defaultValue);
        }
      });
    } catch (error) {
      console.error(`Error loading setting ${key}:`, error);
      resolve(defaultValue);
    }
  });
}

/**
 * Saves a setting to chrome.storage.local.
 * @param {string} key - The setting key to save
 * @param {*} value - The value to save
 * @returns {Promise<void>}
 */
export function saveSetting(key, value) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
      reject(error);
    }
  });
}

/**
 * Loads all chat settings from storage.
 * @returns {Promise<Object>} Object containing all settings
 */
export async function loadAllSettings() {
  try {
    const settings = {};
    for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
      settings[key] = await loadSetting(key, defaultValue);
    }
    return settings;
  } catch (error) {
    console.error('Error loading all settings:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Saves all chat settings to storage.
 * @param {Object} settings - Object containing all settings to save
 * @returns {Promise<void>}
 */
export async function saveAllSettings(settings) {
  try {
    for (const [key, value] of Object.entries(settings)) {
      await saveSetting(key, value);
    }
  } catch (error) {
    console.error('Error saving all settings:', error);
  }
}

/**
 * Updates a specific setting and saves it.
 * @param {string} key - The setting key to update
 * @param {*} value - The new value
 * @returns {Promise<void>}
 */
export async function updateSetting(key, value) {
  try {
    await saveSetting(key, value);
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
  }
}

/**
 * Gets the current minimization state.
 * @returns {Promise<boolean>} The minimization state
 */
export async function getMinimizationState() {
  return await loadSetting('isMinimized', DEFAULT_SETTINGS.isMinimized);
}

/**
 * Sets the current minimization state.
 * @param {boolean} isMinimized - The new minimization state
 * @returns {Promise<void>}
 */
export async function setMinimizationState(isMinimized) {
  await updateSetting('isMinimized', isMinimized);
}

/**
 * Gets the original size before minimization.
 * @returns {Promise<Object>} The original size object
 */
export async function getOriginalSize() {
  return await loadSetting('originalSize', DEFAULT_SETTINGS.originalSize);
}

/**
 * Sets the original size before minimization.
 * @param {Object} originalSize - The original size object
 * @returns {Promise<void>}
 */
export async function setOriginalSize(originalSize) {
  await updateSetting('originalSize', originalSize);
}