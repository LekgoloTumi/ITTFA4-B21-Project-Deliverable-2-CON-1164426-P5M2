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

    const testimonials = [
        {
            text: "The experience is always beautiful. We got engaged here, and every year we celebrate our wedding anniversary at the spa. Perfect service, wonderful staff. It has become our second home.",
            client: "MPHO"
        },
        {
            text: "An absolutely transformative experience. The attention to detail and personalized care exceeded all expectations. This place truly understands luxury and wellness.",
            client: "SARAH"
        },
        {
            text: "Five stars isn't enough! From the moment we arrived, we felt pampered and cared for. The facilities are world-class and the staff anticipates your every need.",
            client: "JAMES"
        }
    ];

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

    // Function to set hero background via CSS class (CSP-safe)
    function setHeroImage() {
        const heroSection = document.getElementById('hero');
        const currentPage = getCurrentPage();
        if (!heroSection) return;
        // Remove any previously set page class
        heroSection.classList.remove('home', 'packages', 'retreat', 'corporate', 'zone', 'offers', 'vouchers', 'contact');
        // Add the current page as a class (CSS assigns background-image)
        heroSection.classList.add(currentPage);
    }

    let currentTestimonial = 0;

    // function to display testimonial
    function displayTestimonial(index) {
        currentTestimonial = index;
        const textEl = document.getElementById('testimonialText');
        const clientEl = document.getElementById('clientName');
        if (!textEl || !clientEl) return;
        textEl.textContent = testimonials[index].text;
        clientEl.textContent = testimonials[index].client;
    }

    // function for previous testimonial
    function previousTestimonial() {
        currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
        displayTestimonial(currentTestimonial);
    }

    // function for next testimonial
    function nextTestimonial() {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        displayTestimonial(currentTestimonial);
    }

    // Initial display
    displayTestimonial(currentTestimonial);

    // Auto rotate testimonials every 5 seconds
    setInterval(nextTestimonial, 5000);

    // Expose navigation functions for inline button handlers
    window.previousTestimonial = previousTestimonial;
    window.nextTestimonial = nextTestimonial;

    // Keep in Touch form handling
    const subscriptionForm = document.getElementById('subscriptionForm');
    if (subscriptionForm) {
        subscriptionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('subscriptionEmail');
            const messageEl = document.getElementById('subscriptionMessage');
            const email = emailInput ? emailInput.value.trim() : '';
            if (!SpaUtils.validateEmail(email)) {
                if (messageEl) {
                    messageEl.textContent = 'Please enter a valid email address.';
                    messageEl.className = 'subscription-message error';
                }
                return;
            }
            // Simulate subscription success
            SpaUtils.saveToStorage('newsletterSubscribers', [...(SpaUtils.getFromStorage('newsletterSubscribers') || []), email]);
            if (messageEl) {
                messageEl.textContent = 'Thank you! You are subscribed.';
                messageEl.className = 'subscription-message success';
            }
            if (emailInput) emailInput.value = '';
        });
    }

    // Simple slideshow
    const slides = document.querySelectorAll('.slideshow-slide');
    const prevSlideBtn = document.getElementById('slidePrev');
    const nextSlideBtn = document.getElementById('slideNext');
    let currentSlideIndex = 0;

    function showSlide(index) {
        if (!slides.length) return;
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function goToPrevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        showSlide(currentSlideIndex);
    }

    function goToNextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        showSlide(currentSlideIndex);
    }

    if (prevSlideBtn) prevSlideBtn.addEventListener('click', goToPrevSlide);
    if (nextSlideBtn) nextSlideBtn.addEventListener('click', goToNextSlide);

    if (slides.length) {
        showSlide(currentSlideIndex);
        setInterval(goToNextSlide, 6000);
    }

    // Service card navigation
    document.querySelectorAll('.service-card').forEach((card) => {
        card.addEventListener('click', () => {
            const type = card.getAttribute('data-services');
            if (type === 'spa') {
                window.location.href = 'pages/packages.html';
            } else if (type === 'beauty') {
                window.location.href = 'pages/retreat.html';
            }
        });
    });

    // What's On carousel controls
    const carouselTrack = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicators = document.querySelectorAll('#indicators .indicator');
    const cards = carouselTrack ? carouselTrack.querySelectorAll('.experience-card') : [];
    let currentCarouselIndex = 0;

    function updateCarousel() {
        if (!carouselTrack || !cards.length) return;
        const cardWidth = cards[0].getBoundingClientRect().width + 30; // include gap
        carouselTrack.style.transform = `translateX(-${currentCarouselIndex * cardWidth}px)`;
        indicators.forEach((dot, i) => dot.classList.toggle('active', i === currentCarouselIndex));
        if (prevBtn) prevBtn.disabled = currentCarouselIndex === 0;
        if (nextBtn) nextBtn.disabled = currentCarouselIndex >= Math.max(0, cards.length - 3);
    }

    function goPrev() {
        currentCarouselIndex = Math.max(0, currentCarouselIndex - 1);
        updateCarousel();
    }

    function goNext() {
        const maxIndex = Math.max(0, cards.length - 3);
        currentCarouselIndex = Math.min(maxIndex, currentCarouselIndex + 1);
        updateCarousel();
    }

    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);
    indicators.forEach((dot) => {
        dot.addEventListener('click', () => {
            const slide = parseInt(dot.getAttribute('data-slide') || '0', 10);
            currentCarouselIndex = slide;
            updateCarousel();
        });
    });
    updateCarousel();

    // View all navigation and CTA buttons in What's On
    const viewAllBtn = document.querySelector('.view-all-btn');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            window.location.href = 'pages/offers.html';
        });
    }
    document.querySelectorAll('.book-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            window.location.href = 'pages/packages.html';
        });
    });

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
    // Set footer year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Scroll to top functionality
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Enquire button functionality
    const enquireBtn = document.querySelector('.enquire-btn');
    if (enquireBtn) {
        enquireBtn.addEventListener('click', () => {
            window.location.href = 'pages/contact.html';
        });
    }
});