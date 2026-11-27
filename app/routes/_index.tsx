import {Link, useLoaderData, useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';
import type {Route} from './+types/_index';
import {Image} from '@shopify/hydrogen';
import {
  PRODUCT_CARD_FRAGMENT,
  ProductCard,
  Section,
  SectionHead,
  TextLink,
  type ProductCardData,
} from '~/components/ui';
import {seoMeta} from '~/lib/seo';
import {HERO_FIELDS_FRAGMENT, parseHero} from '~/lib/hero';
import {BrandVideo} from '~/components/ui/BrandVideo';
import {FitText} from '~/components/ui/FitText';
import {SITE_IMAGES, SITE_VIDEOS} from '~/lib/site-images';
import {SiteImg} from '~/components/ui/SiteImg';
import {Qualities} from '~/components/home/Qualities';
import {Ticker} from '~/components/home/Ticker';
import {Spotlight} from '~/components/home/Spotlight';
import {Mosaic} from '~/components/home/Mosaic';
import {ProductCarousel} from '~/components/ui/ProductCarousel';
import {Manifesto} from '~/components/content/ContentBlocks';
import {Button} from '~/components/ui/Button';
import {toPath} from '~/lib/url';
import {stripHtml} from '~/lib/seo';

/** Collections mises en avant dans « Nos collections » (CLAUDE.md §7). */
const CATEGORY_HANDLES = ['perruques', 'perruque-indetectable-13x6', 'bundles', 'laces-closures'];

export const meta: Route.MetaFunction = ({data}) =>
  seoMeta({
    title: data?.shop.name ? `${data.shop.name} — Perruques en cheveux 100 % naturels` : undefined,
    description: data?.shop.description,
    url: data?.url,
    image: data?.ogImage,
    jsonLd: data
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: data.shop.name,
            url: data.origin,
            logo: `${data.origin}/brand/logo-alone-hair.png`,
            sameAs: ['https://www.instagram.com/alone_hair', 'https://www.tiktok.com/@alonehair'],
          },
        ]
      : [],
  });

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront, env} = context;
  const data = await storefront.query(HOME_QUERY, {
    cache: storefront.CacheShort(),
    variables: {
      cat1: CATEGORY_HANDLES[0],
      cat2: CATEGORY_HANDLES[1],
      cat3: CATEGORY_HANDLES[2],
      cat4: CATEGORY_HANDLES[3],
    },
  });
  const origin = new URL(request.url).origin;
  const bestSellers = (data.bestSellers?.products.nodes ?? []) as ProductCardData[];
  return {
    ...data,
    heroContent: parseHero(data.hero),
    bestSellers,
    origin,
    url: `${origin}/`,
    domains: [data.shop.primaryDomain.url, env.PUBLIC_STORE_DOMAIN],
    ogImage: bestSellers[0]?.images.nodes[0] ?? null,
  };
}

