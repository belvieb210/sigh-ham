/** Navigation et contenus — Salle Caisse HAM LABORATOIRE (maquette) */

import {
  Home,
  Users,
  Receipt,
  FileText,
  Wallet,
  Ban,
  History,
  BarChart3,
  CalendarDays,
  PieChart,
  Tags,
  CreditCard,
  UserCircle,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";

export const NAVIGATION_CAISSE = {
  accueil: [
    { href: "/sigh/caisse", id: "tableauDeBord", icone: Home },
    { href: "/sigh/caisse/patients", id: "fileAttente", icone: Users, badge: true },
  ],
  caisse: [
    { href: "/sigh/caisse/facturation", id: "nouvelleFacture", icone: Receipt },
    { href: "/sigh/caisse/factures", id: "facturesDuJour", icone: FileText },
    { href: "/sigh/caisse/encaissements", id: "encaissements", icone: Wallet },
    { href: "/sigh/caisse/factures-annulees", id: "facturesAnnulees", icone: Ban },
    { href: "/sigh/caisse/historique", id: "historiqueCaisse", icone: History },
  ],
  rapports: [
    { href: "/sigh/caisse/rapports", id: "rapportJournalier", icone: BarChart3 },
    { href: "/sigh/caisse/rapports/mensuel", id: "rapportMensuel", icone: CalendarDays },
    { href: "/sigh/caisse/rapports/statistiques", id: "statistiques", icone: PieChart },
  ],
  parametres: [
    { href: "/sigh/caisse/parametres/tarifs", id: "tarifs", icone: Tags },
    { href: "/sigh/caisse/parametres/modes-paiement", id: "modesPaiement", icone: CreditCard },
    { href: "/sigh/caisse/profil", id: "profil", icone: UserCircle },
    { href: "/sigh/caisse/messagerie", id: "messagerie", icone: MessageSquare },
    { href: "/sigh/caisse/notifications", id: "notifications", icone: Bell },
    { href: "/sigh/caisse/parametres", id: "parametres", icone: Settings },
  ],
} as const;

/** Nav basse mobile — FAB central = nouvelle facture */
export const NAVIGATION_BASSE_CAISSE = [
  { href: "/sigh/caisse", id: "accueil", icone: Home },
  { href: "/sigh/caisse/patients", id: "file", icone: Users },
  { href: "/sigh/caisse/facturation", id: "nouvelleFacture", icone: Receipt, fab: true },
  { href: "/sigh/caisse/factures", id: "factures", icone: FileText },
] as const;

/** Modes affichés (maquette) — mappés vers ModePaiement Prisma */
export const MODES_PAIEMENT_UI_CAISSE = [
  { id: "ESPECES", modePrisma: "ESPECES" as const },
  { id: "CARTE", modePrisma: "CARTE" as const },
  { id: "MOBILE_MONEY", modePrisma: "MOBILE_MONEY" as const },
  { id: "ASSURANCE", modePrisma: "VIREMENT" as const },
  { id: "MIXTE", modePrisma: "ESPECES" as const },
] as const;

export const DESTINATIONS_APRES_ENCAISSEMENT = [
  "LABORATOIRE",
  "PHARMACIE",
  "AUCUNE",
] as const;

export const MODES_FACTURE_CAISSE = [
  "CASH",
  "AVANCE",
  "SOLDE",
  "PRISE_EN_CHARGE",
  "ABONNE",
  "CONVENTIONNE",
] as const;
