import {useEffect, useRef, useState} from 'react';
import {ProductCard, type ProductCardData} from './ProductCard';

/**
 * Carrousel horizontal de cartes produit.
 * - doigt : défilement natif avec aimantation (scroll-snap) ;
 * - souris : glisser-déposer, flèches, barre de progression ;
 * - clavier : les cartes restent des liens tabulables, flèches ← → dans le rail.
 */
export function ProductCarousel({products, label}: {products: ProductCardData[]; label: string}) {
  const track = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({start: true, end: false});

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
      setEdges({start: el.scrollLeft < 4, end: el.scrollLeft > max - 4});
    };
    update();
    el.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);

    // glisser à la souris (le tactile garde le défilement natif)
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.classList.add('is-dragging');
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      down = false;
      el.classList.remove('is-dragging');
    };
    // un glisser ne doit pas ouvrir la fiche produit
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('click', onClick, true);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('click', onClick, true);
    };
  }, []);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({left: dir * el.clientWidth * 0.8, behavior: 'smooth'});
  };

  if (!products.length) return null;

  return (
    <div className="carousel" role="region" aria-label={label}>
      <ul ref={track} className="carousel__track" data-reveal-group>
        {products.map((p, i) => (
          <li key={p.id} className="carousel__item">
            <ProductCard product={p} loading={i < 4 ? 'eager' : 'lazy'} sizes="(min-width: 1024px) 24vw, 70vw" />
          </li>
        ))}
      </ul>
      <div className="carousel__controls">
        <div className="carousel__progress" aria-hidden="true">
          <span style={{transform: `scaleX(${Math.max(0.08, progress)})`}} />
        </div>
        <div className="carousel__arrows">
          <button type="button" className="icon-btn carousel__arrow" aria-label="Produits précédents" disabled={edges.start} onClick={() => page(-1)}>
            ←
          </button>
          <button type="button" className="icon-btn carousel__arrow" aria-label="Produits suivants" disabled={edges.end} onClick={() => page(1)}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}
