document.addEventListener("DOMContentLoaded", () => {
    // Define mapping of page names to image paths
    const pageImages = {
        'home': 'url("assets/images/mowana-gardens.jpg")',
        'packages': 'url("assets/images/mowana-spa-massage.jpg")',
        'retreat': 'url("assets/images/couples-mowana.jpg")',
        'corporate': 'url("assets/images/lounges-23-450-300-100.jpg")',
        'zone': 'url("assets/images/mowana-gardens.jpg")',
        'offers': 'url("assets/images/ultimate-full-body-massage.jpg")',
        'vouchers': 'url("assets/images/massage--foot---leg-13-450-300-100.jpg")',
        'contact': 'url("assets/images/couple-pool-mowana.jpg")'
    };

    // Function to get current page name from URL
    function getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();

        // Handle root directory (home page)
        if (filename === '' || filename === 'home.html' || filename === '/home.html') {
            return 'home';
        }

        // Handle pages in subdirectories
        const pageName = filename.split('.')[0];
        return pageName || 'home';
    }

    // Function to update hero image based on current page
    function setHeroImage() {
        const heroSection = document.getElementById('hero');
        const currentPage = getCurrentPage();

        console.log('Setting hero image for page:', currentPage); // Debug log

        if (heroSection && pageImages[currentPage]) {
            // Determine if we're in the pages directory or root directory
            const isInPagesDirectory = window.location.pathname.includes('/pages/');
            const imagePath = isInPagesDirectory
                ? pageImages[currentPage].replace('url("assets/', 'url("../assets/')
                : pageImages[currentPage];

            console.log('Using image path:', imagePath); // Debug log
            heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), ${imagePath}`;
        } else {
            console.warn('Hero section not found or no image defined for page:', currentPage);
        }
    }

    // Call function on page load to set hero image
    setHeroImage();
});

const SpaUtils = {
    // Smooth scroll to element
    scrollToElement: (elementId, offset = 100) => {
        const element = document.getElementById(elementId);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    },

    // Form validation helper
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Phone number validation (South African format)
    validatePhone: (phone) => {
        const phoneRegex = /^(\+27|0)[0-9]{9}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },

    // Show notification (can be enhanced with a proper notification system)
    showNotification: (message, type = 'info') => {
        alert(`${type.toUpperCase()}: ${message}`);
    },

    // Local storage helpers
    saveToStorage: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    getFromStorage: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }
};

// Initialize any additional features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Monwana Spa website loaded successfully');

    // Save page visit
    const visits = SpaUtils.getFromStorage('pageVisits') || 0;
    SpaUtils.saveToStorage('pageVisits', visits + 1);
});