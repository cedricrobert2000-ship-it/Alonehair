import {Image} from '@shopify/hydrogen';
import {SiteImg} from '~/components/ui/SiteImg';
import type {SiteImage} from '~/lib/site-images';

type Quality = {handle: string; title: string; text?: string | null};
type Img = {url: string; altText?: string | null; width?: number | null; height?: number | null};

/**
 * Bloc « qualités » façon Organic Care : grand titre, phrase + mot en
 * italique, grande photo ovale, et les engagements (métaobjets home_promise)
 * en cartes posées autour de la photo. Sur mobile, les cartes passent dessous.
 */
export function Qualities({
  qualities,
  image,
  siteImage,
  text,
}: {
  qualities: Quality[];
  image?: Img | null;
  /** image du dossier public/images, prioritaire sur la photo Shopify */
  siteImage?: SiteImage | null;
  text?: string | null;
}) {
  if (!qualities.length) return null;
  return (
    <section className="qualities section" aria-labelledby="qualities-title">
      <div className="container qualities__inner">
        <div className="qualities__head" data-reveal>
          <h2 className="qualities__title" id="qualities-title">
            <span>Naturels, faits main,</span> <span>sur commande</span>
          </h2>
          <div className="qualities__sub">
            {text && <p>{text}</p>}
            <p className="qualities__accent">single donor.</p>
          </div>
        </div>

        <svg className="qualities__curve" viewBox="0 0 400 420" fill="none" aria-hidden="true">
          <path d="M2 12C190-8 395 40 398 210c2 120-60 190-110 205" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="qualities__stage">
          <div className="qualities__oval">
            {siteImage ? (
              <SiteImg image={siteImage} sizes="(min-width: 1024px) 70vw, 100vw" />
            ) : (
              image && <Image data={image} alt={image.altText ?? ''} sizes="(min-width: 1024px) 60vw, 100vw" loading="lazy" />
            )}
          </div>
          <ul className="qualities__cards" data-reveal-group>
            {qualities.slice(0, 4).map((q, i) => (
              <li key={q.handle} className={`quality quality--${i + 1}`}>
                <span className="quality__icon">
                  <QualityIcon handle={q.handle} />
                </span>
                <p className="quality__title">{q.title}</p>
                {q.text && <p className="quality__text">{q.text}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Pictogramme selon l'engagement (identifiant du métaobjet). */
function QualityIcon({handle}: {handle: string}) {
  const common = {width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, 'aria-hidden': true} as const;
  if (/livr/i.test(handle)) {
    return (
      <svg {...common}>
        <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" />
        <circle cx="6.5" cy="17" r="1.6" />
        <circle cx="17" cy="17" r="1.6" />
      </svg>
    );
  }
  if (/chang|retour/i.test(handle)) {
    return (
      <svg {...common}>
        <path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5" />
      </svg>
    );
  }
  if (/main|fait/i.test(handle)) {
    return (
      <svg {...common}>
        <path d="M12 3.5l2.4 5 5.4.7-4 3.7 1 5.4L12 15.7l-4.8 2.6 1-5.4-4-3.7 5.4-.7z" />
      </svg>
    );
  }
  if (/sav|contact|aide/i.test(handle)) {
    return (
      <svg {...common}>
        <path d="M4 5h16v11H9l-5 4z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}
