import {forwardRef} from 'react';
import {Link} from 'react-router';
import {RollText} from './RollText';

type Variant = 'primary' | 'secondary' | 'light';

type CommonProps = {
  /** Texte du bouton (chaîne simple : nécessaire pour l'effet « roll »). */
  children: string;
  variant?: Variant;
  /** Pleine largeur (ex. « Ajouter au panier » sur mobile). */
  block?: boolean;
  /** Affiche un indicateur, bloque les clics, garde la largeur. */
  loading?: boolean;
  /** Désactive l'animation des lettres (ex. libellé qui change souvent). */
  noRoll?: boolean;
  className?: string;
};

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    to?: undefined;
  };

type LinkProps = CommonProps & {
  /** Rend un lien interne stylé en bouton. */
  to: string;
  disabled?: boolean;
  prefetch?: 'intent' | 'render' | 'none' | 'viewport';
};

function classes({variant = 'primary', block, noRoll, className}: CommonProps) {
  return [
    'btn',
    variant !== 'primary' && `btn--${variant}`,
    block && 'btn--block',
    !noRoll && 'roll-trigger',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

function Label({children, noRoll}: {children: string; noRoll?: boolean}) {
  return (
    <span className="btn__label">
      {noRoll ? children : <RollText>{children}</RollText>}
    </span>
  );
}

/**
 * Bouton de la charte : majuscules, 48 px de haut, lettres qui roulent au
 * survol. Gère les états désactivé et chargement (aria-busy, libellé conservé
 * pour les lecteurs d'écran, pas de double clic possible).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps | LinkProps>(
  function Button(props, ref) {
    const {children, loading, noRoll} = props;

    if (props.to !== undefined) {
      const {to, disabled, prefetch = 'intent'} = props;
      if (disabled) {
        return (
          <span className={classes(props)} aria-disabled="true" role="link">
            <Label noRoll>{children}</Label>
          </span>
        );
      }
      return (
        <Link to={to} prefetch={prefetch} className={classes(props)}>
          <Label noRoll={noRoll}>{children}</Label>
        </Link>
      );
    }

    const {
      variant: _v,
      block: _b,
      loading: _l,
      noRoll: _n,
      className: _c,
      type = 'button',
      disabled,
      onClick,
      ...rest
    } = props;

    return (
      <button
        ref={ref}
        type={type}
        className={classes(props)}
        disabled={disabled}
        aria-busy={loading || undefined}
        onClick={(e) => {
          if (loading) {
            e.preventDefault();
            return;
          }
          onClick?.(e);
        }}
        {...rest}
      >
        <Label noRoll={noRoll || disabled}>{children}</Label>
        {loading && <span className="btn__spinner" aria-hidden="true" />}
      </button>
    );
  },
);
