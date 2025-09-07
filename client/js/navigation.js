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
    const ctaButton = document.querySelector('.button-cta');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            // Navigate to contact page
            const currentPath = window.location.pathname;
            const contactUrl = currentPath.includes('/pages/') ? 'contact.html' : 'pages/contact.html';
            window.location.href = contactUrl;

            // Close mobile menu if open
            if (navigationItems.classList.contains('active')) {
                toggleMobileMenu(false);
            }
        });
    }
});

// Function to return to the home page
function showHome() {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reset page title
    document.title = 'Mowana Spa - Luxury Wellness Retreat';
}

// Export navigation utilities for use in other scripts
const NavigationUtils = {
    scrollToTop: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

};