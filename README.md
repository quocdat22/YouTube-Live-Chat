# YouTube Live Chat Fullscreen Extension

A Chrome extension that allows users to view and interact with YouTube Live Chat while watching videos in fullscreen mode.

## Features

- Displays YouTube Live Chat as an overlay when in fullscreen mode
- Maintains chat functionality without exiting fullscreen
- Responsive design that works on various screen sizes
- Proper cleanup and resource management
- Security measures to prevent XSS and other vulnerabilities
- Performance optimizations for smooth user experience

## Installation

1. Clone or download this repository.
2. Install dependencies by running `npm install` in the root directory.
3. Build the extension by running `npm run build`.
4. Open Chrome and navigate to `chrome://extensions`.
5. Enable "Developer mode" in the top right corner.
6. Click "Load unpacked" and select the `dist` directory.
7. The extension will be installed and ready to use.

## Usage

1. Navigate to a YouTube video page
2. Click the fullscreen button on the video player
3. The chat overlay will automatically appear in the top-right corner
4. Interact with the chat as you would normally
5. Exit fullscreen to dismiss the chat overlay

## Technical Details

### Files Structure

- `manifest.json`: Extension configuration and permissions
- `content.js`: Main logic for fullscreen detection and chat overlay management
- `popup.html`: HTML structure for the chat overlay UI
- `popup.css`: Styling for the chat overlay
- `popup.js`: Client-side JavaScript for chat UI interactions
- `icons/`: Extension icon files

### How It Works

The extension uses a content script that monitors the browser for fullscreen events. When a fullscreen YouTube video is detected, it injects a chat overlay into the page. The overlay contains an iframe that loads the YouTube Live Chat for the current video.

## Limitations

- Requires user to be logged in to YouTube to participate in chat
- Chat overlay position is fixed to top-right corner
- Some YouTube page layout changes may affect functionality
- Message sending directly through the extension has limitations due to YouTube's security policies

## Security

- All user inputs are sanitized to prevent XSS attacks
- Iframe is properly sandboxed with limited permissions
- Video ID validation to prevent injection attacks
- Content Security Policy compliance

## Compatibility

- Chrome 88 or higher
- Works with modern YouTube layout
- Responsive design for various screen resolutions

## Development

This project uses `webpack` to bundle the source files.

1.  Install dependencies:
    ```
    npm install
    ```
2.  Build the extension:
    ```
    npm run build
    ```
    This will create a `dist` directory with the bundled extension.

To modify the extension:

1.  Make changes to the source files in the `src` directory.
2.  Run `npm run build` to rebuild the extension.
3.  Reload the extension in `chrome://extensions` by clicking the refresh icon.

## License

This project is available for personal and educational use.
