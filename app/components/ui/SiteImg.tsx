import {srcSetOf, type SiteImage} from '~/lib/site-images';

/** Image du dossier public/images (WebP + versions mobiles). */
export function SiteImg({
  image,
  sizes,
  className,
  priority,
}: {
  image: SiteImage;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      className={className}
      src={image.src}
      srcSet={srcSetOf(image)}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      style={image.position ? {objectPosition: image.position} : undefined}
    />
  );
}
