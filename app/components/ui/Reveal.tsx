import {useEffect} from 'react';
import {useLocation} from 'react-router';

/**
 * Apparitions au scroll (fondu + léger glissement vers le haut).
 *
 * Usage dans le JSX :
 *   <div data-reveal>…</div>           → l'élément apparaît
 *   <ul data-reveal-group>…</ul>       → ses enfants apparaissent en cascade
 *
 * Sans JS, ou avec prefers-reduced-motion, tout est visible immédiatement
 * (voir ui.css). Un seul IntersectionObserver pour toute la page.
 */
export function RevealObserver() {
  const location = useLocation();

  useEffect(() => {
    (window as Window & {__ahReveal?: boolean}).__ahReveal = true;

    if (!('IntersectionObserver' in window)) {
      document
        .querySelectorAll('[data-reveal],[data-reveal-group]')
        .forEach((el) => el.classList.add('is-inview'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-inview');
          observer.unobserve(entry.target);
        }
      },
      {rootMargin: '0px 0px -10% 0px', threshold: 0.01},
    );

    const scan = () => {
      document
        .querySelectorAll<HTMLElement>(
          '[data-reveal]:not(.is-inview),[data-reveal-group]:not(.is-inview)',
        )
        .forEach((el) => {
          if (el.hasAttribute('data-reveal-group')) {
            Array.from(el.children).forEach((child, i) =>
              (child as HTMLElement).style.setProperty('--i', String(i)),
            );
          }
          observer.observe(el);
        });
    };

    scan();
    // Les sections chargées en différé (Suspense) arrivent après le premier rendu.
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, {childList: true, subtree: true});

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [location.pathname]);

  return null;
}
