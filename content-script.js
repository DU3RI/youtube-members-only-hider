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
            'ytd-rich-item-renderer',       // Rich grid items
            'yt-lockup-view-model'          // New YouTube layout with lockup model
        ],
        // Text patterns that indicate members-only content
        membersOnlyPatterns: [
            'Members only',
            'members only',
            'MEMBERS ONLY',
            'Members',  // Sometimes shown as just "Members"
            'Members-only',
            'Members-only videos',
            'Members only videos',
            'Videos for members',
            'For channel members',
            'Channel members only',
            'Nur für Mitglieder',  // German
            'Videos nur für Mitglieder',  // German section title
            'Nur für Kanalmitglieder',  // German badge text
            '會員專用',  // Chinese
            'Solo para miembros',   // Spanish
            'Seulement pour les membres'  // French
        ],
        // Attribute selectors for members-only badges
        badgeSelectors: [
            '[aria-label*="Members only"]',
            '[aria-label*="members only"]',
            '[aria-label*="Members"]',
            '[aria-label*="Members-only"]',
            '[aria-label*="Videos for members"]',
            '[aria-label*="Channel members"]',
            '[aria-label*="Nur für Mitglieder"]',
            '[aria-label*="Nur für Kanalmitglieder"]',
            '[title*="Members only"]',
            '[title*="members only"]',
            '[title*="Members"]',
            '[title*="Members-only"]',
            '[title*="Videos for members"]',
            '[title*="Channel members"]',
            '[title*="Nur für Mitglieder"]',
            '[title*="Nur für Kanalmitglieder"]',
            '.yt-spec-icon-badge-shape--style-green'  // Green member badge icon
        ],
        // Section selectors/headings that indicate channel shelves dedicated to members
        sectionSelectors: [
            'ytd-shelf-renderer',
            'ytd-rich-grid-row',
            'ytd-rich-section-renderer',
            'yt-horizontal-list-renderer',
            '.yt-content-metadata-view-model'
        ],
        membersOnlySectionPatterns: [
            'Members-only videos',
            'Members only videos',
            'Members-only',
            'Members only',
            'Videos for members',
            'For channel members',
            'Channel members only',
            'Videos nur für Mitglieder',
            'Nur für Mitglieder',
            'Nur für Kanalmitglieder'
        ]
    };

    let hiddenCount = 0;
    let observer = null;
    let isPaused = false;

    /**
     * Check if a video element contains members-only indicators
     * Enhanced to check ALL badges, even when multiple flags are present
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

        // Check ALL badges on the video (handles multiple flags like Featured + Members Only)
        const allBadges = videoElement.querySelectorAll(
            'ytd-badge-supported-renderer, .badge-style-type-members-only, .badge, .yt-badge, yt-icon, ' +
            'yt-badge-shape, .yt-badge-shape__text, .yt-content-metadata-view-model__badge'
        );
        for (const badge of allBadges) {
            const badgeText = badge.textContent ? badge.textContent.toLowerCase().trim() : '';
            const badgeLabel = badge.getAttribute('aria-label') ? badge.getAttribute('aria-label').toLowerCase() : '';
            const badgeTitle = badge.getAttribute('title') ? badge.getAttribute('title').toLowerCase() : '';
            
            // Check if any badge contains "members only" or "member"
            if (badgeText.includes('members only') || 
                badgeText.includes('members-only') ||
                badgeText.includes('member') ||
                badgeText.includes('channel members') ||
                badgeText.includes('kanalmitglied') ||
                badgeLabel.includes('members only') || 
                badgeLabel.includes('members-only') ||
                badgeLabel.includes('channel members') ||
                badgeLabel.includes('kanalmitglied') ||
                badgeTitle.includes('members only') ||
                badgeTitle.includes('members-only') ||
                badgeTitle.includes('channel members') ||
                badgeTitle.includes('kanalmitglied')) {
                return true;
            }
        }
        
        // Check for YouTube's badge system with multiple badges
        const ytBadgeShapes = videoElement.querySelectorAll('yt-badge-shape');
        for (const badgeShape of ytBadgeShapes) {
            const badgeText = badgeShape.textContent ? badgeShape.textContent.toLowerCase().trim() : '';
            if (badgeText.includes('members only') || badgeText.includes('members')) {
                return true;
            }
        }

        // Check for membership badge icons
        const membershipBadges = videoElement.querySelectorAll('yt-icon[icon="yt-icons:members_only"]');
        if (membershipBadges.length > 0) {
            return true;
        }

        // Check for specific YouTube membership indicators
        const membershipIndicators = videoElement.querySelectorAll('.badge-style-type-members-only');
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
        
        // Update badge count (include increment for stats)
        updateBadgeCount(1);
        
        console.log(`[YouTube Members Only Hider] Hidden video #${hiddenCount}:`, videoElement);
    }

    /**
     * Update the extension badge with current hidden count
     */
    function updateBadgeCount(increment = 0) {
        if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
            browser.runtime.sendMessage({
                type: 'updateBadge',
                tabCount: hiddenCount,
                increment: increment
            }).catch(() => {
                // Silently fail if background script is not available
            });
        }
    }

    /**
     * Process video elements and hide members-only content
     */
    function processVideos() {
        // Don't process if paused
        if (isPaused) {
            return;
        }
        
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

        hideMembersOnlySections();
    }

    /**
     * Initialize the extension
     */
    async function init() {
        console.log('[YouTube Members Only Hider] Initializing...');
        
        // Check if extension is paused
        try {
            const response = await browser.runtime.sendMessage({ type: 'checkPauseState' });
            isPaused = response.isPaused || false;
        } catch (err) {
            // Continue if background script not ready
        }
        
        // Initialize badge (show 0 if nothing hidden yet)
        updateBadgeCount(0);
        
        // Process existing videos (if not paused)
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
        // Do NOT reset count - keep counting across navigation
        
        // Reset processed flags when navigating to new pages
        const processedElements = document.querySelectorAll('[data-members-only-processed="true"]');
        processedElements.forEach(el => {
            el.removeAttribute('data-members-only-processed');
        });
        
        // Re-process videos after navigation
        setTimeout(processVideos, 500);
    }

    /**
     * Hide entire members-only sections/shelves on channel overview pages
     */
    function hideMembersOnlySections() {
        if (!CONFIG.sectionSelectors.length) {
            return;
        }

        const sections = document.querySelectorAll(CONFIG.sectionSelectors.join(','));
        sections.forEach(section => {
            if (section.dataset.membersOnlySectionHidden === 'true') {
                return;
            }

            const headingText = getSectionHeadingText(section);
            if (containsMembersOnlySectionText(headingText)) {
                section.style.display = 'none';
                section.dataset.membersOnlySectionHidden = 'true';
                console.log('[YouTube Members Only Hider] Hidden members-only section:', headingText || section);
            }
        });
    }

    function getSectionHeadingText(section) {
        const headingSelectors = [
            'h1', 'h2', 'h3', 'h4',
            '#title', '#title-text', '#title-container',
            'yt-formatted-string[slot="title"]',
            'yt-formatted-string.style-scope',
            '.title'
        ];

        for (const selector of headingSelectors) {
            const heading = section.querySelector(selector);
            if (heading && heading.textContent) {
                const text = heading.textContent.trim();
                if (text) {
                    return text;
                }
            }
        }

        return section.textContent ? section.textContent.trim().slice(0, 200) : '';
    }

    function containsMembersOnlySectionText(text) {
        if (!text) {
            return false;
        }
        const normalized = text.toLowerCase();
        return CONFIG.membersOnlySectionPatterns.some(pattern => normalized.includes(pattern.toLowerCase()));
    }

    function setMembersOnlySectionVisibility(shouldShow) {
        const hiddenSections = document.querySelectorAll('[data-members-only-section-hidden="true"]');
        hiddenSections.forEach(section => {
            section.style.display = shouldShow ? '' : 'none';
        });
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

    // Listen for messages from background script
    browser.runtime.onMessage.addListener((message) => {
        if (message.type === 'pauseStateChanged') {
            isPaused = message.isPaused;
            
            if (isPaused) {
                console.log('[YouTube Members Only Hider] Extension paused');
                // Show all hidden videos when paused
                const hiddenVideos = document.querySelectorAll('[data-members-only-hidden="true"]');
                hiddenVideos.forEach(video => {
                    video.style.display = '';
                });
                setMembersOnlySectionVisibility(true);
            } else {
                console.log('[YouTube Members Only Hider] Extension resumed');
                // Re-hide videos when resumed
                const hiddenVideos = document.querySelectorAll('[data-members-only-hidden="true"]');
                hiddenVideos.forEach(video => {
                    video.style.display = 'none';
                });
                setMembersOnlySectionVisibility(false);
                // Process any new videos
                processVideos();
            }
        } else if (message.type === 'resetStats') {
            // Reset statistics
            hiddenCount = 0;
            updateBadgeCount(0);
            console.log('[YouTube Members Only Hider] Statistics reset');
        }
    });

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
            const hiddenSections = document.querySelectorAll('[data-members-only-section-hidden="true"]');
            hiddenSections.forEach(section => {
                section.style.display = '';
                section.removeAttribute('data-members-only-section-hidden');
            });
            hiddenCount = 0;
            updateBadgeCount(0);
            console.log('[YouTube Members Only Hider] Restored all hidden videos');
        }
    };

})();