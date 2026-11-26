# Mise en ligne : liste de contrôle

Vérifié le 26/11/2026 en local avec les vrais produits (API Storefront, sans commande).

## Ce qui a été testé

| Parcours | Résultat |
|---|---|
| Fiche produit : ajout bloqué tant que les options ne sont pas choisies | OK (desktop et mobile 390 px) |
| Choix lace + longueur (menu déroulant de 14 longueurs) → prix exact, URL `?variant` | OK |
| Option Layers (+49 €) ajoutée avec la perruque | OK (2 lignes, sous-total 699 €) |
| Produit à une seule variante : ajout direct | OK |
| Panier : tiroir, page `/cart`, quantité, retirer, code promo | OK |
| « Paiement sécurisé » → checkout Shopify (français) | OK : redirection vers le checkout Shopify ; page finale non affichée en local |
| Comptes clients | Nouveaux comptes clients activés dans la boutique ; connexion non testable en local (Shopify exige un tunnel) → **à tester sur l'aperçu** |

## Avant de relier alonehair.com

1. **Sous-domaine de paiement** : quand alonehair.com pointera vers Hydrogen, le paiement doit être servi par un sous-domaine (ex. `checkout.alonehair.com`).
   - DNS : `CNAME checkout → shops.myshopify.com`.
   - Shopify : Paramètres → Domaines → connecter `checkout.alonehair.com`, cible **Boutique en ligne**, type **Principal**.
2. **Domaine principal** : Paramètres → Domaines → alonehair.com (et www) → cible = storefront Hydrogen de production.
3. **Environnement de production public** : Hydrogen → storefront → Environnements → Production → Confidentialité de l'URL : Public.
4. **Connexion client** : Hydrogen → Paramètres du storefront → Customer Account API → vérifier que `https://alonehair.com/account/authorize` figure dans les URI de rappel, `https://alonehair.com` dans les origines JavaScript et les URI de déconnexion.
5. **Tests sur l'aperçu** (avant la bascule) :
   - se connecter via l'icône compte, voir Commandes / Profil / Adresses, se déconnecter ;
   - aller jusqu'à la page de paiement (sans payer) ;
   - vérifier le bandeau cookies.
6. Après la bascule : redirection des pages de l'ancien thème (thème « Hydrogen redirect » de Shopify), Search Console : soumettre `https://alonehair.com/sitemap.xml`.

Source : https://shopify.dev/docs/storefronts/hydrogen/deploy/go-live
