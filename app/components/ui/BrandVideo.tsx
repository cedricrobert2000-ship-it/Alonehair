import {useEffect, useRef, useState} from 'react';
import type {HeroVideo} from '~/lib/hero';

/**
 * Vidéo d'ambiance (muette, en boucle, lecture inline).
 * - `muted` posé en JS : React ne l'écrit pas dans le HTML serveur, et sans
 *   lui les navigateurs bloquent la lecture automatique ;
 * - qualité adaptée à l'écran : 720p sur mobile, 1080p sur desktop ;
 * - pas de lecture automatique si « animations réduites » ;
 * - bouton Pause / Lecture (WCAG 2.2.2).
 */
export function BrandVideo({
  video,
  videoMobile,
  className,
  controlClassName = 'brand-video__toggle',
}: {
  video: HeroVideo;
  videoMobile?: HeroVideo | null;
  className?: string;
  controlClassName?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const best = (v: HeroVideo, maxHeight: number) =>
    [...v.sources].reverse().find((s) => s.height <= maxHeight) ?? v.sources[0];
  const desktop = best(video, 1080);
  const mobile = best(videoMobile ?? video, 720);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // charge la bonne qualité selon la largeur d'écran
    const wanted = window.matchMedia('(max-width: 767px)').matches ? mobile.url : desktop.url;
    if (el.currentSrc !== wanted) {
      el.src = wanted;
      el.load();
    }
    if (reduce) return;
    el.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [desktop.url, mobile.url]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setPlaying(true));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <video
        ref={ref}
        className={className}
        poster={(videoMobile ?? video).poster ?? video.poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className={`icon-btn ${controlClassName}`}
        aria-label={playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}
        onClick={toggle}
      >
        <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
      </button>
    </>
  );
}
