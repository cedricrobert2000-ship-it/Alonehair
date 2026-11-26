import {Image} from '@shopify/hydrogen';
import {DarkPanel, FillText} from '~/components/ui/DarkPanel';

/**
 * Blocs des pages de contenu, façon Organic Care /services :
 * - PageIntro : titre géant, chapeau, bande de photos qui défile ;
 * - StackCards : cartes empilées qui se superposent au défilement ;
 * - Manifesto : panneau noir profond (Pragma) avec texte qui se remplit.
 */

export type ContentImage = {url: string; width: number; height: number; altText: string};

export function PageIntro({
  title,
  lead,
  aside,
  images,
}: {
  title: string;
  lead: string;
  aside?: string;
  images?: ContentImage[];
}) {
  return (
    <header className="page-intro">
      <div className="container page-intro__head" data-reveal>
        <h1 className="page-intro__title">{title}</h1>
        <p className="page-intro__lead">{lead}</p>
      </div>
      {images && images.length > 0 && (
        <div className="page-intro__strip" aria-hidden="true">
          <div className="page-intro__track">
            {[...images, ...images].map((im, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={`${im.url}-${i}`} className="page-intro__img">
                <Image data={im} alt="" aspectRatio="4/5" sizes="(min-width: 1024px) 18vw, 45vw" loading={i < 4 ? 'eager' : 'lazy'} />
              </div>
            ))}
          </div>
        </div>
      )}
      {aside && (
        <div className="container page-intro__aside" data-reveal>
          <p>{aside}</p>
        </div>
      )}
    </header>
  );
}

export type StackCard = {
  /** titre en capitales, puis un mot en italique */
  title: string;
  accent: string;
  intro?: string;
  points?: string[];
  image?: ContentImage;
  number?: string;
};

export function StackCards({heading, cards}: {heading?: string; cards: StackCard[]}) {
  return (
    <section className="stack" aria-label={heading}>
      {heading && (
        <div className="container stack__head" data-reveal>
          <h2 className="stack__heading">{heading}</h2>
        </div>
      )}
      <ol className="container stack__list">
        {cards.map((c, i) => (
          <li key={c.title} className="stack__card" style={{'--i': i} as React.CSSProperties}>
            <div className="stack__text">
              {c.number && <p className="stack__num">{c.number}</p>}
              <h3 className="stack__title">
                <span>{c.title}</span> <span className="accent">{c.accent}</span>
              </h3>
              {c.intro && <p className="stack__intro">{c.intro}</p>}
              {c.points && c.points.length > 0 && (
                <ul className="stack__points">
                  {c.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
            </div>
            {c.image && (
              <div className="stack__media">
                <Image data={c.image} alt={c.image.altText} aspectRatio="4/5" sizes="(min-width: 1024px) 30vw, 100vw" loading="lazy" />
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Manifesto({
  eyebrow,
  text,
  signature,
  children,
  variant = 'dark',
}: {
  eyebrow?: string;
  text: string;
  signature?: string;
  children?: React.ReactNode;
  /** dark : panneau noir qui s'ouvre (accueil) ; light : bloc clair, citation en italique */
  variant?: 'dark' | 'light';
}) {
  if (variant === 'light') {
    return (
      <section className="quote-band" aria-label={eyebrow}>
        <div className="container">
          <div className="quote-band__inner" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <p className="quote-band__text accent">{text}</p>
            {signature && <p className="quote-band__sign">{signature}</p>}
            {children}
          </div>
        </div>
      </section>
    );
  }
  return (
    <DarkPanel className="manifesto">
      <div className="container manifesto__inner">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <FillText text={text} className="manifesto__text" />
        {signature && <p className="manifesto__sign">{signature}</p>}
        {children}
      </div>
    </DarkPanel>
  );
}
