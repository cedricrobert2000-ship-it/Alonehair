/**
 * Images d'ambiance hébergées dans le dépôt GitHub (dossier public/images).
 * Pour les remplacer sans toucher au code : public/images/LISEZMOI.md.
 *
 * Mettre une entrée à `null` pour revenir au contenu Shopify
 * (ex. le hero reprend alors la vidéo du métaobjet home_hero).
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

export const SITE_IMAGES: {heroHome: SiteImage | null} = {
  heroHome: {
    src: '/images/accueil/hero.webp',
    srcSet: [{src: '/images/accueil/hero-480.webp', width: 480}],
    width: 713,
    height: 891,
    alt: 'Femme aux cheveux bouclés naturels, veste en laine',
    position: '50% 25%',
  },
};

export function srcSetOf(image: SiteImage) {
  return [...(image.srcSet ?? []), {src: image.src, width: image.width}]
    .map((s) => `${s.src} ${s.width}w`)
    .join(', ');
}
