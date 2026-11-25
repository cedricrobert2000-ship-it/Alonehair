import {Await, Link} from 'react-router';
import {Suspense, useId} from 'react';
import type {CartApiQueryFragment, FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, MobileMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {SEARCH_ENDPOINT, SearchFormPredictive} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <CartAside cart={cart} />
      <SearchAside />
      <Aside type="mobile" heading="Menu">
        <MobileMenu
          menu={header.menu}
          domains={[header.shop.primaryDomain?.url, publicStoreDomain]}
        />
      </Aside>
      {header && (
        <Header header={header} cart={cart} isLoggedIn={isLoggedIn} publicStoreDomain={publicStoreDomain} />
      )}
      <main id="contenu" tabIndex={-1}>
        {children}
      </main>
      <Footer footer={footer} header={header} publicStoreDomain={publicStoreDomain} />
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="Votre panier">
      <Suspense fallback={<p className="text-soft">Chargement du panier…</p>}>
        <Await resolve={cart}>{(cart) => <CartMain cart={cart} layout="aside" />}</Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="Rechercher">
      <div className="predictive-search">
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <div className="inline-form">
              <input
                className="input"
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Une perruque, une longueur…"
                aria-label="Rechercher"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              <button className="btn" type="button" onClick={goToSearch}>
                OK
              </button>
            </div>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {collections, pages, products, queries} = items;
            if (state === 'loading' && term.current) {
              return <p className="text-soft">Recherche…</p>;
            }
            if (!total) return <SearchResultsPredictive.Empty term={term} />;
            return (
              <>
                <SearchResultsPredictive.Queries queries={queries} queriesDatalistId={queriesDatalistId} />
                <SearchResultsPredictive.Products products={products} closeSearch={closeSearch} term={term} />
                <SearchResultsPredictive.Collections collections={collections} closeSearch={closeSearch} term={term} />
                <SearchResultsPredictive.Pages pages={pages} closeSearch={closeSearch} term={term} />
                {term.current && total ? (
                  <Link className="link" onClick={closeSearch} to={`${SEARCH_ENDPOINT}?q=${term.current}`}>
                    Voir tous les résultats
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}
