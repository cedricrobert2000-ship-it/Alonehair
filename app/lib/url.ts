/**
 * Transforme une URL de menu Shopify (absolue, avec le domaine de la boutique)
 * en chemin interne, pour rester sur le storefront Hydrogen.
 * Les liens vraiment externes (Instagram…) sont laissés tels quels.
 */
export function toPath(
  url: string | null | undefined,
  domains: Array<string | null | undefined>,
) {
  if (!url) return '/';
  try {
    const parsed = new URL(url, 'https://local.invalid');
    const internal =
      parsed.hostname === 'local.invalid' ||
      parsed.hostname.includes('myshopify.com') ||
      domains.some((d) => d && new URL(d.includes('://') ? d : `https://${d}`).hostname === parsed.hostname) ||
      parsed.hostname.endsWith('alonehair.com');
    if (!internal) return url;
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';
  } catch {
    return url;
  }
}

export function isExternal(path: string) {
  return /^https?:\/\//.test(path);
}
