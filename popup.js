/**
 * Popup script for YouTube Members Only Hider
 * Handles pause/resume and statistics reset
 */

document.addEventListener('DOMContentLoaded', async () => {
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const hiddenCountEl = document.getElementById('hiddenCount');
    const statusDiv = document.getElementById('statusDiv');

    // Get current state from background script
    async function updateUI() {
        try {
            const response = await browser.runtime.sendMessage({ type: 'getState' });
            
            // Update hidden count
            hiddenCountEl.textContent = response.totalCount || 0;
            
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

    // Reset statistics button
    resetBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset the statistics?')) {
            try {
                await browser.runtime.sendMessage({ type: 'resetStats' });
                await updateUI();
            } catch (err) {
                console.error('Failed to reset stats:', err);
            }
        }
    });
});
