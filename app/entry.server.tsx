import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // Google Fonts : Noto Sans, repli de Verdana quand elle n'est pas installée
    styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.shopify.com', 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://cdn.shopify.com', 'https://fonts.gstatic.com'],
    // Vidéos Shopify : selon l'API, servies par le CDN ou par le domaine de la boutique
    mediaSrc: [
      "'self'",
      'blob:',
      'https://cdn.shopify.com',
      'https://*.shopify.com',
      'https://*.shopifycdn.com',
      'https://*.myshopify.com',
      'https://alonehair.com',
      'https://www.alonehair.com',
      ...(context.env.PUBLIC_STORE_DOMAIN?.startsWith('http') ? [] : [`https://${context.env.PUBLIC_STORE_DOMAIN}`]),
    ],
    // Lecteur TikTok de la fiche produit (chargé seulement au clic)
    frameSrc: ["'self'", 'https://www.tiktok.com'],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
