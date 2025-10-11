/**
 * YouTube Members Only Video Hider
 * Content script that removes "Members only" videos from YouTube feeds and channel pages
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        // Selectors for different YouTube page layouts
        videoSelectors: [
            'ytd-video-renderer',           // Home feed, search results
            'ytd-grid-video-renderer',      // Channel videos tab, subscriptions grid
            'ytd-compact-video-renderer',   // Sidebar recommendations
            'ytd-rich-grid-media',          // New grid layout
            'ytd-rich-item-renderer'        // Rich grid items
        ],
        // Text patterns that indicate members-only content
        membersOnlyPatterns: [
            'Members only',
            'members only',
            'MEMBERS ONLY',
            '會員專用',  // Chinese
            'Nur für Mitglieder',  // German
            'Solo para miembros',   // Spanish
            'Seulement pour les membres'  // French
        ],
        // Attribute selectors for members-only badges
        badgeSelectors: [
            '[aria-label*="Members only"]',
            '[aria-label*="members only"]',
            '[title*="Members only"]',
            '[title*="members only"]'
        ]
    };

    let hiddenCount = 0;
    let observer = null;

    /**
     * Check if a video element contains members-only indicators
     */
    function isMembersOnlyVideo(videoElement) {
        // Check for text content indicating members-only
        const textContent = videoElement.textContent || '';
        for (const pattern of CONFIG.membersOnlyPatterns) {
            if (textContent.includes(pattern)) {
                return true;
            }
        }

        // Check for members-only badges or attributes
        for (const selector of CONFIG.badgeSelectors) {
            if (videoElement.querySelector(selector)) {
                return true;
            }
        }

        // Check for membership badge icons
        const membershipBadges = videoElement.querySelectorAll('yt-icon[icon="yt-icons:members_only"], .ytd-badge-supported-renderer');
        if (membershipBadges.length > 0) {
            for (const badge of membershipBadges) {
                if (badge.textContent.toLowerCase().includes('member')) {
                    return true;
                }
            }
        }

        // Check for specific YouTube membership indicators
        const membershipIndicators = videoElement.querySelectorAll('.badge-style-type-members-only, .ytd-thumbnail-overlay-toggle-button-renderer[aria-label*="member"]');
        if (membershipIndicators.length > 0) {
            return true;
        }

        return false;
    }

    /**
     * Hide a members-only video element
     */
    function hideVideo(videoElement) {
        if (videoElement.dataset.membersOnlyHidden === 'true') {
            return; // Already hidden
        }

        videoElement.style.display = 'none';
        videoElement.dataset.membersOnlyHidden = 'true';
        hiddenCount++;
        
        console.log(`[YouTube Members Only Hider] Hidden video #${hiddenCount}:`, videoElement);
    }

    /**
     * Process video elements and hide members-only content
     */
    function processVideos() {
        for (const selector of CONFIG.videoSelectors) {
            const videos = document.querySelectorAll(selector);
            videos.forEach(video => {
                if (video.dataset.membersOnlyProcessed === 'true') {
                    return; // Already processed
                }
                // Special handling for sidebar suggestions (ytd-compact-video-renderer)
                if (selector === 'ytd-compact-video-renderer') {
                    // Check for badges in the thumbnail or overlay
                    const badge = video.querySelector('.badge-style-type-members-only, [aria-label*="Members only"], [aria-label*="members only"], [title*="Members only"], [title*="members only"]');
                    if (badge || isMembersOnlyVideo(video)) {
                        hideVideo(video);
                    }
                } else {
                    if (isMembersOnlyVideo(video)) {
                        hideVideo(video);
                    }
                }
                video.dataset.membersOnlyProcessed = 'true';
            });
        }
    }

    /**
     * Initialize the extension
     */
    function init() {
        console.log('[YouTube Members Only Hider] Initializing...');
        
        // Process existing videos
        processVideos();

        // Set up mutation observer to handle dynamically loaded content
        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver((mutations) => {
            let shouldProcess = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Always process if sidebar suggestions are updated
                            if (node.matches && node.matches('ytd-compact-video-renderer')) {
                                shouldProcess = true;
                            }
                            // Or if any video element is added
                            const hasVideos = CONFIG.videoSelectors.some(selector => 
                                node.matches && node.matches(selector) || 
                                node.querySelector && node.querySelector(selector)
                            );
                            if (hasVideos) {
                                shouldProcess = true;
                            }
                        }
                    });
                }
            });
            if (shouldProcess) {
                setTimeout(processVideos, 100);
            }
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('[YouTube Members Only Hider] Initialized successfully');
    }

    /**
     * Handle page navigation in YouTube's SPA
     */
    function handleNavigation() {
        // Reset processed flags when navigating to new pages
        const processedElements = document.querySelectorAll('[data-members-only-processed="true"]');
        processedElements.forEach(el => {
            el.removeAttribute('data-members-only-processed');
        });
        
        // Re-process videos after navigation
        setTimeout(processVideos, 500);
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle YouTube's single-page app navigation
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            handleNavigation();
        }
    }).observe(document, { subtree: true, childList: true });

    // Expose global functions for debugging
    window.youtubeMembersOnlyHider = {
        processVideos,
        getHiddenCount: () => hiddenCount,
        showHiddenVideos: () => {
            const hiddenVideos = document.querySelectorAll('[data-members-only-hidden="true"]');
            hiddenVideos.forEach(video => {
                video.style.display = '';
                video.removeAttribute('data-members-only-hidden');
            });
            hiddenCount = 0;
            console.log('[YouTube Members Only Hider] Restored all hidden videos');
        }
    };

})();