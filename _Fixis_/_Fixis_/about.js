document.addEventListener('DOMContentLoaded', () => {

    // --- Custom Cursor Logic (Shared across pages) ---
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

        // Interactive hover states
        const t = e.target;
        if (t.tagName.toLowerCase() === 'a' || 
            t.tagName.toLowerCase() === 'button' || 
            t.closest('.value-card') ||
            t.closest('.team-card') ||
            t.closest('.btn') ||
            t.closest('#back-to-top')) {
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

    // --- Scroll to Top Button ---
    const backToTopBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Intersection Observer for Scroll Entrance Animations ---
    const animElements = document.querySelectorAll('.animate-up, .animate-fade, .animate-slide-left, .animate-slide-right');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before it comes fully into view
        threshold: 0.1
    };

    const entranceObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only play animation once
            }
        });
    }, observerOptions);

    animElements.forEach(el => entranceObserver.observe(el));

});
