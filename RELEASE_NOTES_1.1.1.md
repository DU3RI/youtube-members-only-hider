# YouTube Members Only Hider v1.1.1

## New Features

### Control Popup
- Click the extension icon to open a control panel with settings and statistics
- Clean, modern interface with real-time updates
- Professional design with smooth animations

### Pause/Resume Functionality
- Temporarily pause the extension without uninstalling
- Paused state is saved across browser sessions
- Videos reappear when paused, automatically hidden when resumed
- Badge turns gray when paused for visual feedback

### Statistics Management
- Reset the hidden video counter from the popup
- Confirmation dialog prevents accidental resets
- Real-time statistics display showing total videos hidden
- Status indicator shows whether extension is Active or Paused

## Improvements

### User Interface
- Large, easy-to-read statistics counter
- Color-coded status indicator (Green = Active, Orange = Paused)
- Intuitive button controls with clear labels
- Responsive hover effects for better user experience

### Technical Changes
- Added `storage` permission for persistent state management
- Background script now manages global pause state across all tabs
- Content script respects pause state and processes videos accordingly
- Tab-specific tracking for accurate counting
- Message passing system between popup, background, and content scripts

## Installation

Download `youtube_members_only_hider-1.1.1.xpi` from the releases page and:
1. Open Firefox
2. Drag and drop the `.xpi` file into the browser window
3. Click "Add" when prompted

Or install directly from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/youtube-members-only-hider/)

## Usage

**To access controls:**
- Click the extension icon in your Firefox toolbar

**To pause/resume:**
- Open the popup and click "Pause Extension" or "Resume Extension"

**To reset statistics:**
- Open the popup and click "Reset Statistics"
- Confirm the action when prompted

## Bug Fixes
- Improved detection for videos with multiple badges
- Better handling of YouTube's new layout system
- More reliable badge counting across page navigation
