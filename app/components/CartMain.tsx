import {useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {Button} from '~/components/ui/Button';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}

/**
 * Contenu du panier, partagé par le tiroir et la page /cart.
 * Les actions sont optimistes : la quantité change tout de suite à l'écran.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  const lines = cart?.lines?.nodes ?? [];
  const hasItems = (cart?.totalQuantity ?? 0) > 0;
  const childrenMap = getLineItemChildrenMap(lines);

  if (!hasItems) return <CartEmpty layout={layout} />;

  return (
    <section className={`cart cart--${layout}`} aria-label={layout === 'page' ? 'Panier' : undefined}>
      <ul className="cart__lines" aria-label="Articles du panier">
        {lines.map((line) => {
          if ('parentRelationship' in line && line.parentRelationship?.parent) return null;
          return <CartLineItem key={line.id} line={line} layout={layout} childrenMap={childrenMap} />;
        })}
      </ul>
      <CartSummary cart={cart} layout={layout} />
    </section>
  );
}

function CartEmpty({layout}: {layout: CartLayout}) {
  const {close} = useAside();
  return (
    <div className="cart-empty">
      <p className="h4">Votre panier est vide.</p>
      <p className="text-soft">Nos perruques sont faites main, sur commande, en cheveux 100 % naturels.</p>
      <span onClick={layout === 'aside' ? close : undefined} role="presentation">
        <Button to="/collections/perruques">Découvrir les perruques</Button>
      </span>
    </div>
  );
}
