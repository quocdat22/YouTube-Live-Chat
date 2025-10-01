/**
 * Chat Overlay Module
 * Handles the creation, display, and management of the YouTube live chat overlay.
 */

import { createOverlayElement } from './overlayCreation.js';
import {
  loadSavedPosition,
  constrainPosition,
  applySavedPosition,
  savePosition,
} from './overlayPositioning.js';
import { setupControls } from './overlayControls.js';
import { setupDragging } from './overlayDrag.js';
import { setupKeyboard } from './overlayKeyboard.js';
import { setupResizing } from './overlayResize.js';
import { updateChatSource as updateChat } from './overlayChat.js';

/**
 * Shows the chat overlay on the page.
 * @returns {Promise<HTMLElement|null>} The chat overlay element or null if an error occurred.
 */
export async function showChatOverlay() {
  try {
    console.log('showChatOverlay function called');

    // Check if overlay already exists
    const existingOverlay = document.getElementById('yt-fullscreen-chat-overlay');
    if (existingOverlay) {
      console.log('Chat overlay already exists, showing it');
      existingOverlay.style.display = 'block';
      return existingOverlay;
    }

    // Create the overlay element
    const chatOverlay = createOverlayElement();
    if (!chatOverlay) {
      console.error('Failed to create chat overlay element');
      return null;
    }

    // Load and apply saved position
    try {
      const savedPosition = loadSavedPosition();
      if (savedPosition.left !== undefined && savedPosition.top !== undefined) {
        applySavedPosition(chatOverlay, savedPosition);
      }
    } catch (error) {
      console.error('Error loading or applying saved position:', error);
    }

    // Add the overlay to the page
    if (document.body) {
      document.body.appendChild(chatOverlay);
    } else {
      console.error('Document body not available');
      return null;
    }

    // Set up controls (buttons)
    try {
      await setupControls(chatOverlay, hideChatOverlay);
    } catch (error) {
      console.error('Error setting up controls:', error);
    }

    // Set up dragging
    try {
      setupDragging(chatOverlay, savePosition, (left, top, overlay) =>
        constrainPosition(left, top, overlay)
      );
    } catch (error) {
      console.error('Error setting up dragging:', error);
    }

    // Set up resizing
    try {
      setupResizing(chatOverlay);
    } catch (error) {
      console.error('Error setting up resizing:', error);
    }

    // Set up keyboard navigation
    try {
      setupKeyboard(chatOverlay, savePosition, (left, top, overlay) =>
        constrainPosition(left, top, overlay)
      );
    } catch (error) {
      console.error('Error setting up keyboard navigation:', error);
    }

    console.log('Returning chat overlay element:', chatOverlay);
    return chatOverlay;
  } catch (error) {
    console.error('Error in showChatOverlay:', error);
    return null;
  }
}

/**
 * Hides the chat overlay by removing it from the DOM.
 */
export function hideChatOverlay() {
  try {
    console.log('hideChatOverlay function called (ID-based)');
    const chatOverlay = document.getElementById('yt-fullscreen-chat-overlay');
    if (chatOverlay) {
      console.log('Found chat overlay element, removing it');
      // Instead of just hiding, properly remove the element to free resources
      chatOverlay.remove();
    } else {
      console.log('No chat overlay found to hide');
    }
  } catch (error) {
    console.error('Error in hideChatOverlay:', error);
  }
}

/**
 * Updates the chat iframe source based on the current YouTube video.
 * @param {HTMLElement} chatOverlay - The chat overlay element.
 * @returns {Promise<void>}
 */
export async function updateChatSource(chatOverlay) {
  try {
    if (!chatOverlay) {
      console.warn('Chat overlay is null or undefined');
      return;
    }
    return await updateChat(chatOverlay);
  } catch (error) {
    console.error('Error in updateChatSource:', error);
  }
}
