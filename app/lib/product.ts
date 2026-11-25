/**
 * Lecture des descriptions produit Alone Hair.
 * Format actuel dans Shopify : paragraphes d'intro, puis des blocs <h3>
 * (« En bref », « Échanges »…). On les sépare pour les onglets de la fiche.
 */
export type DescriptionSection = {title: string | null; html: string};

export function splitDescription(html: string): DescriptionSection[] {
  if (!html) return [];
  const parts = html.split(/<h3[^>]*>/i);
  const sections: DescriptionSection[] = [];
  const intro = parts.shift()?.trim();
  if (intro) sections.push({title: null, html: intro});
  for (const part of parts) {
    const [rawTitle, ...rest] = part.split(/<\/h3>/i);
    const title = rawTitle.replace(/<[^>]*>/g, '').trim();
    const body = rest.join('</h3>').trim();
    if (body) sections.push({title, html: body});
  }
  return sections;
}

/** Teinte lue dans le bloc « En bref » (« Teinte : Brun profond… »). */
export function findShade(html: string) {
  const match = html.match(/<strong>\s*Teinte\s*<\/strong>\s*:?\s*([^<]+)/i);
  return match ? match[1].replace(/^[:\s]+/, '').trim() : null;
}

/** ID d'une vidéo TikTok (le nombre après /video/). */
export function tiktokId(url: string | null | undefined) {
  return url?.match(/\/video\/(\d+)/)?.[1] ?? null;
}

export function sectionByTitle(sections: DescriptionSection[], re: RegExp) {
  return sections.find((s) => s.title && re.test(s.title));
}
