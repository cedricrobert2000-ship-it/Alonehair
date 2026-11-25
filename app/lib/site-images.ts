/**
 * Images d'ambiance hébergées dans le dépôt GitHub (dossier public/images).
 * Pour les remplacer sans toucher au code : public/images/LISEZMOI.md.
 *
 * Mettre une entrée à `null` pour revenir au contenu Shopify
 * (hero : vidéo du métaobjet home_hero ; autres blocs : photo produit).
 */
export type SiteImage = {
  src: string;
  /** versions plus légères pour les petits écrans */
  srcSet?: Array<{src: string; width: number}>;
  width: number;
  height: number;
  alt: string;
  /** cadrage quand l'image est recadrée (CSS object-position) */
  position?: string;
};

const DIR = '/images/accueil';

export const SITE_IMAGES: {
  heroHome: SiteImage | null;
  qualities: SiteImage | null;
  instagram: SiteImage | null;
} = {
  heroHome: {
    src: `${DIR}/hero.webp`,
    srcSet: [
      {src: `${DIR}/hero-640.webp`, width: 640},
      {src: `${DIR}/hero-1024.webp`, width: 1024},
    ],
    width: 1512,
    height: 2000,
    alt: 'Femme aux cheveux bouclés châtain cuivré, veste pied-de-poule',
    position: '50% 30%',
  },
  qualities: {
    src: `${DIR}/qualites.webp`,
    srcSet: [
      {src: `${DIR}/qualites-800.webp`, width: 800},
      {src: `${DIR}/qualites-1280.webp`, width: 1280},
    ],
    width: 2000,
    height: 1125,
    alt: 'Longues boucles châtain doré sur une chemise à carreaux',
  },
  instagram: {
    src: `${DIR}/instagram.webp`,
    srcSet: [
      {src: `${DIR}/instagram-640.webp`, width: 640},
      {src: `${DIR}/instagram-1024.webp`, width: 1024},
    ],
    width: 1333,
    height: 2000,
    alt: 'Femme aux cheveux longs bruns méchés, chemise rayée',
    position: '50% 25%',
  },
};

export function srcSetOf(image: SiteImage) {
  return [...(image.srcSet ?? []), {src: image.src, width: image.width}]
    .map((s) => `${s.src} ${s.width}w`)
    .join(', ');
}
