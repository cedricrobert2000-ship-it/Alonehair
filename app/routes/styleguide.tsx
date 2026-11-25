import {useCallback, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/styleguide';
import {
  getProductOptions,
  getSelectedProductOptions,
  Image,
} from '@shopify/hydrogen';
import {
  Accordion,
  Badge,
  Banner,
  BurgerButton,
  Button,
  Checkbox,
  Drawer,
  NavLinkRoll,
  PRODUCT_CARD_FRAGMENT,
  ProductCard,
  ProductCardSkeleton,
  QuantityInput,
  Section,
  SectionHead,
  SelectField,
  TextAreaField,
  TextField,
  TextLink,
  VariantOptions,
  type ProductCardData,
} from '~/components/ui';
import {formatMoney} from '~/lib/format';
import styleguideStyles from '~/styles/styleguide.css?url';

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: styleguideStyles},
];

/**
 * /styleguide — système de design Alone Hair (Prompt 0).
 * Toutes les données produits viennent de la Storefront API.
 * Page interne : non indexée.
 */
export const meta: Route.MetaFunction = () => [
  {title: 'Système de design | Alone Hair'},
  {name: 'robots', content: 'noindex, nofollow'},
];

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const url = new URL(request.url);

  const [{collection, products}, hero] = await Promise.all([
    storefront.query(STYLEGUIDE_QUERY, {cache: storefront.CacheShort()}),
    storefront
      .query(STYLEGUIDE_HERO_QUERY, {cache: storefront.CacheShort()})
      .then((r) => r.metaobject)
      .catch(() => null),
  ]);

  // Les perruques (ordre manuel de la collection), sinon n'importe quels produits
  const cards = (collection?.products.nodes.length
    ? collection.products.nodes
    : products.nodes) as ProductCardData[];

  // Produit de démonstration du sélecteur : celui qui a le plus d'options
  const byOptions = [...cards].sort(
    (a, b) => b.options.length - a.options.length,
  );
  const handle = url.searchParams.get('produit') ?? byOptions[0]?.handle;

  const selectedOptions = getSelectedProductOptions(request).filter(
    (o) => o.name !== 'produit',
  );

  const {product} = handle
    ? await storefront.query(STYLEGUIDE_PRODUCT_QUERY, {
        variables: {handle, selectedOptions},
      })
    : {product: null};

  return {cards, product, hero, bannerImage: collection?.image ?? null};
}

/* --------------------------------------------------------------------------
 * Données d'affichage des tokens (les valeurs réelles sont dans tokens.css)
 * ------------------------------------------------------------------------ */
const COLORS = [
  ['--color-ink', '#0C0C0C', 'Texte, boutons pleins'],
  ['--color-ink-soft', 'Noir 65 %', 'Texte secondaire'],
  ['--color-ink-mute', 'Noir 40 %', 'Désactivé, prix barré'],
  ['--color-line', 'Noir 12 %', 'Filets, bordures'],
  ['--color-bg', '#FFFFFF', 'Fond'],
  ['--color-surface', '#F7F7F7', 'Blocs, fonds de photo'],
  ['--color-pill', '#EDEDED', 'Pastilles au repos'],
  ['--color-veil', 'Noir 30 %', 'Voile sur vidéo hero'],
] as const;

const TYPE = [
  ['display', 'Inter Tight 500 · 48 → 110 px · −4,5 %', 'Designed to be rare'],
  ['h1', 'Inter Tight 500 · 40 → 72 px', 'Perruques faites main'],
  ['h2', 'Inter Tight 500 · 32 → 54 px', 'Les préférées de nos clientes'],
  ['h3', 'Inter Tight 500 · 24 → 32 px', 'Notre histoire'],
  ['h4', 'Inter Tight 500 · 20 → 24 px', 'Livraison et échanges'],
] as const;

const SPACES = [
  ['--space-1', 4],
  ['--space-2', 8],
  ['--space-3', 12],
  ['--space-4', 16],
  ['--space-6', 24],
  ['--space-8', 32],
  ['--space-12', 48],
  ['--space-16', 64],
  ['--space-24', 96],
  ['--space-32', 128],
] as const;

const MOTION = [
  ['--dur-fast', '200 ms', 'Couleurs, bordures au survol'],
  ['--dur-roll', '350 ms', 'Lettres qui roulent (10 ms entre chaque)'],
  ['--dur-base', '500 ms', 'Apparition au scroll, tiroirs'],
  ['--dur-slow', '900 ms', 'Zoom des photos, entrée du hero'],
  ['--ease-out', 'power2.out', 'Courbe par défaut'],
] as const;

