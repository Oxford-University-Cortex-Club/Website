// Google Analytics Event Tracking
// This file tracks key user interactions as events

document.addEventListener('DOMContentLoaded', function() {
    // Track specific external link clicks with detailed event names
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            const url = this.href;
            if (typeof gtag !== 'undefined') {
                // Track specific link types with unique event names
                if (url.includes('spotify.com')) {
                    gtag('event', 'spotify_click', {
                        'event_category': 'podcast',
                        'event_label': 'Spotify Podcast',
                        'link_url': url
                    });
                } else if (url.includes('podcasts.apple.com')) {
                    gtag('event', 'apple_podcasts_click', {
                        'event_category': 'podcast',
                        'event_label': 'Apple Podcasts',
                        'link_url': url
                    });
                } else if (url.includes('instagram.com')) {
                    gtag('event', 'instagram_click', {
                        'event_category': 'social',
                        'event_label': 'Instagram',
                        'link_url': url
                    });
                } else if (url.includes('linkedin.com')) {
                    gtag('event', 'linkedin_click', {
                        'event_category': 'social',
                        'event_label': 'LinkedIn',
                        'link_url': url
                    });
                } else if (url.includes('forms.office.com') || url.includes('forms.cloud.microsoft')) {
                    gtag('event', 'mailing_list_form_click', {
                        'event_category': 'form',
                        'event_label': 'Mailing List Form',
                        'link_url': url
                    });
                } else if (url.includes('maps.app.goo.gl') || url.includes('google.com/maps')) {
                    gtag('event', 'google_maps_click', {
                        'event_category': 'location',
                        'event_label': 'Google Maps',
                        'link_url': url
                    });
                } 
            }
        });
    });

    // Track "View All Events" / "Read All News" button clicks
    const viewAllButtons = document.querySelectorAll('a.btn-secondary');
    viewAllButtons.forEach(btn => {
        if (btn.textContent.includes('View All') || btn.textContent.includes('Read All')) {
            btn.addEventListener('click', function() {
                if (typeof gtag !== 'undefined') {
                    const buttonText = this.textContent.trim();
                    gtag('event', 'view_all_click', {
                        'event_category': 'engagement',
                        'event_label': buttonText
                    });
                }
            });
        }
    });


    // Track event search (if on events page)
    const eventSearch = document.getElementById('eventSearch');
    if (eventSearch) {
        eventSearch.addEventListener('input', function() {
            // Debounce search tracking
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                if (this.value.length > 2 && typeof gtag !== 'undefined') {
                    gtag('event', 'event_search', {
                        'event_category': 'search',
                        'event_label': this.value,
                        'search_term': this.value
                    });
                }
            }, 1000);
        });
    }
});

