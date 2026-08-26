// Basic interactions based on the provided text elements
document.addEventListener('DOMContentLoaded', () => {
    
    // Explore Collection Button
    const exploreBtn = document.querySelector('.explore-btn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            const featuredSection = document.querySelector('.featured');
            if (featuredSection) {
                featuredSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Save to Favorites Button
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveBtn.textContent = 'Saved';
            saveBtn.style.background = '#e0e0e0';
            saveBtn.style.color = '#4caf50';
        });
    }

    // Copy Link Button
    const copyBtn = document.querySelector('.copy-link');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            });
        });
    }

    // Simulate Loading Collection
    const loadingText = document.querySelector('.loading');
    if (loadingText) {
        setTimeout(() => {
            loadingText.textContent = 'Collection loaded.';
            loadingText.style.color = '#4caf50';
            loadingText.style.fontStyle = 'normal';
        }, 2000);
    }

});