export default function Styleguide() {
  const {cards, product, hero, bannerImage} = useLoaderData<typeof loader>();

  return (
    <div className="sg">
      <header className="container section--sm sg-intro" data-reveal>
        <img
          className="sg-logo"
          src="/brand/logo-alone-hair.png"
          alt="Alone Hair"
          width={779}
          height={68}
        />
        <p className="eyebrow">Système de design · v0</p>
        <h1 className="display">
          Luxe éditorial,
          <br />
          <span className="title-soft">minimal et lumineux.</span>
        </h1>
        <p className="lead text-soft">
          Les cheveux sont la seule couleur. Grandes photos portées, angles
          droits, typographie serrée et micro-interactions discrètes.
        </p>
      </header>

      <HeroDemo hero={hero} fallbackImage={bannerImage ?? cards[0]?.images.nodes[0]} />

      <SgSection id="couleurs" n="01" title="Couleurs">
        <ul className="sg-colors" data-reveal-group>
          {COLORS.map(([token, value, usage]) => (
            <li key={token}>
              <span className="sg-swatch" style={{background: `var(${token})`}} />
              <code>{token}</code>
              <span>{value}</span>
              <span className="text-soft">{usage}</span>
            </li>
          ))}
        </ul>
      </SgSection>

      <SgSection id="typographie" n="02" title="Typographie">
        <p className="text-soft sg-note">
          Polices d&apos;Organic Care : texte et interface en <strong>Inter</strong>,
          titres en <strong>Inter Tight</strong> (à la place de PP Mori, police
          payante). Deux familles Google Fonts, quatre graisses au total.
        </p>
        <div className="sg-type">
          {TYPE.map(([cls, spec, sample]) => (
            <div key={cls} className="sg-type__row" data-reveal>
              <span className="sg-type__spec">
                <code>.{cls}</code>
                <span className="text-soft">{spec}</span>
              </span>
              <p className={cls}>{sample}</p>
            </div>
          ))}
          <div className="sg-type__row" data-reveal>
            <span className="sg-type__spec">
              <code>.lead</code>
              <span className="text-soft">Inter 400 · 17 px</span>
            </span>
            <p className="lead">
              Des perruques en cheveux 100 % naturels, faites main, sur commande.
            </p>
          </div>
          <div className="sg-type__row" data-reveal>
            <span className="sg-type__spec">
              <code>body</code>
              <span className="text-soft">Inter 400 · 15 px · 1,65</span>
            </span>
            <p className="prose">
              Chaque pièce est montée à la main à partir d&apos;un seul donneur.
              Le texte courant reste court, au vouvoiement, chaleureux et
              premium.{' '}
              <a className="inline-link" href="#typographie">
                Lien dans le texte
              </a>
              .
            </p>
          </div>
          <div className="sg-type__row" data-reveal>
            <span className="sg-type__spec">
              <code>.eyebrow</code>
              <span className="text-soft">Inter 500 · 11 px · capitales · +22 %</span>
            </span>
            <p className="eyebrow">Nos best-sellers</p>
          </div>
        </div>
      </SgSection>

      <SgSection id="espacements" n="03" title="Espacements et grille">
        <ul className="sg-spaces">
          {SPACES.map(([token, px]) => (
            <li key={token}>
              <code>{token}</code>
              <span className="sg-space-bar" style={{width: `var(${token})`}} />
              <span className="text-soft">{px} px</span>
            </li>
          ))}
        </ul>
        <p className="text-soft sg-note">
          Contenu éditorial : 1220 px max, gouttière 16 → 80 px. Grilles
          produits et médias : 1440 px, gouttière 16 → 24 px, presque bord à
          bord comme la référence. Sections : 64 → 120 px de marge verticale.
          Angles droits partout, aucune ombre hors tiroirs.
        </p>
      </SgSection>

      <SgSection id="mouvement" n="04" title="Mouvement">
        <ul className="sg-motion">
          {MOTION.map(([token, value, usage]) => (
            <li key={token}>
              <code>{token}</code>
              <span>{value}</span>
              <span className="text-soft">{usage}</span>
            </li>
          ))}
        </ul>
        <p className="text-soft sg-note">
          Apparition au scroll : fondu + montée de 40 px, éléments en cascade
          (120 ms). Toutes les durées passent à 0 si le téléphone demande moins
          d&apos;animations (prefers-reduced-motion).
        </p>
      </SgSection>

      <SgSection id="boutons" n="05" title="Boutons et liens">
        <ButtonsDemo />
        <div className="sg-row">
          <TextLink to="/collections/perruques">Découvrir la collection</TextLink>
          <NavLinkRoll to="/collections">Nos collections</NavLinkRoll>
          <NavLinkRoll to="/pages/entretien">Entretien</NavLinkRoll>
        </div>
        <div className="sg-onphoto">
          <Button variant="light">Trouver ma perruque</Button>
          <TextLink to="/collections/best-sellers" light>
            Voir les best-sellers
          </TextLink>
        </div>
        <p className="text-soft sg-note">
          &lt;Button&gt; : primaire, secondaire, clair, pleine largeur, lien
          (prop <code>to</code>), désactivé, chargement (aria-busy, pas de
          double clic, largeur conservée). Survol : les lettres roulent ; au
          clavier, le focus est toujours visible.
        </p>
      </SgSection>

      <SgSection id="champs" n="06" title="Champs">
        <FormDemo />
      </SgSection>

      <SgSection id="variantes" n="07" title="Sélecteurs de variantes">
        {product ? (
          <VariantDemo product={product} cards={cards} />
        ) : (
          <p className="text-soft">Aucun produit trouvé dans la boutique.</p>
        )}
      </SgSection>

      <Section id="cartes" wide>
        <SectionHead
          eyebrow="08"
          title="Carte produit"
          action={<TextLink to="/collections/perruques">Toutes les perruques</TextLink>}
        />
        <ul className="product-grid" data-reveal-group>
          {cards.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} badges={i === 0 ? ['Best-seller'] : []} />
            </li>
          ))}
        </ul>
        <p className="eyebrow sg-subhead">État de chargement</p>
        <div className="product-grid">
          {[0, 1, 2, 3].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
        <p className="text-soft sg-note">
          Portrait 3:4. Desktop : deuxième photo au survol, vignettes pour
          parcourir les photos (souris et clavier). Mobile : 2 colonnes, prix
          sous le nom. Badge « Épuisé » automatique si plus rien n&apos;est
          disponible. Photos 3 et 4 chargées seulement à la demande.
        </p>
      </Section>

      <SgSection id="accordeons" n="09" title="Accordéons et tiroir">
        <div className="sg-acc">
          <Accordion title="Description" defaultOpen group="sg-fiche">
            Le contenu vient de la description Shopify du produit
            (descriptionHtml).
          </Accordion>
          <Accordion title="Entretien" group="sg-fiche">
            Le contenu viendra de la page Shopify « entretien ».
          </Accordion>
          <Accordion title="Livraison et échanges" group="sg-fiche">
            Le contenu viendra des métaobjets et des politiques Shopify.
          </Accordion>
        </div>
        <DrawerDemo />
        <p className="text-soft sg-note">
          Accordéons natifs (un seul ouvert à la fois, Ctrl+F trouve le texte
          caché). Tiroir : Échap ou clic sur le fond pour fermer, focus piégé
          dans le tiroir puis rendu au bouton, page bloquée derrière.
        </p>
      </SgSection>

      <SgSection id="logo" n="10" title="Logo">
        <div className="sg-logos">
          <div>
            <img src="/brand/logo-alone-hair.png" alt="Alone Hair, logo noir" width={779} height={68} />
          </div>
          <div className="is-dark">
            <img src="/brand/logo-alone-hair.png" alt="Alone Hair, logo blanc" width={779} height={68} />
          </div>
        </div>
        <p className="text-soft sg-note">
          Logo actuel conservé tel quel. Version blanche obtenue en CSS sur
          photo ou fond noir (pied de page, hero).
        </p>
      </SgSection>

      <SgSection id="composants" n="11" title="Composants">
        <ul className="sg-components">
          {COMPONENTS.map(([name, rules]) => (
            <li key={name}>
              <code>&lt;{name}&gt;</code>
              <span className="text-soft">{rules}</span>
            </li>
          ))}
        </ul>
      </SgSection>
    </div>
  );
}

