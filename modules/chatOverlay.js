/**
 * Chat Overlay Module
 * Handles the creation, display, and management of the YouTube live chat overlay.
 */

import { getYouTubeVideoId, checkIfUserLoggedIn, checkIfLiveStream } from './youtubeUtils.js';

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

    console.log('Creating new chat overlay element');
    // Create the chat overlay element
    const chatOverlay = document.createElement('div');
    chatOverlay.id = 'yt-fullscreen-chat-overlay';
    chatOverlay.innerHTML = `
        <div id="chat-header">
            <span>YouTube Live Chat</span>
            <button id="close-chat-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
        </div>
        <iframe
            id="yt-chat-iframe"
            src=""
            style="width: 100%; height: calc(100% - 40px); border: none;"
            allow="autoplay; encrypted-media"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox allow-same-origin allow-orientation-lock allow-pointer-lock">
        </iframe>
    `;

    // Position the overlay with responsive dimensions
    chatOverlay.style.position = 'fixed';
    chatOverlay.style.top = '10%';
    chatOverlay.style.right = '10px';
    chatOverlay.style.width = window.innerWidth < 800 ? '250px' : '400px';
    chatOverlay.style.height = window.innerWidth < 800 ? '50%' : '70%';
    chatOverlay.style.zIndex = '2147483647'; // Maximum z-index value
    chatOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    chatOverlay.style.borderRadius = '8px';
    chatOverlay.style.overflow = 'hidden';
    chatOverlay.style.fontFamily = 'Arial, sans-serif';
    chatOverlay.style.color = 'white';

    console.log('Applying styles to overlay, width:', chatOverlay.style.width, 'height:', chatOverlay.style.height);

    // Add the overlay to the page
    document.body.appendChild(chatOverlay);
    console.log('Added chat overlay to document body');

    // Add close button functionality
    const closeChatBtn = document.getElementById('close-chat-btn');
    if (closeChatBtn) {
        console.log('Adding close button event listener');
        closeChatBtn.addEventListener('click', () => {
            console.log('Close button clicked');
            hideChatOverlay();
        });
    } else {
        console.error('Close button not found in overlay');
    }

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
    console.log('updateChatSource function called with overlay:', chatOverlay);
    if (!chatOverlay) {
        console.log('No chat overlay provided to update source');
        return;
    }

    const videoId = getYouTubeVideoId(window.location.href);
    console.log('Extracted video ID:', videoId);

    if (videoId) {
        try {
            const isLive = await checkIfLiveStream(videoId);
            console.log('Is live stream check result:', isLive);
            if (isLive) {
                try {
                    const isLoggedIn = await checkIfUserLoggedIn();
                    console.log('Is user logged in check result:', isLoggedIn);
                    if (isLoggedIn) {
                        const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;
                        console.log('Chat URL to load:', chatUrl);
                        const iframe = chatOverlay.querySelector('#yt-chat-iframe');
                        console.log('Found iframe:', iframe);
                        if (iframe && iframe.src !== chatUrl) {
                            iframe.src = chatUrl;
                            console.log('Set iframe source to:', chatUrl);
                        } else if (iframe) {
                            console.log('Iframe source already set to:', iframe.src);
                        }
                    } else {
                        // Show a message about needing to be logged in
                        console.log('User is not logged in, showing login message');
                        const iframe = chatOverlay.querySelector('#yt-chat-iframe');
                        if (iframe) {
                            iframe.src = 'about:blank';
                            iframe.parentElement.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; text-align:center; padding:20px;">Please log in to YouTube to participate in the chat</div>';
                        }
                    }
                } catch (error) {
                    console.error('Error checking login status:', error);
                    // If we can't determine login status, just load the chat
                    const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;
                    const iframe = chatOverlay.querySelector('#yt-chat-iframe');
                    if (iframe && iframe.src !== chatUrl) {
                        iframe.src = chatUrl;
                        console.log('Set iframe source after login check error:', chatUrl);
                    }
                }
            } else {
                // For non-live streams, show a message or hide the chat
                console.log('Video is not a live stream, showing message');
                const iframe = chatOverlay.querySelector('#yt-chat-iframe');
                if (iframe) {
                    iframe.src = 'about:blank';
                    // Or display a message that chat is not available for this video
                    iframe.parentElement.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; text-align:center; padding:20px;">Chat is not available for non-live videos</div>';
                }
            }
        } catch (error) {
            console.error('Error checking if live stream:', error);
            // If there's an error checking if it's a live stream, try loading the chat anyway
            const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;
            const iframe = chatOverlay.querySelector('#yt-chat-iframe');
            if (iframe && iframe.src !== chatUrl) {
                iframe.src = chatUrl;
                console.log('Set iframe source after livestream check error:', chatUrl);
            }
        }
    } else {
        console.log('No video ID found in URL, cannot update chat source');
    }
}