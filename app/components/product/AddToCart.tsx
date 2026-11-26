import {useEffect, useRef} from 'react';
import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {Button} from '~/components/ui/Button';

/**
 * Bouton « Ajouter au panier » : ajoute une ou plusieurs lignes
 * (la perruque + l'option Layers si cochée) puis ouvre le tiroir panier.
 * Pendant l'envoi, le bouton passe en chargement (pas de double ajout).
 */
export function AddToCart({
  lines,
  disabled,
  label,
  analytics,
  className,
  blocked,
  onBlocked,
}: {
  lines: OptimisticCartLineInput[];
  disabled?: boolean;
  label: string;
  analytics?: unknown;
  className?: string;
  /** vrai tant que toutes les options ne sont pas choisies : rien n'est envoyé */
  blocked?: boolean;
  onBlocked?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<unknown>) => (
        <Submit
          fetcher={fetcher}
          disabled={disabled}
          label={label}
          analytics={analytics}
          className={className}
          blocked={blocked}
          onBlocked={onBlocked}
        />
      )}
    </CartForm>
  );
}

function Submit({
  fetcher,
  disabled,
  label,
  analytics,
  className,
  blocked,
  onBlocked,
}: {
  fetcher: FetcherWithComponents<unknown>;
  disabled?: boolean;
  label: string;
  analytics?: unknown;
  className?: string;
  blocked?: boolean;
  onBlocked?: () => void;
}) {
  const {open} = useAside();
  const wasSubmitting = useRef(false);
  const busy = fetcher.state !== 'idle';

  useEffect(() => {
    if (busy) wasSubmitting.current = true;
    else if (wasSubmitting.current) {
      wasSubmitting.current = false;
      open('cart');
    }
  }, [busy, open]);

  return (
    <>
      <input name="analytics" type="hidden" value={JSON.stringify(analytics ?? {})} />
      <Button
        type="submit"
        block
        disabled={disabled}
        loading={busy}
        className={className}
        onClick={(e) => {
          if (blocked) {
            e.preventDefault();
            onBlocked?.();
          }
        }}
      >
        {label}
      </Button>
    </>
  );
}
