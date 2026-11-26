/**
 * Contenu des pages Entretien, FAQ et Contact.
 * Textes repris du site actuel (thème Shopify), car les pages Shopify
 * correspondantes sont vides. Corrections apportées :
 * - mentions de l'ancienne marque « Brune » remplacées par Alone Hair ;
 * - emojis retirés (charte) ;
 * - « nuanciers sur la fiche produit » (inexistants) → photos de la fiche.
 * Photos : fichiers déjà présents dans Shopify (Contenu → Fichiers).
 */
import type {ContentImage} from '~/components/content/ContentBlocks';

const FILES = 'https://cdn.shopify.com/s/files/1/0970/3102/9084/files';
const photo = (file: string, altText: string): ContentImage => ({url: `${FILES}/${file}`, width: 1536, height: 2048, altText});

export const PHOTOS = {
  marble1: photo('IMG_0580.jpg', 'Perruque brune méchée portée dans une salle de bain en marbre'),
  marble2: photo('IMG_0581.jpg', 'Perruque brune longue portée, haut blanc'),
  bob: photo('IMG_0673.jpg', 'Carré court brun porté sur un lit'),
  bath: photo('IMG_0674.jpg', 'Perruque brune vue de dos, baignoire'),
  curls: photo('IMG_0799.jpg', 'Longue perruque bouclée châtain'),
  bathFront: photo('IMG_1213.jpg', 'Perruque brune ondulée, baignoire'),
  street: photo('IMG_5804.jpg', 'Très longue perruque brune vue de dos, dans la rue'),
  blonde: photo('PHOTO-2026-10-14-23-46-42_e974407d-aa8c-4992-b562-b4e48b2f3134.jpg', 'Perruque blonde ondulée'),
};

export const ENTRETIEN = {
  title: 'Entretien',
  lead: 'Prenez soin de vos extensions et perruques comme de vos cheveux naturels : quelques gestes suffisent à les garder belles longtemps.',
  aside: 'Les conseils de votre coloriste Noémie, cofondatrice d’Alone Hair, pour le lavage, le séchage, le rangement et les retouches de couleur.',
  strip: [PHOTOS.curls, PHOTOS.marble1, PHOTOS.bob, PHOTOS.blonde, PHOTOS.street, PHOTOS.marble2],
  cards: [
    {
      number: '01',
      title: 'Lavage & soin',
      accent: 'avec délicatesse',
      intro: 'Prenez soin de vos extensions comme de vos cheveux naturels.',
      points: [
        'Ne laissez jamais tremper la perruque ou l’extension dans l’eau, surtout dans l’eau du robinet.',
        'Un bain prolongé peut provoquer le gonflement des cuticules et endommager la fibre, en particulier si elle a été colorée ou décolorée.',
        'Préférez un lavage doux : mouillez, appliquez le shampooing en massant délicatement dans le sens des longueurs, rincez.',
        'Appliquez ensuite un soin profond nourrissant, laissez poser, puis rincez soigneusement.',
        'Évitez de tordre ou frotter : essorez doucement avec une serviette microfibre.',
      ],
      image: PHOTOS.bath,
    },
    {
      number: '02',
      title: 'Séchage &',
      accent: 'protection',
      intro: 'Protégez la fibre de la chaleur et des agressions extérieures.',
      points: [
        'Séchez toujours la perruque ou l’extension à l’air libre ou au sèche-cheveux à basse température.',
        'Avant toute utilisation d’outils chauffants (fer, brushing…), appliquez systématiquement un spray thermo-protecteur.',
        'En été ou en exposition au soleil, pensez à un spray protecteur UV pour éviter l’oxydation et la décoloration prématurée.',
      ],
      image: PHOTOS.blonde,
    },
    {
      number: '03',
      title: 'Le',
      accent: 'rangement',
      intro: 'Un rangement soigné prolonge la durée de vie de vos extensions.',
      points: [
        'Une fois propre et sèche, rangez toujours votre perruque ou vos extensions dans un endroit sec, à l’abri de la lumière et de toute source de chaleur (radiateurs, soleil direct…).',
        'Idéalement, utilisez une boîte ou une housse adaptée, ou un support perruque pour préserver la forme.',
      ],
      image: PHOTOS.bob,
    },
    {
      number: '04',
      title: 'Retouches &',
      accent: 'suivi',
      intro: 'Comme pour des cheveux naturels, la couleur évolue avec le temps.',
      points: [
        'Il est recommandé de faire une retouche tous les 3 à 6 mois, selon la fréquence d’utilisation, le type de coloration et l’entretien quotidien.',
        'Je propose des retouches personnalisées pour raviver ou ajuster votre teinte avec soin.',
      ],
      image: PHOTOS.curls,
    },
  ],
  manifesto: {
    eyebrow: 'À retenir',
    text: 'Une belle couleur qui dure, c’est l’alchimie entre mon expertise… et votre entretien quotidien. Prenez-en soin comme de vos propres cheveux.',
    signature: 'Noémie, coloriste et cofondatrice d’Alone Hair',
  },
};

export type FaqItem = {question: string; answer: string[]; points?: string[]; link?: {label: string; to: string}};

