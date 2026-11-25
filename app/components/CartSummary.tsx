import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, type OptimisticCart} from '@shopify/hydrogen';
import {useId} from 'react';
import {formatMoney} from '~/lib/format';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

/**
 * Récapitulatif : code promo, sous-total, mention livraison, bouton de
 * paiement vers le checkout Shopify (cart.checkoutUrl). Rien n'est recalculé
 * ici : les montants viennent de Shopify.
 */
export function CartSummary({cart, layout}: CartSummaryProps) {
  const codes = cart?.discountCodes?.filter((d) => d.applicable).map((d) => d.code) ?? [];
  const inputId = useId();

  return (
    <div className={`cart-summary cart-summary--${layout}`}>
      <CartForm route="/cart" action={CartForm.ACTIONS.DiscountCodesUpdate} inputs={{discountCodes: codes}}>
        <label className="field__label" htmlFor={inputId}>
          Code promo
        </label>
        <div className="inline-form">
          <input id={inputId} className="input" type="text" name="discountCode" autoComplete="off" />
          <button className="btn btn--secondary" type="submit">
            Appliquer
          </button>
        </div>
      </CartForm>

      {codes.length > 0 && (
        <CartForm route="/cart" action={CartForm.ACTIONS.DiscountCodesUpdate} inputs={{discountCodes: []}}>
          <p className="cart-summary__code">
            Code appliqué : <strong>{codes.join(', ')}</strong>{' '}
            <button className="cart-line__remove" type="submit">
              Retirer
            </button>
          </p>
        </CartForm>
      )}

      <dl className="cart-summary__totals">
        <div>
          <dt>Sous-total</dt>
          <dd>{formatMoney(cart?.cost?.subtotalAmount)}</dd>
        </div>
      </dl>
      <p className="text-soft text-sm">Livraison et taxes calculées à l&apos;étape du paiement.</p>

      {cart?.checkoutUrl && (
        <a className="btn btn--block" href={cart.checkoutUrl} target="_self">
          Paiement sécurisé
        </a>
      )}
    </div>
  );
}
