# Direction artistique — Alone Hair × Veloraskin (Prompt 0)

Référence principale demandée : **Veloraskin** (veloraskin.webflow.io), pour la structure, les styles et les animations. Organic Care reste une source secondaire pour l'accueil. On reprend **la structure, les proportions et les interactions**, jamais les textes, images ou logos. L'identité reste celle d'Alone Hair : logo actuel, photos de la boutique, noir et blanc, cheveux comme seule couleur.

Captures : `references/` (desktop 1440 px et mobile 390 px, prises écran par écran avec les animations jouées).

| Fichier | Contenu |
|---|---|
| `accueil-veloraskin-*` | accueil Veloraskin |
| `produit-veloraskin-*` | fiche produit Veloraskin |
| `collection-veloraskin-*` | boutique (« Shop All ») Veloraskin |
| `styleguide-veloraskin-desktop` | style guide Veloraskin |
| `accueil-organic-care-*` | accueil Organic Care |
| `actuel-alonehair-*` | site actuel (logo, photos, contenus à garder) |

---

## 1. Ce que l'on retient de Veloraskin, section par section

### En-tête
- Deux niveaux : petite barre utilitaire (recherche à gauche, liens à droite), puis logo à gauche, menu centré, icônes à droite.
- Liens de menu : **les lettres roulent une à une** au survol (chaque lettre monte et laisse place à son double, 350 ms, 10 ms entre deux lettres).
- **Adaptation** : logo ALONE HAIR à gauche, menu `main-menu` en majuscules espacées (charte), recherche/compte/panier à droite. Barre utilitaire = bandeau d'annonce (métaobjet). Compact au scroll. *(Prompt 1)*

### Hero (remplacé le 25/11/2026 par le hero Organic Care, voir plus bas)
- Photo plein cadre, **encart blanc en bas à gauche** avec titre sur deux lignes (2ᵉ ligne grise) et lien souligné « Shop Now ».
- Entrée : la photo passe de 120 % à 100 % en fondu, l'encart monte depuis le bas (décalé de 0,3 s).
- **Adaptation** : vidéo du métaobjet `home_hero` (desktop/mobile) avec voile 30 %, encart « ALONE HAIR / Designed to be rare ». Sur mobile, l'encart passe sous la vidéo pour ne rien cacher du visage. Bouton pause (accessibilité). → composant `Banner`.

### Grilles produits
- 4 colonnes presque bord à bord (16 px de marge), cartes à fond gris clair, **vignettes en bas à gauche de la photo** pour changer d'image, nom à gauche, prix barré + prix à droite, sous-titre gris.
- Cœur favori en haut à droite : **non repris** (pas de liste de favoris sur la boutique).
- **Adaptation** : portrait 3:4 (au lieu de 4:5) pour les perruques portées, 2ᵉ photo au survol, vignettes au survol desktop, sous-titre = longueurs disponibles lues dans l'option « Longueur » (« 10 à 24 pouces »), prix « À partir de … ». → `ProductCard`.

