/**
 * Overlay Chat Module
 * Handles updating the chat iframe source based on the current YouTube video.
 */

import { getYouTubeVideoId, checkIfUserLoggedIn, checkIfLiveStream } from './youtubeUtils.js';

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