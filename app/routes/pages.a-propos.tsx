import {useLoaderData} from 'react-router';
import type {Route} from './+types/pages.a-propos';
import {Image} from '@shopify/hydrogen';
import {ABOUT} from '~/content/a-propos';
import {breadcrumbLd, seoMeta} from '~/lib/seo';
import aboutStyles from '~/styles/about.css?url';

/**
 * /pages/a-propos — page À propos façon Organic Care (/about).
 * Route dédiée : elle passe avant pages.$handle pour cette adresse.
 * Textes : app/content/a-propos.ts ; engagements de service, avis et
 * photos de la bande Instagram : Shopify (métaobjets, produits).
 */
export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: aboutStyles}];

export const meta: Route.MetaFunction = ({data}) =>
  seoMeta({
    title: data?.page?.seo?.title || 'À propos',
    description: data?.page?.seo?.description || ABOUT.intro,
    url: data?.url,
    image: ABOUT.heroImage,
    jsonLd: data
      ? [
          breadcrumbLd(data.origin, [
            {name: 'Accueil', path: '/'},
            {name: 'À propos', path: '/pages/a-propos'},
          ]),
        ]
      : [],
  });

export async function loader({context, request}: Route.LoaderArgs) {
  const data = await context.storefront.query(ABOUT_QUERY, {cache: context.storefront.CacheShort()});
  const origin = new URL(request.url).origin;
  const field = (n: {fields: Array<{key: string; value?: string | null}>}, k: string) =>
    n.fields.find((f) => f.key === k)?.value ?? null;
  return {
    page: data.page,
    origin,
    url: `${origin}/pages/a-propos`,
    promises: (data.promises?.nodes ?? [])
      .map((n) => ({handle: n.handle, title: field(n, 'title'), text: field(n, 'text')}))
      .filter((p) => p.title),
    reviews: (data.reviews?.nodes ?? [])
      .map((n) => ({
        id: n.id,
        author: field(n, 'author'),
        city: field(n, 'city'),
        text: field(n, 'text'),
      }))
      .filter((r) => r.author && r.text),
  };
}

