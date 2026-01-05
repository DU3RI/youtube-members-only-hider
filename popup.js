/**
 * Popup script for YouTube Members Only Hider
 * Handles pause/resume and statistics reset
 */

document.addEventListener('DOMContentLoaded', async () => {
    const pauseBtn = document.getElementById('pauseBtn');
    const lifetimeCountEl = document.getElementById('lifetimeCount');
    const sessionCountEl = document.getElementById('sessionCount');
    const resetLifetimeBtn = document.getElementById('resetLifetimeBtn');
    const resetSessionBtn = document.getElementById('resetSessionBtn');
    const statusDiv = document.getElementById('statusDiv');

    // Get current state from background script
    async function updateUI() {
        try {
            const response = await browser.runtime.sendMessage({ type: 'getState' });
            
            const lifetimeCount = typeof response.lifetimeCount === 'number'
                ? response.lifetimeCount
                : (response.totalCount || 0);
            const sessionCount = typeof response.sessionCount === 'number'
                ? response.sessionCount
                : 0;

            lifetimeCountEl.textContent = lifetimeCount;
            sessionCountEl.textContent = sessionCount;
            
            // Update pause button and status
            if (response.isPaused) {
                pauseBtn.textContent = '▶️ Resume Extension';
                pauseBtn.classList.add('paused');
                statusDiv.textContent = 'Status: Paused';
                statusDiv.classList.remove('active');
                statusDiv.classList.add('paused');
            } else {
                pauseBtn.textContent = '⏸️ Pause Extension';
                pauseBtn.classList.remove('paused');
                statusDiv.textContent = 'Status: Active';
                statusDiv.classList.remove('paused');
                statusDiv.classList.add('active');
            }
        } catch (err) {
            console.error('Failed to get state:', err);
        }
    }

    // Initial UI update
    await updateUI();

    // Pause/Resume button
    pauseBtn.addEventListener('click', async () => {
        try {
            await browser.runtime.sendMessage({ type: 'togglePause' });
            await updateUI();
        } catch (err) {
            console.error('Failed to toggle pause:', err);
        }
    });

    // Reset lifetime statistics
    resetLifetimeBtn.addEventListener('click', async () => {
        if (confirm('Reset lifetime statistics?')) {
            try {
                await browser.runtime.sendMessage({ type: 'resetStats', scope: 'lifetime' });
                await updateUI();
            } catch (err) {
                console.error('Failed to reset lifetime stats:', err);
            }
        }
    });

    // Reset session statistics
    resetSessionBtn.addEventListener('click', async () => {
        if (confirm('Reset session statistics?')) {
            try {
                await browser.runtime.sendMessage({ type: 'resetStats', scope: 'session' });
                await updateUI();
            } catch (err) {
                console.error('Failed to reset session stats:', err);
            }
        }
    });
});
