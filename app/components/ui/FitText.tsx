import {useEffect, useRef} from 'react';

/**
 * Texte qui occupe exactement toute la largeur de son conteneur
 * (le mot géant du hero, façon « ORGANIC » d'Organic Care).
 * - côté serveur : taille approximative en vw (pas de saut visible) ;
 * - côté navigateur : on mesure le texte et on ajuste la taille, puis on
 *   recalcule au redimensionnement et quand la police est chargée.
 */
export function FitText({
  children,
  as: Tag = 'span',
  className,
}: {
  children: string;
  as?: 'span' | 'p' | 'h1' | 'h2';
  className?: string;
}) {
  const boxRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;

    const fit = () => {
      const available = box.clientWidth;
      if (!available) return;
      // mesure à une taille de référence, puis règle de trois
      text.style.fontSize = '100px';
      const measured = text.getBoundingClientRect().width;
      if (!measured) return;
      let size = (100 * available) / measured;
      text.style.fontSize = `${size}px`;
      // 2e passe : le rendu n'est pas parfaitement proportionnel (crénage, arrondis)
      const second = text.getBoundingClientRect().width;
      if (second) size *= available / second;
      text.style.fontSize = `${Math.floor(size * 10) / 10}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    void document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, [children]);

  return (
    <Tag ref={boxRef as React.Ref<never>} className={['fit-text', className].filter(Boolean).join(' ')}>
      <span ref={textRef} className="fit-text__inner">
        {children}
      </span>
    </Tag>
  );
}
