// Typewriter effect function for hero text
function typeText(element, text, speed = 50, showCursor = false) {
    return new Promise((resolve) => {
        let index = 0;
        element.textContent = '';
        element.style.visibility = 'visible';
        
        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                // Add cursor only if requested
                if (showCursor) {
                    const cursor = document.createElement('span');
                    cursor.className = 'typewriter-cursor';
                    cursor.textContent = '_';
                    element.appendChild(cursor);
                }
                resolve();
            }
        }
        
        type();
    });
}

// Initialize typewriter effect on page load
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    
    if (heroTitle && heroSubtitle) {
        // The headline text lives in index.html (so search engines can read it);
        // this script just re-types it. To change the wording, edit index.html.
        const titleText = heroTitle.textContent.trim();
        const subtitleText = heroSubtitle.textContent.trim();
        typeText(heroTitle, titleText, 40, false)
            .then(() => {
                return typeText(heroSubtitle, subtitleText, 20, true);
            });
    }
});

