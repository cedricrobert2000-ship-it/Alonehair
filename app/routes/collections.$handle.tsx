import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {Analytics, getPaginationVariables} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {PRODUCT_CARD_FRAGMENT} from '~/components/ui';
import {CollectionView} from '~/components/collection/CollectionView';
import {parseCollectionParams} from '~/lib/collection';
import {breadcrumbLd, seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Alone Hair'}];
  const {collection, origin} = data;
  return seoMeta({
    title: collection.seo.title || collection.title,
    description: collection.seo.description || collection.description,
    url: `${origin}/collections/${collection.handle}`,
    image: collection.image,
    // pages filtrées / triées : pas d'indexation (évite le contenu dupliqué)
    noindex: data.filtered,
    jsonLd: [
      breadcrumbLd(origin, [
        {name: 'Accueil', path: '/'},
        {name: collection.title, path: `/collections/${collection.handle}`},
      ]),
    ],
  });
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw redirect('/collections');

  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const {filters, sort, activeFilters} = parseCollectionParams(request);

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {handle, filters, sortKey: sort.key, reverse: sort.reverse, ...paginationVariables},
  });
  if (!collection) throw new Response(`Collection ${handle} introuvable`, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  const url = new URL(request.url);
  return {
    collection,
    sort: sort.value,
    activeFilters,
    origin: url.origin,
    filtered: activeFilters.length > 0 || url.searchParams.has('sort'),
  };
}

export default function Collection() {
  const {collection, sort, activeFilters} = useLoaderData<typeof loader>();
  return (
    <>
      <CollectionView
        title={collection.title}
        description={collection.description}
        products={collection.products}
        sort={sort}
        activeFilters={activeFilters}
      />
      <Analytics.CollectionView data={{collection: {id: collection.id, handle: collection.handle}}} />
    </>
  );
}

const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      seo {
        title
        description
      }
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
