@AGENTS.md

# Alone Hair — boutique sur mesure (Hydrogen)

Site e-commerce sur mesure pour **Alone Hair**, marque de perruques et extensions en cheveux 100 % naturels (single donor, Raw Hair), faites main, sur commande.
Front codé avec **Shopify Hydrogen**, hébergé sur **Oxygen**. **Shopify reste le back-office** : produits, stock, prix, paiement, commandes, factures, e-mails.

Langue du site et des réponses : **français**.

---

## 1. Règles absolues

1. **Ne jamais écrire dans la boutique Shopify** (produits, prix, stock, collections, menus, pages, métaobjets) sans demander d'abord. Le site lit les données, il ne les modifie pas.
2. **Aucun prix, stock ou nom de produit en dur dans le code.** Tout vient de la Storefront API.
3. **Le paiement reste le checkout Shopify** (`cart.checkoutUrl`). Ne jamais recréer une page de paiement, ne jamais toucher aux données bancaires.
4. **Conserver les URL actuelles** (voir §6). Le site est indexé sur Google et suivi dans la Search Console.
5. **Pas d'avis clients, de notes ou de chiffres inventés.** Les avis viennent de métaobjets remplis par les propriétaires (§5). Ne rien afficher si c'est vide.
6. Les promesses commerciales (livraison, retours) viennent des métaobjets, **jamais en dur**. La politique actuelle :
   - livraison gratuite en France **à partir de 1 000 €** (8,80 € en dessous) ;
   - **pas de remboursement pour simple changement d'avis** (voir la politique de remboursement Shopify).
   Ne pas reprendre « Livraison offerte dès 50 € » ni « Satisfaite ou remboursée » de l'ancien thème.
7. Avant de dire qu'une tâche est finie : lancer `npm run typecheck` et `npm run build`, et vérifier la page dans le navigateur (desktop **et** mobile 390 px).

---

## 2. Boutique

| Élément | Valeur |
|---|---|
| Domaine | alonehair.com |
| Boutique | sv4tev-bg.myshopify.com |
| Marché | France uniquement, EUR |
| Forfait | Basic (1 environnement public Oxygen ; liens de partage disponibles) |
| Trafic | ~85 % mobile, beaucoup de navigateurs intégrés Instagram / TikTok → **mobile first** |

---

## 3. Identité visuelle

Direction : **luxe éditorial, minimal, lumineux**. Beaucoup de blanc, grandes photos portées, typographie fine, très peu d'ornements. Le produit (les cheveux) est la star.

**Références visuelles** (captures dans `references/`) :
- accueil : template Webflow *Organic Care* (organic-care-template.webflow.io) ;
- fiche produit et collection : template Webflow *Veloraskin* (veloraskin.webflow.io).
S'inspirer de leur structure, de leurs espacements et de leurs interactions, **sans copier** textes, images ni logos. Le système de design validé est visible sur la route `/styleguide` : toute nouvelle page doit l'utiliser.

- **Couleurs** : noir `#0C0C0C` (texte), blanc `#FFFFFF` (fond), gris de texte secondaire = noir à 65 % d'opacité. Les accents viennent des photos, pas de l'interface.
- **Typographie** : Montserrat (400 / 500) pour tout ; titres en 400, `letter-spacing: -0.01em`.
  - Sur-titres (eyebrows) : MAJUSCULES, 11–12 px, 500, `letter-spacing: 0.18–0.24em`.
  - Boutons et liens : MAJUSCULES, 12 px, 500, `letter-spacing: 0.18em`, soulignement fin animé.
- **Largeur max du contenu** : 1220 px ; gouttière 16 px sur mobile, 80 px sur desktop.
- **Photos** : ratio portrait 3:4 pour les cartes produit, avec une deuxième photo au survol (desktop).
- **Vidéo hero** : pleine largeur, voile noir à 30 %, texte en bas à gauche (« ALONE HAIR / Designed to be rare »).
- **Ton** : vouvoiement, phrases courtes, chaleureux et premium. Pas d'emoji.
- **Animations** : discrètes (fondu ou léger glissement au scroll, 300–500 ms). Respecter `prefers-reduced-motion`.

---

## 4. Données produits (Storefront API)

### Options des variantes (noms exacts)
- `Type de cheveux` : Raw Hair, Gros grain indien
- `Type de lace` : 5x5 HD, 13x4 HD, 13x6 HD
- `Longueur` : 10 pouces … 36 pouces
- `Taille du bonnet` : S, M, L (perruques indétectables 13×6)

Chaque produit n'a qu'une partie de ces options : le sélecteur doit s'adapter, griser les combinaisons inexistantes ou épuisées, et mettre à jour le prix et l'URL (`?variant=`) à chaque choix.

