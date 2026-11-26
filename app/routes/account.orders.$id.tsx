import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import {TextLink} from '~/components/ui/TextLink';
import {formatDate, fulfillmentLabel} from '~/lib/account';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Commande ${data?.order?.name ?? ''} | Alone Hair`}, {name: 'robots', content: 'noindex, nofollow'}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Commande introuvable');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? null;

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {order, lineItems, discountValue, discountPercentage, fulfillmentStatus} =
    useLoaderData<typeof loader>();
  const hasDiscount = Boolean((discountValue && Number(discountValue.amount) > 0) || discountPercentage);

  return (
    <section className="account-section account-order" aria-labelledby="order-title">
      <p>
        <TextLink to="/account/orders">Toutes mes commandes</TextLink>
      </p>
      <h2 id="order-title" className="account-section__title">
        Commande {order.name}
      </h2>
      <p className="order-card__meta">
        Passée le {formatDate(order.processedAt)}
        {order.confirmationNumber ? ` · Confirmation ${order.confirmationNumber}` : ''}
      </p>
      <ul className="order-card__status">
        <li className="badge">{fulfillmentLabel(fulfillmentStatus)}</li>
      </ul>

      <div className="account-order__grid">
        <div>
          <h3 className="sr-only">Articles</h3>
          <ul className="order-lines">
            {lineItems.map((lineItem, i) => (
              <OrderLine key={lineItem.id ?? i} lineItem={lineItem} />
            ))}
          </ul>

          <dl className="order-totals">
            <div>
              <dt>Sous-total</dt>
              <dd>
                <Money data={order.subtotal!} />
              </dd>
            </div>
            {hasDiscount && (
              <div>
                <dt>Réduction</dt>
                <dd>{discountPercentage ? `−${discountPercentage} %` : discountValue && <Money data={discountValue} />}</dd>
              </div>
            )}
            {order.totalTax && Number(order.totalTax.amount) > 0 && (
              <div>
                <dt>Dont TVA</dt>
                <dd>
                  <Money data={order.totalTax} />
                </dd>
              </div>
            )}
            <div className="order-totals__total">
              <dt>Total</dt>
              <dd>
                <Money data={order.totalPrice!} />
              </dd>
            </div>
          </dl>
        </div>

        <aside className="account-order__aside">
          <h3 className="eyebrow">Adresse de livraison</h3>
          {order.shippingAddress ? (
            <address className="account-address">
              {order.shippingAddress.formatted?.map((line) => <p key={line}>{line}</p>)}
            </address>
          ) : (
            <p className="account-muted">Aucune adresse de livraison (retrait en boutique).</p>
          )}
          <a className="btn btn--secondary btn--block" href={order.statusPageUrl} target="_blank" rel="noreferrer">
            <span className="btn__label">Suivre ma commande</span>
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
        </aside>
      </div>
    </section>
  );
}

function OrderLine({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <li className="order-line">
      <div className="order-line__img">
        {lineItem.image && <Image data={lineItem.image} width={96} aspectRatio="3/4" sizes="96px" />}
      </div>
      <div className="order-line__info">
        <p className="order-line__title">{lineItem.title}</p>
        {lineItem.variantTitle && <p className="account-muted">{lineItem.variantTitle}</p>}
        <p className="account-muted">Quantité : {lineItem.quantity}</p>
      </div>
      <p className="order-line__price">
        <Money data={lineItem.price!} />
      </p>
    </li>
  );
}
