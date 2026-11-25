# Images du site hébergées dans GitHub

Ces images sont servies directement par le site (Oxygen), sans passer par Shopify.

## Changer une image
1. Préparer l'image en **WebP**, au moins **2400 px de large** pour un plein écran
   (1600 px suffisent pour les autres blocs). Outil gratuit : squoosh.app.
2. Sur GitHub, ouvrir le dossier `public/images/accueil/`, cliquer sur le fichier
   à remplacer → « … » → *Upload files*, déposer la nouvelle image **avec exactement
   le même nom** (ex. `hero.webp`), puis *Commit changes*.
3. Le site se redéploie tout seul en 1 à 2 minutes.

Pour ajouter une image ou changer d'emplacement : `app/lib/site-images.ts`
(largeur, hauteur, texte alternatif, cadrage).

| Fichier | Où il apparaît |
|---|---|
| `accueil/hero.webp` (+ `hero-480.webp` pour mobile) | Grande image du haut de l'accueil |

Les photos produits, collections et l'histoire restent gérées dans Shopify.
