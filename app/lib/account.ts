/** Libellés français des statuts de commande (Customer Account API). */
const FINANCIAL: Record<string, string> = {
  PAID: 'Payée',
  PENDING: 'Paiement en attente',
  AUTHORIZED: 'Paiement autorisé',
  PARTIALLY_PAID: 'Partiellement payée',
  PARTIALLY_REFUNDED: 'Partiellement remboursée',
  REFUNDED: 'Remboursée',
  VOIDED: 'Annulée',
  EXPIRED: 'Expirée',
};

const FULFILLMENT: Record<string, string> = {
  SUCCESS: 'Expédiée',
  OPEN: 'En préparation',
  PENDING: 'En préparation',
  CANCELLED: 'Annulée',
  ERROR: 'Incident d’expédition',
  FAILURE: 'Incident d’expédition',
};

export const financialLabel = (s?: string | null) => (s ? FINANCIAL[s] ?? s : '');
/** Sans expédition : la pièce est en fabrication (faite main, sur commande). */
export const fulfillmentLabel = (s?: string | null) => (s ? FULFILLMENT[s] ?? s : 'En fabrication');

export const formatDate = (iso?: string | null) =>
  iso ? new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date(iso)) : '';
