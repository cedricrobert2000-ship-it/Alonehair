/**
 * Texte qui « roule » lettre par lettre au survol (interaction Veloraskin).
 * Chaque lettre a un double placé juste en dessous (text-shadow) ; au survol
 * du parent `.roll-trigger`, les lettres montent l'une après l'autre.
 * Le texte lisible par les lecteurs d'écran reste un seul mot, non découpé.
 */
export function RollText({children}: {children: string}) {
  const chars = Array.from(children);
  return (
    <>
      <span className="sr-only">{children}</span>
      <span className="roll" aria-hidden="true">
        {chars.map((char, i) => (
          <span
            // l'index est stable : le texte ne change pas d'ordre
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="roll__c"
            style={{'--i': i} as React.CSSProperties}
          >
            {char === ' ' ? ' ' : char}
          </span>
        ))}
      </span>
    </>
  );
}
