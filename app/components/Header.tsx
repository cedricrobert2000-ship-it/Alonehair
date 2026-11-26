import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, Link, NavLink, useAsyncValue, useLocation} from 'react-router';
import {Image, useAnalytics, useOptimisticCart, type CartViewPayload} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {RollText} from '~/components/ui/RollText';
import {toPath} from '~/lib/url';
import {CONTACT} from '~/content/pages';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type MenuItem = NonNullable<HeaderQuery['menu']>['items'][number];

/**
 * En-tête : logo à gauche, menu `main-menu` (lu dans Shopify) au centre,
 * recherche / compte / panier à droite. Devient compact au scroll.
 * Le sous-menu « Nos collections » s'ouvre au survol, au clic et au clavier.
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}: HeaderProps) {
  const {shop, menu} = header;
  const domains = [shop.primaryDomain?.url, publicStoreDomain];
  const [scrolled, setScrolled] = useState(false);
  // Sur l'accueil, l'en-tête est transparent au-dessus de la vidéo (Organic Care)
  const overlay = useLocation().pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${overlay ? ' is-overlay' : ''}`}>
      <div className="site-header__inner container container--wide">
        <MobileMenuToggle />
        <Link className="site-logo" to="/" prefetch="intent" aria-label={`${shop.name}, accueil`}>
          <img src="/brand/logo-alone-hair.png" alt="" width={779} height={68} />
        </Link>
        {menu && (
          <nav className="site-nav" aria-label="Menu principal">
            <ul>
              {menu.items.map((item) => (
                <DesktopItem key={item.id} item={item} domains={domains} />
              ))}
            </ul>
          </nav>
        )}
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>
    </header>
  );
}

function DesktopItem({item, domains}: {item: MenuItem; domains: Array<string | null | undefined>}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const ref = useRef<HTMLLIElement>(null);
  // délai avant fermeture : laisse le temps d'atteindre le sous-menu à la souris
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // vrai si le menu vient d'être ouvert au survol (le clic qui suit ne doit pas le refermer)
  const openedByHover = useRef(false);
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  useEffect(() => cancelClose, []);
  const url = toPath(item.url, domains);
  const children = item.items ?? [];

  // ferme le sous-menu à chaque navigation
  useEffect(() => setOpen(false), [location.pathname]);

  if (!children.length) {
    return (
      <li>
        <NavLink className="navlink roll-trigger" to={url} prefetch="intent">
          <RollText>{item.title}</RollText>
        </NavLink>
      </li>
    );
  }

  const withImages = children.filter((c) => c.resource && 'image' in c.resource && c.resource.image).slice(0, 3);

  return (
    // Survol = confort souris ; le clavier passe par le <button> (aria-expanded), Échap ferme.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <li
      ref={ref}
      className={`has-mega${open ? ' is-open' : ''}`}
      onMouseEnter={(e) => {
        cancelClose();
        if (!open && e.nativeEvent instanceof MouseEvent) {
          openedByHover.current = true;
          setOpen(true);
        }
      }}
      onMouseLeave={() => {
        cancelClose();
        closeTimer.current = setTimeout(() => {
          openedByHover.current = false;
          setOpen(false);
        }, 180);
      }}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      <button
        type="button"
        className="navlink roll-trigger site-nav__toggle"
        aria-expanded={open}
        onClick={() => {
          if (openedByHover.current) {
            // déjà ouvert par le survol : le clic confirme, il ne referme pas
            openedByHover.current = false;
            setOpen(true);
            return;
          }
          setOpen((o) => !o);
        }}
      >
        <RollText>{item.title}</RollText>
        <span className="chevron" aria-hidden="true" />
      </button>
      <div className="mega" hidden={!open}>
        <div className="mega__inner container container--wide">
          <ul className="mega__links">
            {children.map((child) => (
              <li key={child.id}>
                <NavLink className="mega__link" to={toPath(child.url, domains)} prefetch="intent">
                  {child.title}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mega__cards">
            {withImages.map((child) => {
              const image = child.resource && 'image' in child.resource ? child.resource.image : null;
              return (
                <Link key={child.id} className="catcard catcard--sm" to={toPath(child.url, domains)} prefetch="intent">
                  {image && <Image data={image} alt="" sizes="20vw" aspectRatio="4/5" loading="lazy" />}
                  <span className="catcard__label">
                    <span className="catcard__title">{child.title}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </li>
  );
}

/** Menu mobile plein écran (dans le tiroir de gauche). */
/**
 * Menu mobile plein écran :
 * - les collections en vignettes photo qui défilent au doigt ;
 * - les pages en grands liens numérotés qui montent l'un après l'autre ;
 * - en bas : compte, recherche, réseaux et signature de la marque.
 * Le menu vient de `main-menu` (Shopify), rien n'est codé en dur.
 */
