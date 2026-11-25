import {useCallback, useEffect, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';

export type GalleryMedia = {
  id: string;
  kind: 'image' | 'video';
  alt: string;
  image?: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
  poster?: string | null;
  sources?: Array<{url: string; mimeType: string}>;
};

/**
 * Galerie produit : un seul rail à défilement « snap ».
 * - mobile : on swipe, des points indiquent la position ;
 * - desktop : vignettes (en haut à gauche, comme la référence) + flèches ;
 * - quand la cliente choisit une variante, la galerie va à sa photo.
 */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex --
   le rail de photos est une zone défilante : il doit être focusable et piloté aux flèches (WCAG 2.1.1). */
export function ProductGallery({media, activeUrl, title}: {media: GalleryMedia[]; activeUrl?: string | null; title: string}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number, smooth = true) => {
    const el = track.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(media.length - 1, i));
    el.scrollTo({left: clamped * el.clientWidth, behavior: smooth ? 'smooth' : 'auto'});
  }, [media.length]);

  // Suit le défilement (swipe) pour mettre à jour la position
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))));
    };
    el.addEventListener('scroll', onScroll, {passive: true});
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Variante choisie → sa photo
  useEffect(() => {
    if (!activeUrl) return;
    const clean = (u: string) => u.split('?')[0];
    const i = media.findIndex((m) => m.image && clean(m.image.url) === clean(activeUrl));
    if (i >= 0) goTo(i);
  }, [activeUrl, media, goTo]);

  if (!media.length) return <div className="gallery gallery--empty" />;

  return (
    <div className="gallery" aria-roledescription="carrousel" aria-label={`Photos de ${title}`}>
      {/* Zone défilante focusable : flèches du clavier (WCAG 2.1.1, « scrollable region ») */}
      <div
        ref={track}
        className="gallery__track"
        role="region"
        tabIndex={0}
        aria-label="Faire défiler les photos avec les flèches du clavier"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            goTo(index + 1);
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(index - 1);
          }
        }}
      >
        {media.map((m, i) => (
          <div
            key={m.id}
            className="gallery__slide"
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${i + 1} sur ${media.length}`}
          >
            {m.kind === 'video' && m.sources?.length ? (
              <video
                className="gallery__media"
                poster={m.poster ?? undefined}
                muted
                playsInline
                loop
                controls
                preload="none"
                aria-label={m.alt}
              >
                {m.sources.map((s) => (
                  <source key={s.url} src={s.url} type={s.mimeType} />
                ))}
              </video>
            ) : m.image ? (
              <Image
                className="gallery__media"
                data={m.image}
                alt={m.alt}
                aspectRatio="3/4"
                sizes="(min-width: 1024px) 55vw, 100vw"
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : undefined}
              />
            ) : null}
          </div>
        ))}
      </div>

      {media.length > 1 && (
        <>
          <div className="gallery__thumbs" aria-label="Choisir une photo">
            {media.map((m, i) => (
              <button
                key={m.id}
                type="button"
                className={`gallery__thumb${i === index ? ' is-current' : ''}`}
                aria-label={`Afficher ${m.kind === 'video' ? 'la vidéo' : 'la photo'} ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => goTo(i)}
              >
                {(m.image || m.poster) && (
                  <Image
                    data={m.image ?? {url: m.poster!, width: 200, height: 266}}
                    alt=""
                    aspectRatio="3/4"
                    width={56}
                    sizes="56px"
                    loading="lazy"
                  />
                )}
                {m.kind === 'video' && <span className="gallery__play" aria-hidden="true">▶</span>}
              </button>
            ))}
          </div>
          <div className="gallery__arrows">
            <button type="button" className="icon-btn" aria-label="Photo précédente" disabled={index === 0} onClick={() => goTo(index - 1)}>
              ←
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Photo suivante"
              disabled={index === media.length - 1}
              onClick={() => goTo(index + 1)}
            >
              →
            </button>
          </div>
          <div className="gallery__dots" aria-hidden="true">
            {media.map((m, i) => (
              <span key={m.id} className={i === index ? 'is-current' : ''} />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Photo {index + 1} sur {media.length}
          </p>
        </>
      )}
    </div>
  );
}
/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
