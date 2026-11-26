import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import type {Route} from './+types/account.profile';
import {Button} from '~/components/ui/Button';
import {TextField} from '~/components/ui/Field';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Mon profil | Alone Hair'}, {name: 'robots', content: 'noindex, nofollow'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Action non autorisée.'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('La mise à jour du profil a échoué. Réessayez dans un instant.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;
  const saved = action && !action.error && state === 'idle';

  return (
    <section className="account-section" aria-labelledby="profile-title">
      <h2 id="profile-title" className="account-section__title">Mon profil</h2>
      <Form method="PUT" className="account-form">
        <div className="account-form__grid">
          <TextField label="Prénom" name="firstName" autoComplete="given-name" defaultValue={customer.firstName ?? ''} minLength={2} />
          <TextField label="Nom" name="lastName" autoComplete="family-name" defaultValue={customer.lastName ?? ''} minLength={2} />
        </div>
        {action?.error && (
          <p className="field__error" role="alert">
            {action.error}
          </p>
        )}
        {saved && (
          <p className="account-success" role="status">
            Vos informations sont enregistrées.
          </p>
        )}
        <div>
          <Button type="submit" loading={state !== 'idle'}>
            Enregistrer
          </Button>
        </div>
      </Form>
      <p className="account-muted">
        Votre adresse e-mail sert à vous connecter : elle se modifie depuis la page de connexion Shopify.
      </p>
    </section>
  );
}
