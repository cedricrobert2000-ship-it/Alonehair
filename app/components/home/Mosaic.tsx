import {ProductCard, type ProductCardData} from '~/components/ui/ProductCard';
import {TextLink} from '~/components/ui/TextLink';

/**
 * Mosaïque d'une collection : texte + une grande carte et deux petites
 * (ex. perruques indétectables 13×6). Titre et texte viennent de Shopify.
 */
export function Mosaic({
  handle,
  title,
  description,
  products,
}: {
  handle: string;
  title: string;
  description?: string | null;
  products: ProductCardData[];
}) {
  if (products.length < 2) return null;
  return (
    <section className="mosaic section" aria-labelledby="mosaic-title">
      <div className="mosaic__inner container container--wide">
        <div className="mosaic__text" data-reveal>
          <p className="eyebrow">Collection</p>
          <h2 className="mosaic__title" id="mosaic-title">
            {title}
          </h2>
          {description && <p className="text-soft">{description}</p>}
          <TextLink to={`/collections/${handle}`}>Voir la collection</TextLink>
        </div>
        <ul className={`mosaic__grid mosaic__grid--${Math.min(products.length, 3)}`} data-reveal-group>
          {products.slice(0, 3).map((p, i) => (
            <li key={p.id} className={i === 0 ? 'mosaic__big' : undefined}>
              <ProductCard product={p} sizes={i === 0 ? '(min-width: 1024px) 40vw, 100vw' : '(min-width: 1024px) 20vw, 50vw'} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
