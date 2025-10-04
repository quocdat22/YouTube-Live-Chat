/**
 * Message Handler Module
 * Manages communication with background and content scripts
 */

export class MessageHandler {
  /**
   * Send message to a specific tab
   * @param {number} tabId - Tab ID
   * @param {Object} message - Message to send
   * @returns {Promise<*>} Response from tab
   */
  async sendToTab(tabId, message) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, message);
      return response;
    } catch (error) {
      console.error('Error sending message to tab:', error);
      return null;
    }
  }

  /**
   * Send message to background script
   * @param {Object} message - Message to send
   * @returns {Promise<*>} Response from background
   */
  async sendToBackground(message) {
    try {
      console.log('[MessageHandler] Sending message to background:', message);
      const response = await chrome.runtime.sendMessage(message);
      console.log('[MessageHandler] Received response from background:', response);
      return response;
    } catch (error) {
      console.error('[MessageHandler] Error sending message to background:', error);
      return null;
    }
  }

  /**
   * Broadcast message to all YouTube tabs via background script
   * @param {Object} message - Message to broadcast
   * @returns {Promise<void>}
   */
  async broadcastToYouTubeTabs(message) {
    try {
      console.log('[MessageHandler] Broadcasting message to YouTube tabs:', message);
      
      // Send to background script, which will relay to all YouTube tabs
      const response = await this.sendToBackground(message);
      console.log('[MessageHandler] Background script response:', response);
      
      if (response && response.success) {
        console.log('[MessageHandler] Settings broadcast to background script successfully');
      } else {
        console.warn('[MessageHandler] Background script did not confirm message relay');
      }
    } catch (error) {
      console.error('[MessageHandler] Error broadcasting to YouTube tabs:', error);
    }
  }

  /**
   * Get active YouTube tab via background script
   * @returns {Promise<chrome.tabs.Tab|null>} Active YouTube tab or null
   */
  async getActiveYouTubeTab() {
    try {
      // This is now handled by the background script
      // We don't need to query tabs directly from popup
      return null;
    } catch (error) {
      console.error('Error getting active YouTube tab:', error);
      return null;
    }
  }

  /**
   * Check if current tab is YouTube
   * @returns {Promise<boolean>} True if on YouTube
   */
  async isOnYouTube() {
    const tab = await this.getActiveYouTubeTab();
    return tab !== null;
  }
}