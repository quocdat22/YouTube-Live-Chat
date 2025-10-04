/**
 * Status Display Module
 * Handles real-time status updates in the popup UI
 */

export class StatusDisplay {
  constructor() {
    this.elements = {
      overlayStatus: document.getElementById('overlay-status'),
      videoTitle: document.getElementById('video-title'),
      fullscreenStatus: document.getElementById('fullscreen-status')
    };
  }

  /**
   * Update all status displays with new data
   * @param {Object} statusData - Status information from content script
   */
  update(statusData) {
    this.updateOverlayStatus(statusData.overlayActive);
    this.updateVideoTitle(statusData.videoTitle, statusData.videoId);
    this.updateFullscreenStatus(statusData.isFullscreen);
  }

  /**
   * Update overlay status indicator
   * @param {boolean} isActive - Whether overlay is currently active
   */
  updateOverlayStatus(isActive) {
    const element = this.elements.overlayStatus;
    if (!element) return;

    element.className = isActive
      ? 'status-value status-active'
      : 'status-value status-inactive';
    
    element.innerHTML = `
      <span class="status-dot"></span>
      ${isActive ? 'Active' : 'Inactive'}
    `;
  }

  /**
   * Update video title display
   * @param {string} title - Video title
   * @param {string} videoId - YouTube video ID
   */
  updateVideoTitle(title, videoId) {
    const element = this.elements.videoTitle;
    if (!element) return;

    if (title && videoId) {
      const displayTitle = title.length > 40
        ? title.substring(0, 40) + '...'
        : title;
      element.textContent = displayTitle;
      element.title = title; // Full title on hover
    } else {
      element.textContent = 'Not detected';
      element.title = '';
    }
  }

  /**
   * Update fullscreen mode indicator
   * @param {boolean} isFullscreen - Whether page is in fullscreen mode
   */
  updateFullscreenStatus(isFullscreen) {
    const element = this.elements.fullscreenStatus;
    if (!element) return;

    element.textContent = isFullscreen ? 'Fullscreen' : 'Normal';
    element.className = isFullscreen
      ? 'status-value status-fullscreen'
      : 'status-value';
  }

  /**
   * Show message when not on YouTube
   */
  showNotOnYouTube() {
    if (this.elements.overlayStatus) {
      this.elements.overlayStatus.innerHTML = `
        <span class="status-dot"></span>
        Not on YouTube
      `;
      this.elements.overlayStatus.className = 'status-value status-inactive';
    }
    
    if (this.elements.videoTitle) {
      this.elements.videoTitle.textContent = 'Navigate to YouTube';
      this.elements.videoTitle.title = '';
    }
    
    if (this.elements.fullscreenStatus) {
      this.elements.fullscreenStatus.textContent = 'N/A';
      this.elements.fullscreenStatus.className = 'status-value';
    }
  }

  /**
   * Show error state
   */
  showError() {
    if (this.elements.overlayStatus) {
      this.elements.overlayStatus.innerHTML = `
        <span class="status-dot"></span>
        Error
      `;
      this.elements.overlayStatus.className = 'status-value status-error';
    }
  }
}