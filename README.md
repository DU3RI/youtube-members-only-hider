# YouTube Members Only Hider

A Firefox browser extension that automatically hides YouTube videos marked as "Members only" from your feed, search results, and channel pages.

## Screenshots

### Before (with Members-only videos visible)
![Before - Members-only videos visible](images/before.png)

### After (Members-only videos hidden)
![After - Members-only videos hidden](images/after.png)

## Features

- 🚫 Hides "Members only" videos from all YouTube pages
- 🔄 Works with YouTube's dynamic content loading
- 🌐 Supports multiple languages
- 🎯 Targets various YouTube layouts (home feed, channel videos, search results)
- 🛠️ Debug functions available in browser console



## Installation

### Manual Installation (Easy Method)

1. **Download the source code:**
   - Click the green "Code" button on this GitHub page
   - Select "Download ZIP"
   - Extract the ZIP file to a folder on your computer

2. **Install in Firefox:**
   - Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
   - Click "This Firefox" in the sidebar
   - Click "Load Temporary Add-on"
   - Navigate to the extracted folder and select the `manifest.json` file

### Manual Installation (Release Package)

1. Download the latest release `.xpi` file from the [Releases](../../releases) page
2. **Option A - Drag & Drop (Easiest):**
   - Drag the `.xpi` file onto your Firefox window
   - Click "Add" when prompted
   
3. **Option B - Through Firefox:**
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox" in the sidebar
   - Click "Load Temporary Add-on"
   - Select the downloaded `.xpi` file

**Note:** Method A installs permanently, Method B installs temporarily until Firefox restart.

### Development Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/DU3RI/youtube-members-only-hider.git
   cd youtube-members-only-hider
   ```

2. Install development dependencies:
   ```bash
   npm install
   ```

3. Load the extension in Firefox:
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox" in the sidebar  
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from this project

## Development

```bash
# Start development with auto-reload
npm run dev

# Lint the extension
npm run lint

# Build for distribution
npm run build

# Package for submission
npm run package
```

## How It Works

The extension uses a content script that:

1. **Detects Members-only videos** by looking for:
   - Text patterns like "Members only" in multiple languages
   - Membership badge icons and attributes
   - YouTube-specific membership indicators

2. **Hides videos** by setting `display: none` on matching video elements

3. **Handles dynamic content** using MutationObserver to catch videos loaded via AJAX

4. **Supports various layouts** including:
   - Home feed (`ytd-video-renderer`)
   - Channel videos tab (`ytd-grid-video-renderer`)
   - Search results
   - Sidebar recommendations (`ytd-compact-video-renderer`)
   - New grid layouts (`ytd-rich-grid-media`)

## Debug Functions

Open browser console on YouTube and use:

```javascript
// Manually process videos
youtubeMembersOnlyHider.processVideos();

// Check how many videos were hidden
youtubeMembersOnlyHider.getHiddenCount();

// Temporarily show all hidden videos (for debugging)
youtubeMembersOnlyHider.showHiddenVideos();
```

## File Structure

```
├── manifest.json          # Extension manifest
├── content-script.js      # Main functionality  
├── background.js          # Extension lifecycle
├── icons/                 # Extension icons
├── package.json          # Development dependencies
└── README.md             # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on different YouTube pages
5. Submit a pull request

## License

MIT License
