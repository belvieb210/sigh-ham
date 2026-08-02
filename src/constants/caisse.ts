/** Navigation et contenus — Salle Caisse HAM LABORATOIRE */

import {
  Home,
  Receipt,
  Users,
  FileText,
  Wallet,
  BarChart3,
  Settings,
  UserCircle,
  MessageSquare,
  Bell,
} from "lucide-react";

export const BADGES_NAVIGATION_CAISSE = {
  messagerie: 0,
  notifications: 0,
} as const;

export const NAVIGATION_CAISSE = {
  principal: [
    { href: "/sigh/caisse", id: "accueil", icone: Home },
    { href: "/sigh/caisse/facturation", id: "facturation", icone: Receipt },
    { href: "/sigh/caisse/patients", id: "patientsEnAttente", icone: Users },
    { href: "/sigh/caisse/factures", id: "facturesDuJour", icone: FileText },
    { href: "/sigh/caisse/encaissements", id: "encaissements", icone: Wallet },
    { href: "/sigh/caisse/rapports", id: "rapports", icone: BarChart3 },
  ],
  communication: [
    {
      href: "/sigh/caisse/messagerie",
      id: "messagerie",
      icone: MessageSquare,
      badge: BADGES_NAVIGATION_CAISSE.messagerie,
      badgeVariant: "bleu" as const,
    },
    {
      href: "/sigh/caisse/notifications",
      id: "notifications",
      icone: Bell,
      badge: BADGES_NAVIGATION_CAISSE.notifications,
      badgeVariant: "rouge" as const,
    },
  ],
  parametres: [
    { href: "/sigh/caisse/profil", id: "profil", icone: UserCircle },
    { href: "/sigh/caisse/parametres", id: "parametres", icone: Settings },
  ],
} as const;

export const NAVIGATION_BASSE_CAISSE = [
  { href: "/sigh/caisse", id: "accueil", icone: Home },
  { href: "/sigh/caisse/facturation", id: "facturation", icone: Receipt },
  { href: "/sigh/caisse/patients", id: "patients", icone: Users },
  { href: "/sigh/caisse/encaissements", id: "encaissements", icone: Wallet },
] as const;

export const MODES_FACTURE_CAISSE = [
  "CASH",
  "AVANCE",
  "SOLDE",
  "PRISE_EN_CHARGE",
  "ABONNE",
  "CONVENTIONNE",
] as const;

export const MODES_PAIEMENT_CAISSE = [
  "ESPECES",
  "CARTE",
  "MOBILE_MONEY",
  "VIREMENT",
  "CHEQUE",
] as const;

export const DESTINATIONS_APRES_ENCAISSEMENT = [
  "LABORATOIRE",
  "PHARMACIE",
  "AUCUNE",
] as const;
