import {Link} from 'react-router';
import type {MappedProductOptions} from '@shopify/hydrogen';

/**
 * Sélecteurs de variantes en pastilles (pas de menus déroulants).
 * - pastille noire : choix actuel ;
 * - barrée : combinaison épuisée (cliquable, pour voir le prix) ;
 * - grisée et inactive : combinaison qui n'existe pas.
 * Chaque choix met à jour l'URL (?variant / options), donc le prix et le partage.
 */
export function VariantOptions({
  options,
  buildTo = (query) => `?${query}`,
}: {
  options: MappedProductOptions[];
  buildTo?: (variantUriQuery: string, handle: string) => string;
}) {
  return (
    <div className="vopts">
      {options.map((option) => {
        if (option.optionValues.length < 1) return null;
        const selected = option.optionValues.find((v) => v.selected);
        return (
          <fieldset className="vopt" key={option.name}>
            <legend className="vopt__legend">
              <span className="vopt__name">{option.name}</span>
              {selected && <span className="vopt__value">{selected.name}</span>}
            </legend>
            <div className="pill-group">
              {option.optionValues.map((value) => {
                const {name, selected, available, exists, variantUriQuery} =
                  value;
                if (!exists) {
                  return (
                    <span
                      key={name}
                      className="pill is-missing"
                      aria-disabled="true"
                      title="Combinaison indisponible"
                    >
                      {name}
                    </span>
                  );
                }
                return (
                  <Link
                    key={name}
                    className={`pill${selected ? ' is-selected' : ''}${
                      available ? '' : ' is-soldout'
                    }`}
                    to={buildTo(variantUriQuery, value.handle)}
                    replace
                    preventScrollReset
                    prefetch="intent"
                    aria-current={selected ? 'true' : undefined}
                    aria-label={`${option.name} : ${name}${
                      available ? '' : ' (épuisé)'
                    }`}
                  >
                    {name}
                  </Link>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
