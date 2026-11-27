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
| `accueil/hero.webp` (+ `hero-640`, `hero-1024`) | Grande image du haut de l'accueil |
| `accueil/qualites.webp` (+ `-800`, `-1280`) | Photo dans l'ovale du bloc « Naturels, faits main » |
| `accueil/instagram.webp` (+ `-640`, `-1024`) | Photo du bloc Instagram en bas de l'accueil |

Les fichiers `-640`, `-800`, `-1024`, `-1280` sont des versions plus légères pour
les téléphones. Si vous ne remplacez que le fichier principal, supprimez-les
(et retirez la ligne `srcSet` correspondante dans `app/lib/site-images.ts`)
pour que les téléphones n'affichent pas l'ancienne image.

Les photos produits, collections et l'histoire restent gérées dans Shopify.

## Vidéo du hero (accueil)

La vidéo du hero est dans `public/videos/accueil/` et passe avant l'image :

| Fichier | Rôle |
|---|---|
| `hero.mp4` | ordinateur (1440 px de large, sans son, ≈ 5 Mo) |
| `hero-mobile.mp4` | mobile, recadrée en portrait 540×960 (≈ 3 Mo) |
| `hero-poster.webp` | image affichée pendant le chargement (1re image de la vidéo) |

Pour changer de vidéo : remplacer ces trois fichiers en gardant les mêmes noms, puis pousser sur GitHub.
Pour revenir à la photo : mettre `heroHome: null` dans `SITE_VIDEOS` (`app/lib/site-images.ts`).

Commandes d'encodage utilisées (ffmpeg) :

```bash
ffmpeg -i source.mp4 -an -vf "scale=1440:-2,format=yuv420p" -c:v libx264 -preset slow -crf 30 -movflags +faststart hero.mp4
```

```bash
ffmpeg -i source.mp4 -an -vf "crop=ih*9/16:ih,scale=540:960,format=yuv420p" -c:v libx264 -preset slow -crf 30 -movflags +faststart hero-mobile.mp4
```

```bash
ffmpeg -i hero.mp4 -frames:v 1 -c:v libwebp -quality 78 hero-poster.webp
```
