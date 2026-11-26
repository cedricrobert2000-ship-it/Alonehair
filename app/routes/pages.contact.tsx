import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/pages.contact';
import {Manifesto, PageIntro} from '~/components/content/ContentBlocks';
import {Button} from '~/components/ui';
import {CONTACT, FAQ} from '~/content/pages';
import {loadPageSeo} from '~/lib/content-page';
import {breadcrumbLd, seoMeta} from '~/lib/seo';
import contentStyles from '~/styles/content.css?url';

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: contentStyles}];

export const meta: Route.MetaFunction = ({data}) =>
  seoMeta({
    title: data?.page?.seo?.title || 'Contact',
    description: data?.page?.seo?.description || CONTACT.lead,
    url: data?.url,
    jsonLd: data
      ? [
          breadcrumbLd(data.origin, [
            {name: 'Accueil', path: '/'},
            {name: 'Contact', path: '/pages/contact'},
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Contacter Alone Hair',
            url: data.url,
          },
        ]
      : [],
  });

export async function loader({context, request}: Route.LoaderArgs) {
  return loadPageSeo(context.storefront, 'contact', request);
}

/** Questions les plus utiles avant d'écrire (renvoient vers la FAQ). */
const QUICK = FAQ.groups.flatMap((g) => g.items).slice(0, 4);

export default function Contact() {
  useLoaderData<typeof loader>();
  return (
    <article className="content-page-v2">
      <PageIntro title={CONTACT.title} lead={CONTACT.lead} images={CONTACT.strip} />

      <section className="container contact-v2" aria-labelledby="contact-channels">
        <h2 className="sr-only" id="contact-channels">
          Nous écrire
        </h2>
        <p className="contact-v2__delay" data-reveal>
          <span className="contact-v2__dot" aria-hidden="true" />
          {CONTACT.delay}
        </p>
        <ul className="contact-v2__cards" data-reveal-group>
          {CONTACT.channels.map((c) => (
            <li key={c.title} className="contact-card">
              <p className="eyebrow">{c.title}</p>
              <p className="contact-card__handle accent">{c.accent}</p>
              <p className="contact-card__text">{c.text}</p>
              <a className="btn" href={c.href} target="_blank" rel="noopener noreferrer">
                {c.cta}
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="container contact-v2__faq" aria-labelledby="contact-faq">
        <h2 className="faq-v2__title" id="contact-faq" data-reveal>
          Avant de nous écrire <span className="accent">en bref</span>
        </h2>
        <ul className="contact-v2__quick" data-reveal-group>
          {QUICK.map((q) => (
            <li key={q.question}>
              <Link to="/pages/faq" className="contact-v2__q">
                <span>{q.question}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Manifesto eyebrow="Alone Hair" text="Chaque pièce est faite main, sur commande, à partir des cheveux d’un seul donneur. Dites-nous ce que vous imaginez, nous vous guidons jusqu’à la bonne perruque.">
        <div className="manifesto__ctas">
          <Button to="/collections/perruques" variant="light">
            Voir les perruques
          </Button>
        </div>
      </Manifesto>
    </article>
  );
}
