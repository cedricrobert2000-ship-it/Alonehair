import {useEffect} from 'react';
import {useLocation} from 'react-router';
import Lenis from 'lenis';

/**
 * Défilement fluide (Lenis) + parallaxe légère des éléments [data-parallax].
 * - à la souris et au pavé tactile uniquement : sur téléphone, le défilement
 *   natif est conservé (déjà fluide, et plus fiable dans Instagram/TikTok) ;
 * - coupé si « animations réduites » ;
 * - mis en pause quand un tiroir bloque la page (classe html.is-locked).
 *
 * Parallaxe : <div data-parallax="0.12"> décale l'élément de ±12 % de sa
 * hauteur selon sa position dans l'écran.
 */
export function SmoothScroll() {
  const {pathname} = useLocation();

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const html = document.documentElement;

    const lenis = reduce ? null : new Lenis({lerp: 0.09, smoothWheel: true, syncTouch: false});

    // Tiroir ouvert → défilement de la page en pause
    const locker = new MutationObserver(() => {
      if (!lenis) return;
      if (html.classList.contains('is-locked')) lenis.stop();
      else lenis.start();
    });
    locker.observe(html, {attributes: true, attributeFilter: ['class']});

    const parallax = () => {
      if (reduce) return;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -vh || rect.top > vh * 2) return;
        // -1 (élément sous l'écran) → 1 (au-dessus)
        const raw = (vh / 2 - (rect.top + rect.height / 2)) / (vh / 2 + rect.height / 2);
        // borné : l'image (agrandie à 115 %) ne laisse jamais voir le fond
        const progress = Math.max(-1, Math.min(1, raw));
        const amount = Number(el.dataset.parallax) || 0.1;
        el.style.setProperty('--parallax', `${(progress * amount * 100).toFixed(2)}%`);
      });
    };

    let frame = 0;
    const loop = (time: number) => {
      lenis?.raf(time);
      parallax();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      locker.disconnect();
      lenis?.destroy();
    };
  }, []);

  // Nouvelle page : Lenis recalcule la hauteur du document
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [pathname]);

  return null;
}
