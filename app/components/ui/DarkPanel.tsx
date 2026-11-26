/**
 * Panneau noir profond (effet Pragma Studio) : il arrive en retrait avec des
 * coins arrondis, puis s'ouvre sur toute la largeur au défilement.
 * Sans JS ou avec « animations réduites » : directement ouvert.
 */
export function DarkPanel({
  children,
  className,
  as: Tag = 'section',
  label,
  labelledBy,
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'footer';
  label?: string;
  labelledBy?: string;
}) {
  return (
    <Tag
      className={['dark-panel', className].filter(Boolean).join(' ')}
      data-expand=""
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      {children}
    </Tag>
  );
}

/**
 * Texte « manifeste » : les mots passent du gris au blanc un à un pendant le
 * défilement. Le texte reste lisible en entier pour les lecteurs d'écran.
 */
export function FillText({text, as: Tag = 'p', className}: {text: string; as?: 'p' | 'h2'; className?: string}) {
  const words = text.split(/\s+/);
  return (
    <Tag className={['fill-text', className].filter(Boolean).join(' ')} data-fill="" style={{'--n': words.length} as React.CSSProperties}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className="fill-text__w" style={{'--i': i} as React.CSSProperties}>
            {w}{' '}
          </span>
        ))}
      </span>
    </Tag>
  );
}
