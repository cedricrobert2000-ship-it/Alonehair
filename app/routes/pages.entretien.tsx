import {useLoaderData} from 'react-router';
import type {Route} from './+types/pages.entretien';
import {Manifesto, PageIntro, StackCards} from '~/components/content/ContentBlocks';
import {Button} from '~/components/ui';
import {ENTRETIEN} from '~/content/pages';
import {loadPageSeo} from '~/lib/content-page';
import {breadcrumbLd, seoMeta} from '~/lib/seo';
import contentStyles from '~/styles/content.css?url';

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: contentStyles}];

export const meta: Route.MetaFunction = ({data}) =>
  seoMeta({
    title: data?.page?.seo?.title || 'Entretien des perruques et extensions',
    description: data?.page?.seo?.description || ENTRETIEN.lead,
    url: data?.url,
    image: ENTRETIEN.strip[0],
    jsonLd: data
      ? [
          breadcrumbLd(data.origin, [
            {name: 'Accueil', path: '/'},
            {name: 'Entretien', path: '/pages/entretien'},
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'Entretenir une perruque ou des extensions en cheveux naturels',
            step: ENTRETIEN.cards.map((c) => ({
              '@type': 'HowToStep',
              name: `${c.title} ${c.accent}`,
              text: [c.intro, ...(c.points ?? [])].join(' '),
            })),
          },
        ]
      : [],
  });

export async function loader({context, request}: Route.LoaderArgs) {
  return loadPageSeo(context.storefront, 'entretien', request);
}

export default function Entretien() {
  useLoaderData<typeof loader>();
  return (
    <article className="content-page-v2">
      <PageIntro title={ENTRETIEN.title} lead={ENTRETIEN.lead} aside={ENTRETIEN.aside} images={ENTRETIEN.strip} />
      <StackCards heading="Les bons gestes" cards={ENTRETIEN.cards} />
      <Manifesto variant="light" eyebrow={ENTRETIEN.manifesto.eyebrow} text={ENTRETIEN.manifesto.text} signature={ENTRETIEN.manifesto.signature}>
        <div className="manifesto__ctas">
          <Button to="/collections/soins-des-cheveux">
            Nos soins
          </Button>
          <Button to="/pages/contact" variant="secondary">
            Demander une retouche
          </Button>
        </div>
      </Manifesto>
    </article>
  );
}