### Métachamps utilisés
- `custom.tiktok_url` (url) : vidéo TikTok de la perruque. La section TikTok n'apparaît que si le champ est rempli. Extraire l'ID après `/video/`.
- `custom.tiktok_vues` (texte) : nombre de vues affiché, ex. « 2,4 M de vues ».
- `shopify.cap-size`, `shopify.lace-type`, `shopify.hair-type` : métaobjets de catégorie Shopify (affichables en caractéristiques).

Les métachamps doivent être exposés à la Storefront API (Paramètres → Données personnalisées → accès Storefront) : demander avant de le faire.

### Collections (handles)
`perruques` (ordre manuel, à respecter) · `perruque-indetectable-13x6` · `bundles` · `laces-closures` · `coloration` · `soins-des-cheveux` · `seconde-main` · `best-sellers`

### Pages (handles)
`a-propos` · `faq` · `entretien` · `contact`
Politiques : remboursement, confidentialité (via `shop.privacyPolicy`, `shop.refundPolicy`…).

### Menu
Lire le menu `main-menu` via l'API (ne pas le coder en dur) : À propos · Nos collections (sous-menu) · Seconde main · Entretien · FAQ · Contact.

---

## 5. Contenu éditable par les propriétaires (métaobjets)

Les textes de la page d'accueil doivent être modifiables depuis l'admin Shopify, sans code. Définitions à **créer avec accord** (accès Storefront activé) :

| Type | Champs |
|---|---|
| `home_hero` (1 entrée) | `title`, `subtitle`, `video_desktop` (fichier), `video_mobile` (fichier), `cta_label`, `cta_link` |
| `home_promise` (liste) | `title`, `text` |
| `home_review` (liste) | `author`, `city`, `text`, `rating` (1–5) |
| `home_story` (1 entrée) | `eyebrow`, `title`, `quote`, `text`, `image` |

Si un métaobjet est vide, la section correspondante ne s'affiche pas.

---

## 6. URL à conserver (SEO)

| Page | Route Hydrogen |
|---|---|
| Accueil | `/` |
| Produit | `/products/:handle` |
| Collection | `/collections/:handle` |
| Toutes les collections | `/collections` et `/collections/all` |
| Page | `/pages/:handle` |
| Politiques | `/policies/:handle` |
| Recherche | `/search` |
| Panier | `/cart` |

Ajouter pour chaque page : `<title>` et meta description venant du champ SEO Shopify, balise canonique, Open Graph, et JSON-LD (`Product` avec prix et disponibilité, `BreadcrumbList`, `Organization`). Générer `sitemap.xml` et `robots.txt`.

---

## 7. Pages à construire (ordre de priorité)

1. **Fiche produit** : galerie photos et vidéos (swipe sur mobile), sélecteur de variantes, prix, bouton d'ajout au panier fixé en bas sur mobile, onglets Description / Entretien / Livraison et retours, section TikTok, guide des tailles de bonnet, mention « Faite main, sur commande ».
2. **Collection** : grille 2 colonnes sur mobile et 4 sur desktop, « à partir de » le prix minimum, filtres (type de cheveux, lace, longueur) si disponibles.
3. **Accueil** : hero vidéo → catégories → best-sellers (8 premières perruques de `perruques`) → notre histoire → avis → promesses.
4. **Panier** : tiroir latéral + page `/cart`, et seuil de livraison gratuite (1 000 €) affiché comme une barre de progression.
5. **Pages de contenu** et politiques.
6. **Recherche**, 404, en-tête et pied de page.

---

## 8. Technique

- Partir du template officiel Hydrogen (`npm create @shopify/hydrogen@latest`), TypeScript.
- Styles : CSS natif ou Tailwind, avec des variables CSS pour les couleurs et les tailles. Pas de grosse librairie d'UI.
- Images via le composant `Image` de Hydrogen (CDN Shopify, `srcset`, lazy loading). Vidéos en `muted playsinline loop`.
- Performance : viser un LCP < 2,5 s sur mobile 4G, et aucune police chargée hors Google Fonts / auto-hébergée.
- Accessibilité : contrastes AA, focus visible, `alt` venant de Shopify, sélecteurs de variantes utilisables au clavier.
- Analytics : composant `Analytics` de Hydrogen + bandeau de consentement cookies (RGPD).
- Doc à jour : utiliser le MCP **Shopify Dev** pour la Storefront API et Hydrogen, plutôt que la mémoire.

## 9. Déploiement

- `main` → environnement **Production** sur Oxygen (pas relié au domaine tant que les propriétaires n'ont pas validé).
- Autres branches → aperçus. Pour montrer un aperçu sans compte : page du déploiement → **Partager** → « Toute personne disposant du lien ».
- Les aperçus utilisent les **vrais produits et le vrai paiement** : ne pas passer de commande de test sans prévenir.
- Bascule finale : Paramètres → Domaines → relier alonehair.com au storefront Hydrogen. L'ancien thème reste disponible pour revenir en arrière.
