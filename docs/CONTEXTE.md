# Contexte Alone Hair — état de la boutique (25 novembre 2026)

Résumé de tout ce qui a été fait et décidé sur la boutique Shopify, pour reprendre le travail du nouveau site sans relire l'historique. À lire avec `CLAUDE.md` (règles) et `DEMARRAGE.md` (prompts).

---

## 1. Qui fait quoi

- **Alone Hair** (ex-Brune / brunewig.com) : boutique de perruques et extensions en cheveux naturels, tenue par des amies (les « propriétaires »).
- **Cédric** gère le site pour elles. Il demande les changements, les propriétaires les valident.
- Règle de travail : **ne jamais modifier le contenu de la boutique sans demander d'abord**.
- Les propriétaires modifient aussi le thème et les produits elles-mêmes, parfois en même temps : toujours relire l'état actuel avant de changer quelque chose.

## 2. La boutique aujourd'hui

- Domaine **alonehair.com**, boutique `sv4tev-bg.myshopify.com`, forfait **Basic**, **marché France uniquement** (EUR).
- Thème en ligne : **« Dawn x Webaltix – nov. 2026 »** (Dawn 15 personnalisé). L'ancien « Dawn x Webaltix » est gardé en brouillon.
- Paiement : **Shopify Payments** uniquement (les virements « Stripe » sur le compte bancaire viennent de Shopify Payments). PayPal n'est pas utilisé pour les commandes.
- Livraison France : **8,80 € toujours** (la livraison gratuite a été désactivée). UE 22 €, international 29 €. Retrait en boutique gratuit (message d'erreur « disponibilité du retrait » à corriger dans les réglages du lieu).
- Politique : **aucun remboursement, échanges sous 14 jours selon le motif du retour**. Le texte de la politique de remboursement Shopify est encore à mettre à jour par les propriétaires (Paramètres → Politiques ; l'API n'a pas le droit de l'écrire).
- Facturation : en réflexion (Make + Tiime à la main aujourd'hui ; pistes : application Shopify de factures françaises ou Make + Google Docs gratuit).

## 3. Catalogue

### Perruques (collection `perruques`, ordre manuel)
Ordre actuel : Anne, Jhana, Isabelle, Martine, Laure, Noémie – Blonde, Inès, Lucile, Vicky, Lisa, Julia, Sarah, U Part, Ruth, Alison, Manon. Les 8 premières apparaissent en « best-sellers » sur l'accueil.

Options possibles : `Type de cheveux` (Raw Hair / Gros grain indien), `Type de lace` (5x5 HD, 13x4 HD, 13x6 HD, 2x6, Closure 5x5), `Longueur` (en pouces). **Maximum 3 options par produit (limite Shopify).**

Points particuliers :
- **Julia** : 10 à 24 pouces ; lace 2x6 du 10 au 18, Closure 5x5 du 20 au 24 ; 600 € → 950 €.
- **Laure** : 12 pouces, 650 €. **Sarah** : 14 p 699 €, 16 p 749 €. **Martine** : jusqu'au 28 pouces (+80 € par taille après le 22). **Ruth** : 10 pouces seulement. **Lisa** : 28 pouces, bonnet M, 1 000 €. **Isabelle** : Raw Hair, lace 2x6. **Vicky** : affichée en « Gros grain indien » avec les prix Raw Hair (à vérifier avec les propriétaires).
- **Noémie – Blonde** : délai de coloration 14 jours, contact Instagram pour choisir le blond.
- **Bonnet** : taille **M unique, réglable de S à L** (affichée en texte, ce n'est pas une option de variante), sauf les indétectables.
- **Option Layers** : produit non listé `option-layers` à **49 €** (variante `gid://shopify/ProductVariant/60020286095708`), ajouté au panier en plus de la perruque quand la cliente coche « Ajouter des layers ». À reproduire sur le nouveau site.

### Perruques indétectables 13×6 (collection `perruque-indetectable-13x6`)
Noémie, Jacqueline, Haley. Options `Taille du bonnet` (S/M/L) × `Longueur` (10–30 pouces), 600 € → 1 450 €. Texte : cheveux Virgin, prix justifié par le bonnet et la coloration.

### Bundles (collection `bundles`)
- **Bundle Raw Hair lisse** : vendu **par lot de 3 × 100 g**, options `Couleur` (Naturel / Brun) × `Longueur` (18, 22, 26, 30, 32, 36 pouces), 942 € → 2 090 € (Brun = Naturel + 50 €).
- Bundle Raw Hair bouclé, Blond 613, Gros grain indien lisse et bouclé : ancienne grille au paquet de 100 g (pas encore revue).
- Clips Raw Hair (Couleur × Longueur).

### Autres collections
`laces-closures`, `coloration` (vide), `soins-des-cheveux`, `seconde-main` (vide pour l'instant, dans le menu), `best-sellers`, `nos-wigs` (ancienne).

## 4. Contenu et textes

- Chaque perruque a une description avec un bloc « En bref » (cheveux, lace, longueur, bonnet, teinte, fabrication, prix) et un bloc « Échanges ». Garder ce format.
- Métachamps produits : `custom.tiktok_url`, `custom.tiktok_vues` (accès storefront activé).
- **Métaobjets d'accueil créés** (accès storefront) : `home_hero` (handle `accueil`), `home_promise` ×4 (livraison, echange, fait-main, sav), `home_story` (handle `accueil`), `home_review` (vide → section masquée).
- Menu `main-menu` : À propos · Nos collections (Perruques, Perruque indétectable 13×6, Bundles, Laces & closures, Coloration, Soin du cheveu, Tous nos produits) · Seconde main · Entretien · FAQ · Contact.
- Pages : `a-propos`, `faq`, `entretien`, `contact`.
- **À ne pas reprendre** de l'ancien thème : « Satisfaite ou remboursée », « Livraison offerte dès 50 € », « 500+ avis / 4,9/5 », avis qui parlent de clips (non vérifiés), « Fibres grade salon ».
- Bandeau en cours : « BLACK FRIDAY · -50 € sur toutes les perruques en boutique » (en boutique physique ; aucune réduction en ligne).

## 5. Nouveau site (ce dépôt)

- Storefront Hydrogen **« Alone Hair – nouveau site »**, relié à ce dépôt GitHub. Chaque push sur `main` déploie l'environnement Production d'Oxygen (pas relié au domaine) ; chaque autre branche crée un aperçu partageable.
- Tous les produits et collections actifs sont publiés sur ce canal, avec publication automatique des nouveaux produits.
- Search & Discovery est installé ; les filtres restent à configurer dans l'application.
- Prochaine étape : **Prompt 0 de DEMARRAGE.md** (direction artistique + `/styleguide`), à partir des captures des sites de référence dans `references/`.