const COMPONENTS = [
  ['Button', 'Variantes, lien, désactivé, chargement (aria-busy), cible 48 px'],
  ['TextLink / NavLinkRoll', 'Lien interne préchargé ; lien externe ouvert dans un nouvel onglet et annoncé'],
  ['TextField / TextAreaField / SelectField', 'Label relié, aide et erreur annoncées, aria-invalid, 16 px (pas de zoom iPhone), « facultatif »'],
  ['Checkbox', 'Zone cliquable sur tout le libellé, complément de prix'],
  ['QuantityInput', 'Boutons et saisie, bornes min/max, fonctionne dans un formulaire sans JS'],
  ['VariantOptions', 'Pastilles-liens : choix, épuisé, inexistant ; URL et prix mis à jour'],
  ['ProductCard / ProductCardSkeleton', '3:4, photo au survol, vignettes clavier, badges, épuisé, chargement'],
  ['Banner', 'Photo ou vidéo, bouton pause, pas de lecture auto si animations réduites, image prioritaire (LCP)'],
  ['Accordion', '<details> natif, groupe exclusif, fonctionne sans JS'],
  ['Drawer / BurgerButton', 'Échap, focus piégé et rendu, défilement bloqué, inert fermé'],
  ['Section / SectionHead / Badge', 'Mise en page et étiquettes'],
  ['RevealObserver', 'Apparition au scroll, filet de sécurité sans JS, mouvement réduit respecté'],
] as const;

