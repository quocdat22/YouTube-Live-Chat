/**
 * YouTube Utility Functions Module
 * Provides utilities for interacting with YouTube pages and APIs.
 */

/**
 * Extracts the YouTube video ID from a given URL.
 * @param {string} url - The YouTube URL to parse.
 * @returns {string|null} The video ID if found and valid, otherwise null.
 */
export function getYouTubeVideoId(url) {
  console.log('getYouTubeVideoId called with URL:', url);
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(live\/))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  console.log('URL match result:', match);
  const videoId = match && match[8].length === 11 ? match[8] : null;
  console.log('Extracted video ID:', videoId);

  // Validate video ID format (should be 11 alphanumeric characters)
  if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    console.log('Valid video ID returned:', videoId);
    return videoId;
  }

  console.log('Invalid or no video ID found');
  return null;
}

/**
 * Checks if the user is logged into YouTube.
 * @returns {Promise<boolean>} A promise that resolves to true if logged in, false otherwise.
 */
export function checkIfUserLoggedIn() {
  console.log('checkIfUserLoggedIn called');
  // This is a simplified check - in reality, we'd need to check for YouTube auth tokens
  // For now, we'll check for the presence of a YouTube account element in the header
  return new Promise((resolve) => {
    // Check if the user's account icon or name is visible in the header
    const accountButton =
      document.querySelector('#avatar-btn') ||
      document.querySelector('ytd-topbar-menu-button-renderer');
    const isLoggedIn = !!accountButton;
    console.log('User logged in check result:', isLoggedIn);
    resolve(isLoggedIn);
  });
}

/**
 * Checks if the current video is a live stream by detecting the presence of #chatframe.
 * @returns {boolean} True if #chatframe exists (indicating a live stream), false otherwise.
 */
export function isLivestream() {
  const chatframe = document.querySelector('#chatframe');
  const isLive = chatframe !== null;
  console.log('isLivestream check: #chatframe exists:', isLive);
  return isLive;
}

/**
 * Checks if the video is a live stream.
 * @param {string} videoId - The YouTube video ID.
 * @returns {Promise<boolean>} A promise that resolves to true if it's a live stream.
 */
export function checkIfLiveStream(videoId) {
  console.log('checkIfLiveStream called for video ID:', videoId);
  // In a real implementation, we would check if this is a live stream
  // by making a request to YouTube's API or examining the video page
  // For this extension, we'll assume if it has a video ID on a YouTube page,
  // it could be a live stream and allow the chat overlay
  return new Promise((resolve) => {
    // A more sophisticated implementation might:
    // 1. Check the YouTube page HTML for live stream indicators
    // 2. Make a request to YouTube's API to check video status
    // 3. Look for "live" or "streaming" indicators on the page
    console.log('Assuming video is a live stream');
    resolve(true);
  });
}
