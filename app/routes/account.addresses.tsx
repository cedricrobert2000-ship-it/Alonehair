import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type Fetcher,
} from 'react-router';
import type {Route} from './+types/account.addresses';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';
import {Button} from '~/components/ui/Button';
import {Checkbox} from '~/components/ui/Checkbox';
import {TextField} from '~/components/ui/Field';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Mes adresses | Alone Hair'}, {name: 'robots', content: 'noindex, nofollow'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('Adresse introuvable.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Votre session a expiré : reconnectez-vous.'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('L’adresse n’a pas pu être ajoutée.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('L’adresse n’a pas pu être modifiée.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('L’adresse n’a pas pu être supprimée.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Action non autorisée.'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {defaultAddress, addresses} = customer;

  return (
    <section className="account-section" aria-labelledby="addresses-title">
      <h2 id="addresses-title" className="account-section__title">Mes adresses</h2>

      {addresses.nodes.length > 0 ? (
        <div className="address-list">
          {addresses.nodes.map((address) => (
            <details key={address.id} className="address-card">
              <summary className="address-card__summary">
                <span className="account-address">
                  {address.formatted.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
                {defaultAddress?.id === address.id && <span className="badge">Par défaut</span>}
                <span className="link">Modifier</span>
              </summary>
              <AddressForm addressId={address.id} address={address} defaultAddress={defaultAddress}>
                {({stateForMethod}) => (
                  <div className="account-form__actions">
                    <Button formMethod="PUT" type="submit" loading={stateForMethod('PUT') !== 'idle'}>
                      Enregistrer
                    </Button>
                    <Button formMethod="DELETE" type="submit" variant="secondary" loading={stateForMethod('DELETE') !== 'idle'}>
                      Supprimer
                    </Button>
                  </div>
                )}
              </AddressForm>
            </details>
          ))}
        </div>
      ) : (
        <p className="account-muted">Aucune adresse enregistrée pour l’instant.</p>
      )}

      <div className="address-new">
        <h3 className="eyebrow">Ajouter une adresse</h3>
        <NewAddressForm key={addresses.nodes.length} />
      </div>
    </section>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: 'FR',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm addressId={'NEW_ADDRESS_ID'} address={newAddress} defaultAddress={null}>
      {({stateForMethod}) => (
        <div className="account-form__actions">
          <Button formMethod="POST" type="submit" loading={stateForMethod('POST') !== 'idle'}>
            Ajouter l’adresse
          </Button>
        </div>
      )}
    </AddressForm>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;
  return (
    <Form id={addressId} className="account-form">
      <input type="hidden" name="addressId" defaultValue={addressId} />
      {/* France uniquement : pays fixé, pas de région à saisir */}
      <input type="hidden" name="territoryCode" defaultValue={address?.territoryCode || 'FR'} />
      <div className="account-form__grid">
        <TextField label="Prénom" name="firstName" autoComplete="given-name" defaultValue={address?.firstName ?? ''} required />
        <TextField label="Nom" name="lastName" autoComplete="family-name" defaultValue={address?.lastName ?? ''} required />
      </div>
      <TextField label="Adresse" name="address1" autoComplete="address-line1" defaultValue={address?.address1 ?? ''} required />
      <TextField
        label="Complément d’adresse"
        optional
        name="address2"
        autoComplete="address-line2"
        defaultValue={address?.address2 ?? ''}
      />
      <div className="account-form__grid">
        <TextField
          label="Code postal"
          name="zip"
          autoComplete="postal-code"
          inputMode="numeric"
          defaultValue={address?.zip ?? ''}
          required
        />
        <TextField label="Ville" name="city" autoComplete="address-level2" defaultValue={address?.city ?? ''} required />
      </div>
      <TextField label="Société" optional name="company" autoComplete="organization" defaultValue={address?.company ?? ''} />
      <TextField
        label="Téléphone"
        optional
        hint="Format international, ex. +33612345678 : utile au transporteur."
        name="phoneNumber"
        type="tel"
        autoComplete="tel"
        defaultValue={address?.phoneNumber ?? ''}
        pattern="^\+?[1-9]\d{3,14}$"
      />
      <Checkbox name="defaultAddress" defaultChecked={isDefaultAddress} label="Adresse par défaut" />
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
      {children({
        stateForMethod: (method) => (formMethod === method ? state : 'idle'),
      })}
    </Form>
  );
}