type Data = Awaited<ReturnType<typeof loader>>;
type Fields = Array<{key: string; value?: string | null}>;
const fieldOf = (fields: Fields | undefined, key: string) => fields?.find((f) => f.key === key);

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const promises = (data.promises?.nodes ?? []).flatMap((n) => {
    const title = fieldOf(n.fields, 'title')?.value;
    return title ? [{handle: n.handle, title, text: fieldOf(n.fields, 'text')?.value}] : [];
  });
  // Bandeau : faits produits (cheveux naturels, single donor, Raw Hair) + engagements Shopify
  const ticker = Array.from(
    new Set(['Cheveux 100 % naturels', 'Single donor', 'Raw Hair', ...promises.map((p) => p.title)]),
  );
  const spotlight = data.spotlight?.products.nodes[0];
  const carousel = data.bestSellers.filter((p) => p.handle !== spotlight?.handle);
  const mosaic = data.mosaic;

  return (
    <div className="home">
      <Hero data={data} />
      <Ticker items={ticker} />
      <Categories data={data} />
      <BestSellers products={carousel} />
      <Spotlight product={spotlight} />
      <Manifesto
        eyebrow="Alone Hair"
        text="Des perruques en cheveux 100 % naturels, issus d’un seul donneur, faites main et sur commande. Tout est pensé pour durer, sublimer et s’adapter à chaque femme."
      >
        <div className="manifesto__ctas">
          <Button to="/pages/a-propos" variant="light">
            Notre histoire
          </Button>
        </div>
      </Manifesto>
      <Story data={data} />
      {mosaic && (
        <Mosaic
          handle={mosaic.handle}
          title={mosaic.title}
          description={mosaic.description}
          products={mosaic.products.nodes as ProductCardData[]}
        />
      )}
      <Qualities
        qualities={promises}
        siteImage={SITE_IMAGES.qualities}
        image={data.bestSellers[2]?.images.nodes[0] ?? data.bestSellers[0]?.images.nodes[0] ?? storyImage(data)}
        text={data.story ? fieldOf(data.story.fields, 'text')?.value : null}
      />
      <TikTokWall data={data} />
      <Reviews data={data} />
    </div>
  );
}

/* ------------------------------------------------------------------ Hero */
/**
 * Hero façon Organic Care : vidéo plein écran sous l'en-tête transparent,
 * phrase + lien en bas à gauche, « ALONE HAIR » en texte géant sur toute la largeur.
 */
