// YouTube Live Chat Fullscreen Extension - Content Script

(function() {
    'use strict';

    let isFullscreen = false;
    let chatOverlay = null;

    // Function to check if we're in fullscreen mode
    function checkFullscreen() {
        const fullscreenElement = document.fullscreenElement || 
                                 document.webkitFullscreenElement || 
                                 document.mozFullScreenElement ||
                                 document.msFullscreenElement;
        
        return !!fullscreenElement;
    }

    // Debounce function to prevent rapid toggling issues
    let fullscreenToggleTimeout = null;
    
    // Function to handle fullscreen change events
    function handleFullscreenChange() {
        // Clear any existing timeout
        if (fullscreenToggleTimeout) {
            clearTimeout(fullscreenToggleTimeout);
        }
        
        // Use a small delay to handle rapid toggling
        fullscreenToggleTimeout = setTimeout(() => {
            const newIsFullscreen = checkFullscreen();
            
            // Only update if the state actually changed
            if (isFullscreen !== newIsFullscreen) {
                isFullscreen = newIsFullscreen;
                
                if (isFullscreen) {
                    // Check if we're on a YouTube video page
                    if (window.location.href.includes('youtube.com/watch')) {
                        showChatOverlay();
                    }
                } else {
                    hideChatOverlay();
                }
            }
        }, 100); // Small delay to prevent rapid toggling
    }

    // Function to create and show the chat overlay
    function showChatOverlay() {
        if (chatOverlay) {
            chatOverlay.style.display = 'block';
            return;
        }

        // Create the chat overlay element
        chatOverlay = document.createElement('div');
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
        
        // Adjust size when window resizes
        window.addEventListener('resize', function() {
            if (chatOverlay && isFullscreen) {
                chatOverlay.style.width = window.innerWidth < 800 ? '250px' : '400px';
                chatOverlay.style.height = window.innerWidth < 800 ? '50%' : '70%';
            }
        });
        
        // Add the overlay to the page
        document.body.appendChild(chatOverlay);
        
        // Add close button functionality
        const closeChatBtn = document.getElementById('close-chat-btn');
        closeChatBtn.addEventListener('click', () => {
            hideChatOverlay();
        });
    }

    // Function to hide the chat overlay
    function hideChatOverlay() {
        if (chatOverlay) {
            // Instead of just hiding, properly remove the element to free resources
            chatOverlay.remove();
            chatOverlay = null;
        }
    }

    // Function to update the chat iframe source when on a YouTube video page
    function updateChatSource() {
        if (!chatOverlay || !isFullscreen) return;
        
        const videoId = getYouTubeVideoId(window.location.href);
        if (videoId) {
            // Check if the video is actually a live stream
            checkIfLiveStream(videoId).then(isLive => {
                if (isLive) {
                    // Before loading the chat, check if the user is logged in
                    checkIfUserLoggedIn().then(isLoggedIn => {
                        if (isLoggedIn) {
                            const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;
                            const iframe = chatOverlay.querySelector('#yt-chat-iframe');
                            iframe.src = chatUrl;
                        } else {
                            // Show a message about needing to be logged in
                            const iframe = chatOverlay.querySelector('#yt-chat-iframe');
                            iframe.src = 'about:blank';
                            iframe.parentElement.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; text-align:center; padding:20px;">Please log in to YouTube to participate in the chat</div>';
                        }
                    }).catch(() => {
                        // If we can't determine login status, just load the chat
                        const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;
                        const iframe = chatOverlay.querySelector('#yt-chat-iframe');
                        iframe.src = chatUrl;
                    });
                } else {
                    // For non-live streams, show a message or hide the chat
                    const iframe = chatOverlay.querySelector('#yt-chat-iframe');
                    iframe.src = 'about:blank';
                    // Or display a message that chat is not available for this video
                    iframe.parentElement.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; text-align:center; padding:20px;">Chat is not available for non-live videos</div>';
                }
            }).catch(() => {
                // If there's an error checking if it's a live stream, try loading the chat anyway
                const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;
                const iframe = chatOverlay.querySelector('#yt-chat-iframe');
                iframe.src = chatUrl;
            });
        }
    }

    // Function to check if the user is logged into YouTube
    function checkIfUserLoggedIn() {
        // This is a simplified check - in reality, we'd need to check for YouTube auth tokens
        // For now, we'll check for the presence of a YouTube account element in the header
        return new Promise((resolve) => {
            // Check if the user's account icon or name is visible in the header
            const accountButton = document.querySelector('#avatar-btn') || 
                                  document.querySelector('ytd-topbar-menu-button-renderer');
            resolve(!!accountButton);
        });
    }

    // Function to check if the video is a live stream
    function checkIfLiveStream(videoId) {
        // In a real implementation, we would check if this is a live stream
        // by making a request to YouTube's API or examining the video page
        // For this extension, we'll assume if it has a video ID on a YouTube page,
        // it could be a live stream and allow the chat overlay
        return new Promise((resolve) => {
            // A more sophisticated implementation might:
            // 1. Check the YouTube page HTML for live stream indicators
            // 2. Make a request to YouTube's API to check video status
            // 3. Look for "live" or "streaming" indicators on the page
            resolve(true);
        });
    }

    // Extract YouTube video ID from URL
    function getYouTubeVideoId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[7].length === 11) ? match[7] : null;
        
        // Validate video ID format (should be 11 alphanumeric characters)
        if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            return videoId;
        }
        
        return null;
    }

    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Initialize - check current fullscreen state on load
    window.addEventListener('load', function() {
        setTimeout(() => {
            isFullscreen = checkFullscreen();
            if (isFullscreen && window.location.href.includes('youtube.com/watch')) {
                showChatOverlay();
                updateChatSource();
            }
        }, 1000); // Slight delay to ensure page is loaded
    });

    // Observe for URL changes in single-page applications
    const observer = new MutationObserver(function(mutations) {
        if (isFullscreen && window.location.href.includes('youtube.com/watch')) {
            updateChatSource();
        } else if (isFullscreen && !window.location.href.includes('youtube.com/watch')) {
            // If we're fullscreen but not on a YouTube watch page, hide the chat
            hideChatOverlay();
        }
    });

    observer.observe(document, { childList: true, subtree: true });
    
    // Watch for URL changes (for single-page applications)
    let currentHref = location.href;
    new MutationObserver(function() {
        if (currentHref !== location.href) {
            currentHref = location.href;
            
            // If we're on a YouTube watch page and in fullscreen, make sure chat is updated
            if (isFullscreen && location.href.includes('youtube.com/watch')) {
                updateChatSource();
            } else if (isFullscreen && !location.href.includes('youtube.com/watch')) {
                // If we've navigated away from YouTube while in fullscreen, hide chat
                hideChatOverlay();
            }
        }
    }).observe(document.querySelector('base') || document.body, {
        attributes: true,
        childList: true,
        subtree: true
    });
    
    // Cleanup when the page is unloaded
    window.addEventListener('beforeunload', function() {
        if (chatOverlay) {
            chatOverlay.remove();
            chatOverlay = null;
        }
        if (fullscreenToggleTimeout) {
            clearTimeout(fullscreenToggleTimeout);
        }
        observer.disconnect();
    });
})();