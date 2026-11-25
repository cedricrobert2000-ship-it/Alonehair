# Alone Hair — démarrage de la préprod Hydrogen

Ce fichier se lit dans l'ordre : **A. Shopify** (à cocher une seule fois) → **B. Ordinateur** → **C. Prompts Claude Code**, à envoyer un par un.

---

## A. À activer dans Shopify (admin, ~20 min)

Rien de tout ça ne touche le site actuel : alonehair.com continue de vendre.

- [ ] **1. Installer le canal Hydrogen**
  Paramètres → Applications et canaux de vente → Shopify App Store → « Hydrogen » → Installer.
  Puis Hydrogen → **Créer un storefront** → nom : `Alone Hair – nouveau site`.

- [ ] **2. Publier les produits et les collections sur le canal Hydrogen** (sinon le nouveau site sera vide)
  - Produits → tout sélectionner → Actions → **Inclure dans les canaux de vente** → cocher Hydrogen.
  - Même chose dans Collections.
  - À l'avenir, chaque nouveau produit doit avoir le canal Hydrogen coché (c'est souvent automatique, mais à vérifier).

- [ ] **3. Ouvrir les métachamps produits à la Storefront API**
  Paramètres → Données personnalisées → Produits :
  - `Lien TikTok` (custom.tiktok_url) → cocher **Accès au storefront**
  - `Vues TikTok` (custom.tiktok_vues) → cocher **Accès au storefront**

- [ ] **4. Installer « Search & Discovery »** (application gratuite de Shopify)
  Elle sert aux **filtres** des collections (type de cheveux, lace, longueur, prix). Dans l'application → Filtres → ajouter :
  - Disponibilité
  - Prix
  - Option produit « Type de cheveux »
  - Option produit « Type de lace »
  - Option produit « Longueur »
  - Option produit « Taille du bonnet »

- [ ] **5. Créer les métaobjets de la page d'accueil**
  Contenu → Métaobjets → Ajouter une définition, avec **Accès au storefront activé** :
  - `home_hero` : `title`, `subtitle`, `video_desktop` (fichier), `video_mobile` (fichier), `cta_label`, `cta_link`
  - `home_promise` : `title`, `text`
  - `home_review` : `author`, `city`, `text`, `rating` (entier 1–5)
  - `home_story` : `eyebrow`, `title`, `quote`, `text`, `image` (fichier)

  Ensuite, remplir 1 hero, 3 ou 4 promesses **vraies** (livraison gratuite dès 1 000 €, fait main, single donor…), et seulement de **vrais** avis.
  *(Claude peut créer ces définitions pour vous depuis le chat Shopify si vous lui demandez.)*

- [ ] **6. Personnaliser la page de paiement**
  Paramètres → Paiement → **Personnaliser** : logo, couleurs noir et blanc, police proche de Montserrat. C'est la seule page qui restera chez Shopify.

- [ ] **7. Ne PAS toucher à Paramètres → Domaines** avant le lancement final.

---

## B. Sur l'ordinateur (une fois)

1. Installer Node.js (LTS), Git, et Claude Code ; créer un compte GitHub.
2. Créer le projet :
   ```
   npm create @shopify/hydrogen@latest
   ```
   Choisir TypeScript, puis le modèle de démarrage (« Skeleton »).
3. Relier le projet à la boutique :
   ```
   cd alone-hair
   npx shopify hydrogen link
   npx shopify hydrogen dev
   ```
4. Copier **CLAUDE.md** et ce fichier à la racine du projet.
5. Créer un dossier `references/` et y mettre des **captures pleine page** (desktop **et** mobile) des deux sites d'inspiration :
   - `references/accueil-organic-care-desktop.png` / `-mobile.png` → https://organic-care-template.webflow.io/
   - `references/produit-veloraskin-desktop.png` / `-mobile.png` → une fiche produit de https://veloraskin.webflow.io/
   - `references/collection-veloraskin-desktop.png` → sa page boutique

   Astuce Chrome : Cmd+Option+I → Cmd+Shift+P → « Capture full size screenshot ». Pour mobile, activer d'abord la vue iPhone (Cmd+Shift+M).
6. Ajouter le serveur MCP **Shopify Dev** à Claude Code (doc à jour de Hydrogen et de la Storefront API) :
   ```
   claude mcp add shopify-dev-mcp -- npx -y @shopify/dev-mcp@latest
   ```
