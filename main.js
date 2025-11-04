// Navigation and submenu toggles (mobile + keyboard/touch friendly)
// Extracted from inline script in index.html

document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const navOpenIcon = document.getElementById('nav-open-icon');
    const navCloseIcon = document.getElementById('nav-close-icon');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            if (mobileMenu) mobileMenu.classList.toggle('hidden');
            if (navOpenIcon) navOpenIcon.classList.toggle('hidden');
            if (navCloseIcon) navCloseIcon.classList.toggle('hidden');
        });
    }

    // Submenu toggles for buttons with data-submenu-target (works on touch/keyboard)
    document.querySelectorAll('button[data-submenu-target]').forEach(function (btn) {
        const targetId = btn.getAttribute('data-submenu-target');
        if (!targetId) return;
        const menu = document.getElementById(targetId);
        // keep hover behaviour on desktop via CSS, but add click toggling for accessibility
        btn.addEventListener('click', function (e) {
            // prevent the click from closing via other handlers
            e.stopPropagation();
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            if (menu) menu.classList.toggle('hidden');
        });
        // close when clicking outside
        document.addEventListener('click', function (e) {
            if (!btn.contains(e.target) && menu && !menu.contains(e.target)) {
                btn.setAttribute('aria-expanded', 'false');
                if (!menu.classList.contains('hidden')) menu.classList.add('hidden');
            }
        });
    });

    // Mobile accordions inside mobile-menu
    document.querySelectorAll('[data-accordion-target]').forEach(function (btn) {
        const target = document.getElementById(btn.getAttribute('data-accordion-target'));
        btn.addEventListener('click', function () {
            if (target) target.classList.toggle('hidden');
            const svg = btn.querySelector('svg');
            if (svg) svg.classList.toggle('rotate-180');
        });
    });

    // Full-screen slider for `p-Dhaka.html`.
    // This slider uses transform-based positioning, autoplay, dots, keyboard navigation, and responsive resizing.
    (function initFullScreenSlider() {
        const slider = document.getElementById('slider');
        if (!slider) return;

        const slides = Array.from(slider.querySelectorAll('.slide'));
        if (!slides.length) return;

        let index = 0;
        let autoplayInterval = 5000; // ms
        let autoplayTimer = null;
        const prevBtn = document.getElementById('slider-prev');
        const nextBtn = document.getElementById('slider-next');
        const dotsContainer = document.getElementById('slider-dots');

        // ensure slider container has the right style
        slider.style.display = 'flex';
        slider.style.flexWrap = 'nowrap';
        slider.style.willChange = 'transform';

        function updateTransform(animate = true) {
            if (!animate) slider.style.transition = 'none';
            else slider.style.transition = 'transform 600ms ease';

            const offset = -index * window.innerWidth;
            slider.style.transform = `translateX(${offset}px)`;

            // after forcing no-transition, re-enable smoothly for subsequent calls
            if (!animate) requestAnimationFrame(() => {
                slider.style.transition = 'transform 600ms ease';
            });
        }

        function goTo(i) {
            index = ((i % slides.length) + slides.length) % slides.length;
            updateTransform(true);
            updateDots();
        }

        function next() { goTo(index + 1); }
        function prev() { goTo(index - 1); }

        // Expose for compatibility
        window.nextSlide = next;
        window.prevSlide = prev;

        // Dots
        function createDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            slides.forEach((s, i) => {
                const btn = document.createElement('button');
                btn.className = 'w-3 h-3 rounded-full bg-white/40';
                btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
                btn.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(btn);
            });
        }

        function updateDots() {
            if (!dotsContainer) return;
            Array.from(dotsContainer.children).forEach((d, i) => {
                d.classList.toggle('bg-white', i === index);
                d.classList.toggle('bg-white/40', i !== index);
            });
        }

        // Autoplay
        function startAutoplay() {
            stopAutoplay();
            autoplayTimer = setInterval(next, autoplayInterval);
        }
        function stopAutoplay() {
            if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
        }

        // Attach events
        if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });

        // pause on hover/focus for accessibility
        [slider, prevBtn, nextBtn, dotsContainer].forEach(el => {
            if (!el) return;
            el.addEventListener('mouseenter', stopAutoplay);
            el.addEventListener('mouseleave', startAutoplay);
            el.addEventListener('focusin', stopAutoplay);
            el.addEventListener('focusout', startAutoplay);
        });

        // keyboard navigation
        document.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { next(); startAutoplay(); }
            if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
        });

        // maintain position on resize
        let resizeTimeout = null;
        window.addEventListener('resize', function () {
            // reposition without animation to avoid jumpy transition
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => updateTransform(false), 120);
        });

        // init
        createDots();
        updateTransform(false);
        updateDots();
        startAutoplay();
    })();
});
