import {Link} from 'react-router';
import {RollText} from './RollText';

/**
 * Lien éditorial en majuscules souligné (« Découvrir la collection »).
 * - `to` : lien interne (préchargé au survol) ;
 * - `href` : lien externe, ouvert dans un nouvel onglet avec rel sécurisé.
 */
export function TextLink({
  to,
  href,
  children,
  light,
  className,
}: {
  to?: string;
  href?: string;
  children: React.ReactNode;
  light?: boolean;
  className?: string;
}) {
  const cls = ['link', light && 'link--light', className]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="sr-only"> (nouvel onglet)</span>
      </a>
    );
  }
  return (
    <Link className={cls} to={to ?? '/'} prefetch="intent">
      {children}
    </Link>
  );
}

/** Lien de navigation (en-tête) avec lettres qui roulent. */
export function NavLinkRoll({
  to,
  children,
  current,
}: {
  to: string;
  children: string;
  current?: boolean;
}) {
  return (
    <Link
      className="navlink roll-trigger"
      to={to}
      prefetch="intent"
      aria-current={current ? 'page' : undefined}
    >
      <RollText>{children}</RollText>
    </Link>
  );
}
