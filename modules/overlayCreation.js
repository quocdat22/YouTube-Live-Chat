/**
 * Overlay Creation Module
 * Handles the creation of the chat overlay HTML structure and initial styling.
 */

import { loadSavedSize, applySavedSize } from './overlayPositioning.js';

/**
 * Creates the chat overlay element with initial structure and styles.
 * @returns {HTMLElement} The created chat overlay element.
 */
export function createOverlayElement() {
    console.log('Creating new chat overlay element');

    // Create the chat overlay element
    const chatOverlay = document.createElement('div');
    chatOverlay.id = 'yt-fullscreen-chat-overlay';
    chatOverlay.setAttribute('role', 'dialog');
    chatOverlay.setAttribute('aria-labelledby', 'chat-title');
    chatOverlay.innerHTML = `
        <div id="chat-header" role="banner" aria-label="YouTube Live Chat Controls" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; height: 40px; box-sizing: border-box; cursor: move;">
            <span id="chat-title" aria-label="YouTube Live Chat">YouTube Live Chat</span>
            <div style="display: flex; gap: 5px;">
                <button id="minimize-chat-btn" aria-label="Minimize chat" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">−</button>
                <button id="close-chat-btn" aria-label="Close chat" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
            </div>
        </div>
        <iframe
            id="yt-chat-iframe"
            src=""
            style="width: 100%; height: calc(100% - 40px); border: none;"
            allow="autoplay; encrypted-media"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox allow-same-origin allow-orientation-lock allow-pointer-lock">
        </iframe>
        <!-- Resize handles -->
        <div class="resize-handle resize-handle-nw" style="position: absolute; top: 0; left: 0; width: 10px; height: 10px; cursor: nw-resize; background: rgba(255,255,255,0.1);"></div>
        <div class="resize-handle resize-handle-ne" style="position: absolute; top: 0; right: 0; width: 10px; height: 10px; cursor: ne-resize; background: rgba(255,255,255,0.1);"></div>
        <div class="resize-handle resize-handle-sw" style="position: absolute; bottom: 0; left: 0; width: 10px; height: 10px; cursor: sw-resize; background: rgba(255,255,255,0.1);"></div>
        <div class="resize-handle resize-handle-se" style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; cursor: se-resize; background: rgba(255,255,255,0.1);"></div>
        <div class="resize-handle resize-handle-n" style="position: absolute; top: 0; left: 10px; right: 10px; height: 5px; cursor: n-resize; background: rgba(255,255,255,0.1);"></div>
        <div class="resize-handle resize-handle-s" style="position: absolute; bottom: 0; left: 10px; right: 10px; height: 5px; cursor: s-resize; background: rgba(255,255,255,0.1);"></div>
        <div class="resize-handle resize-handle-w" style="position: absolute; top: 10px; left: 0; bottom: 10px; width: 5px; cursor: w-resize; background: rgba(255,255,255,0.1);"></div>
        <div class="resize-handle resize-handle-e" style="position: absolute; top: 10px; right: 0; bottom: 10px; width: 5px; cursor: e-resize; background: rgba(255,255,255,0.1);"></div>
    `;

    // Position the overlay with responsive dimensions
    chatOverlay.style.position = 'fixed';
    const initialWidth = window.innerWidth < 800 ? 250 : 400;
    const initialHeight = window.innerWidth < 800 ? '50%' : '70%';
    chatOverlay.style.width = initialWidth + 'px';
    chatOverlay.style.height = initialHeight;
    chatOverlay.style.zIndex = '2147483647'; // Maximum z-index value
    chatOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    chatOverlay.style.borderRadius = '8px';
    chatOverlay.style.overflow = 'hidden';
    chatOverlay.style.fontFamily = 'Arial, sans-serif';
    chatOverlay.style.color = 'white';

    // Set initial position
    const initialLeft = (window.innerWidth - initialWidth - 10);
    chatOverlay.style.left = initialLeft + 'px';
    chatOverlay.style.top = '10%';
    console.log('Set initial position: left=' + initialLeft + ', top=10%');

    // Load and apply saved size
    const savedSize = loadSavedSize();
    applySavedSize(chatOverlay, savedSize);

    console.log('Applying styles to overlay, width:', chatOverlay.style.width, 'height:', chatOverlay.style.height);

    // Add smooth transitions
    chatOverlay.style.transition = 'left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease';

    return chatOverlay;
}