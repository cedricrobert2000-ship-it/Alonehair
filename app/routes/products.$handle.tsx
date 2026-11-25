import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  Analytics,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  getSelectedProductOptions,
  useOptimisticVariant,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  Accordion,
  Badge,
  Checkbox,
  Drawer,
  PRODUCT_CARD_FRAGMENT,
  ProductCard,
  ProductCardSkeleton,
  Section,
  SectionHead,
  VariantOptions,
  type ProductCardData,
} from '~/components/ui';
import {ProductGallery, type GalleryMedia} from '~/components/product/ProductGallery';
import {AddToCart} from '~/components/product/AddToCart';
import {formatMoney} from '~/lib/format';
import {findShade, sectionByTitle, splitDescription, tiktokId} from '~/lib/product';
import {breadcrumbLd, seoMeta, stripHtml} from '~/lib/seo';

/** Produit non listé ajouté au panier quand la cliente coche « Layers ». */
const LAYERS_HANDLE = 'option-layers';
/** Collections « techniques » à ne pas utiliser dans le fil d'Ariane. */
const SKIP_BREADCRUMB = ['best-sellers', 'nos-wigs', 'all'];

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Alone Hair'}];
  const {product, canonical, origin, crumbs} = data;
  const v = product.selectedOrFirstAvailableVariant;
  const image = product.media.nodes.find((m) => m.__typename === 'MediaImage');
  return seoMeta({
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    url: canonical,
    type: 'product',
    image: image?.__typename === 'MediaImage' ? image.image : null,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: stripHtml(product.description).slice(0, 500),
        brand: {'@type': 'Brand', name: product.vendor || 'Alone Hair'},
        image: product.media.nodes.flatMap((m) => (m.__typename === 'MediaImage' && m.image ? [m.image.url] : [])),
        sku: v?.sku || undefined,
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: product.priceRange.minVariantPrice.currencyCode,
          lowPrice: product.priceRange.minVariantPrice.amount,
          highPrice: product.priceRange.maxVariantPrice.amount,
          availability: product.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: canonical,
        },
      },
      breadcrumbLd(origin, crumbs),
    ],
  });
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw new Error('Expected product handle to be defined');

  const {product, layers, entretien, promises, shop} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, layersHandle: LAYERS_HANDLE, selectedOptions: getSelectedProductOptions(request)},
  });
  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});

  const origin = new URL(request.url).origin;
  const collection = product.collections.nodes.find((c) => !SKIP_BREADCRUMB.includes(c.handle));
  const crumbs = [
    {name: 'Accueil', path: '/'},
    ...(collection ? [{name: collection.title, path: `/collections/${collection.handle}`}] : []),
    {name: product.title, path: `/products/${product.handle}`},
  ];

  return {
    product,
    layers: layers?.variants.nodes[0] ?? null,
    entretienHtml: entretien?.body ?? '',
    promises: promises.nodes,
    shop,
    crumbs,
    origin,
    canonical: `${origin}/products/${product.handle}`,
  };
}

function loadDeferredData({context, params}: Route.LoaderArgs) {
  const recommended = context.storefront
    .query(RECOMMENDED_QUERY, {variables: {handle: params.handle!}})
    .then((r) => (r.productRecommendations ?? []).slice(0, 4) as ProductCardData[])
    .catch(() => [] as ProductCardData[]);
  return {recommended};
}

