/**
 * Vidéo de marque (métaobjet `home_hero`, entrée « accueil »).
 * Utilisée dans le hero de l'accueil et dans l'en-tête des pages de contenu.
 */
export const HERO_FIELDS_FRAGMENT = `#graphql
  fragment HeroFields on Metaobject {
    fields {
      key
      value
      reference {
        __typename
        ... on Video {
          alt
          previewImage {
            url
            width
            height
          }
          sources {
            url
            mimeType
            height
            width
          }
        }
      }
    }
  }
` as const;

type Source = {url: string; mimeType: string; height: number; width: number};
type Field = {
  key: string;
  value?: string | null;
  reference?:
    | {__typename: 'Video'; alt?: string | null; previewImage?: {url: string} | null; sources: Source[]}
    | {__typename: string}
    | null;
};

export type HeroVideo = {
  poster?: string;
  alt?: string | null;
  /** MP4 triés du plus léger au plus lourd. */
  sources: Array<{url: string; height: number}>;
};

export type HeroContent = {
  title?: string | null;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  video: HeroVideo | null;
  videoMobile: HeroVideo | null;
};

function toVideo(field?: Field): HeroVideo | null {
  const ref = field?.reference;
  if (!ref || ref.__typename !== 'Video' || !('sources' in ref)) return null;
  const sources = ref.sources
    .filter((s) => s.mimeType === 'video/mp4')
    .sort((a, b) => a.height - b.height)
    .map((s) => ({url: s.url, height: s.height}));
  if (!sources.length) return null;
  return {poster: ref.previewImage?.url, alt: ref.alt, sources};
}

export function parseHero(metaobject: {fields: Field[]} | null | undefined): HeroContent | null {
  if (!metaobject) return null;
  const f = (key: string) => metaobject.fields.find((x) => x.key === key);
  return {
    title: f('title')?.value,
    subtitle: f('subtitle')?.value,
    ctaLabel: f('cta_label')?.value,
    ctaLink: f('cta_link')?.value,
    video: toVideo(f('video_desktop')),
    videoMobile: toVideo(f('video_mobile')),
  };
}
