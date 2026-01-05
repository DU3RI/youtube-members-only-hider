# YouTube Members Only Hider v1.2

## New Features

### Enhanced Members-Only Detection
- Extended support for German phrases: "Nur für Mitglieder", "Videos nur für Mitglieder", "Nur für Kanalmitglieder"
- Added English shelf detection: "Members-only videos", "Videos for members", "Channel members only"
- Improved badge text matching for hyphenated and channel-specific labels
- Whole-section hiding for dedicated members-only shelves on channel overview pages

### Advanced Statistics Tracking
- Split statistics into **Lifetime** (persists across browser restarts) and **Session** (resets on restart)
- Separate reset buttons for each statistic type
- More granular tracking of hidden videos across tabs and sessions
- Backward-compatible with existing installations

## Improvements

### User Interface
- Redesigned popup with separate cards for Lifetime and Session statistics
- Individual reset buttons for each statistic type with confirmation dialogs
- Cleaner layout with grid-based stats display
- Maintained pause/resume functionality with updated styling

### Technical Changes
- Background script now tracks lifetime and session counts separately
- Content script sends increment deltas for accurate aggregation
- Storage migration handles legacy total counts seamlessly
- Enhanced section detection using multiple selectors for better coverage

## Installation

Download `youtube_members_only_hider-1.2.xpi` from the releases page and:
1. Open Firefox
2. Drag and drop the `.xpi` file into the browser window
3. Click "Add" when prompted

Or install directly from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/youtube-members-only-hider/)

## Usage

**To access controls:**
- Click the extension icon in your Firefox toolbar

**Statistics:**
- **Lifetime:** Total videos hidden since installation (persists across restarts)
- **Session:** Videos hidden in current browser session (resets on restart)
- Use individual reset buttons to clear each counter as needed

**Pause/Resume:**
- Temporarily disable the extension while keeping it installed
- Badge color changes to indicate paused state

## Changelog from v1.1.1
- Added multilingual shelf hiding for German and English
- Implemented dual statistics tracking (lifetime/session)
- Updated popup UI with separate stats cards and reset controls
- Enhanced detection patterns for better coverage of members-only content