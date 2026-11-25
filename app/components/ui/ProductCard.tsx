import {useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {formatMoney, formatPriceRange, summarizeLengths} from '~/lib/format';

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCardMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductCard on Product {
    id
    handle
    title
    productType
    availableForSale
    images(first: 4) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        ...ProductCardMoney
      }
      maxVariantPrice {
        ...ProductCardMoney
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...ProductCardMoney
      }
    }
    options(first: 5) {
      name
      optionValues {
        name
      }
    }
  }
` as const;

type Money = {amount: string; currencyCode: string};
type CardImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type ProductCardData = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  availableForSale: boolean;
  images: {nodes: CardImage[]};
  priceRange: {minVariantPrice: Money; maxVariantPrice: Money};
  compareAtPriceRange: {minVariantPrice: Money};
  options: Array<{name: string; optionValues: Array<{name: string}>}>;
};

/**
 * Carte produit — portrait 3:4, deuxième photo au survol, vignettes
 * (desktop) qui changent la photo principale, comme sur Veloraskin.
 */
export function ProductCard({
  product,
  badges = [],
  loading = 'lazy',
  sizes = '(min-width: 1024px) 25vw, 50vw',
}: {
  product: ProductCardData;
  /** Étiquettes affichées en haut à gauche (« Best-seller »…). */
  badges?: string[];
  loading?: 'eager' | 'lazy';
  sizes?: string;
}) {
  const images = product.images.nodes;
  const [active, setActive] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const url = `/products/${product.handle}`;

  const lengths = summarizeLengths(product.options);
  const meta = lengths ?? product.productType;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const hasCompareAt =
    Number(compareAt.amount) > Number(product.priceRange.minVariantPrice.amount);

  const show = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  return (
    <article
      className={`pcard${active !== null ? ' is-picking' : ''}`}
      onMouseLeave={() => setActive(null)}
    >
      <div className="pcard__media">
        <Link to={url} prefetch="intent" tabIndex={-1} aria-hidden="true">
          {images.map((image, i) => {
            // Photos 3 et 4 : chargées seulement si la cliente survole les vignettes
            if (i > 1 && !touched) return null;
            const state =
              active === null
                ? i === 0
                  ? 'is-base'
                  : i === 1
                    ? 'is-alt'
                    : ''
                : i === active
                  ? 'is-active'
                  : '';
            return (
              <Image
                key={image.id ?? image.url}
                className={`pcard__img ${state}`}
                data={image}
                alt={image.altText || product.title}
                aspectRatio="3/4"
                sizes={sizes}
                loading={i === 0 ? loading : 'lazy'}
              />
            );
          })}
          {!images.length && <span className="pcard__placeholder" />}
        </Link>

        {(badges.length > 0 || !product.availableForSale) && (
          <div className="pcard__badges">
            {!product.availableForSale && (
              <span className="badge badge--dark">Épuisé</span>
            )}
            {badges.map((b) => (
              <span key={b} className="badge">
                {b}
              </span>
            ))}
          </div>
        )}

        {images.length > 1 && (
          <div className="pcard__thumbs" role="group" aria-label="Photos">
            {images.slice(0, 3).map((image, i) => (
              <button
                key={image.id ?? image.url}
                type="button"
                className={`pcard__thumb${(active ?? 0) === i ? ' is-current' : ''}`}
                aria-label={`Voir la photo ${i + 1} de ${product.title}`}
                onMouseEnter={() => show(i)}
                onFocus={() => show(i)}
                onClick={() => show(i)}
              >
                <Image
                  data={image}
                  alt=""
                  aspectRatio="1/1"
                  width={48}
                  sizes="48px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pcard__info">
        <h3 className="pcard__title">
          <Link to={url} prefetch="intent">
            {product.title}
          </Link>
        </h3>
        <p className="pcard__price">
          {hasCompareAt && <s>{formatMoney(compareAt)}</s>}
          <span>{formatPriceRange(product.priceRange)}</span>
        </p>
        {meta && <p className="pcard__meta">{meta}</p>}
      </div>
    </article>
  );
}

/** Carte vide animée, le temps que les produits arrivent (Suspense). */
export function ProductCardSkeleton() {
  return (
    <div className="pcard is-skeleton" aria-hidden="true">
      <div className="pcard__media" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line--short" />
    </div>
  );
}