function Hero({data}: {data: Data}) {
  // Vidéo puis image hébergées dans GitHub (public/) si elles sont définies, sinon la vidéo Shopify
  const repoVideo = SITE_VIDEOS.heroHome;
  const repoImage = SITE_IMAGES.heroHome;
  // Textes du métaobjet home_hero ; sans lui, le hero garde son média et le nom de la boutique
  const hero = data.heroContent ?? (repoVideo || repoImage ? {video: null, videoMobile: null} : null);
  if (!hero) return null;
  const poster = data.bestSellers[0]?.images.nodes[0];

  return (
    <section className="hero" aria-label="À la une">
      <div className="hero__media">
        {repoVideo ? (
          <BrandVideo video={repoVideo.video} videoMobile={repoVideo.videoMobile} className="hero__video" controlClassName="hero__toggle" />
        ) : repoImage ? (
          <SiteImg image={repoImage} className="hero__video" sizes="100vw" priority />
        ) : hero.video ? (
          <BrandVideo video={hero.video} videoMobile={hero.videoMobile} className="hero__video" controlClassName="hero__toggle" />
        ) : poster ? (
          <Image data={poster} alt="" sizes="100vw" loading="eager" fetchPriority="high" className="hero__video" />
        ) : null}
      </div>
      <div className="hero__content container">
        <div className="hero__text">
          {hero.subtitle && <p className="hero__lead">{hero.subtitle}</p>}
          {hero.ctaLabel && hero.ctaLink && (
            <Link className="hero__cta" to={toPath(hero.ctaLink, data.domains)} prefetch="intent">
              {hero.ctaLabel}
            </Link>
          )}
        </div>
        <FitText as="h1" className="hero__brand">
          {(hero.title ?? data.shop.name).toUpperCase()}
        </FitText>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Best-sellers */
function BestSellers({products}: {products: ProductCardData[]}) {
  if (!products.length) return null;
  return (
    <Section wide className="bestsellers">
      <SectionHead
        eyebrow="Best-sellers"
        title="Les préférées de nos clientes"
        action={<TextLink to="/collections/perruques">Toutes les perruques</TextLink>}
      />
      <ProductCarousel products={products} label="Best-sellers" />
    </Section>
  );
}

function storyImage(data: Data) {
  const ref = data.story?.fields.find((f) => f.key === 'image')?.reference;
  return ref?.__typename === 'MediaImage' ? ref.image : null;
}

/* ----------------------------------------------------------------- Story */
function Story({data}: {data: Data}) {
  const root = useRouteLoaderData<RootLoader>('root');
  const fields = data.story?.fields;
  const title = fieldOf(fields, 'title')?.value;
  if (!data.story || !title) return null;
  const imgRef = data.story.fields.find((f) => f.key === 'image')?.reference;
  const image = imgRef?.__typename === 'MediaImage' ? imgRef.image : null;
  const quote = fieldOf(fields, 'quote')?.value;
  const text = fieldOf(fields, 'text')?.value;
  const eyebrow = fieldOf(fields, 'eyebrow')?.value;
  // Liens : les collections du menu « Nos collections » (Shopify), puis À propos
  const links = [
    ...(root?.header.menu?.items.find((i) => i.items?.length)?.items ?? []).map((c) => ({
      title: c.title,
      to: toPath(c.url, data.domains),
    })),
    {title: 'Notre histoire', to: '/pages/a-propos'},
  ];

  return (
    <section className="story-split" aria-labelledby="story-title">
      <div className="story-split__panel">
        <div className="story-split__text" data-reveal>
          <h2 className="story-split__title" id="story-title">
            <span className="story-split__accent">{title}</span>
            {eyebrow && <span className="story-split__label">{eyebrow}</span>}
          </h2>
          {quote && <p className="story-split__quote">{quote}</p>}
          {text && <p className="story-split__body">{text}</p>}
        </div>
        <ul className="story-split__links" data-reveal-group>
          {links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} prefetch="intent" className="story-split__link">
                {l.title}
                <span className="story-split__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="story-split__media" data-reveal>
        {image && (
          <div className="story-split__clip">
            <div className="story-split__parallax" data-parallax="0.08">
              <Image data={image} alt={image.altText ?? ''} sizes="(min-width: 1024px) 50vw, 100vw" loading="lazy" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Catégories */
function Categories({data}: {data: Data}) {
  const cats = [data.cat1, data.cat2, data.cat3, data.cat4].filter(Boolean);
  if (!cats.length) return null;
  return (
    <Section wide>
      <SectionHead
        eyebrow="Nos collections"
        title="Choisir sa pièce"
        action={<TextLink to="/collections">Toutes les collections</TextLink>}
      />
      <ul className="cat-grid" data-reveal-group>
        {cats.map((c) => {
          const image = c!.image ?? c!.products.nodes[0]?.featuredImage;
          return (
            <li key={c!.handle}>
              <Link className="catcard" to={`/collections/${c!.handle}`} prefetch="intent">
                {image && (
                  <Image data={image} alt="" aspectRatio="4/5" sizes="(min-width: 1024px) 25vw, 50vw" loading="lazy" />
                )}
                <span className="catcard__label">
                  <span className="catcard__title">{c!.title}</span>
                  <span className="badge">Voir</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

/* --------------------------------------------------- Vidéos TikTok (community) */
function TikTokWall({data}: {data: Data}) {
  const items = (data.tiktok?.products.nodes ?? [])
    .filter((p) => p.tiktokUrl?.value && p.featuredImage)
    .slice(0, 4);
  if (!items.length) return null;
  return (
    <Section wide className="tiktok-wall">
      <SectionHead
        eyebrow="Sur TikTok"
        title="Nos perruques en vidéo"
        action={<TextLink href="https://www.tiktok.com/@alonehair">@alonehair</TextLink>}
      />
      <ul className="tiktok-grid" data-reveal-group>
        {items.map((p) => (
          <li key={p.handle} className="tiktok-card">
            <Image data={p.featuredImage!} alt="" aspectRatio="9/16" sizes="(min-width: 1024px) 25vw, 50vw" loading="lazy" />
            <div className="tiktok-card__box">
              <Link className="tiktok-card__title" to={`/products/${p.handle}`} prefetch="intent">
                {p.title}
              </Link>
              <a className="link" href={p.tiktokUrl!.value} target="_blank" rel="noopener noreferrer">
                Voir la vidéo<span className="sr-only"> de {p.title} sur TikTok (nouvel onglet)</span>
              </a>
            </div>
            {p.tiktokViews?.value && <span className="badge tiktok-card__views">{p.tiktokViews.value}</span>}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------- Avis */
function Reviews({data}: {data: Data}) {
  const reviews = (data.reviews?.nodes ?? [])
    .map((n) => ({
      id: n.id,
      author: fieldOf(n.fields, 'author')?.value,
      city: fieldOf(n.fields, 'city')?.value,
      text: fieldOf(n.fields, 'text')?.value,
      rating: Number(fieldOf(n.fields, 'rating')?.value ?? 0),
    }))
    .filter((r) => r.text && r.author);
  // Aucun avis saisi par les propriétaires : la section n'existe pas.
  if (!reviews.length) return null;
  return (
    <Section>
      <SectionHead eyebrow="Avis" title="Elles en parlent" />
      <ul className="reviews" data-reveal-group>
        {reviews.map((r) => (
          <li key={r.id} className="review">
            {r.rating > 0 && (
              <p className="review__stars" aria-label={`${r.rating} sur 5`}>
                {'★'.repeat(Math.min(5, r.rating))}
                <span aria-hidden="true">{'☆'.repeat(Math.max(0, 5 - r.rating))}</span>
              </p>
            )}
            <blockquote>« {stripHtml(r.text!)} »</blockquote>
            <p className="text-soft text-sm">
              {r.author}
              {r.city ? `, ${r.city}` : ''}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------------------------------------------------------------- Requête */
const HOME_QUERY = `#graphql
  fragment HomeCategory on Collection {
    handle
    title
    image {
      url
      altText
      width
      height
    }
    products(first: 1) {
      nodes {
        featuredImage {
          url
          altText
          width
          height
        }
      }
    }
  }
  query Home(
    $country: CountryCode
    $language: LanguageCode
    $cat1: String!
    $cat2: String!
    $cat3: String!
    $cat4: String!
  ) @inContext(country: $country, language: $language) {
    shop {
      name
      description
      primaryDomain {
        url
      }
    }
    hero: metaobject(handle: {type: "home_hero", handle: "accueil"}) {
      ...HeroFields
    }
    story: metaobject(handle: {type: "home_story", handle: "accueil"}) {
      fields {
        key
        value
        reference {
          __typename
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
    promises: metaobjects(type: "home_promise", first: 8) {
      nodes {
        handle
        fields {
          key
          value
        }
      }
    }
    reviews: metaobjects(type: "home_review", first: 12) {
      nodes {
        id
        fields {
          key
          value
        }
      }
    }
    bestSellers: collection(handle: "perruques") {
      products(first: 9) {
        nodes {
          ...ProductCard
        }
      }
    }
    spotlight: collection(handle: "perruques") {
      products(first: 1) {
        nodes {
          handle
          title
          descriptionHtml
          images(first: 3) {
            nodes {
              url
              altText
              width
              height
            }
          }
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
          options(first: 5) {
            name
            optionValues {
              name
            }
          }
        }
      }
    }
    mosaic: collection(handle: "perruque-indetectable-13x6") {
      handle
      title
      description
      products(first: 3) {
        nodes {
          ...ProductCard
        }
      }
    }
    tiktok: collection(handle: "perruques") {
      products(first: 40) {
        nodes {
          handle
          title
          featuredImage {
            url
            altText
            width
            height
          }
          tiktokUrl: metafield(namespace: "custom", key: "tiktok_url") {
            value
          }
          tiktokViews: metafield(namespace: "custom", key: "tiktok_vues") {
            value
          }
        }
      }
    }
    cat1: collection(handle: $cat1) {
      ...HomeCategory
    }
    cat2: collection(handle: $cat2) {
      ...HomeCategory
    }
    cat3: collection(handle: $cat3) {
      ...HomeCategory
    }
    cat4: collection(handle: $cat4) {
      ...HomeCategory
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${HERO_FIELDS_FRAGMENT}
` as const;
