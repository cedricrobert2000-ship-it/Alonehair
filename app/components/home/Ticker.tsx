/**
 * Bandeau de texte qui défile (sous le hero).
 * Les éléments viennent de la page : faits produits + engagements Shopify.
 */
export function Ticker({items}: {items: string[]}) {
  if (!items.length) return null;
  const row = [...items, ...items, ...items];
  return (
    <div className="ticker" role="marquee" aria-label={items.join(', ')}>
      <div className="ticker__track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <span key={copy} className="ticker__row">
            {row.map((t, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={`${t}-${i}`} className="ticker__item">
                {t}
                <span className="ticker__dot">✦</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
