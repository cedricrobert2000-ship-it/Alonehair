import type {ProductCollectionSortKeys, ProductFilter} from '@shopify/hydrogen/storefront-api-types';

/** Tris proposés (libellés français, clés Storefront API). */
export const SORTS = [
  {value: 'manual', label: 'Notre sélection', key: 'MANUAL' as ProductCollectionSortKeys, reverse: false},
  {value: 'best', label: 'Meilleures ventes', key: 'BEST_SELLING' as ProductCollectionSortKeys, reverse: false},
  {value: 'price-asc', label: 'Prix croissant', key: 'PRICE' as ProductCollectionSortKeys, reverse: false},
  {value: 'price-desc', label: 'Prix décroissant', key: 'PRICE' as ProductCollectionSortKeys, reverse: true},
  {value: 'new', label: 'Nouveautés', key: 'CREATED' as ProductCollectionSortKeys, reverse: true},
] as const;

/**
 * Lit les filtres et le tri dans l'URL (`?filter=<json>&sort=price-asc`).
 * Les filtres viennent de l'app Search & Discovery : chaque valeur fournit
 * son `input` JSON, qu'on renvoie tel quel à l'API.
 */
export function parseCollectionParams(request: Request) {
  const params = new URL(request.url).searchParams;
  const filters: ProductFilter[] = [];
  for (const raw of params.getAll('filter')) {
    try {
      filters.push(JSON.parse(raw) as ProductFilter);
    } catch {
      // filtre invalide dans l'URL : ignoré
    }
  }
  const sort = SORTS.find((s) => s.value === params.get('sort')) ?? SORTS[0];
  return {filters, sort, activeFilters: params.getAll('filter')};
}