export function MobileMenu({
  menu,
  domains,
}: {
  menu: HeaderQuery['menu'];
  domains: Array<string | null | undefined>;
}) {
  const {close, open} = useAside();
  if (!menu) return null;

  const groups = menu.items.filter((i) => i.items?.length);
  const links = [{id: 'accueil', title: 'Accueil', url: '/'}, ...menu.items.filter((i) => !i.items?.length)];
  let n = 0;

  return (
    <nav className="mm" aria-label="Menu principal">
      {groups.map((group) => {
        const cards = group.items.filter((c) => c.resource && 'image' in c.resource && c.resource.image);
        const textOnly = group.items.filter((c) => !cards.includes(c));
        return (
          <section key={group.id} className="mm__group mm__in" style={{'--i': n++} as React.CSSProperties}>
            <p className="eyebrow mm__eyebrow">{group.title}</p>
            <ul className="mm__cards">
              {cards.map((child) => {
                const image = child.resource && 'image' in child.resource ? child.resource.image : null;
                return (
                  <li key={child.id}>
                    <NavLink to={toPath(child.url, domains)} onClick={close} className="mm__card" prefetch="intent">
                      <span className="mm__card-img">
                        {image && <Image data={image} alt="" sizes="36vw" aspectRatio="4/5" loading="eager" />}
                      </span>
                      <span className="mm__card-title">{child.title}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
            {textOnly.map((child) => (
              <NavLink key={child.id} to={toPath(child.url, domains)} onClick={close} className="link mm__all">
                {child.title}
              </NavLink>
            ))}
          </section>
        );
      })}

      <ul className="mm__links">
        {links.map((item) => {
          const i = n++;
          return (
            <li key={item.id} className="mm__in" style={{'--i': i} as React.CSSProperties}>
              <NavLink
                to={item.url === '/' ? '/' : toPath(item.url, domains)}
                end={item.url === '/'}
                onClick={close}
                className="mm__link"
                prefetch="intent"
              >
                <span className="mm__num" aria-hidden="true">
                  {String(i).padStart(2, '0')}
                </span>
                <span className="mm__label">{item.title}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="mm__foot mm__in" style={{'--i': n++} as React.CSSProperties}>
        <div className="mm__actions">
          <NavLink to="/account" onClick={close} className="btn btn--secondary">
            <span className="btn__label">Mon compte</span>
          </NavLink>
          <button type="button" className="btn btn--secondary" onClick={() => open('search')}>
            <span className="btn__label">Rechercher</span>
          </button>
        </div>
        <ul className="mm__social">
          {SOCIALS.map((s) => (
            <li key={s.href}>
              <a className="link" href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mm__tag accent">Designed to be rare</p>
      </div>
    </nav>
  );
}

const SOCIALS = CONTACT.channels.map((c) => ({label: c.title, href: c.href}));

function MobileMenuToggle() {
  const {open, type} = useAside();
  return (
    <button
      type="button"
      className="icon-btn site-header__burger"
      aria-label="Ouvrir le menu"
      aria-expanded={type === 'mobile'}
      onClick={() => open('mobile')}
    >
      <span className="burger" aria-hidden="true">
        <span />
        <span />
      </span>
    </button>
  );
}

function HeaderCtas({isLoggedIn, cart}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  const {open} = useAside();
  return (
    <div className="site-ctas">
      <button type="button" className="icon-btn" aria-label="Rechercher" onClick={() => open('search')}>
        <IconSearch />
      </button>
      <Suspense fallback={null}>
        <Await resolve={isLoggedIn} errorElement={null}>
          {(loggedIn) => (
            <NavLink
              className="icon-btn site-ctas__account"
              to="/account"
              prefetch="intent"
              aria-label={loggedIn ? 'Mon compte' : 'Se connecter'}
            >
              <IconAccount />
            </NavLink>
          )}
        </Await>
      </Suspense>
      <CartToggle cart={cart} />
    </div>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <a
      href="/cart"
      className="icon-btn site-ctas__cart"
      aria-label={`Panier${count ? `, ${count} article${count > 1 ? 's' : ''}` : ''}`}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <IconBag />
      {count ? <span className="cart-count">{count}</span> : null}
    </a>
  );
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="m13.5 13.5 4 4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconAccount() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="6.5" r="3.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 18c.8-3.4 3.4-5.25 6.5-5.25S15.7 14.6 16.5 18" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.75 6.5h12.5l-1 11H4.75l-1-11Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 8V5.5a3 3 0 0 1 6 0V8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
