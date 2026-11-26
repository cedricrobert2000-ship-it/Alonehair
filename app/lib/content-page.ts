import type {Storefront} from '@shopify/hydrogen';

/** Titre et champs SEO d'une page Shopify (le contenu, lui, vient de app/content). */
export async function loadPageSeo(storefront: Storefront, handle: string, request: Request) {
  const {page} = await storefront.query(PAGE_SEO_QUERY, {variables: {handle}, cache: storefront.CacheLong()});
  const origin = new URL(request.url).origin;
  return {page, origin, url: `${origin}/pages/${handle}`};
}

const PAGE_SEO_QUERY = `#graphql
  query ContentPageSeo($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    page(handle: $handle) {
      title
      seo {
        title
        description
      }
    }
  }
` as const;
