import {Link, useNavigate} from 'react-router';
import type {MappedProductOptions} from '@shopify/hydrogen';

/** Au-delà de ce nombre de valeurs, l'option s'affiche en liste déroulante. */
const DROPDOWN_FROM = 7;

/**
 * Sélecteurs de variantes.
 * - peu de valeurs : pastilles (noire = choisie, barrée = épuisée,
 *   pointillés = combinaison inexistante) ;
 * - beaucoup de valeurs (longueurs…) : liste déroulante native, plus simple
 *   au doigt et au clavier ;
 * - `chosen` : options réellement choisies par la cliente. Tant qu'une option
 *   n'est pas choisie, rien n'est présélectionné (« Choisir… ») ;
 * - `missing` : options manquantes signalées après un clic sur « Ajouter ».
 * Chaque choix met à jour l'URL, donc le prix, la photo et le lien partagé.
 */
export function VariantOptions({
  options,
  chosen,
  missing,
  onChoose,
  buildTo = (query) => `?${query}`,
}: {
  options: MappedProductOptions[];
  chosen?: Set<string>;
  missing?: Set<string>;
  onChoose?: (optionName: string) => void;
  buildTo?: (variantUriQuery: string, handle: string) => string;
}) {
  const navigate = useNavigate();

  return (
    <div className="vopts">
      {options.map((option) => {
        if (option.optionValues.length < 1) return null;
        const isChosen = !chosen || chosen.has(option.name) || option.optionValues.length === 1;
        const selected = isChosen ? option.optionValues.find((v) => v.selected) : undefined;
        const isMissing = missing?.has(option.name);
        const id = `opt-${slug(option.name)}`;
        const errorId = `${id}-error`;

        return (
          <fieldset
            className={`vopt${isMissing ? ' is-missing' : ''}`}
            key={option.name}
            id={id}
            aria-describedby={isMissing ? errorId : undefined}
          >
            <legend className="vopt__legend">
              <span className="vopt__name">{option.name}</span>
              <span className="vopt__value">{selected ? selected.name : 'À choisir'}</span>
            </legend>

            {option.optionValues.length >= DROPDOWN_FROM ? (
              <div className="vopt__select-wrap">
                <label className="sr-only" htmlFor={`${id}-select`}>
                  {option.name}
                </label>
                <select
                  id={`${id}-select`}
                  className="select vopt__select"
                  value={selected ? selected.variantUriQuery : ''}
                  aria-invalid={isMissing || undefined}
                  onChange={(e) => {
                    const value = option.optionValues.find((v) => v.variantUriQuery === e.target.value);
                    if (!value) return;
                    onChoose?.(option.name);
                    void navigate(buildTo(value.variantUriQuery, value.handle), {replace: true, preventScrollReset: true});
                  }}
                >
                  <option value="" disabled>
                    Choisir {option.name.toLowerCase().startsWith('long') ? 'une longueur' : '…'}
                  </option>
                  {option.optionValues.map((v) => (
                    <option key={v.name} value={v.variantUriQuery} disabled={!v.exists}>
                      {v.name}
                      {!v.exists ? ' — indisponible' : !v.available ? ' — épuisé' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="pill-group">
                {option.optionValues.map((value) => {
                  const {name, available, exists, variantUriQuery} = value;
                  const isSelected = isChosen && value.selected;
                  if (!exists) {
                    return (
                      <span key={name} className="pill is-missing" aria-disabled="true" title="Combinaison indisponible">
                        {name}
                      </span>
                    );
                  }
                  return (
                    <Link
                      key={name}
                      className={`pill${isSelected ? ' is-selected' : ''}${available ? '' : ' is-soldout'}`}
                      to={buildTo(variantUriQuery, value.handle)}
                      replace
                      preventScrollReset
                      prefetch="intent"
                      onClick={() => onChoose?.(option.name)}
                      aria-current={isSelected ? 'true' : undefined}
                      aria-label={`${option.name} : ${name}${available ? '' : ' (épuisé)'}`}
                    >
                      {name}
                    </Link>
                  );
                })}
              </div>
            )}

            {isMissing && (
              <p className="vopt__error" id={errorId} role="alert">
                Choisissez {articleFor(option.name)} pour continuer.
              </p>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

function slug(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

/** « une longueur », « un type de lace », « une taille du bonnet »… */
function articleFor(name: string) {
  const n = name.toLowerCase();
  const feminine = /^(longueur|taille|couleur)/.test(n);
  return `${feminine ? 'une' : 'un'} ${n}`;
}
