/**
 * Accordéon basé sur <details>/<summary> : clavier, lecteurs d'écran et
 * recherche dans la page (Ctrl+F) fonctionnent nativement, même sans JS.
 * `group` : même nom pour plusieurs accordéons = un seul ouvert à la fois
 * (attribut natif `name`, ignoré sans danger par les vieux navigateurs).
 */
export function Accordion({
  title,
  children,
  defaultOpen,
  group,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  group?: string;
}) {
  return (
    <details
      className="accordion"
      open={defaultOpen}
      {...(group ? {name: group} : {})}
    >
      <summary>
        {title}
        <span className="accordion__icon" aria-hidden="true" />
      </summary>
      <div className="accordion__body">{children}</div>
    </details>
  );
}
