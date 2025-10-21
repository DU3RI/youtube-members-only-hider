/**
 * Background script for YouTube Members Only Hider
 * Handles extension lifecycle, badge updates, and basic functionality
 */

// Extension installation/update handler
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('YouTube Members Only Hider installed');
    } else if (details.reason === 'update') {
        console.log('YouTube Members Only Hider updated to version', browser.runtime.getManifest().version);
    }
});

// Listen for messages from content script to update badge
browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'updateBadge') {
        const count = message.count || 0;
        const tabId = sender.tab ? sender.tab.id : null;
        
        if (tabId) {
            if (count > 0) {
                // Show count on badge
                browser.browserAction.setBadgeText({
                    text: count.toString(),
                    tabId: tabId
                });
                browser.browserAction.setBadgeBackgroundColor({
                    color: '#FF0000',  // Red background
                    tabId: tabId
                });
                browser.browserAction.setTitle({
                    title: `YouTube Members Only Hider - ${count} video${count === 1 ? '' : 's'} hidden`,
                    tabId: tabId
                });
            } else {
                // Clear badge when count is 0
                browser.browserAction.setBadgeText({
                    text: '',
                    tabId: tabId
                });
                browser.browserAction.setTitle({
                    title: 'YouTube Members Only Hider',
                    tabId: tabId
                });
            }
        }
    }
});

// Optional: Add browser action click handler if you want to add an options page later
browser.browserAction.onClicked.addListener((tab) => {
    // Could open options page or show statistics
    console.log('Extension icon clicked on tab:', tab.url);
});