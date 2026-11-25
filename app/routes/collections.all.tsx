import {useLoaderData} from 'react-router';
import type {Route} from './+types/collections.all';
import {getPaginationVariables} from '@shopify/hydrogen';
import type {ProductSortKeys} from '@shopify/hydrogen/storefront-api-types';
import {PRODUCT_CARD_FRAGMENT} from '~/components/ui';
import {CollectionView} from '~/components/collection/CollectionView';
import {parseCollectionParams} from '~/lib/collection';
import {seoMeta} from '~/lib/seo';

/** Produits techniques à ne jamais montrer dans la liste (option payante). */
const HIDDEN = ['option-layers'];

const SORT_MAP: Record<string, ProductSortKeys> = {
  MANUAL: 'BEST_SELLING',
  BEST_SELLING: 'BEST_SELLING',
  PRICE: 'PRICE',
  CREATED: 'CREATED_AT',
};

export const meta: Route.MetaFunction = ({data}) =>
  seoMeta({
    title: 'Tous nos produits',
    description: 'Perruques, bundles, laces et closures en cheveux 100 % naturels, faits main, sur commande.',
    url: data ? `${data.origin}/collections/all` : undefined,
    noindex: data?.filtered,
  });

export async function loader({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const {sort} = parseCollectionParams(request);
  const {products} = await context.storefront.query(CATALOG_QUERY, {
    variables: {sortKey: SORT_MAP[sort.key] ?? 'BEST_SELLING', reverse: sort.reverse, ...paginationVariables},
  });
  const url = new URL(request.url);
  return {
    products: {...products, nodes: products.nodes.filter((p) => !HIDDEN.includes(p.handle))},
    sort: sort.value,
    origin: url.origin,
    filtered: url.searchParams.has('sort'),
  };
}

export default function AllProducts() {
  const {products, sort} = useLoaderData<typeof loader>();
  return <CollectionView eyebrow="Boutique" title="Tous nos produits" products={products} sort={sort} activeFilters={[]} />;
}

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $sortKey: ProductSortKeys!
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
