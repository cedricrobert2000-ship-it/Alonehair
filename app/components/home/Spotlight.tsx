import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Button} from '~/components/ui/Button';
import {formatPriceRange, summarizeLengths} from '~/lib/format';
import {findShade} from '~/lib/product';

type Img = {url: string; altText?: string | null; width?: number | null; height?: number | null};
type Money = {amount: string; currencyCode: string};

export type SpotlightProduct = {
  handle: string;
  title: string;
  descriptionHtml: string;
  images: {nodes: Img[]};
  priceRange: {minVariantPrice: Money; maxVariantPrice: Money};
  options: Array<{name: string; optionValues: Array<{name: string}>}>;
};

/**
 * « La pièce signature » : une perruque mise en scène en grand
 * (photo principale en parallaxe, deux vignettes, infos lues dans Shopify).
 */
export function Spotlight({product}: {product: SpotlightProduct | null | undefined}) {
  if (!product || !product.images.nodes.length) return null;
  const [main, ...rest] = product.images.nodes;
  const shade = findShade(product.descriptionHtml);
  const lengths = summarizeLengths(product.options);
  const url = `/products/${product.handle}`;
  const facts = product.options
    .filter((o) => !/longueur/i.test(o.name) && o.optionValues.length)
    .map((o) => ({name: o.name, value: o.optionValues.map((v) => v.name).join(' · ')}));

  return (
    <section className="spotlight section" aria-labelledby="spotlight-title">
      <div className="spotlight__inner container container--wide">
        <Link to={url} className="spotlight__main" prefetch="intent" tabIndex={-1} aria-hidden="true" data-reveal>
          <div className="spotlight__parallax" data-parallax="0.06">
            <Image data={main} alt="" sizes="(min-width: 1024px) 55vw, 100vw" loading="lazy" />
          </div>
        </Link>

        <div className="spotlight__info">
          <div className="spotlight__text" data-reveal>
            <p className="eyebrow">La pièce signature</p>
            <h2 className="spotlight__title" id="spotlight-title">
              <Link to={url} prefetch="intent">
                {product.title}
              </Link>
            </h2>
            {shade && <p className="spotlight__shade accent">{shade}</p>}
            <dl className="spotlight__facts">
              {facts.map((f) => (
                <div key={f.name}>
                  <dt>{f.name}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
              {lengths && (
                <div>
                  <dt>Longueur</dt>
                  <dd>{lengths}</dd>
                </div>
              )}
            </dl>
            <p className="spotlight__price">{formatPriceRange(product.priceRange)}</p>
            <Button to={url}>Découvrir la perruque</Button>
          </div>

          {rest.length > 0 && (
            <div className="spotlight__thumbs" data-reveal-group>
              {rest.slice(0, 2).map((im) => (
                <Link key={im.url} to={url} prefetch="intent" tabIndex={-1} aria-hidden="true" className="spotlight__thumb">
                  <Image data={im} alt="" aspectRatio="3/4" sizes="(min-width: 1024px) 14vw, 40vw" loading="lazy" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
