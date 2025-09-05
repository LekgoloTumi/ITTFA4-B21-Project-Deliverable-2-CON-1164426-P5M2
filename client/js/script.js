document.addEventListener("DOMContentLoaded", () => {
    // Initialize hamburger menu functionality
    const openHam = document.querySelector('#openHam');
    const closeHam = document.querySelector('#closeHam');
    const navigationItems = document.querySelector('#navigation-items');

    const hamburgerEvent = (navigation, close, open) => {
        navigationItems.style.display = navigation;
        closeHam.style.display = close;
        openHam.style.display = open;
    };

    openHam.addEventListener('click', () => {
        hamburgerEvent("flex", "block", "none");
        navigationItems.classList.add('active');
    });

    closeHam.addEventListener('click', () => {
        hamburgerEvent("none", "none", "block");
        navigationItems.classList.remove('active');
    });

    // Handle navigation links
    document.querySelectorAll("nav a").forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");

            // If its an anchor link (Start with #), handle smooth scrolling
            if (href.startsWith('#')) {
                e.preventDefault();
                const section = href.substring(1);
                const targetSection = document.getElementById(section);

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });


                    // Close mobile menu if open
                    if (navigationItems.classList.contains('active')) {
                        hamburgerEvent("none", "none", "block");
                        navigationItems.classList.remove('active');
                    }
                }
            }
        });
    });

    // Fallback for scroll-driven animation (for browsers that don't support it)
    if (!CSS.supports('animation-timeline', 'view()')) {
        const homeSection = document.getElementById('home');

        if (homeSection) {
            window.addEventListener('scroll', () => {
                const rect = homeSection.getBoundingClientRect();

                // Start fading when section is 500px from being completely out of view
                if (rect.bottom < 500) {
                    homeSection.classList.add('fade-out');
                } else {
                    homeSection.classList.remove('fade-out');
                }
            });
        }
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar') && navigationItems.classList.contains('active')) {
            hamburgerEvent("none", "none", "block");
            navigationItems.classList.remove('active');
        }
    });

    // Close mobile menu on window resive (if users rotates device)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navigationItems.classList.contains('active')) {
            hamburgerEvent("none", "none", "block");
            navigationItems.classList.remove('active')
        }
    });
});