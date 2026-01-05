/**
 * Background script for YouTube Members Only Hider
 * Handles extension lifecycle, badge updates, pause/resume, and statistics
 */

// Global state
let isPaused = false;
let lifetimeHiddenCount = 0;
let sessionHiddenCount = 0;
let tabCounts = {}; // Track count per tab

// Extension installation/update handler
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('YouTube Members Only Hider installed');
        // Initialize storage
        browser.storage.local.set({ 
            isPaused: false, 
            lifetimeHiddenCount: 0,
            sessionHiddenCount: 0,
            totalHiddenCount: 0 // Legacy compatibility
        });
    } else if (details.reason === 'update') {
        console.log('YouTube Members Only Hider updated to version', browser.runtime.getManifest().version);
    }
    
    // Load saved state
    loadState();
});

// Load state from storage
async function loadState() {
    try {
        const result = await browser.storage.local.get([
            'isPaused',
            'lifetimeHiddenCount',
            'sessionHiddenCount',
            'totalHiddenCount'
        ]);
        isPaused = result.isPaused || false;
        lifetimeHiddenCount = typeof result.lifetimeHiddenCount === 'number'
            ? result.lifetimeHiddenCount
            : (result.totalHiddenCount || 0);
        sessionHiddenCount = typeof result.sessionHiddenCount === 'number'
            ? result.sessionHiddenCount
            : 0;
    } catch (err) {
        console.error('Failed to load state:', err);
    }
}

// Save state to storage
async function saveState() {
    try {
        await browser.storage.local.set({ 
            isPaused: isPaused, 
            lifetimeHiddenCount: lifetimeHiddenCount,
            sessionHiddenCount: sessionHiddenCount,
            totalHiddenCount: lifetimeHiddenCount // Legacy compatibility
        });
    } catch (err) {
        console.error('Failed to save state:', err);
    }
}

// Initialize on startup
loadState();

browser.runtime.onStartup.addListener(() => {
    sessionHiddenCount = 0;
    saveState();
});

// Listen for messages from content script and popup
browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'updateBadge') {
        const tabCount = typeof message.tabCount === 'number'
            ? message.tabCount
            : (message.count || 0);
        const increment = typeof message.increment === 'number' ? message.increment : 0;
        const tabId = sender.tab ? sender.tab.id : null;
        
        if (tabId) {
            // Update tab-specific count
            tabCounts[tabId] = tabCount;

            if (increment > 0) {
                sessionHiddenCount += increment;
                lifetimeHiddenCount += increment;
                saveState();
            }
            
            // Always show count on badge (even when 0)
            browser.browserAction.setBadgeText({
                text: tabCount.toString(),
                tabId: tabId
            });
            
            // Color: Red when active, Gray when paused or 0
            let badgeColor = '#808080';
            if (!isPaused && tabCount > 0) {
                badgeColor = '#FF0000';
            }
            browser.browserAction.setBadgeBackgroundColor({
                color: badgeColor,
                tabId: tabId
            });
            
            // Update tooltip
            const videoText = tabCount === 1 ? 'video' : 'videos';
            const statusText = isPaused ? ' (Paused)' : '';
            browser.browserAction.setTitle({
                title: `YouTube Members Only Hider - ${tabCount} ${videoText} hidden${statusText}`,
                tabId: tabId
            });
        }
    } else if (message.type === 'getState') {
        // Popup requesting current state
        return Promise.resolve({
            isPaused: isPaused,
            lifetimeCount: lifetimeHiddenCount,
            sessionCount: sessionHiddenCount,
            totalCount: lifetimeHiddenCount // Legacy field for older popups
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
        // Reset statistics (session, lifetime, or both)
        const scope = message.scope || 'all';
        const resetSession = scope === 'session' || scope === 'all';
        const resetLifetime = scope === 'lifetime' || scope === 'all';

        if (resetSession) {
            sessionHiddenCount = 0;
        }
        if (resetLifetime) {
            lifetimeHiddenCount = 0;
        }
        saveState();
        
        // Notify all tabs to reset displayed counts
        browser.tabs.query({}).then(tabs => {
            tabs.forEach(tab => {
                tabCounts[tab.id] = 0;
                browser.tabs.sendMessage(tab.id, { 
                    type: 'resetStats'
                }).catch(() => {
                    // Tab might not have content script
                });
            });
        });
        
        return Promise.resolve({ 
            lifetimeCount: lifetimeHiddenCount,
            sessionCount: sessionHiddenCount
        });
    } else if (message.type === 'checkPauseState') {
        // Content script checking if paused
        return Promise.resolve({ isPaused: isPaused });
    }
});

// Tab removal handler - clean up tab counts
browser.tabs.onRemoved.addListener((tabId) => {
    delete tabCounts[tabId];
});