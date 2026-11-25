import {useEffect, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {TextLink} from './TextLink';

type BannerImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Grande bannière photo/vidéo avec encart blanc en bas à gauche (hero).
 * - vidéo muette, en boucle, en lecture inline ; bouton Pause/Lecture
 *   (obligatoire au-delà de 5 s d'animation, WCAG 2.2.2) ;
 * - si le téléphone demande moins d'animations, la vidéo ne démarre pas seule ;
 * - l'image/la vidéo est chargée en priorité (LCP).
 */
export function Banner({
  eyebrow,
  title,
  cta,
  image,
  video,
  veil = true,
  animated = true,
  as: Heading = 'h1',
}: {
  eyebrow?: string;
  title: string;
  cta?: {label: string; to: string};
  image?: BannerImage | null;
  video?: {url: string; poster?: string} | null;
  veil?: boolean;
  animated?: boolean;
  as?: 'h1' | 'h2' | 'p';
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      className={['banner', !veil && 'banner--plain', animated && 'is-animated']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="banner__media">
        {video ? (
          <video
            ref={videoRef}
            src={video.url}
            poster={video.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        ) : image ? (
          <Image
            data={image}
            alt={image.altText ?? ''}
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
          />
        ) : null}
      </div>

      {video && (
        <button
          type="button"
          className="icon-btn banner__pause"
          aria-label={playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}
          onClick={toggle}
        >
          <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
        </button>
      )}

      <div className="banner__box">
        <div className="banner__titles">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <Heading className="h2">{title}</Heading>
        </div>
        {cta && <TextLink to={cta.to}>{cta.label}</TextLink>}
      </div>
    </div>
  );
}