/* --------------------------------------------------------------------------
 * Sous-composants de démonstration
 * ------------------------------------------------------------------------ */

function SgSection({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Section id={id} className="sg-section">
      <SectionHead eyebrow={n} title={title} />
      {children}
    </Section>
  );
}

type HeroData = Awaited<ReturnType<typeof loader>>['hero'];

function HeroDemo({
  hero,
  fallbackImage,
}: {
  hero: HeroData;
  fallbackImage?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
}) {
  const field = (key: string) => hero?.fields.find((f) => f.key === key);
  const ctaLink = field('cta_link')?.value;
  const videoRef = field('video_desktop')?.reference;
  const sources =
    videoRef?.__typename === 'Video'
      ? videoRef.sources.filter((s) => s.mimeType === 'video/mp4').map((s) => ({url: s.url, height: 720}))
      : [];

  return (
    <section className="sg-hero" aria-label="Exemple de hero">
      <Banner
        as="p"
        eyebrow={field('title')?.value ?? 'Alone Hair'}
        title={field('subtitle')?.value ?? 'Designed to be rare'}
        cta={{
          label: field('cta_label')?.value ?? 'Découvrir les perruques',
          to: ctaLink && ctaLink.startsWith('/') ? ctaLink : '/collections/perruques',
        }}
        video={
          sources.length
            ? {
                sources,
                poster: videoRef?.__typename === 'Video' ? videoRef.previewImage?.url : undefined,
              }
            : null
        }
        image={fallbackImage}
      />
      <p className="container text-soft sg-note">
        &lt;Banner&gt; : vidéo du métaobjet <code>home_hero</code> (sinon une
        photo de la collection), voile 30 %, encart blanc qui monte pendant que
        l&apos;image se resserre, bouton pause.
      </p>
    </section>
  );
}

function ButtonsDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="sg-row">
      <Button
        loading={loading}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1800);
        }}
      >
        Ajouter au panier
      </Button>
      <Button variant="secondary">Guide des tailles</Button>
      <Button disabled>Épuisé</Button>
      <Button to="/collections/perruques" variant="secondary">
        Voir les perruques
      </Button>
    </div>
  );
}

function FormDemo() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [layers, setLayers] = useState(false);

  return (
    <form
      className="sg-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) {
          setError('Indiquez une adresse e-mail valide, par exemple vous@exemple.fr.');
          setSent(false);
          return;
        }
        setError(undefined);
        setSent(true);
      }}
    >
      <TextField
        label="Adresse e-mail"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="vous@exemple.fr"
        hint="Envoyez le formulaire vide pour voir l'état d'erreur."
        value={email}
        error={error}
        onChange={(e) => setEmail(e.target.value)}
      />
      <SelectField
        label="Trier par"
        defaultValue="manual"
        optional
        options={[
          {value: 'manual', label: 'Notre sélection'},
          {value: 'price-asc', label: 'Prix croissant'},
          {value: 'price-desc', label: 'Prix décroissant'},
        ]}
      />
      <TextAreaField label="Message" optional rows={4} />
      <TextField label="Champ désactivé" optional disabled value="Non modifiable" readOnly />
      <div className="sg-row">
        <QuantityInput name="quantity" max={10} />
        <Checkbox
          label="Ajouter des layers"
          extra="(option payante)"
          checked={layers}
          onChange={(e) => setLayers(e.target.checked)}
        />
      </div>
      <Button type="submit">Envoyer</Button>
      {sent && (
        <p className="text-soft" role="status">
          Merci, c&apos;est noté (démonstration : rien n&apos;est envoyé).
        </p>
      )}
    </form>
  );
}

type SGProduct = NonNullable<Awaited<ReturnType<typeof loader>>['product']>;

