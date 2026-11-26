import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {toPath} from '~/lib/url';
import {DarkPanel} from '~/components/ui/DarkPanel';
import {FitText} from '~/components/ui/FitText';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

/** Réseaux sociaux de la marque (comptes officiels, liens du site actuel). */
const SOCIALS = [
  {label: 'Instagram', href: 'https://www.instagram.com/alone_hair'},
  {label: 'TikTok', href: 'https://www.tiktok.com/@alonehair'},
];

/**
 * Pied de page noir façon Veloraskin : grand logo blanc, colonnes de liens
 * (menu principal et collections lus dans Shopify), politiques, réseaux.
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}: FooterProps) {
  const domains = [header.shop.primaryDomain?.url, publicStoreDomain];
  const items = header.menu?.items ?? [];
  const collections = items.find((i) => i.items?.length)?.items ?? [];
  const pages = items.filter((i) => !i.items?.length);

  return (
    <DarkPanel as="footer" className="site-footer">
      <div className="container">
        <div className="site-footer__cols">
          <div className="site-footer__col site-footer__brand">
            <p className="site-footer__title">Alone Hair</p>
            <p className="site-footer__about">
              Perruques et extensions en cheveux 100 % naturels, single donor, faites main, sur commande.
            </p>
            <Link className="link link--light" to="/pages/contact">
              Nous contacter
            </Link>
          </div>
          {collections.length > 0 && (
            <FooterCol title="Collections">
              {collections.map((c) => (
                <li key={c.id}>
                  <Link to={toPath(c.url, domains)} prefetch="intent">
                    {c.title}
                  </Link>
                </li>
              ))}
            </FooterCol>
          )}
          <FooterCol title="La maison">
            {pages.map((p) => (
              <li key={p.id}>
                <Link to={toPath(p.url, domains)} prefetch="intent">
                  {p.title}
                </Link>
              </li>
            ))}
          </FooterCol>
          <Suspense fallback={null}>
            <Await resolve={footerPromise} errorElement={null}>
              {(footer) => {
                const policies = [
                  footer?.shop.shippingPolicy,
                  footer?.shop.refundPolicy,
                  footer?.shop.termsOfService,
                  footer?.shop.privacyPolicy,
                ].filter(Boolean);
                if (!policies.length) return null;
                return (
                  <FooterCol title="Informations">
                    {policies.map((p) => (
                      <li key={p!.id}>
                        <Link to={`/policies/${p!.handle}`}>{p!.title}</Link>
                      </li>
                    ))}
                  </FooterCol>
                );
              }}
            </Await>
          </Suspense>
          <FooterCol title="Suivez-nous">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
              </li>
            ))}
          </FooterCol>
        </div>

        <FitText as="p" className="site-footer__word">
          {header.shop.name.toUpperCase()}
        </FitText>

        <div className="site-footer__bottom">
          <p>
            © {new Date().getFullYear()} {header.shop.name}. Cheveux 100 % naturels, faits main, sur commande.
          </p>
          <Link to="/collections/perruques">Découvrir les perruques</Link>
        </div>
      </div>
    </DarkPanel>
  );
}

function FooterCol({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <div className="site-footer__col">
      <p className="site-footer__title">{title}</p>
      <ul>{children}</ul>
    </div>
  );
}
