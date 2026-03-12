document.addEventListener('DOMContentLoaded', () => {

    // --- Custom Cursor Logic (Shared with index but localized for contact page elements) ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorGlow = document.getElementById('cursor-glow');
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let glowX = cursorX;
    let glowY = cursorY;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;

        cursorDot.style.left = `${cursorX}px`;
        cursorDot.style.top = `${cursorY}px`;

        // Check for interactable elements to trigger hover state
        const target = e.target;
        if (target.tagName.toLowerCase() === 'a' ||
            target.tagName.toLowerCase() === 'button' ||
            target.closest('.info-block') ||
            target.tagName.toLowerCase() === 'input' ||
            target.tagName.toLowerCase() === 'textarea' ||
            target.tagName.toLowerCase() === 'select') {
            cursorDot.classList.add('hovered');
            cursorGlow.classList.add('hovered');
        } else {
            cursorDot.classList.remove('hovered');
            cursorGlow.classList.remove('hovered');
        }
    });

    document.addEventListener('mousedown', () => cursorGlow.classList.add('clicked'));
    document.addEventListener('mouseup', () => cursorGlow.classList.remove('clicked'));

    const animateCursor = () => {
        glowX += (cursorX - glowX) * 0.2;
        glowY += (cursorY - glowY) * 0.2;
        cursorGlow.style.left = `${glowX}px`;
        cursorGlow.style.top = `${glowY}px`;
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // --- Header Background on Scroll ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Entrance Animations (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Fade up the info blocks sequentially
    document.querySelectorAll('.info-block').forEach(block => {
        observer.observe(block);
    });

    // --- Form Interaction & Submission Animation ---
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = document.querySelector('.btn-text');

    // PASTE YOUR GOOGLE APPS SCRIPT URL HERE
    const scriptURL = 'https://script.google.com/macros/s/AKfycbz4UtAxBWQrSNEboPYwJkeTyqqafttduG6OWN7yDNZNEE2FVS4ToqiAf3onZji0NHuT/exec';

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!scriptURL) {
                alert("Please add your Google Apps Script URL in contact.js");
                return;
            }

            // 1. Loading State
            submitBtn.classList.add('loading');

            // 2. Actual API Call
            const formData = new FormData(contactForm);

            fetch(scriptURL, {
                method: 'POST',
                body: new URLSearchParams(formData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        submitBtn.classList.remove('loading');
                        submitBtn.classList.add('success');
                        btnText.textContent = "Sent!";

                        setTimeout(() => {
                            contactForm.reset();
                            submitBtn.classList.remove('success');
                            btnText.textContent = "Send Message";
                            document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
                                input.blur();
                            });
                        }, 3000);
                    } else {
                        throw new Error(data.error || 'Server error');
                    }
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    submitBtn.classList.remove('loading');
                    btnText.textContent = "Error!";
                    setTimeout(() => {
                        btnText.textContent = "Send Message";
                    }, 3000);
                });
        });
    }

});
