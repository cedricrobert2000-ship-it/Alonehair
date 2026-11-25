import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/collections._index';
import {Image} from '@shopify/hydrogen';
import {seoMeta} from '~/lib/seo';

/** Collections techniques, jamais affichées dans la liste. */
const HIDDEN = ['nos-wigs', 'best-sellers'];

export const meta: Route.MetaFunction = ({data}) =>
  seoMeta({
    title: 'Nos collections',
    description: 'Perruques, perruques indétectables 13×6, bundles, laces & closures : toutes nos collections en cheveux 100 % naturels.',
    url: data ? `${data.origin}/collections` : undefined,
  });

export async function loader({context, request}: Route.LoaderArgs) {
  const {collections} = await context.storefront.query(COLLECTIONS_QUERY, {cache: context.storefront.CacheShort()});
  return {
    collections: collections.nodes.filter((c) => !HIDDEN.includes(c.handle)),
    origin: new URL(request.url).origin,
  };
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();
  return (
    <div className="plp">
      <header className="plp__head container container--wide" data-reveal>
        <p className="eyebrow">Boutique</p>
        <h1 className="display plp__title">Nos collections</h1>
      </header>
      <div className="container container--wide section--sm">
        <ul className="cat-grid cat-grid--wide" data-reveal-group>
          {collections.map((c, i) => {
            const image = c.image ?? c.products.nodes[0]?.featuredImage;
            return (
              <li key={c.id}>
                <Link className="catcard" to={`/collections/${c.handle}`} prefetch="intent">
                  {image ? (
                    <Image data={image} alt="" aspectRatio="4/5" sizes="(min-width: 1024px) 33vw, 50vw" loading={i < 3 ? 'eager' : 'lazy'} />
                  ) : (
                    <span className="catcard__empty" />
                  )}
                  <span className="catcard__label">
                    <span className="catcard__title">{c.title}</span>
                    <span className="badge">Voir</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="plp__all">
          <Link className="link" to="/collections/all">
            Tous nos produits
          </Link>
        </p>
      </div>
    </div>
  );
}

const COLLECTIONS_QUERY = `#graphql
  query StoreCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 30, sortKey: TITLE) {
      nodes {
        id
        title
        handle
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
    }
  }
` as const;