export default function About() {
  const {page, promises, reviews} = useLoaderData<typeof loader>();
  const {story, collage, commitments, service, founders} = ABOUT;

  return (
    <article className="about">
      {/* 1. Titre + grande photo */}
      <header className="about-hero">
        <div className="container" data-reveal>
          <h1 className="about-hero__title">{page?.title ?? 'À propos'}</h1>
          <p className="about-hero__intro">{ABOUT.intro}</p>
        </div>
        <div className="about-hero__media">
          <div data-parallax="0.06" className="about-parallax">
            <Image data={ABOUT.heroImage} alt={ABOUT.heroImage.altText} sizes="100vw" loading="eager" fetchPriority="high" />
          </div>
        </div>
      </header>

      {/* 2. L'histoire */}
      <section className="about-story section container" aria-labelledby="about-story">
        <h2 className="about-story__title" id="about-story" data-reveal>
          {story.title.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </h2>
        <p className="about-story__accent" data-reveal>
          <span className="accent">{story.accent}</span>
          <span className="about-story__line" aria-hidden="true" />
        </p>
        <div className="about-story__text" data-reveal-group>
          {story.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      {/* 3. Collage de deux photos */}
      <div className="about-collage container container--wide" aria-hidden="true">
        {collage.map((im, i) => (
          <div key={im.url} className={`about-collage__item about-collage__item--${i + 1}`} data-reveal>
            <div data-parallax={i === 0 ? '0.04' : '0.06'} className="about-parallax">
              <Image data={im} alt="" sizes="(min-width: 1024px) 45vw, 100vw" loading="lazy" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Nos engagements */}
      <section className="about-values section container" aria-labelledby="about-values">
        <div className="about-values__head" data-reveal>
          <h2 id="about-values">
            <span className="about-values__label">{commitments.label}</span>
            <span className="accent">{commitments.accent}</span>
          </h2>
        </div>
        <ul className="about-values__cards" data-reveal-group>
          {commitments.items.map((c, i) => (
            <li key={c.title} className="value-card">
              <span className="quality__icon">
                <ValueIcon name={c.icon} />
              </span>
              <p className="value-card__num">0{i + 1}</p>
              <p className="value-card__title">{c.title}</p>
              <p className="value-card__text">{c.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Le service (engagements Shopify home_promise) */}
      {promises.length > 0 && (
        <section className="about-service" aria-labelledby="about-service">
          <div className="container">
            <h2 className="about-service__title" id="about-service" data-reveal>
              {service.title.map((l, i) => (
                <span key={l} style={{'--i': i} as React.CSSProperties}>
                  {l}
                </span>
              ))}
            </h2>
            <div className="about-service__body">
              <div className="about-service__media" data-reveal>
                <Image data={service.image} alt={service.image.altText} sizes="(min-width: 1024px) 40vw, 100vw" loading="lazy" />
              </div>
              <ul className="about-service__list" data-reveal-group>
                {promises.map((p) => (
                  <li key={p.handle}>
                    <span className="quality__icon">
                      <ValueIcon name={p.handle} />
                    </span>
                    <p className="about-service__name">{p.title}</p>
                    {p.text && <p className="about-service__text">{p.text}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 6. Les fondatrices */}
      <section className="about-founders" aria-labelledby="about-founders">
        <div className="about-founders__media">
          <div data-parallax="0.08" className="about-parallax">
            <Image data={founders.image} alt={founders.image.altText} sizes="100vw" loading="lazy" />
          </div>
        </div>
        <div className="about-founders__content container">
          <h2 id="about-founders" data-reveal>
            <span className="about-values__label">{founders.label}</span>
            <span className="accent">{founders.accent}</span>
          </h2>
          <blockquote className="about-founders__quote" data-reveal>
            <p>« {founders.quote} »</p>
            <footer>{founders.signature}</footer>
          </blockquote>
        </div>
      </section>

      {/* 7. Avis (métaobjets home_review) — masqué tant qu'il n'y en a pas */}
      {reviews.length > 0 && (
        <section className="about-reviews section container" aria-labelledby="about-reviews">
          <h2 className="accent about-reviews__title" id="about-reviews" data-reveal>
            Elles en parlent
          </h2>
          <ul className="reviews" data-reveal-group>
            {reviews.map((r) => (
              <li key={r.id} className="review">
                <blockquote>« {r.text} »</blockquote>
                <p className="text-soft text-sm">
                  {r.author}
                  {r.city ? `, ${r.city}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

    </article>
  );
}

function ValueIcon({name}: {name: string}) {
  const c = {width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, 'aria-hidden': true} as const;
  if (name === 'origin') return (<svg {...c}><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /></svg>);
  if (name === 'density') return (<svg {...c}><path d="M7 3v18M12 3v18M17 3v18" /></svg>);
  if (name === 'ethics') return (<svg {...c}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>);
  if (/livr/.test(name)) return (<svg {...c}><path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" /><circle cx="6.5" cy="17" r="1.6" /><circle cx="17" cy="17" r="1.6" /></svg>);
  if (/chang/.test(name)) return (<svg {...c}><path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5" /></svg>);
  if (/main/.test(name)) return (<svg {...c}><path d="M12 3.5l2.4 5 5.4.7-4 3.7 1 5.4L12 15.7l-4.8 2.6 1-5.4-4-3.7 5.4-.7z" /></svg>);
  return (<svg {...c}><path d="M4 5h16v11H9l-5 4z" /></svg>);
}

const ABOUT_QUERY = `#graphql
  query AboutPage($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    page(handle: "a-propos") {
      title
      seo {
        title
        description
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
    reviews: metaobjects(type: "home_review", first: 9) {
      nodes {
        id
        fields {
          key
          value
        }
      }
    }
  }
` as const;
