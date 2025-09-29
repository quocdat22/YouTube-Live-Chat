/**
 * Chat Overlay Module
 * Handles the creation, display, and management of the YouTube live chat overlay.
 */

import { createOverlayElement } from './overlayCreation.js';
import { loadSavedPosition, constrainPosition, applySavedPosition, savePosition } from './overlayPositioning.js';
import { setupControls } from './overlayControls.js';
import { setupDragging } from './overlayDrag.js';
import { setupKeyboard } from './overlayKeyboard.js';
import { setupResizing } from './overlayResize.js';
import { updateChatSource as updateChat } from './overlayChat.js';

/**
 * Shows the chat overlay on the page.
 * @returns {HTMLElement} The chat overlay element.
 */
export function showChatOverlay() {
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

    // Load and apply saved position
    const savedPosition = loadSavedPosition();
    if (savedPosition.left !== undefined && savedPosition.top !== undefined) {
        applySavedPosition(chatOverlay, savedPosition);
    }

    // Add the overlay to the page
    document.body.appendChild(chatOverlay);
    console.log('Added chat overlay to document body');

    // Set up controls (buttons)
    setupControls(chatOverlay, hideChatOverlay);

    // Set up dragging
    setupDragging(chatOverlay, savePosition, (left, top, overlay) => constrainPosition(left, top, overlay));

    // Set up resizing
    setupResizing(chatOverlay);

    // Set up keyboard navigation
    setupKeyboard(chatOverlay, savePosition, (left, top, overlay) => constrainPosition(left, top, overlay));

    console.log('Returning chat overlay element:', chatOverlay);
    return chatOverlay;
}

/**
 * Hides the chat overlay by removing it from the DOM.
 */
export function hideChatOverlay() {
    console.log('hideChatOverlay function called (ID-based)');
    const chatOverlay = document.getElementById('yt-fullscreen-chat-overlay');
    if (chatOverlay) {
        console.log('Found chat overlay element, removing it');
        // Instead of just hiding, properly remove the element to free resources
        chatOverlay.remove();
    } else {
        console.log('No chat overlay found to hide');
    }
}

/**
 * Updates the chat iframe source based on the current YouTube video.
 * @param {HTMLElement} chatOverlay - The chat overlay element.
 */
export async function updateChatSource(chatOverlay) {
    return updateChat(chatOverlay);
}