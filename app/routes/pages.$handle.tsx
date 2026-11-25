import {useLoaderData} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {Accordion, Button, TextLink} from '~/components/ui';
import {seoMeta, stripHtml} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) =>
  data
    ? seoMeta({
        title: data.page.seo?.title || data.page.title,
        description: data.page.seo?.description || data.page.body,
        url: data.url,
      })
    : [{title: 'Alone Hair'}];

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  const url = new URL(request.url);
  return {page, url: `${url.origin}/pages/${page.handle}`};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

/**
 * Découpe un contenu de page en questions/réponses : chaque titre (h2/h3)
 * devient une question, ce qui suit jusqu'au titre suivant la réponse.
 */
function toQuestions(html: string) {
  const parts = html.split(/<h[23][^>]*>/i);
  const intro = parts.shift() ?? '';
  const items = parts.map((part) => {
    const [q, ...rest] = part.split(/<\/h[23]>/i);
    return {question: stripHtml(q), answer: rest.join('').trim()};
  });
  return {intro, items: items.filter((i) => i.question)};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();
  const isFaq = page.handle === 'faq';
  const faq = isFaq ? toQuestions(page.body) : null;
  const hasBody = stripHtml(page.body).length > 0;

  return (
    <article className="content-page">
      <header className="content-page__head container" data-reveal>
        <p className="eyebrow">Alone Hair</p>
        <h1 className="display">{page.title}</h1>
      </header>

      <div className="container content-page__body">
        {faq && faq.items.length > 0 ? (
          <>
            {stripHtml(faq.intro) && <div className="lead rte" dangerouslySetInnerHTML={{__html: faq.intro}} />}
            <div className="faq">
              {faq.items.map((item) => (
                <Accordion key={item.question} title={item.question} group="faq">
                  <div className="prose rte" dangerouslySetInnerHTML={{__html: item.answer}} />
                </Accordion>
              ))}
            </div>
          </>
        ) : hasBody ? (
          <div className="prose rte" dangerouslySetInnerHTML={{__html: page.body}} />
        ) : null}

        {(!hasBody || (faq && faq.items.length === 0)) && <PageFallback handle={page.handle} />}
      </div>
    </article>
  );
}

/** Quand la page Shopify est encore vide : un message utile plutôt qu'un blanc. */
function PageFallback({handle}: {handle: string}) {
  return (
    <div className="page-fallback">
      {handle === 'contact' ? (
        <p className="lead">
          Une question sur une perruque, une nuance ou une commande ? Écrivez-nous sur Instagram : nous répondons en
          semaine.
        </p>
      ) : (
        <p className="lead text-soft">Cette page est en cours de rédaction.</p>
      )}
      <div className="page-fallback__ctas">
        <TextLink href="https://www.instagram.com/alone_hair">Instagram @alone_hair</TextLink>
        <Button to="/collections/perruques" variant="secondary">
          Voir les perruques
        </Button>
      </div>
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      seo {
        title
        description
      }
      body
      seo {
        description
        title
      }
    }
  }
` as const;