export const FAQ = {
  title: 'FAQ',
  lead: 'Tout ce que vous devez savoir avant de commander.',
  groups: [
    {
      title: 'Commande',
      accent: '& livraison',
      items: [
        {
          question: 'Quels sont les délais de livraison ?',
          answer: [
            'Nos cheveux sont récoltés uniquement après commande, afin de vous garantir une durée de vie optimale. Ce processus demande un peu de temps, que nous estimons nécessaire pour vous offrir la meilleure qualité possible.',
            'Les délais de livraison sont généralement de 2 à 4 semaines après validation de votre commande. Vous recevrez un email de confirmation avec un numéro de suivi dès l’expédition.',
          ],
        },
        {
          question: 'Puis-je annuler ma commande ?',
          answer: [
            'Toute annulation doit être effectuée dans les 24 h suivant la commande, avant le début de la récolte et de la fabrication. Passé ce délai, la production étant lancée sur mesure pour vous, l’annulation ne pourra plus être acceptée.',
            'Pour toute demande d’annulation, contactez-nous immédiatement.',
          ],
          link: {label: 'Nous contacter', to: '/pages/contact'},
        },
      ] as FaqItem[],
    },
    {
      title: 'Retours',
      accent: '& échanges',
      items: [
        {
          question: 'Quelle est votre politique de retour ?',
          answer: [
            'Aucun remboursement n’est possible. Nous proposons uniquement des échanges, sous 14 jours après la réception de votre commande, selon le motif du renvoi.',
            'Pour faire une demande, contactez-nous en indiquant votre numéro de commande, le motif et, si possible, des photos du produit. Les produits portés, lavés ou manipulés ne peuvent pas être échangés.',
          ],
          link: {label: 'Nous contacter', to: '/pages/contact'},
        },
        {
          question: 'Puis-je être remboursée ?',
          answer: [
            'Non. En raison de la nature capillaire et artisanale de nos produits, aucun remboursement n’est possible. Selon le motif du renvoi, nous pouvons vous proposer un échange sous 14 jours. En cas de défaut ou de produit non conforme, la perruque est remplacée.',
          ],
          link: {label: 'Politique de retour et d’échange', to: '/policies/refund-policy'},
        },
      ] as FaqItem[],
    },
    {
      title: 'Nos',
      accent: 'cheveux',
      items: [
        {
          question: 'Quelle est la différence entre clips, perruques et tissage ?',
          answer: [
            'Extensions à clips : idéales pour ajouter du volume ou de la longueur ponctuellement. Elles se fixent directement sur vos cheveux naturels avec de petits clips. Aucun engagement : on les pose et on les retire facilement. Parfaites pour débuter.',
            'Perruques : une solution complète qui recouvre l’ensemble de la chevelure. Nos perruques sont fabriquées sur mesure avec une monture en lace pour un rendu naturel et discret. Idéales pour changer de look ou préserver ses cheveux naturels.',
            'Tissage : les mèches sont cousues sur des tresses réalisées sur vos cheveux naturels. Technique semi-permanente qui offre une durée de vie plus longue (6 à 8 semaines). Recommandé si vous souhaitez un résultat durable et discret au quotidien.',
          ],
        },
        {
          question: 'Comment choisir la bonne nuance ?',
          answer: ['Choisir la bonne nuance est essentiel pour un rendu naturel. Voici quelques conseils :'],
          points: [
            'Regardez vos pointes, pas votre racine : la teinte de vos pointes est généralement la plus représentative de votre couleur naturelle.',
            'Prenez une photo en lumière naturelle (pas en intérieur) et comparez-la avec les photos de la fiche produit.',
            'En cas de doute entre deux teintes, choisissez toujours la teinte la plus claire : les cheveux naturels s’assombrissent légèrement avec le temps et les soins.',
            'Notre équipe peut vous conseiller sur la bonne nuance avant votre commande.',
          ],
          link: {label: 'Demander conseil', to: '/pages/contact'},
        },
        {
          question: 'D’où viennent vos cheveux ? Comment garantissez-vous leur qualité ?',
          answer: ['Chez Alone Hair, l’éthique et la qualité sont au cœur de chaque commande. Voici nos engagements :'],
          points: [
            'Récolte après commande uniquement : vos cheveux n’attendent pas en stock. Ils sont récoltés à la demande pour garantir une fraîcheur et une durée de vie optimales.',
            'Single donor : chaque extension ou perruque est confectionnée avec des cheveux issus d’un seul et même donneur, garantissant une homogénéité parfaite de texture et de couleur.',
            'Zéro cheveux d’enfants : nous refusons catégoriquement tout don provenant de mineurs.',
            'Usine partenaire de confiance : notre fabricant travaille le cheveu de génération en génération, perpétuant un savoir-faire artisanal transmis et respecté.',
          ],
        },
        {
          question: 'Puis-je demander une coloration sur mesure ?',
          answer: ['Bien sûr ! Pour toute demande de coloration sur mesure, merci de nous contacter directement sur Instagram : @alone_hair.'],
          link: {label: 'Écrire sur Instagram', to: 'https://www.instagram.com/alone_hair'},
        },
      ] as FaqItem[],
    },
  ],
};

export const CONTACT = {
  title: 'Contact',
  lead: 'Une question, un doute ? Que ce soit pour choisir votre nuance, suivre une commande ou en savoir plus sur nos produits, nous sommes là.',
  delay: 'Réponse sous 24 h en semaine.',
  strip: [PHOTOS.marble2, PHOTOS.street, PHOTOS.bathFront, PHOTOS.curls, PHOTOS.bob, PHOTOS.marble1],
  channels: [
    {
      title: 'Instagram',
      accent: '@alone_hair',
      text: 'Le plus rapide : écrivez-nous en message privé pour une nuance, une longueur, une coloration sur mesure ou le suivi d’une commande.',
      cta: 'Écrire sur Instagram',
      href: 'https://www.instagram.com/alone_hair',
    },
    {
      title: 'TikTok',
      accent: '@alonehair',
      text: 'Nos perruques en vidéo, essayages et coulisses : retrouvez-les portées avant de choisir.',
      cta: 'Voir nos vidéos',
      href: 'https://www.tiktok.com/@alonehair',
    },
  ],
};
