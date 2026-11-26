import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {Button} from '~/components/ui/Button';
import {TextLink} from '~/components/ui/TextLink';
import {financialLabel, fulfillmentLabel, formatDate} from '~/lib/account';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Mes commandes | Alone Hair'}, {name: 'robots', content: 'noindex, nofollow'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Commandes introuvables');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <section className="account-section" aria-labelledby="orders-title">
      <h2 id="orders-title" className="account-section__title">Mes commandes</h2>
      <div aria-live="polite">
        {orders?.nodes.length ? (
          <PaginatedResourceSection connection={orders} resourcesClassName="order-list" ariaLabel="Commandes">
            {({node: order}) => <OrderItem key={order.id} order={order} />}
          </PaginatedResourceSection>
        ) : (
          <EmptyOrders hasFilters={hasFilters} />
        )}
      </div>
    </section>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return hasFilters ? (
    <div className="account-empty">
      <p>Aucune commande ne correspond à cette recherche.</p>
      <TextLink to="/account/orders">Voir toutes mes commandes</TextLink>
    </div>
  ) : (
    <div className="account-empty">
      <p>Vous n’avez pas encore passé de commande.</p>
      <Button to="/collections/perruques">Découvrir nos perruques</Button>
    </div>
  );
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const to = `/account/orders/${btoa(order.id)}`;
  return (
    <article className="order-card">
      <div className="order-card__main">
        <h3 className="order-card__num">
          <Link to={to}>Commande n° {order.number}</Link>
        </h3>
        <p className="order-card__meta">
          {formatDate(order.processedAt)}
          {order.confirmationNumber ? ` · Confirmation ${order.confirmationNumber}` : ''}
        </p>
      </div>
      <ul className="order-card__status">
        {order.financialStatus && <li className="badge">{financialLabel(order.financialStatus)}</li>}
        <li className="badge">{fulfillmentLabel(fulfillmentStatus)}</li>
      </ul>
      <p className="order-card__total">
        <Money data={order.totalPrice} />
      </p>
      <TextLink to={to}>Voir le détail</TextLink>
    </article>
  );
}
