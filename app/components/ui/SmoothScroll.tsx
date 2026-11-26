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

    // Panneaux sombres (effet Pragma) : s'élargissent et perdent leurs coins
    // en entrant dans l'écran. --expand : 0 (entrée) → 1 (ouvert).
    const expand = () => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>('[data-expand]').forEach((el) => {
        const top = el.getBoundingClientRect().top;
        if (top > vh * 1.2) return el.style.setProperty('--expand', '0');
        const p = reduce ? 1 : Math.max(0, Math.min(1, (vh - top) / (vh * 0.7)));
        el.style.setProperty('--expand', p.toFixed(3));
      });
      // Texte qui se « remplit » mot à mot au défilement : --fill 0 → 1
      document.querySelectorAll<HTMLElement>('[data-fill]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
        el.style.setProperty('--fill', p.toFixed(3));
      });
    };

    let frame = 0;
    const loop = (time: number) => {
      lenis?.raf(time);
      parallax();
      expand();
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