7. Créer un dépôt GitHub, puis Hydrogen (dans l'admin) → votre storefront → **Connecter GitHub**. Chaque `git push` crée alors un aperçu.

---

## C. Prompts Claude Code (un par un, valider avant de passer au suivant)

### Prompt 0 — Direction artistique

```
Lis CLAUDE.md et DEMARRAGE.md.
Analyse les captures du dossier references/ : l'accueil vient du template Organic Care, la fiche produit et la collection viennent de Veloraskin.
Je veux qu'Alone Hair reprenne leur niveau de finition — mise en page éditoriale aérée, grandes photos, typographie élégante, hiérarchie très claire — mais avec l'identité Alone Hair décrite dans CLAUDE.md (luxe, minimal, noir et blanc, les photos de cheveux comme seule couleur).
Ne copie ni textes, ni logos, ni images des templates : inspire-toi uniquement de la structure, des espacements, des proportions et des interactions.

Avant de coder les pages :
1. Décris-moi en français, section par section, ce que tu retiens de chaque référence (structure, grille, typo, espacements, animations) et comment tu l'adaptes à Alone Hair.
2. Propose un système de design : tokens CSS (couleurs, typo avec une police titre + Montserrat, échelle de tailles, espacements, rayons, ombres, durées d'animation).
3. Crée une route /styleguide qui affiche ces tokens, les boutons, les liens, les champs, une carte produit et les sélecteurs de variantes.
Attends ma validation avant de continuer.
```

### Prompt 1 — Structure générale

```
Construis le layout global d'après le style validé :
- annonce en haut, texte venant d'un métaobjet ou d'un réglage, sinon rien ;
- en-tête : logo ALONE HAIR centré ou à gauche selon la référence, menu `main-menu` lu via l'API avec un méga-menu pour « Nos collections », recherche, compte, panier avec compteur ; il devient compact au scroll ;
- menu mobile plein écran ;
- pied de page : navigation, politiques Shopify, Instagram/TikTok, inscription newsletter (formulaire client Shopify), mentions légales.
Vérifie sur desktop et sur iPhone (390 px).
```

### Prompt 2 — Fiche produit (la plus importante)

```
Construis la route /products/:handle en t'inspirant de la fiche produit Veloraskin (references/produit-veloraskin-*) :
- galerie : grandes photos et vidéos Shopify ; sur desktop, vignettes ou défilement vertical avec infos collantes à droite ; sur mobile, carrousel swipe avec pagination ;
- bloc infos : nom, sous-titre (la teinte, ex. « Brun profond aux reflets ambrés »), prix « à partir de » qui devient le prix exact selon la variante ;
- sélecteurs de variantes en boutons (pas de menus déroulants) pour Type de cheveux, Type de lace, Longueur, Taille du bonnet ; uniquement les options existantes du produit ; combinaisons indisponibles grisées ; URL ?variant= mise à jour ;
- bouton « Ajouter au panier », collé en bas d'écran sur mobile ; mention « Faite main, sur commande » ;
- accordéons : Description (descriptionHtml), Caractéristiques (options et métachamps), Entretien (page `entretien`), Livraison et retours (politique de remboursement + livraison gratuite dès 1 000 €) ;
- section TikTok si `custom.tiktok_url` est rempli (embed officiel + vues `custom.tiktok_vues`) ;
- « Vous aimerez aussi » : produits recommandés Shopify ;
- SEO : title et meta du champ SEO, JSON-LD Product (prix, disponibilité, images), fil d'Ariane.
Teste avec perruque-isabelle (3 options), perruque-noemie-indetectable (bonnet + longueur) et perruque-lisa (1 seule variante).
```

### Prompt 3 — Collections

```
Construis /collections/:handle et /collections en t'inspirant de references/collection-veloraskin-* :
- bandeau de titre avec description de la collection ;
- grille : 2 colonnes mobile, 3 ou 4 desktop ; cartes portrait 3:4 avec photo au survol, nom, « à partir de » le prix, pastilles d'options principales ;
- filtres Search & Discovery dans un tiroir sur mobile, une barre latérale ou un tiroir sur desktop ; tri ; pagination « Voir plus » ;
- respecte l'ordre manuel de la collection `perruques`.
Gère la collection vide (`seconde-main`) avec un joli message et un lien vers les perruques.
```

### Prompt 4 — Page d'accueil

```
Construis la page d'accueil en t'inspirant de references/accueil-organic-care-* :
1. hero plein écran avec la vidéo du métaobjet `home_hero` (desktop/mobile), voile 30 %, titre et bouton ;
2. catégories : Perruques, Indétectable 13×6, Bundles, Laces & closures — grandes cartes image ;
3. best-sellers : les 8 premiers produits actifs de `perruques` ;
4. bloc éditorial « Notre histoire » (métaobjet `home_story`) ;
5. bandeau de réassurance (`home_promise`) ;
6. avis (`home_review`) — section masquée si aucun avis ;
7. inscription newsletter.
Animations d'apparition discrètes, respect de prefers-reduced-motion. Vise un LCP < 2,5 s sur mobile.
```

### Prompt 5 — Panier

```
Construis le panier :
- tiroir latéral qui s'ouvre à l'ajout ;
- lignes avec photo, variante, quantité, suppression ;
- barre de progression vers la livraison gratuite (1 000 €) ;
- sous-total et bouton « Paiement sécurisé » vers cart.checkoutUrl ;
- page /cart identique pour le sans-JS et le SEO ;
- champ code promo via l'API panier.
```

### Prompt 6 — Pages, SEO et finitions

```
- /pages/:handle pour a-propos, faq, entretien, contact (FAQ en accordéons) ;
- /policies/:handle ;
- /search, 404 ;
- sitemap.xml, robots.txt, balises canonical/Open Graph sur toutes les pages ;
- vérifie que toutes les URL listées dans CLAUDE.md §6 répondent.
Ensuite, fais un audit complet : accessibilité (clavier, contrastes, alt), performance mobile, et cohérence visuelle avec le styleguide. Donne-moi la liste des problèmes trouvés et corrige-les.
```

### Mettre en ligne la préprod

```
npx shopify hydrogen deploy
```
(ou `git push` si GitHub est connecté)

Dans l'admin : Hydrogen → storefront → Déploiements → le déploiement → **Partager** → « Toute personne disposant du lien » → copier. C'est ce lien que vous envoyez aux propriétaires.
⚠️ La préprod utilise les vrais produits et le vrai paiement : pour une démo, s'arrêter au panier.
