import {useState} from 'react';
import {Form, Link, useNavigation, useSubmit} from 'react-router';
import {Pagination} from '@shopify/hydrogen';
import {Button, Drawer, ProductCard, TextLink, type ProductCardData} from '~/components/ui';
import {SORTS} from '~/lib/collection';

type FilterValue = {id: string; label: string; count: number; input: unknown};
type Filter = {id: string; label: string; type: string; values: FilterValue[]};
type Connection = {
  nodes: ProductCardData[];
  pageInfo: {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    startCursor?: string | null;
    endCursor?: string | null;
  };
  filters?: Filter[];
};

/**
 * Page collection façon Veloraskin : grand titre, filtres en colonne
 * (tiroir sur mobile), tri, grille de cartes, « Voir plus ».
 * Filtres et tri passent par l'URL (partageables, fonctionnent sans JS).
 */
export function CollectionView({
  title,
  description,
  products,
  sort,
  activeFilters,
  eyebrow = 'Collection',
}: {
  title: string;
  description?: string | null;
  products: Connection;
  sort: string;
  activeFilters: string[];
  eyebrow?: string;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filters = (products.filters ?? []).filter((f) => f.type === 'LIST' && f.values.length > 0);
  const navigation = useNavigation();
  const loading = navigation.state === 'loading';
  const empty = products.nodes.length === 0;

  const controls = (idPrefix: string) => (
    <FiltersForm filters={filters} activeFilters={activeFilters} sort={sort} idPrefix={idPrefix} />
  );

  return (
    <div className="plp">
      <header className="plp__head container container--wide" data-reveal>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display plp__title">{title}</h1>
        {description && <p className="plp__desc text-soft">{description}</p>}
      </header>

      <div className="plp__body container container--wide">
        <aside className="plp__side" aria-label="Filtres et tri">
          {controls('d')}
        </aside>

        <div className={`plp__results${loading ? ' is-loading' : ''}`}>
          <div className="plp__bar">
            <p className="text-soft text-sm" aria-live="polite">
              {empty ? 'Aucun produit' : `${products.nodes.length}${products.pageInfo?.hasNextPage ? '+' : ''} produit${products.nodes.length > 1 ? 's' : ''}`}
            </p>
            <button
              type="button"
              className="btn btn--secondary plp__filter-btn"
              aria-haspopup="dialog"
              onClick={() => setFiltersOpen(true)}
            >
              Filtrer et trier{activeFilters.length ? ` (${activeFilters.length})` : ''}
            </button>
          </div>

          {empty ? (
            <EmptyState filtered={activeFilters.length > 0} />
          ) : (
            <Pagination connection={products as Parameters<typeof Pagination>[0]['connection']}>
              {({nodes, isLoading, NextLink}) => (
                <>
                  <ul className="product-grid product-grid--3" data-reveal-group>
                    {(nodes as ProductCardData[]).map((p, i) => (
                      <li key={p.id}>
                        <ProductCard product={p} loading={i < 6 ? 'eager' : 'lazy'} sizes="(min-width: 1024px) 25vw, 50vw" />
                      </li>
                    ))}
                  </ul>
                  <div className="plp__more">
                    <NextLink className="btn btn--secondary">{isLoading ? 'Chargement…' : 'Voir plus'}</NextLink>
                  </div>
                </>
              )}
            </Pagination>
          )}
        </div>
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtrer et trier"
        footer={
          <Button block onClick={() => setFiltersOpen(false)}>
            Voir les produits
          </Button>
        }
      >
        {controls('m')}
      </Drawer>
    </div>
  );
}

function FiltersForm({
  filters,
  activeFilters,
  sort,
  idPrefix,
}: {
  filters: Filter[];
  activeFilters: string[];
  sort: string;
  idPrefix: string;
}) {
  const submit = useSubmit();
  return (
    <Form
      method="get"
      preventScrollReset
      className="filters"
      onChange={(e) => void submit(e.currentTarget, {preventScrollReset: true, replace: true})}
    >
      <div className="field">
        <label className="field__label" htmlFor={`${idPrefix}-sort`}>
          Trier par
        </label>
        <select id={`${idPrefix}-sort`} className="select" name="sort" defaultValue={sort}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {filters.map((f) => (
        <details key={f.id} className="accordion" open>
          <summary>
            {f.label}
            <span className="accordion__icon" aria-hidden="true" />
          </summary>
          <fieldset className="filters__values">
            <legend className="sr-only">{f.label}</legend>
            {f.values.map((v) => (
              <label key={v.id} className={`check filters__value${v.count === 0 ? ' is-empty' : ''}`}>
                <input
                  type="checkbox"
                  name="filter"
                  value={String(v.input)}
                  defaultChecked={activeFilters.includes(String(v.input))}
                  disabled={v.count === 0 && !activeFilters.includes(String(v.input))}
                />
                <span>{v.label}</span>
                <span className="check__extra">({v.count})</span>
              </label>
            ))}
          </fieldset>
        </details>
      ))}

      <noscript>
        <button className="btn" type="submit">
          Appliquer
        </button>
      </noscript>
      {activeFilters.length > 0 && (
        <Link className="link" to="?" preventScrollReset replace>
          Effacer les filtres
        </Link>
      )}
    </Form>
  );
}

function EmptyState({filtered}: {filtered: boolean}) {
  return (
    <div className="plp__empty">
      {filtered ? (
        <>
          <p className="h4">Aucun produit ne correspond à ces filtres.</p>
          <TextLink to="?">Effacer les filtres</TextLink>
        </>
      ) : (
        <>
          <p className="h4">Cette collection arrive bientôt.</p>
          <p className="text-soft">En attendant, découvrez nos perruques faites main en cheveux 100 % naturels.</p>
          <Button to="/collections/perruques">Voir les perruques</Button>
        </>
      )}
    </div>
  );
}
