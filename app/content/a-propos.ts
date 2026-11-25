/**
 * Contenu de la page À propos.
 * Textes repris mot pour mot de la page À propos du site actuel (thème
 * Shopify), car la page Shopify « a-propos » est vide pour l'instant.
 * Photos : fichiers déjà présents dans Shopify (Contenu → Fichiers).
 *
 * À terme, ce contenu pourra passer dans un métaobjet Shopify pour être
 * modifiable depuis l'admin (à valider avec les propriétaires).
 */

const FILES = 'https://cdn.shopify.com/s/files/1/0970/3102/9084/files';

export type AboutImage = {url: string; width: number; height: number; altText: string};

const img = (file: string, width: number, height: number, altText: string): AboutImage => ({
  url: `${FILES}/${file}`,
  width,
  height,
  altText,
});

export const ABOUT = {
  intro: 'Alone Hair est née d’une conviction : chaque femme mérite des cheveux qui lui ressemblent vraiment.',
  heroImage: img('PHOTO-2026-10-15-00-22-29.jpg', 2400, 1600, 'Les fondatrices et leurs amies entourées de perruques Alone Hair'),

  story: {
    title: ['Une passion pour', 'la fibre capillaire'],
    accent: 'L’histoire',
    paragraphs: [
      'Anne, influenceuse passionnée par l’univers du cheveu, des perruques et des extensions, est constamment à la recherche de la meilleure qualité.',
      'Noémie, coloriste spécialisée dans la coloration des perruques et des extensions, apporte son expertise et son regard artistique pour créer des couleurs harmonieuses, pensées pour sublimer chaque femme.',
    ],
  },

  collage: [
    img('IMG_0565_c47c9d77-0459-490a-9f31-ac07662c7081.jpg', 1800, 2400, 'Perruque châtain clair portée, chemise blanche'),
    img('alone-hair-apropos-08-trio-portrait.jpg', 1600, 2400, 'Trois femmes portant des perruques Alone Hair'),
  ],

  commitments: {
    label: 'Nos',
    accent: 'engagements',
    items: [
      {
        icon: 'origin',
        title: 'Une seule origine',
        text: 'Nos cheveux sont récoltés sur commande, auprès d’un seul donneur par pièce. Texture, couleur et tenue restent ainsi parfaitement homogènes.',
      },
      {
        icon: 'density',
        title: 'Une densité uniforme',
        text: 'Nos cheveux sont double drawn : la même épaisseur de la racine aux pointes, pour un rendu plein et naturel.',
      },
      {
        icon: 'ethics',
        title: 'Une éthique sans compromis',
        text: 'Aucun prélèvement sur des enfants, aucune production de masse. Chaque pièce est fabriquée à la main par notre usine partenaire.',
      },
    ],
  },

  service: {
    title: ['De la commande', 'à votre', 'porte'],
    image: img('alone-hair-hero-mobile-4x5.jpg', 1920, 2400, 'Préparation des perruques en coulisses'),
  },

  founders: {
    label: 'Les',
    accent: 'fondatrices',
    quote: 'Tout est pensé pour durer, sublimer et s’adapter à chaque femme.',
    signature: 'Anne & Noémie, fondatrices de Alone Hair',
    image: img('IMG_2605.jpg', 2400, 1600, 'L’équipe Alone Hair au balcon'),
  },
} as const;
