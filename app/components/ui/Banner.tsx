import {Image} from '@shopify/hydrogen';
import {TextLink} from './TextLink';
import {BrandVideo} from './BrandVideo';
import type {HeroVideo} from '~/lib/hero';

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
  video?: HeroVideo | null;
  veil?: boolean;
  animated?: boolean;
  as?: 'h1' | 'h2' | 'p';
}) {
  return (
    <div
      className={['banner', !veil && 'banner--plain', animated && 'is-animated']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="banner__media">
        {video ? (
          <BrandVideo video={video} controlClassName="banner__pause" />
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
