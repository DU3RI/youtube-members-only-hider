/**
 * Background script for YouTube Members Only Hider
 * Handles extension lifecycle, badge updates, pause/resume, and statistics
 */

// Global state
let isPaused = false;
let totalHiddenCount = 0;
let tabCounts = {}; // Track count per tab

// Extension installation/update handler
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('YouTube Members Only Hider installed');
        // Initialize storage
        browser.storage.local.set({ isPaused: false, totalHiddenCount: 0 });
    } else if (details.reason === 'update') {
        console.log('YouTube Members Only Hider updated to version', browser.runtime.getManifest().version);
    }
    
    // Load saved state
    loadState();
});

// Load state from storage
async function loadState() {
    try {
        const result = await browser.storage.local.get(['isPaused', 'totalHiddenCount']);
        isPaused = result.isPaused || false;
        totalHiddenCount = result.totalHiddenCount || 0;
    } catch (err) {
        console.error('Failed to load state:', err);
    }
}

// Save state to storage
async function saveState() {
    try {
        await browser.storage.local.set({ 
            isPaused: isPaused, 
            totalHiddenCount: totalHiddenCount 
        });
    } catch (err) {
        console.error('Failed to save state:', err);
    }
}

// Initialize on startup
loadState();

// Listen for messages from content script and popup
browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'updateBadge') {
        const count = message.count || 0;
        const tabId = sender.tab ? sender.tab.id : null;
        
        if (tabId) {
            // Update tab-specific count
            tabCounts[tabId] = count;
            
            // Update total count
            totalHiddenCount = count;
            saveState();
            
            // Always show count on badge (even when 0)
            browser.browserAction.setBadgeText({
                text: count.toString(),
                tabId: tabId
            });
            
            // Color: Red when active, Gray when paused or 0
            let badgeColor = '#808080';
            if (!isPaused && count > 0) {
                badgeColor = '#FF0000';
            }
            browser.browserAction.setBadgeBackgroundColor({
                color: badgeColor,
                tabId: tabId
            });
            
            // Update tooltip
            const videoText = count === 1 ? 'video' : 'videos';
            const statusText = isPaused ? ' (Paused)' : '';
            browser.browserAction.setTitle({
                title: `YouTube Members Only Hider - ${count} ${videoText} hidden${statusText}`,
                tabId: tabId
            });
        }
    } else if (message.type === 'getState') {
        // Popup requesting current state
        return Promise.resolve({
            isPaused: isPaused,
            totalCount: totalHiddenCount
        });
    } else if (message.type === 'togglePause') {
        // Toggle pause state
        isPaused = !isPaused;
        saveState();
        
        // Notify all tabs
        browser.tabs.query({}).then(tabs => {
            tabs.forEach(tab => {
                browser.tabs.sendMessage(tab.id, { 
                    type: 'pauseStateChanged', 
                    isPaused: isPaused 
                }).catch(() => {
                    // Tab might not have content script
                });
                
                // Update badge color for all tabs
                const count = tabCounts[tab.id] || 0;
                const badgeColor = (!isPaused && count > 0) ? '#FF0000' : '#808080';
                browser.browserAction.setBadgeBackgroundColor({
                    color: badgeColor,
                    tabId: tab.id
                });
            });
        });
        
        return Promise.resolve({ isPaused: isPaused });
    } else if (message.type === 'resetStats') {
        // Reset statistics
        totalHiddenCount = 0;
        saveState();
        
        // Notify all tabs to reset
        browser.tabs.query({}).then(tabs => {
            tabs.forEach(tab => {
                browser.tabs.sendMessage(tab.id, { 
                    type: 'resetStats'
                }).catch(() => {
                    // Tab might not have content script
                });
            });
        });
        
        return Promise.resolve({ totalCount: 0 });
    } else if (message.type === 'checkPauseState') {
        // Content script checking if paused
        return Promise.resolve({ isPaused: isPaused });
    }
});

// Tab removal handler - clean up tab counts
browser.tabs.onRemoved.addListener((tabId) => {
    delete tabCounts[tabId];
});