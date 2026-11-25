const SITE = 'Alone Hair';

type SeoInput = {
  title?: string | null;
  description?: string | null;
  /** URL absolue de la page (sans paramètres de suivi). */
  url?: string | null;
  image?: {url: string; width?: number | null; height?: number | null; altText?: string | null} | null;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  jsonLd?: Array<Record<string, unknown>>;
};

/**
 * Balises SEO d'une page : <title>, meta description, canonical,
 * Open Graph / Twitter et JSON-LD. Les textes viennent des champs SEO Shopify.
 */
export function seoMeta({title, description, url, image, type = 'website', noindex, jsonLd = []}: SeoInput) {
  const fullTitle = title ? (title.includes(SITE) ? title : `${title} | ${SITE}`) : SITE;
  const desc = description ? truncate(stripHtml(description), 160) : undefined;
  const tags: Array<Record<string, unknown>> = [
    {title: fullTitle},
    {property: 'og:site_name', content: SITE},
    {property: 'og:title', content: fullTitle},
    {property: 'og:type', content: type},
    {property: 'og:locale', content: 'fr_FR'},
    {name: 'twitter:card', content: image ? 'summary_large_image' : 'summary'},
  ];
  if (desc) {
    tags.push({name: 'description', content: desc}, {property: 'og:description', content: desc});
  }
  if (url) {
    tags.push({tagName: 'link', rel: 'canonical', href: url}, {property: 'og:url', content: url});
  }
  if (image?.url) {
    tags.push({property: 'og:image', content: image.url});
    if (image.width) tags.push({property: 'og:image:width', content: String(image.width)});
    if (image.height) tags.push({property: 'og:image:height', content: String(image.height)});
    if (image.altText) tags.push({property: 'og:image:alt', content: image.altText});
  }
  if (noindex) tags.push({name: 'robots', content: 'noindex'});
  for (const data of jsonLd) tags.push({'script:ld+json': data});
  return tags;
}

/** URL canonique : origine + chemin, sans paramètres (sauf ceux listés). */
export function canonicalUrl(request: Request, keep: string[] = []) {
  const url = new URL(request.url);
  const params = new URLSearchParams();
  for (const k of keep) {
    const v = url.searchParams.get(k);
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return `${url.origin}${url.pathname}${qs ? `?${qs}` : ''}`;
}

export function breadcrumbLd(origin: string, items: Array<{name: string; path: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${origin}${item.path}`,
    })),
  };
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
