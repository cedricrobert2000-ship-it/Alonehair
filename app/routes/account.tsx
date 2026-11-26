import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export const meta: Route.MetaFunction = () => [
  {title: 'Mon compte | Alone Hair'},
  {name: 'robots', content: 'noindex, nofollow'},
];

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();
  const heading = customer.firstName ? `Bonjour ${customer.firstName}` : 'Mon compte';

  return (
    <div className="account container">
      <header className="account__head">
        <p className="eyebrow">Espace client</p>
        <h1 className="h1">{heading}</h1>
      </header>
      <AccountMenu />
      <div className="account__body">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  const links = [
    {to: '/account/orders', label: 'Commandes'},
    {to: '/account/profile', label: 'Profil'},
    {to: '/account/addresses', label: 'Adresses'},
  ];
  return (
    <nav className="account__nav" aria-label="Espace client">
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} className="account__tab" prefetch="intent">
          {l.label}
        </NavLink>
      ))}
      <Form className="account__logout" method="POST" action="/account/logout">
        <button type="submit" className="account__tab">
          Se déconnecter
        </button>
      </Form>
    </nav>
  );
}
