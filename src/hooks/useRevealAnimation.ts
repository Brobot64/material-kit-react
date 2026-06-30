import { useRef, useEffect } from 'react';

/**
 * Attach scroll-reveal animation to a section container.
 * All `.reveal` children animate in as they enter the viewport.
 * Elements already in view on page load animate immediately.
 */
export function useRevealAnimation(threshold = 0.08) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Signal to CSS that JS is active — enables the hide-before-animate rule
    document.body.classList.add('ready-to-animate');

    const container = ref.current;
    if (!container || typeof IntersectionObserver === 'undefined') {
      // Fallback: make everything visible immediately
      container?.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
      return undefined;
    }

    const items = Array.from(container.querySelectorAll('.reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = items.indexOf(entry.target as Element);
            setTimeout(() => entry.target.classList.add('visible'), idx * 90);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
