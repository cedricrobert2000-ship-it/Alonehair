type MoneyLike = {amount: string; currencyCode: string};

/**
 * Prix au format français : « 550 € », « 49,90 € ».
 * Pas de décimales quand le montant est rond (rendu plus éditorial).
 */
export function formatMoney(money: MoneyLike | null | undefined) {
  if (!money) return '';
  const value = Number(money.amount);
  const isRound = Number.isInteger(value);
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: money.currencyCode,
    minimumFractionDigits: isRound ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Prix d'une fiche : « À partir de 550 € » si les variantes ont des prix
 * différents, sinon le prix unique.
 */
export function formatPriceRange(range: {
  minVariantPrice: MoneyLike;
  maxVariantPrice: MoneyLike;
}) {
  const min = formatMoney(range.minVariantPrice);
  if (range.minVariantPrice.amount === range.maxVariantPrice.amount) return min;
  return `À partir de ${min}`;
}

/**
 * Résumé court des longueurs disponibles, lu dans l'option « Longueur »
 * du produit : « 10 à 24 pouces », « 12 pouces ». Rien si l'option n'existe pas.
 */
export function summarizeLengths(
  options: Array<{name: string; optionValues: Array<{name: string}>}>,
) {
  const length = options.find((o) => o.name.toLowerCase() === 'longueur');
  if (!length) return null;
  const inches = length.optionValues
    .map((v) => parseInt(v.name, 10))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
  if (!inches.length) return null;
  const min = inches[0];
  const max = inches[inches.length - 1];
  return min === max ? `${min} pouces` : `${min} à ${max} pouces`;
}
