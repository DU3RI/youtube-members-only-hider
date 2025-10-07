/**
 * Background script for YouTube Members Only Hider
 * Handles extension lifecycle and basic functionality
 */

// Extension installation/update handler
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('YouTube Members Only Hider installed');
    } else if (details.reason === 'update') {
        console.log('YouTube Members Only Hider updated to version', browser.runtime.getManifest().version);
    }
});

// Optional: Add browser action click handler if you want to add an options page later
browser.browserAction.onClicked.addListener((tab) => {
    // Could open options page or show statistics
    console.log('Extension icon clicked on tab:', tab.url);
});