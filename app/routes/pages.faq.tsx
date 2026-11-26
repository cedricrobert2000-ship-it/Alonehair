import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/pages.faq';
import {Manifesto, PageIntro} from '~/components/content/ContentBlocks';
import {Accordion, Button} from '~/components/ui';
import {FAQ, PHOTOS} from '~/content/pages';
import {loadPageSeo} from '~/lib/content-page';
import {breadcrumbLd, seoMeta} from '~/lib/seo';
import contentStyles from '~/styles/content.css?url';

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: contentStyles}];

const ALL = FAQ.groups.flatMap((g) => g.items);

export const meta: Route.MetaFunction = ({data}) =>
  seoMeta({
    title: data?.page?.seo?.title || 'Questions fréquentes',
    description: data?.page?.seo?.description || FAQ.lead,
    url: data?.url,
    jsonLd: data
      ? [
          breadcrumbLd(data.origin, [
            {name: 'Accueil', path: '/'},
            {name: 'FAQ', path: '/pages/faq'},
          ]),
          // Questions/réponses lisibles par Google (résultats enrichis)
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: ALL.map((q) => ({
              '@type': 'Question',
              name: q.question,
              acceptedAnswer: {'@type': 'Answer', text: [...q.answer, ...(q.points ?? [])].join(' ')},
            })),
          },
        ]
      : [],
  });

export async function loader({context, request}: Route.LoaderArgs) {
  return loadPageSeo(context.storefront, 'faq', request);
}

export default function Faq() {
  useLoaderData<typeof loader>();
  return (
    <article className="content-page-v2">
      <PageIntro title={FAQ.title} lead={FAQ.lead} images={[PHOTOS.marble1, PHOTOS.curls, PHOTOS.bob, PHOTOS.street, PHOTOS.blonde, PHOTOS.bathFront]} />

      <div className="container faq-v2">
        <nav className="faq-v2__nav" aria-label="Thèmes de la FAQ">
          <ul>
            {FAQ.groups.map((g, i) => (
              <li key={g.title}>
                <a href={`#faq-${i}`}>
                  {g.title} <span className="accent">{g.accent}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="faq-v2__groups">
          {FAQ.groups.map((g, i) => (
            <section key={g.title} id={`faq-${i}`} className="faq-v2__group" aria-labelledby={`faq-${i}-t`}>
              <h2 className="faq-v2__title" id={`faq-${i}-t`} data-reveal>
                {g.title} <span className="accent">{g.accent}</span>
              </h2>
              <div data-reveal-group>
                {g.items.map((q) => (
                  <Accordion key={q.question} title={q.question} group="faq">
                    <div className="prose faq-v2__answer">
                      {q.answer.map((a) => (
                        <p key={a}>{a}</p>
                      ))}
                      {q.points && (
                        <ul>
                          {q.points.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      )}
                      {q.link &&
                        (q.link.to.startsWith('http') ? (
                          <a className="link" href={q.link.to} target="_blank" rel="noopener noreferrer">
                            {q.link.label}
                            <span className="sr-only"> (nouvel onglet)</span>
                          </a>
                        ) : (
                          <Link className="link" to={q.link.to}>
                            {q.link.label}
                          </Link>
                        ))}
                    </div>
                  </Accordion>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <Manifesto variant="light" eyebrow="Vous n’avez pas trouvé votre réponse ?" text="Écrivez-nous : nous vous répondons sous 24 heures en semaine, pour une nuance, une longueur ou le suivi de votre commande.">
        <div className="manifesto__ctas">
          <Button to="/pages/contact">
            Nous contacter
          </Button>
        </div>
      </Manifesto>
    </article>
  );
}
