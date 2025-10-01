import { getYouTubeVideoId } from 'utils/youtubeUtils.js';

let observer = null;

function handleUrlChange(isFullscreen, chatOverlay, hideChatOverlay, updateChatSource) {
  const videoId = getYouTubeVideoId(window.location.href);
  if (isFullscreen && !videoId) {
    // If we're fullscreen but not on a YouTube video page, hide the chat
    console.log(
      'Navigated away from YouTube video page in fullscreen, hiding chat. Video ID:',
      videoId
    );
    if (chatOverlay) {
      hideChatOverlay();
    } else {
      hideChatOverlay(); // fallback to ID-based removal
    }
  }
}

export function startObserving(isFullscreen, chatOverlay, hideChatOverlay, updateChatSource) {
  observer = new MutationObserver(() => {
    handleUrlChange(isFullscreen, chatOverlay, hideChatOverlay, updateChatSource);
  });

  observer.observe(document, { childList: true, subtree: true });
}

export function stopObserving() {
  if (observer) {
    observer.disconnect();
  }
}
