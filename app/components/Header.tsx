import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, Link, NavLink, useAsyncValue, useLocation} from 'react-router';
import {Image, useAnalytics, useOptimisticCart, type CartViewPayload} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {RollText} from '~/components/ui/RollText';
import {toPath} from '~/lib/url';

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
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
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
        onClick={() => setOpen((o) => !o)}
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
export function MobileMenu({
  menu,
  domains,
}: {
  menu: HeaderQuery['menu'];
  domains: Array<string | null | undefined>;
}) {
  const {close} = useAside();
  if (!menu) return null;
  return (
    <nav className="mobile-menu" aria-label="Menu principal">
      <ul>
        <li>
          <NavLink to="/" end onClick={close} className="mobile-menu__link">
            Accueil
          </NavLink>
        </li>
        {menu.items.map((item) =>
          item.items?.length ? (
            <li key={item.id}>
              <details className="accordion mobile-menu__group">
                <summary className="mobile-menu__link">
                  {item.title}
                  <span className="accordion__icon" aria-hidden="true" />
                </summary>
                <ul>
                  {item.items.map((child) => (
                    <li key={child.id}>
                      <NavLink to={toPath(child.url, domains)} onClick={close} className="mobile-menu__sublink">
                        {child.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ) : (
            <li key={item.id}>
              <NavLink to={toPath(item.url, domains)} onClick={close} className="mobile-menu__link">
                {item.title}
              </NavLink>
            </li>
          ),
        )}
        <li>
          <NavLink to="/account" onClick={close} className="mobile-menu__link">
            Mon compte
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

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
