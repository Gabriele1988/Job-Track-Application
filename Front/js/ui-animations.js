// =========================================================
// UI ANIMATIONS
// Reveal animations sicure con fallback se GSAP non è presente
// =========================================================

(function () {
    function hasGSAP() {
        return typeof window.gsap !== 'undefined';
    }

    function initRevealAnimations(root = document) {
        const elements = root.querySelectorAll(
            '.reveal-up, .reveal, .reveal-left, .reveal-right, .reveal-scale'
        );

        if (!elements.length) return;

        if (!hasGSAP()) {
            elements.forEach((el) => {
                el.style.opacity = '1';
                el.style.visibility = 'visible';
                el.style.transform = 'none';
            });
            return;
        }

        document.documentElement.classList.add('gsap-ready');

        if (window.ScrollTrigger && !gsap.core.globals().ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }

        elements.forEach((el) => {
            const fromVars = {
                opacity: 0,
                duration: 0.7,
                ease: 'power2.out',
                clearProps: 'opacity,visibility,transform'
            };

            if (el.classList.contains('reveal-up') || el.classList.contains('reveal')) {
                fromVars.y = 24;
            }

            if (el.classList.contains('reveal-left')) {
                fromVars.x = -24;
            }

            if (el.classList.contains('reveal-right')) {
                fromVars.x = 24;
            }

            if (el.classList.contains('reveal-scale')) {
                fromVars.scale = 0.96;
            }

            if (window.ScrollTrigger) {
                fromVars.scrollTrigger = {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                    once: true
                };
            }

            gsap.from(el, fromVars);
        });
    }

    window.initRevealAnimations = initRevealAnimations;
})();