export default function Product() {
  const {product, layers, entretienHtml, promises, shop, crumbs, recommended} = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);
  const productOptions = getProductOptions({...product, selectedOrFirstAvailableVariant: selectedVariant});

  const sections = splitDescription(product.descriptionHtml);
  const intro = sections.find((s) => !s.title);
  const brief = sectionByTitle(sections, /bref/i);
  const exchanges = sectionByTitle(sections, /échange|echange|retour/i);
  const others = sections.filter((s) => s.title && s !== brief && s !== exchanges);
  const shade = findShade(product.descriptionHtml);

  const isWig = /perruque/i.test(product.productType) || /perruque/i.test(product.title);
  const hasCapOption = product.options.some((o) => /bonnet/i.test(o.name));
  const [withLayers, setWithLayers] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const available = Boolean(selectedVariant?.availableForSale);
  const price = selectedVariant?.price;
  const compareAt =
    selectedVariant?.compareAtPrice && Number(selectedVariant.compareAtPrice.amount) > Number(price?.amount)
      ? selectedVariant.compareAtPrice
      : null;
  const showLayers = isWig && layers?.availableForSale;

  const lines = selectedVariant
    ? [
        {merchandiseId: selectedVariant.id, quantity: 1, selectedVariant},
        ...(showLayers && withLayers && layers ? [{merchandiseId: layers.id, quantity: 1}] : []),
      ]
    : [];

  const media: GalleryMedia[] = product.media.nodes.flatMap((m): GalleryMedia[] => {
    if (m.__typename === 'MediaImage' && m.image) {
      return [{id: m.id, kind: 'image', alt: m.alt || product.title, image: m.image}];
    }
    if (m.__typename === 'Video') {
      return [{id: m.id, kind: 'video', alt: m.alt || `Vidéo ${product.title}`, poster: m.previewImage?.url, sources: m.sources}];
    }
    return [];
  });

  // Barre d'achat collée en bas d'écran sur mobile, quand le bouton principal n'est plus visible
  const buyRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = buyRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const buyLabel = available ? 'Ajouter au panier' : 'Épuisé';
  const analytics = {
    products: [
      {
        productGid: product.id,
        variantGid: selectedVariant?.id,
        name: product.title,
        variantName: selectedVariant?.title,
        brand: product.vendor,
        price: price?.amount,
        quantity: 1,
      },
    ],
  };
  const tiktok = tiktokId(product.tiktokUrl?.value);
  const policyLinks = [shop.shippingPolicy, shop.refundPolicy].filter(Boolean);

  return (
    <div className="pdp">
      <div className="pdp__main container container--wide">
        <ProductGallery media={media} activeUrl={selectedVariant?.image?.url} title={product.title} />

        <div className="pdp__info">
          <nav className="breadcrumb" aria-label="Fil d'Ariane">
            <ol>
              {crumbs.map((c, i) => (
                <li key={c.path}>
                  {i < crumbs.length - 1 ? <Link to={c.path}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
                </li>
              ))}
            </ol>
          </nav>

          <div className="pdp__head">
            <h1 className="h3 pdp__title">{product.title}</h1>
            {shade && <p className="text-soft pdp__shade">{shade}</p>}
            <p className="pdp__price" aria-live="polite">
              {compareAt && <s>{formatMoney(compareAt)}</s>}
              <span>{formatMoney(price)}</span>
              {!available && <Badge dark>Épuisé</Badge>}
            </p>
          </div>

          <VariantOptions options={productOptions} />

          {isWig && (
            <div className="pdp__cap">
              {!hasCapOption && <p className="text-sm">Bonnet M unique, réglable du S au L.</p>}
              <button type="button" className="pdp__guide" aria-haspopup="dialog" onClick={() => setGuideOpen(true)}>
                Guide des tailles de bonnet <span aria-hidden="true">›</span>
              </button>
            </div>
          )}

          {showLayers && layers && (
            <Checkbox
              label="Ajouter des layers"
              extra={`+ ${formatMoney(layers.price)}`}
              checked={withLayers}
              onChange={(e) => setWithLayers(e.target.checked)}
            />
          )}

          <div ref={buyRef} className="pdp__buy">
            <AddToCart lines={lines} disabled={!available} label={buyLabel} analytics={analytics} />
            <p className="pdp__made text-sm">
              <span aria-hidden="true">—</span> Faite main, sur commande.
            </p>
          </div>

          <div className="pdp__tabs">
            {intro && (
              <Accordion title="Description" defaultOpen group="pdp">
                <div className="prose rte" dangerouslySetInnerHTML={{__html: intro.html}} />
              </Accordion>
            )}
            {(brief || product.options.length > 0) && (
              <Accordion title="Caractéristiques" group="pdp">
                {brief ? (
                  <div className="prose rte" dangerouslySetInnerHTML={{__html: brief.html}} />
                ) : (
                  <ul className="specs">
                    {product.options.map((o) => (
                      <li key={o.name}>
                        <strong>{o.name}</strong> : {o.optionValues.map((v) => v.name).join(', ')}
                      </li>
                    ))}
                  </ul>
                )}
              </Accordion>
            )}
            {others.map((s) => (
              <Accordion key={s.title} title={s.title!} group="pdp">
                <div className="prose rte" dangerouslySetInnerHTML={{__html: s.html}} />
              </Accordion>
            ))}
            {stripHtml(entretienHtml) && (
              <Accordion title="Entretien" group="pdp">
                <div className="prose rte" dangerouslySetInnerHTML={{__html: entretienHtml}} />
              </Accordion>
            )}
            <Accordion title="Livraison et échanges" group="pdp">
              <ShippingAndReturns promises={promises} exchangesHtml={exchanges?.html} policies={policyLinks} />
            </Accordion>
          </div>
        </div>
      </div>

      {showSticky && (
        <div className="pdp-sticky" role="region" aria-label="Ajout rapide au panier">
          <div className="pdp-sticky__info">
            <span className="pdp-sticky__title">{product.title}</span>
            <span>{formatMoney(price)}</span>
          </div>
          <AddToCart lines={lines} disabled={!available} label={available ? 'Ajouter' : 'Épuisé'} analytics={analytics} />
        </div>
      )}

      <Promises promises={promises} />

      {tiktok && <TikTok id={tiktok} views={product.tiktokViews?.value} title={product.title} poster={media[0]?.image?.url} url={product.tiktokUrl!.value} />}

      <Suspense
        fallback={
          <Section wide>
            <SectionHead title="Vous aimerez aussi" reveal={false} />
            <div className="product-grid">
              {[0, 1, 2, 3].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </Section>
        }
      >
        <Await resolve={recommended} errorElement={null}>
          {(products) =>
            products.length ? (
              <Section wide>
                <SectionHead title="Vous aimerez aussi" />
                <ul className="product-grid" data-reveal-group>
                  {products.map((p) => (
                    <li key={p.id}>
                      <ProductCard product={p} />
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null
          }
        </Await>
      </Suspense>

      <Drawer open={guideOpen} onClose={() => setGuideOpen(false)} title="Guide des tailles de bonnet">
        <div className="prose">
          {hasCapOption ? (
            <p>
              Cette perruque existe en plusieurs tailles de bonnet (
              {product.options.find((o) => /bonnet/i.test(o.name))?.optionValues.map((v) => v.name).join(', ')}
              ). Choisissez la vôtre ci-dessus.
            </p>
          ) : (
            <p>Nos perruques ont un bonnet M unique, réglable : il convient d&apos;un tour de tête S à L.</p>
          )}
          <p>
            Un doute sur votre taille ? Écrivez-nous, nous vous aidons à choisir avant la fabrication.
          </p>
          <p>
            <Link className="link" to="/pages/contact" onClick={() => setGuideOpen(false)}>
              Nous contacter
            </Link>
          </p>
        </div>
      </Drawer>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

type PromiseNode = {fields: Array<{key: string; value?: string | null}>};

function promiseList(promises: PromiseNode[]) {
  return promises
    .map((p) => ({
      title: p.fields.find((f) => f.key === 'title')?.value,
      text: p.fields.find((f) => f.key === 'text')?.value,
    }))
    .filter((p) => p.title);
}

function ShippingAndReturns({
  promises,
  exchangesHtml,
  policies,
}: {
  promises: PromiseNode[];
  exchangesHtml?: string;
  policies: Array<{handle: string; title: string} | null | undefined>;
}) {
  const list = promiseList(promises);
  return (
    <div className="prose">
      {list.length > 0 && (
        <ul className="specs">
          {list.map((p) => (
            <li key={p.title}>
              <strong>{p.title}</strong>
              {p.text ? ` — ${p.text}` : ''}
            </li>
          ))}
        </ul>
      )}
      {exchangesHtml && <div className="rte" dangerouslySetInnerHTML={{__html: exchangesHtml}} />}
      {policies.length > 0 && (
        <p>
          {policies.map((p, i) => (
            <span key={p!.handle}>
              {i > 0 && ' · '}
              <Link className="inline-link" to={`/policies/${p!.handle}`}>
                {p!.title}
              </Link>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

function Promises({promises}: {promises: PromiseNode[]}) {
  const list = promiseList(promises);
  if (!list.length) return null;
  return (
    <section className="promises section--sm" aria-label="Nos engagements">
      <ul className="container promises__list" data-reveal-group>
        {list.map((p) => (
          <li key={p.title}>
            <p className="h4">{p.title}</p>
            {p.text && <p className="text-soft">{p.text}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Vidéo TikTok : on ne charge le lecteur TikTok qu'au clic
 * (performance mobile et aucun cookie tiers avant l'action de la cliente).
 */
function TikTok({id, views, title, poster, url}: {id: string; views?: string | null; title: string; poster?: string; url: string}) {
  const [play, setPlay] = useState(false);
  return (
    <Section className="pdp-tiktok">
      <div className="pdp-tiktok__inner">
        <div className="pdp-tiktok__text" data-reveal>
          <p className="eyebrow">Sur TikTok</p>
          <h2 className="h2">{title} en vidéo</h2>
          {views && <p className="lead text-soft">{views}</p>}
          <a className="link" href={url} target="_blank" rel="noopener noreferrer">
            Voir sur TikTok<span className="sr-only"> (nouvel onglet)</span>
          </a>
        </div>
        <div className="pdp-tiktok__player">
          {play ? (
            <iframe
              src={`https://www.tiktok.com/player/v1/${id}?autoplay=1&music_info=0&description=0`}
              title={`Vidéo TikTok : ${title}`}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <button type="button" className="pdp-tiktok__poster" onClick={() => setPlay(true)}>
              {poster && <img src={`${poster.split('?')[0]}?width=600`} alt="" loading="lazy" width={600} height={1067} />}
              <span className="pdp-tiktok__play">
                <span aria-hidden="true">▶</span> Lire la vidéo
              </span>
            </button>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- Requêtes */

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    productType
    availableForSale
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    collections(first: 6) {
      nodes {
        handle
        title
      }
    }
    media(first: 20) {
      nodes {
        __typename
        ... on MediaImage {
          id
          alt
          image {
            url
            altText
            width
            height
          }
        }
        ... on Video {
          id
          alt
          previewImage {
            url
          }
          sources {
            url
            mimeType
          }
        }
      }
    }
    tiktokUrl: metafield(namespace: "custom", key: "tiktok_url") {
      value
    }
    tiktokViews: metafield(namespace: "custom", key: "tiktok_vues") {
      value
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $layersHandle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
    layers: product(handle: $layersHandle) {
      variants(first: 1) {
        nodes {
          id
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
    entretien: page(handle: "entretien") {
      body
    }
    promises: metaobjects(type: "home_promise", first: 8) {
      nodes {
        fields {
          key
          value
        }
      }
    }
    shop {
      shippingPolicy {
        handle
        title
      }
      refundPolicy {
        handle
        title
      }
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RECOMMENDED_QUERY = `#graphql
  query ProductRecommended($country: CountryCode, $language: LanguageCode, $handle: String!)
  @inContext(country: $country, language: $language) {
    productRecommendations(productHandle: $handle) {
      ...ProductCard
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