### Blocs éditoriaux
- « Loved by our community » : 4 vidéos verticales de créatrices → **à réserver aux vidéos TikTok** quand `custom.tiktok_url` est rempli (pas d'avis inventés).
- Bannière promotionnelle pleine largeur, même encart blanc → bandeau « Notre histoire » (`home_story`).
- « At Velora, we believe… » : titre centré entouré de 4 cartes d'engagements → **bandeau de promesses** (`home_promise`).
- « Shop by Category » : 3 grandes cartes photo, titre en blanc, zoom lent au survol → **catégories** Perruques, Indétectable 13×6, Bundles, Laces & closures. → classe `.catcard`.
- Avant/après, chiffres (« 3000+ customers »), « Free delivery over $350 » : **non repris** (chiffres non vérifiés, livraison toujours payante).

### Fiche produit
- 2 colonnes : grande photo à gauche (vignettes en haut à gauche), infos à droite : fil d'Ariane en petites capitales, titre, sous-titre gris, prix, « View Size Guide › » (tiroir qui glisse de la droite), **pastilles grises / noire sélectionnée**, quantité, bouton noir pleine largeur, ligne « Shipping, Exchange and Returns », accordéons +/−.
- **Adaptation** : identique dans l'esprit, avec nos options (Type de cheveux, Type de lace, Longueur, Taille du bonnet), case « Ajouter des layers », mention « Faite main, sur commande », guide des tailles de bonnet en tiroir. → `VariantOptions`, `Checkbox`, `QuantityInput`, `Accordion`, `Drawer`. *(Prompt 2)*

### Boutique / collection
- Titre très grand au-dessus de la grille, filtres en colonne gauche repliables (cases à cocher), tri « Sort by » en haut. *(Prompt 3)*

### Pied de page
- Fond noir, logo géant en blanc à gauche, colonnes de liens à droite, petites capitales pour les titres de colonnes. → logo Alone Hair inversé en blanc. *(Prompt 1)*

### Animations (relevées dans le code de la référence)
| Interaction | Référence | Chez nous |
|---|---|---|
| Apparition au scroll | enfants en cascade, fondu + 100 px, 0,15 s d'écart, déclenché à 80–90 % de l'écran | fondu + 40 px, 120 ms d'écart (`data-reveal`, `data-reveal-group`) |
| Liens de menu et boutons | lettres qui roulent (SplitText GSAP) | même effet en CSS pur (`RollText`), sans librairie |
| Lien « Shop Now » | trait souligné | trait qui part vers la droite puis revient |
| Carte catégorie | zoom 110 % | zoom 108 %, 900 ms |
| Hero | zoom 1,2 → 1 + encart qui monte | 1,12 → 1, encart à +300 ms |
| Tiroir guide des tailles | glisse depuis la droite | `Drawer` (droite ou gauche) |
| Burger | deux traits → croix | `BurgerButton` |

Pas de GSAP : tout est en CSS + un seul IntersectionObserver (performance mobile, ~85 % du trafic). `prefers-reduced-motion` coupe toutes les durées.

---

## 2. Système de design

Fichiers : `app/styles/tokens.css` (toutes les valeurs) et `app/styles/ui.css` (composants, **aucune valeur brute**). Démonstration vivante : **`/styleguide`**.

- **Couleurs** : noir `#0C0C0C`, blanc, gris de texte = noir 65 %, filets noir 12 %, fonds de bloc `#F7F7F7`, pastilles `#EDEDED`. Aucun accent d'interface.
- **Typographie** (décision du 25/11/2026) : **Verdana** partout, comme ce qui s'affiche sur Organic Care (leur pile est « PP Mori, Verdana »), avec **Noto Sans** (Google Fonts) en repli là où Verdana n'est pas installée (Android). Verdana est une police système Microsoft : on ne peut pas l'héberger. Échelle fluide 390 → 1440 px : display 48→110, h1 40→72, h2 32→54, h3 24→32, h4 20→24, texte 15, petit 13, boutons 12, sur-titres 11.
- **Espacements** : base 4 (4 → 128 px), sections 64 → 120 px, gouttières 16 → 80 px (éditorial, 1220 px) et 16 → 24 px (grilles et médias, 1440 px).
- **Formes** : angles droits partout. Ombre uniquement sur les tiroirs.
- **Mouvement** : 200 ms (couleurs), 350 ms (lettres), 500 ms (apparitions, tiroirs), 900 ms (zoom photos), courbe ≈ power2.out.
- **Tokens de composants** : hauteur des contrôles 48 px, pastilles 40 px, vignettes 40 px, tiroir 440 px, z-index, bordures, focus… modifiables à un seul endroit.

## 3. Composants (`app/components/ui/`)

| Composant | Garanties UX |
|---|---|
| `Button` | primaire / secondaire / clair, pleine largeur, lien (`to`), désactivé, chargement (`aria-busy`, pas de double clic, largeur conservée), cible 48 px |
| `TextLink`, `NavLinkRoll` | préchargement au survol ; liens externes annoncés « nouvel onglet » |
| `TextField`, `TextAreaField`, `SelectField` | label relié, aide et erreur reliées et annoncées, `aria-invalid`, 16 px (pas de zoom iPhone), mention « facultatif » |
| `Checkbox` | zone cliquable sur tout le libellé, complément de prix |
| `QuantityInput` | boutons + saisie, bornes, fonctionne dans un formulaire sans JS |
| `VariantOptions` | pastilles-liens : choisi / épuisé (barré) / inexistant (pointillés), URL et prix à jour |
| `ProductCard`, `ProductCardSkeleton` | 3:4, photo au survol, vignettes au clavier, badges, « Épuisé » automatique, chargement différé des photos 3 et 4 |
| `Banner` | photo ou vidéo, bouton pause, pas de lecture auto si mouvement réduit, image prioritaire (LCP) |
| `Accordion` | `<details>` natif, un seul ouvert par groupe, marche sans JS |
| `Drawer`, `BurgerButton` | Échap, clic fond, focus piégé puis rendu, page bloquée, `inert` fermé |
| `Section`, `SectionHead`, `Badge`, `Eyebrow` | mise en page |
| `RevealObserver` | apparitions au scroll, filet de sécurité si le JS échoue |

## 4. Points à valider par les propriétaires
1. ~~Police~~ : réglé, Verdana avec repli Noto Sans.
2. Format des cartes : 3:4 portrait (proposé) ou 4:5 comme Veloraskin.
3. Encart du hero : blanc façon Veloraskin (proposé) ou texte blanc directement sur la vidéo (site actuel).
4. Sections Veloraskin écartées : favoris, avant/après, chiffres clients, livraison offerte.

## 5. Hero (décision du 25/11/2026)

Le hero de l'accueil suit **Organic Care** : vidéo plein écran sous un en-tête transparent (logo et menu en blanc), voile 30 %, petite phrase + lien souligné en bas à gauche, et **« ALONE HAIR » en texte géant, dans la police du site, ajusté à toute la largeur** (comme le mot « ORGANIC »). L'en-tête redevient blanc au scroll ou au survol.
Les pages de contenu reprennent le « page hero » d'Organic Care : grand titre, puis la vidéo de marque dans un large cadre.
