import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {FooterQuery} from 'storefrontapi.generated';
import {SITE_IMAGES, type SiteImage} from '~/lib/site-images';
import {SiteImg} from '~/components/ui/SiteImg';

const INSTAGRAM = 'https://www.instagram.com/alone_hair';

type Item =
  | {kind: 'product'; key: string; handle: string; title: string; image: NonNullable<FooterProduct['featuredImage']>}
  | {kind: 'site'; key: string; image: SiteImage};
type FooterProduct = NonNullable<FooterQuery['strip']>['products']['nodes'][number];

/**
 * « Suivez-nous @alone_hair » : bande de photos qui défile en continu,
 * affichée au-dessus du pied de page sur toutes les pages.
 * Photos : images d'ambiance du dépôt + photos des perruques (Shopify).
 */
export function FollowInstagram({footer}: {footer: Promise<FooterQuery | null>}) {
  return (
    <section className="follow" aria-labelledby="follow-title">
      <div className="container follow__head" data-reveal>
        <h2 className="follow__title" id="follow-title">
          <span>Suivez-nous</span>
          <a className="accent" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
            @alone_hair<span className="sr-only"> sur Instagram (nouvel onglet)</span>
          </a>
        </h2>
      </div>
      <Suspense fallback={<div className="marquee marquee--placeholder" />}>
        <Await resolve={footer} errorElement={null}>
          {(data) => <Strip products={data?.strip?.products.nodes ?? []} />}
        </Await>
      </Suspense>
    </section>
  );
}

function Strip({products}: {products: FooterProduct[]}) {
  const site = [SITE_IMAGES.heroHome, SITE_IMAGES.instagram, SITE_IMAGES.qualities].filter(
    (i): i is SiteImage => Boolean(i),
  );
  const fromShop: Item[] = products.flatMap((p) =>
    p.featuredImage ? [{kind: 'product' as const, key: p.handle, handle: p.handle, title: p.title, image: p.featuredImage}] : [],
  );
  // une photo d'ambiance toutes les 3 photos produit
  const items: Item[] = [];
  fromShop.forEach((it, i) => {
    if (i % 3 === 1 && site[Math.floor(i / 3)]) {
      const s = site[Math.floor(i / 3)]!;
      items.push({kind: 'site', key: s.src, image: s});
    }
    items.push(it);
  });
  if (!items.length) site.forEach((s) => items.push({kind: 'site', key: s.src, image: s}));
  if (!items.length) return null;

  // la liste est doublée pour une boucle sans à-coup ; la copie est masquée aux lecteurs d'écran
  return (
    <div className="marquee">
      <ul className="marquee__track">
        {[...items, ...items].map((it, i) => {
          const copy = i >= items.length;
          return (
            <li key={`${it.key}-${i}`} className={`marquee__item${i % 2 ? ' is-low' : ''}`} aria-hidden={copy || undefined}>
              {it.kind === 'product' ? (
                <Link to={`/products/${it.handle}`} prefetch="intent" tabIndex={copy ? -1 : undefined}>
                  <Image data={it.image} alt={it.title} aspectRatio="3/4" width={220} sizes="220px" loading="lazy" />
                </Link>
              ) : (
                <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" tabIndex={copy ? -1 : undefined}>
                  <SiteImg image={it.image} sizes="220px" className="marquee__site" />
                  <span className="sr-only">Alone Hair sur Instagram (nouvel onglet)</span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
