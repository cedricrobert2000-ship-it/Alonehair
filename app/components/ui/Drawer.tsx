import {useEffect, useId, useRef} from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Tiroir latéral (guide des tailles, panier, menu mobile).
 * - Échap et clic sur le fond ferment ;
 * - le focus entre dans le tiroir, y reste (Tab / Maj+Tab), puis revient
 *   sur le bouton qui l'a ouvert ;
 * - la page derrière ne défile plus ;
 * - fermé, le tiroir est « inert » : ni focus ni lecteur d'écran.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  full = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'right' | 'left';
  /** plein écran avec rideau qui descend (menu mobile) */
  full?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // inert quand fermé (React 18 ne connaît pas encore la prop)
  useEffect(() => {
    rootRef.current?.toggleAttribute('inert', !open);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add('is-locked');

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus({preventScroll: true});

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('is-locked');
      returnFocus.current?.focus?.({preventScroll: true});
    };
  }, [open, onClose]);

  return (
    <div
      ref={rootRef}
      className={`drawer${side === 'left' ? ' drawer--left' : ''}${full ? ' drawer--full' : ''}${
        open ? ' is-open' : ''
      }`}
    >
      <div className="drawer__backdrop" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        className="drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="drawer__head">
          <p className="h4 drawer__title" id={titleId}>
            {title}
          </p>
          <button
            type="button"
            className="icon-btn"
            aria-label="Fermer"
            onClick={onClose}
          >
            <span className="burger is-x" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
        <div className="drawer__body" data-lenis-prevent>
          {children}
        </div>
        {footer && <div className="drawer__foot">{footer}</div>}
      </div>
    </div>
  );
}

/** Bouton burger qui se transforme en croix (menu mobile). */
export function BurgerButton({
  open,
  onClick,
  controls,
}: {
  open: boolean;
  onClick: () => void;
  controls?: string;
}) {
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
      aria-expanded={open}
      aria-controls={controls}
      onClick={onClick}
    >
      <span className="burger" aria-hidden="true">
        <span />
        <span />
      </span>
    </button>
  );
}