function VariantDemo({product, cards}: {product: SGProduct; cards: ProductCardData[]}) {
  const selected = product.selectedOrFirstAvailableVariant;
  const options = getProductOptions({...product, selectedOrFirstAvailableVariant: selected});
  const available = Boolean(selected?.availableForSale);
  const compareAt =
    selected?.compareAtPrice &&
    Number(selected.compareAtPrice.amount) > Number(selected.price.amount)
      ? selected.compareAtPrice
      : null;

  return (
    <div className="sg-variant">
      <div className="sg-variant__media">
        {selected?.image && (
          <Image
            data={selected.image}
            alt={selected.image.altText ?? product.title}
            aspectRatio="3/4"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
        )}
      </div>
      <div className="sg-variant__info">
        <nav className="sg-variant__switch" aria-label="Changer de produit">
          {cards.map((c) => (
            <Link
              key={c.handle}
              to={`?produit=${c.handle}`}
              preventScrollReset
              aria-current={c.handle === product.handle ? 'true' : undefined}
              className={`pill${c.handle === product.handle ? ' is-selected' : ''}`}
            >
              {c.title}
            </Link>
          ))}
        </nav>
        <h3 className="h3">{product.title}</h3>
        <p className="sg-variant__price" aria-live="polite">
          {compareAt && <s>{formatMoney(compareAt)}</s>}
          {formatMoney(selected?.price)}
          {!available && <Badge dark>Épuisé</Badge>}
        </p>
        <VariantOptions
          options={options}
          buildTo={(query) => `?produit=${product.handle}&${query}`}
        />
        <Button block disabled={!available}>
          {available ? 'Ajouter au panier' : 'Épuisé'}
        </Button>
        <p className="text-soft text-sm">Faite main, sur commande.</p>
        <p className="text-soft sg-note">
          Pastille noire : choix actuel. Barrée : épuisé. Pointillés :
          combinaison qui n&apos;existe pas. Le prix (annoncé aux lecteurs
          d&apos;écran) et l&apos;URL changent à chaque choix.
        </p>
      </div>
    </div>
  );
}

function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const closeMenu = useCallback(() => setMenu(false), []);
  return (
    <>
      <div className="sg-row">
        <Button variant="secondary" onClick={() => setOpen(true)} aria-haspopup="dialog">
          Ouvrir le tiroir
        </Button>
        <BurgerButton open={menu} onClick={() => setMenu((m) => !m)} />
      </div>
      <Drawer
        open={open}
        onClose={close}
        title="Guide des tailles"
        footer={<Button block onClick={close}>Fermer</Button>}
      >
        <p className="text-soft">
          Exemple de tiroir latéral (guide des tailles de bonnet, panier). Le
          contenu réel viendra de Shopify.
        </p>
      </Drawer>
      <Drawer open={menu} onClose={closeMenu} title="Menu" side="left">
        <p className="text-soft">Exemple de menu mobile (Prompt 1).</p>
      </Drawer>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Requêtes
 * ------------------------------------------------------------------------ */

const STYLEGUIDE_QUERY = `#graphql
  query Styleguide($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: "perruques") {
      image {
        url
        altText
        width
        height
      }
      products(first: 4) {
        nodes {
          ...ProductCard
        }
      }
    }
    products(first: 4) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const STYLEGUIDE_HERO_QUERY = `#graphql
  query StyleguideHero($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobject(handle: {type: "home_hero", handle: "accueil"}) {
      fields {
        key
        value
        reference {
          __typename
          ... on Video {
            previewImage {
              url
            }
            sources {
              url
              mimeType
            }
          }
        }
      }
    }
  }
` as const;

const STYLEGUIDE_VARIANT_FRAGMENT = `#graphql
  fragment StyleguideVariant on ProductVariant {
    id
    title
    availableForSale
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    image {
      id
      url
      altText
      width
      height
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
  }
` as const;

const STYLEGUIDE_PRODUCT_QUERY = `#graphql
  query StyleguideProduct(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      encodedVariantExistence
      encodedVariantAvailability
      options {
        name
        optionValues {
          name
          firstSelectableVariant {
            ...StyleguideVariant
          }
          swatch {
            color
            image {
              previewImage {
                url
              }
            }
          }
        }
      }
      selectedOrFirstAvailableVariant(
        selectedOptions: $selectedOptions
        ignoreUnknownOptions: true
        caseInsensitiveMatch: true
      ) {
        ...StyleguideVariant
      }
      adjacentVariants(selectedOptions: $selectedOptions) {
        ...StyleguideVariant
      }
    }
  }
  ${STYLEGUIDE_VARIANT_FRAGMENT}
` as const;
