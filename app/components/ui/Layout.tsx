/**
 * Petits composants de mise en page partagés.
 */

export function Badge({
  children,
  dark,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return <span className={`badge${dark ? ' badge--dark' : ''}`}>{children}</span>;
}

export function Eyebrow({children}: {children: React.ReactNode}) {
  return <p className="eyebrow">{children}</p>;
}

/** En-tête de section : sur-titre + titre à gauche, action à droite. */
export function SectionHead({
  eyebrow,
  title,
  action,
  as: Heading = 'h2',
  reveal = true,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  reveal?: boolean;
}) {
  return (
    <div className="section-head" {...(reveal ? {'data-reveal': ''} : {})}>
      <div className="section-head__titles">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Heading className="h2">{title}</Heading>
      </div>
      {action}
    </div>
  );
}

/** Section verticale standard, contenu centré (1220 px) ou large (1440 px). */
export function Section({
  id,
  wide,
  small,
  className,
  children,
  label,
}: {
  id?: string;
  wide?: boolean;
  small?: boolean;
  className?: string;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className={[small ? 'section--sm' : 'section', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={wide ? 'container container--wide' : 'container'}>
        {children}
      </div>
    </section>
  );
}
