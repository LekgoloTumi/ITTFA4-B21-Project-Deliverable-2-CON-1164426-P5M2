document.addEventListener("DOMContentLoaded", () => {
    // Initialize hamburger menu functionality
    const openHam = document.querySelector('#openHam');
    const closeHam = document.querySelector('#closeHam');
    const navigationItems = document.querySelector('#navigation-items');
    const navbar = document.querySelector('.navbar');
    const logoLink = document.querySelector('.logo-container a');

    // Mobile menu toggle function
    const toggleMobileMenu = (isOpen) => {
        if (isOpen) {
            navigationItems.classList.add('active');
            closeHam.style.display = 'block';
            openHam.style.display = 'none';
        } else {
            navigationItems.classList.remove('active');
            closeHam.style.display = 'none';
            openHam.style.display = 'block';
        }
    };

    // Open mobile menu
    openHam.addEventListener('click', () => toggleMobileMenu(true));
    
    // Close mobile menu
    closeHam.addEventListener('click', () => toggleMobileMenu(false));

    // Handle logo click to return home
    if (logoLink) {
        logoLink.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = '../home.html';
        });
    }

    // Define mapping of page names to image paths
    const pageImages = {
        'home': 'url("../assets/images/mowana-gardens.jpg")',
        'packages': 'url("/assets/images/mowana-spa-massage.jpg")',
    };

    // Function to get current page name from URL
    function getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        if (filename === '' || filename === '/home.html') {
            return 'home';
        }
        return filename.split('.')[0];
    }

    // Function to update hero image based on current page
    function setHeroImage() {
        const heroSection = document.getElementById('hero');
        const currentPage = getCurrentPage();
        if (heroSection && pageImages[currentPage]) {
            heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), ${pageImages[currentPage]}`;
        }
    }

    // Handle navigation link clicks
    document.querySelectorAll('.navigation-items a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            
            if (page) {
                let filename;
                if (page === 'home') {
                    filename = '/home.html';
                } else {
                    filename = `/pages/${page}.html`;
                }

                window.location.href = filename;
            }

            // Close mobile menu if open
            if (navigationItems.classList.contains('active')) {
                toggleMobileMenu(false);
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar') && navigationItems.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    });

    // Close mobile menu on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navigationItems.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // CTA button functionality
    document.querySelector('.button-cta').addEventListener('click', () => {
        showPage('contact');
        // Close mobile menu if open
        if (navigationItems.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    });

    // Call function on page load to set hero image
    setHeroImage();
});

// Function to return to the home page
function showHome() {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reset page title
    document.title = 'Monwana Spa - Luxury Wellness Retreat';
}

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