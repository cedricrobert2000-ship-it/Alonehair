import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {useAside} from './Aside';
import {formatMoney} from '~/lib/format';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/** Une ligne du panier : photo, nom, options choisies, prix, quantité, retrait. */
export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const options = selectedOptions.filter((o) => o.value !== 'Default Title');

  return (
    <li className="cart-line">
      <div className="cart-line__media">
        {image ? (
          <Image alt={image.altText ?? title} aspectRatio="3/4" data={image} width={96} loading="lazy" />
        ) : (
          <span className="cart-line__placeholder" aria-hidden="true">
            Option
          </span>
        )}
      </div>
      <div className="cart-line__info">
        <Link
          className="cart-line__title"
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => layout === 'aside' && close()}
        >
          {product.title}
        </Link>
        {options.length > 0 && (
          <ul className="cart-line__options">
            {options.map((o) => (
              <li key={o.name}>
                {o.name} : {o.value}
              </li>
            ))}
          </ul>
        )}
        <div className="cart-line__row">
          <CartLineQuantity line={line} />
          <p className="cart-line__price">{formatMoney(line?.cost?.totalAmount)}</p>
        </div>
      </div>
      {lineItemChildren ? (
        <ul className="cart-line__children">
          {lineItemChildren.map((child) => (
            <CartLineItem childrenMap={childrenMap} key={child.id} line={child} layout={layout} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prev = Math.max(0, quantity - 1);
  const next = quantity + 1;

  return (
    <div className="cart-line__qty">
      <div className="qty" role="group" aria-label="Quantité">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prev}]}>
          <button aria-label="Retirer un" disabled={quantity <= 1 || !!isOptimistic} type="submit">
            −
          </button>
        </CartLineUpdateButton>
        <output aria-live="polite" className="qty__value">
          {quantity}
        </output>
        <CartLineUpdateButton lines={[{id: lineId, quantity: next}]}>
          <button aria-label="Ajouter un" disabled={!!isOptimistic} type="submit">
            +
          </button>
        </CartLineUpdateButton>
      </div>
      <CartForm
        fetcherKey={getUpdateKey([lineId])}
        route="/cart"
        action={CartForm.ACTIONS.LinesRemove}
        inputs={{lineIds: [lineId]}}
      >
        <button className="cart-line__remove" disabled={!!isOptimistic} type="submit">
          Retirer
        </button>
      </CartForm>
    </div>
  );
}

function CartLineUpdateButton({children, lines}: {children: React.ReactNode; lines: CartLineUpdateInput[]}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lines.map((l) => l.id))}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
