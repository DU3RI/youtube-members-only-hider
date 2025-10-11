# YouTube Members Only Hider

<img src="icons/android-chrome-192x192.png" alt="YouTube Members Only Hider Icon" width="64" height="64" align="left" style="margin-right: 10px;">

A Firefox browser extension that automatically hides YouTube videos marked as "Members only" from your feed, search results, and channel pages. <br><br><br> [**Development Roadmap**](https://github.com/users/DU3RI/projects/1)
<br clear="left"/>


---

- [Screenshots](#screenshots)
- [Features](#features)
- [Installation](#installation)
   - [Official Store (Coming Soon)](#official-store-coming-soon)
   - [Manual Installation (Easy Method)](#manual-installation-easy-method)
   - [Manual Installation (Release Package)](#manual-installation-release-package)
   - [Development Setup](#development-setup)
- [Development](#development)
- [How It Works](#how-it-works)
- [Debug Functions](#debug-functions)
- [License](#license)

---

## Screenshots

<table>
<tr>
<td width="50%">
<h3>Before (with Members-only videos visible)</h3>
<img src="images/before.png" alt="Before - Members-only videos visible" width="100%">
</td>
<td width="50%">
<h3>After (Members-only videos hidden)</h3>
<img src="images/after.png" alt="After - Members-only videos hidden" width="100%">
</td>
</tr>
</table>

## Features

- 🚫 Hides "Members only" videos from all YouTube pages
- 🔄 Works with YouTube's dynamic content loading
- 🌐 Supports multiple languages
- 🎯 Targets various YouTube layouts (home feed, channel videos, search results)
- 🛠️ Debug functions available in browser console


## Installation

### 🏪 Official Firefox Add-ons Store (Recommended)

**✨ One-click permanent installation:**

[![Get the add-on](https://addons.cdn.mozilla.net/static/img/addons-buttons/AMO-button_1.png)](https://addons.mozilla.org/en-US/firefox/addon/youtube-members-only-hider/)

Or visit: [https://addons.mozilla.org/en-US/firefox/addon/youtube-members-only-hider/](https://addons.mozilla.org/en-US/firefox/addon/youtube-members-only-hider/)

### Manual Installation (Easy Method)

1. **Download the source code:**
   - Click the green "Code" button on this GitHub page
   - Select "Download ZIP"
   - Extract the ZIP file to a folder on your computer

2. **Install in Firefox:**
   - Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Navigate to the extracted folder and select the `manifest.json` file

You will need to repeat this process each time you restart Firefox, as temporary add-ons are not permanent.

### Manual Installation (Release Package)

**Important: Unsigned extensions cannot be permanently installed in regular Firefox. Use one of these methods:**

**Option A - Temporary Installation (Recommended):**
1. Download the latest release `...xpi` zip file from the [Releases](../../releases) page
2. Extract the zip file
3. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select the downloaded `.xpi` file
6. Extension works until Firefox restart

**Option B - Firefox Developer/Nightly (Permanent):**
1. Install [Firefox Developer Edition](https://www.mozilla.org/firefox/developer/) or [Firefox Nightly](https://nightly.mozilla.org/)
2. Set `xpinstall.signatures.required` to `false` in `about:config`
3. Drag the `.xpi` file to Firefox window
4. Click "Add" when prompted - Extension installs permanently



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

## License

MIT License
