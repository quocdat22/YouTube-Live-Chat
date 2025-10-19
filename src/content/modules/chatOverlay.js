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
  saveFinalPosition,
  loadSavedSize,
  applySavedSize,
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

      // Load and apply saved position for existing overlay
      try {
        const savedPosition = loadSavedPosition();
        if (savedPosition.left !== undefined && savedPosition.top !== undefined) {
          applySavedPosition(existingOverlay, savedPosition);
        }
        const savedSize = loadSavedSize();
        if (savedSize.width !== undefined && savedSize.height !== undefined) {
          applySavedSize(existingOverlay, savedSize);
        }
      } catch (error) {
        console.error('Error loading saved position/size for existing overlay:', error);
      }

      existingOverlay.style.display = 'block';
      return existingOverlay;
    }

    // Create the overlay element
    const chatOverlay = createOverlayElement();
    if (!chatOverlay) {
      console.error('Failed to create chat overlay element');
      return null;
    }

    // Add the overlay to the page FIRST
    if (document.body) {
      document.body.appendChild(chatOverlay);
    } else {
      console.error('Document body not available');
      return null;
    }

    // Load and apply saved position AFTER adding to DOM
    try {
      const savedPosition = loadSavedPosition();
      if (savedPosition.left !== undefined && savedPosition.top !== undefined) {
        applySavedPosition(chatOverlay, savedPosition);
      }
      const savedSize = loadSavedSize();
      if (savedSize.width !== undefined && savedSize.height !== undefined) {
        applySavedSize(chatOverlay, savedSize);
      }
    } catch (error) {
      console.error('Error loading or applying saved position/size:', error);
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
      console.log('Found chat overlay element, saving final position before removing');

      // Save final position and size before removing
      saveFinalPosition(chatOverlay);

      // Small delay to ensure save completes before removal
      setTimeout(() => {
        try {
          chatOverlay.remove();
          console.log('Chat overlay removed successfully');
        } catch (removeError) {
          console.error('Error removing chat overlay:', removeError);
        }
      }, 50);
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
