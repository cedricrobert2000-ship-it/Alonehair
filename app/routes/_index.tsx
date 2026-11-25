import {Link, useLoaderData} from 'react-router';
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
import {SITE_IMAGES} from '~/lib/site-images';
import {SiteImg} from '~/components/ui/SiteImg';
import {Qualities} from '~/components/home/Qualities';
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
  return (
    <div className="home">
      <Hero data={data} />
      <BestSellers products={data.bestSellers} />
      <Story data={data} />
      <Categories data={data} />
      <TikTokWall data={data} />
      <Qualities
        qualities={data.promises.nodes.flatMap((n) => {
          const title = fieldOf(n.fields, 'title')?.value;
          return title ? [{handle: n.handle, title, text: fieldOf(n.fields, 'text')?.value}] : [];
        })}
        siteImage={SITE_IMAGES.qualities}
        image={data.bestSellers[2]?.images.nodes[0] ?? data.bestSellers[0]?.images.nodes[0] ?? storyImage(data)}
        text={data.story ? fieldOf(data.story.fields, 'text')?.value : null}
      />
      <Reviews data={data} />
      <Instagram image={data.bestSellers[1]?.images.nodes[0] ?? null} />
    </div>
  );
}

/* ------------------------------------------------------------------ Hero */
/**
 * Hero façon Organic Care : vidéo plein écran sous l'en-tête transparent,
 * phrase + lien en bas à gauche, « ALONE HAIR » en texte géant sur toute la largeur.
 */
function Hero({data}: {data: Data}) {
  const hero = data.heroContent;
  if (!hero) return null;
  const poster = data.bestSellers[0]?.images.nodes[0];
  // Image hébergée dans GitHub (public/images) si elle est définie, sinon la vidéo Shopify
  const repoImage = SITE_IMAGES.heroHome;

  return (
    <section className="hero" aria-label="À la une">
      <div className="hero__media">
        {repoImage ? (
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
    <Section wide>
      <SectionHead
        eyebrow="Best-sellers"
        title="Les préférées de nos clientes"
        action={<TextLink to="/collections/perruques">Toutes les perruques</TextLink>}
      />
      <ul className="product-grid" data-reveal-group>
        {products.map((p, i) => (
          <li key={p.id}>
            <ProductCard product={p} loading={i < 4 ? 'eager' : 'lazy'} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function storyImage(data: Data) {
  const ref = data.story?.fields.find((f) => f.key === 'image')?.reference;
  return ref?.__typename === 'MediaImage' ? ref.image : null;
}

/* ----------------------------------------------------------------- Story */
function Story({data}: {data: Data}) {
  const fields = data.story?.fields;
  const title = fieldOf(fields, 'title')?.value;
  if (!data.story || !title) return null;
  const imgRef = data.story.fields.find((f) => f.key === 'image')?.reference;
  const image = imgRef?.__typename === 'MediaImage' ? imgRef.image : null;
  const quote = fieldOf(fields, 'quote')?.value;
  const text = fieldOf(fields, 'text')?.value;

  return (
    <section className="story section" aria-labelledby="story-title">
      <div className="banner banner--plain story__banner" data-reveal>
        <div className="banner__media">
          {image && <Image data={image} alt={image.altText ?? ''} sizes="100vw" loading="lazy" />}
        </div>
        <div className="banner__box story__box">
          <div className="banner__titles">
            <p className="eyebrow">{fieldOf(fields, 'eyebrow')?.value}</p>
            <h2 className="h2" id="story-title">
              {title}
            </h2>
          </div>
          {quote && <blockquote className="story__quote">{quote}</blockquote>}
          {text && <p className="text-soft">{text}</p>}
          <TextLink to="/pages/a-propos">Notre histoire</TextLink>
        </div>
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
  const reviews = data.reviews.nodes
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

/* -------------------------------------------------------------- Instagram */
function Instagram({
  image,
}: {
  image: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
}) {
  return (
    <section className="insta section" aria-labelledby="insta-title">
      <div className="insta__inner container container--wide" data-reveal>
        <div className="insta__media">
          {SITE_IMAGES.instagram ? (
            <SiteImg image={SITE_IMAGES.instagram} sizes="(min-width: 1024px) 50vw, 100vw" />
          ) : (
            image && <Image data={image} alt="" sizes="(min-width: 1024px) 50vw, 100vw" loading="lazy" aspectRatio="4/5" />
          )}
        </div>
        <div className="insta__box">
          <p className="eyebrow">Instagram</p>
          <h2 className="h2" id="insta-title">
            @alone_hair
          </h2>
          <p className="text-soft">
            Nouveautés, essayages et conseils : suivez-nous, et écrivez-nous en message pour choisir votre perruque.
          </p>
          <TextLink href="https://www.instagram.com/alone_hair">Nous suivre</TextLink>
        </div>
      </div>
    </section>
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
      products(first: 8) {
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
