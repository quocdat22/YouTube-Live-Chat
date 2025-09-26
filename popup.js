// YouTube Live Chat Fullscreen Extension - Popup Script

document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('close-btn');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesList = document.getElementById('messages-list');
    
    // Close button functionality
    closeBtn.addEventListener('click', function() {
        window.close();
    });
    
    // Send button functionality
    sendBtn.addEventListener('click', sendMessage);
    
    // Allow sending message with Enter key
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Function to send a message
    function sendMessage() {
        const message = messageInput.value.trim();
        const validation = validateMessage(message);
        
        if (!validation.valid) {
            showErrorMessage(validation.error);
            return;
        }
        
        if (message) {
            // In a real implementation, this would send the message to YouTube
            // For now, we'll just display it as if it was sent
            displayMessage('You', message);
            messageInput.value = '';
            
            // Here we would integrate with YouTube's API to actually send the message
            // This requires proper authentication and is complex to implement
        }
    }
    
    // Function to sanitize text to prevent XSS
    function sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Function to validate message content
    function validateMessage(text) {
        // Check if the message is empty
        if (!text || text.trim().length === 0) {
            return { valid: false, error: 'Message cannot be empty' };
        }
        
        // Check message length
        if (text.length > 200) {
            return { valid: false, error: 'Message is too long (max 200 characters)' };
        }
        
        // Check for any potentially problematic content
        if (/<script/i.test(text)) {
            return { valid: false, error: 'Message contains invalid content' };
        }
        
        return { valid: true, error: null };
    }
    
    // Message history management to prevent DOM from growing too large
    const MAX_MESSAGES = 100;
    
    // Throttle function to limit how often auto-scroll occurs
    let isScrolling = false;
    function throttleScroll() {
        if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(() => {
                messagesList.scrollTop = messagesList.scrollHeight;
                isScrolling = false;
            });
        }
    }
    
    // Function to display a message in the chat
    function displayMessage(author, text) {
        // Sanitize inputs to prevent XSS
        const safeAuthor = sanitizeText(author);
        const safeText = sanitizeText(text);
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        const now = new Date();
        const timestamp = now.getHours().toString().padStart(2, '0') + ':' + 
                         now.getMinutes().toString().padStart(2, '0');
        
        messageElement.innerHTML = `
            <span class="author">${safeAuthor}</span>
            <span class="text">${safeText}</span>
            <span class="timestamp">${timestamp}</span>
        `;
        
        messagesList.appendChild(messageElement);
        
        // Limit the number of displayed messages for better performance
        if (messagesList.children.length > MAX_MESSAGES) {
            messagesList.removeChild(messagesList.firstChild);
        }
        
        // Limit auto-scroll frequency for better performance
        throttleScroll();
    }
    
    // Function to show an error message in the chat
    function showErrorMessage(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'message';
        errorElement.style.color = '#ff6b6b';
        errorElement.style.fontStyle = 'italic';
        
        const now = new Date();
        const timestamp = now.getHours().toString().padStart(2, '0') + ':' + 
                         now.getMinutes().toString().padStart(2, '0');
        
        errorElement.innerHTML = `
            <span class="text">${sanitizeText(message)}</span>
            <span class="timestamp">${timestamp}</span>
        `;
        
        messagesList.appendChild(errorElement);
        
        // Auto-scroll to the bottom
        messagesList.scrollTop = messagesList.scrollHeight;
    }
    
    // Function to simulate receiving messages (for demo purposes)
    function simulateReceiveMessage(author, text) {
        displayMessage(author, text);
    }
    
    // Check network status
    function checkNetworkStatus() {
        return new Promise((resolve) => {
            // Create a simple request to check connectivity
            fetch('https://www.youtube.com/generate_204', { method: 'HEAD' })
                .then(() => resolve(true))
                .catch(() => resolve(false));
        });
    }

    // Sample messages to demonstrate the UI
    checkNetworkStatus().then(isOnline => {
        if (isOnline) {
            simulateReceiveMessage('Viewer1', 'Great stream!');
            simulateReceiveMessage('Viewer2', 'Thanks for the content!');
            simulateReceiveMessage('Moderator', 'Please keep it respectful everyone.');
        } else {
            showErrorMessage('Network connection issue. Some chat features may not work properly.');
        }
    });
    
    // In a real implementation, we would connect to YouTube's live chat API
    // to receive real-time messages from the live stream
});