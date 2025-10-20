/**
 * Overlay Creation Module
 * Handles the creation of the chat overlay HTML structure and initial styling.
 */

/**
 * Creates the chat overlay element with initial structure and styles.
 * @returns {HTMLElement} The created chat overlay element.
 */
export function createOverlayElement() {
  // Create the chat overlay element
  const chatOverlay = document.createElement('div');
  chatOverlay.id = 'yt-fullscreen-chat-overlay';
  chatOverlay.setAttribute('role', 'dialog');
  chatOverlay.setAttribute('aria-labelledby', 'chat-title');

  // Create chat header
  const chatHeader = document.createElement('div');
  chatHeader.id = 'chat-header';
  chatHeader.setAttribute('role', 'banner');
  chatHeader.setAttribute('aria-label', 'YouTube Live Chat Controls');
  chatHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px; height: 40px; box-sizing: border-box; cursor: move;';

  // Create title span
  const chatTitle = document.createElement('span');
  chatTitle.id = 'chat-title';
  chatTitle.setAttribute('aria-label', 'YouTube Live Chat');
  chatTitle.textContent = 'YouTube Live Chat';

  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'display: flex; gap: 5px;';

  // Create settings button
  const settingsBtn = document.createElement('button');
  settingsBtn.id = 'settings-btn';
  settingsBtn.setAttribute('aria-label', 'Settings');
  settingsBtn.style.cssText = 'background: none; border: none; cursor: pointer;';

  // Create settings icon
  const settingsIcon = document.createElement('img');
  settingsIcon.id = 'settings-icon';
  settingsIcon.style.cssText = 'width: 16px; height: 16px;';
  settingsIcon.src = chrome.runtime.getURL('icons/setting.png');
  settingsBtn.appendChild(settingsIcon);

  // Create minimize button
  const minimizeChatBtn = document.createElement('button');
  minimizeChatBtn.id = 'minimize-chat-btn';
  minimizeChatBtn.setAttribute('aria-label', 'Minimize chat');
  minimizeChatBtn.style.cssText = 'background: none; border: none; color: white; cursor: pointer; font-size: 16px;';
  minimizeChatBtn.textContent = '−';

  // Create close button
  const closeChatBtn = document.createElement('button');
  closeChatBtn.id = 'close-chat-btn';
  closeChatBtn.setAttribute('aria-label', 'Close chat');
  closeChatBtn.style.cssText = 'background: none; border: none; color: white; cursor: pointer; font-size: 18px;';
  closeChatBtn.textContent = '×';

  // Add buttons to container
  buttonContainer.appendChild(settingsBtn);
  buttonContainer.appendChild(minimizeChatBtn);
  buttonContainer.appendChild(closeChatBtn);

  // Add elements to header
  chatHeader.appendChild(chatTitle);
  chatHeader.appendChild(buttonContainer);

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'yt-chat-iframe';
  iframe.src = '';
  iframe.style.cssText = 'width: 100%; height: calc(100% - 40px); border: none;';
  iframe.setAttribute('allow', 'autoplay; encrypted-media');
  iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation');

  // Create resize handles
  const resizeHandles = [];
  
  // Corner handles
  const nwHandle = document.createElement('div');
  nwHandle.className = 'resize-handle resize-handle-nw';
  nwHandle.style.cssText = 'position: absolute; top: 0; left: 0; width: 10px; height: 10px; cursor: nw-resize; background: none;';
  resizeHandles.push(nwHandle);
  
  const neHandle = document.createElement('div');
  neHandle.className = 'resize-handle resize-handle-ne';
  neHandle.style.cssText = 'position: absolute; top: 0; right: 0; width: 10px; height: 10px; cursor: ne-resize; background: none;';
  resizeHandles.push(neHandle);
  
  const swHandle = document.createElement('div');
  swHandle.className = 'resize-handle resize-handle-sw';
  swHandle.style.cssText = 'position: absolute; bottom: 0; left: 0; width: 10px; height: 10px; cursor: sw-resize; background: none;';
  resizeHandles.push(swHandle);
  
  const seHandle = document.createElement('div');
  seHandle.className = 'resize-handle resize-handle-se';
  seHandle.style.cssText = 'position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; cursor: se-resize; background: none;';
  resizeHandles.push(seHandle);
  
  // Edge handles
  const nHandle = document.createElement('div');
  nHandle.className = 'resize-handle resize-handle-n';
  nHandle.style.cssText = 'position: absolute; top: 0; left: 10px; right: 10px; height: 5px; cursor: n-resize; background: none;';
  resizeHandles.push(nHandle);
  
  const sHandle = document.createElement('div');
  sHandle.className = 'resize-handle resize-handle-s';
  sHandle.style.cssText = 'position: absolute; bottom: 0; left: 10px; right: 10px; height: 5px; cursor: s-resize; background: none;';
  resizeHandles.push(sHandle);
  
  const wHandle = document.createElement('div');
  wHandle.className = 'resize-handle resize-handle-w';
  wHandle.style.cssText = 'position: absolute; top: 10px; left: 0; bottom: 10px; width: 5px; cursor: w-resize; background: none;';
  resizeHandles.push(wHandle);
  
  const eHandle = document.createElement('div');
  eHandle.className = 'resize-handle resize-handle-e';
  eHandle.style.cssText = 'position: absolute; top: 10px; right: 0; bottom: 10px; width: 5px; cursor: e-resize; background: none;';
  resizeHandles.push(eHandle);

  // Create settings modal
  const settingsModal = document.createElement('div');
  settingsModal.id = 'settings-modal';
  settingsModal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2147483648; font-family: Arial, sans-serif;';

  // Create settings modal content
  const settingsModalContent = document.createElement('div');
  settingsModalContent.id = 'settings-modal-content';
  settingsModalContent.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); min-width: 250px;';

  // Create settings title
  const settingsTitle = document.createElement('h3');
  settingsTitle.style.cssText = 'margin: 0 0 15px 0; font-size: 18px;';
  settingsTitle.textContent = 'Settings';
  settingsModalContent.appendChild(settingsTitle);

  // Create settings options
  const settingsOptions = [
    { id: 'show-history-checkbox', label: 'Show History', checked: true },
    { id: 'show-chat-header-checkbox', label: 'Show Chat Header', checked: true },
    { id: 'show-chat-banner-checkbox', label: 'Show Chat Banner', checked: true },
    { id: 'hide-super-chat-buttons-checkbox', label: 'Hide Super Chat Buttons', checked: false },
    { id: 'show-chat-ticker-checkbox', label: 'Show Chat Ticker', checked: true }
  ];

  settingsOptions.forEach(option => {
    const optionDiv = document.createElement('div');
    optionDiv.style.cssText = 'margin-bottom: 15px;';
    
    const label = document.createElement('label');
    label.style.cssText = 'display: flex; align-items: center; gap: 10px; cursor: pointer;';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = option.id;
    checkbox.checked = option.checked;
    checkbox.style.cssText = 'cursor: pointer;';
    
    const span = document.createElement('span');
    span.textContent = option.label;
    
    label.appendChild(checkbox);
    label.appendChild(span);
    optionDiv.appendChild(label);
    settingsModalContent.appendChild(optionDiv);
  });

  // Create close modal button
  const closeSettingsModalBtn = document.createElement('button');
  closeSettingsModalBtn.id = 'close-settings-modal';
  closeSettingsModalBtn.style.cssText = 'background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer;';
  closeSettingsModalBtn.textContent = 'Close';
  settingsModalContent.appendChild(closeSettingsModalBtn);

  // Add all elements to settings modal
  settingsModal.appendChild(settingsModalContent);

  // Create loading spinner
  const loadingSpinner = document.createElement('div');
  loadingSpinner.id = 'loading-spinner';
  loadingSpinner.style.cssText = `
    position: absolute;
    top: 40px;
    left: 0;
    width: 100%;
    height: calc(100% - 40px);
    display: none;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10;
  `;

  const spinnerInner = document.createElement('div');
  spinnerInner.style.cssText = `
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  loadingSpinner.appendChild(spinnerInner);

  // Add keyframe animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Add all elements to chat overlay
  chatOverlay.appendChild(chatHeader);
  chatOverlay.appendChild(iframe);
  chatOverlay.appendChild(loadingSpinner);
  resizeHandles.forEach(handle => chatOverlay.appendChild(handle));
  chatOverlay.appendChild(settingsModal);

  // // Position the overlay with responsive dimensions - NO initial position setting here
  chatOverlay.style.position = 'fixed';
  const initialWidth = window.innerWidth < 800 ? 250 : 400;
  const initialHeight = window.innerWidth < 800 ? '150px' : '200px';
  chatOverlay.style.width = initialWidth + 'px';
  chatOverlay.style.height = initialHeight;
  chatOverlay.style.zIndex = '2147483647'; // Maximum z-index value
  chatOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  chatOverlay.style.borderRadius = '8px';
  chatOverlay.style.overflow = 'hidden';
  chatOverlay.style.fontFamily = 'Arial, sans-serif';
  chatOverlay.style.color = 'white';

  // Set default position only - will be overridden by chatOverlay.js
  const initialLeft = window.innerWidth - initialWidth - 10;
  chatOverlay.style.left = initialLeft + 'px';
  chatOverlay.style.top = '10%';

  // IMPORTANT: No transitions applied here - will be added after positioning is complete

  return chatOverlay;
}
