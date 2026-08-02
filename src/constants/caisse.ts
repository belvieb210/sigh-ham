/** Navigation et contenus — Salle Caisse (maquette facturation examens) */

import {
  Home,
  Users,
  Receipt,
  FileText,
  Wallet,
  CircleDollarSign,
  History,
  BarChart3,
  CalendarDays,
  PieChart,
  CreditCard,
  Settings,
  MessageSquare,
  Bell,
  UserCircle,
} from "lucide-react";

export const NAVIGATION_CAISSE = {
  tableauDeBord: [{ href: "/sigh/caisse", id: "accueil", icone: Home }],
  caisse: [
    { href: "/sigh/caisse/facturation", id: "facturation", icone: Receipt },
    { href: "/sigh/caisse/patients", id: "patientsEnAttente", icone: Users, badge: true },
    { href: "/sigh/caisse/factures", id: "facturesDuJour", icone: FileText },
    { href: "/sigh/caisse/encaissements", id: "encaissements", icone: Wallet },
    { href: "/sigh/caisse/avoirs", id: "avoirsAvances", icone: CircleDollarSign },
    { href: "/sigh/caisse/historique", id: "historiqueCaisse", icone: History },
  ],
  rapports: [
    { href: "/sigh/caisse/rapports", id: "rapportJournalier", icone: BarChart3 },
    { href: "/sigh/caisse/rapports/mensuel", id: "rapportMensuel", icone: CalendarDays },
    { href: "/sigh/caisse/rapports/statistiques", id: "statistiques", icone: PieChart },
  ],
  communication: [
    { href: "/sigh/caisse/messagerie", id: "messagerie", icone: MessageSquare },
    { href: "/sigh/caisse/notifications", id: "notifications", icone: Bell },
  ],
  parametres: [
    { href: "/sigh/caisse/parametres/modes-paiement", id: "modesPaiement", icone: CreditCard },
    { href: "/sigh/caisse/parametres", id: "parametres", icone: Settings },
    { href: "/sigh/caisse/profil", id: "profil", icone: UserCircle },
  ],
} as const;

export const NAVIGATION_BASSE_CAISSE = [
  { href: "/sigh/caisse", id: "accueil", icone: Home },
  { href: "/sigh/caisse/patients", id: "patients", icone: Users },
  { href: "/sigh/caisse/facturation", id: "facturation", icone: Receipt, fab: true },
  { href: "/sigh/caisse/encaissements", id: "encaissements", icone: Wallet },
] as const;

export const MODES_FACTURE_CAISSE = [
  { id: "CASH" as const, descriptionKey: "cash" },
  { id: "AVANCE" as const, descriptionKey: "avance" },
  { id: "SOLDE" as const, descriptionKey: "solde" },
  { id: "PRISE_EN_CHARGE" as const, descriptionKey: "priseEnCharge" },
  { id: "ABONNE" as const, descriptionKey: "abonne" },
  { id: "CONVENTIONNE" as const, descriptionKey: "conventionne" },
] as const;

/** Maquette : Espèces, Carte, Mobile Money, Assurance, Virement */
export const MODES_PAIEMENT_UI_CAISSE = [
  { id: "ESPECES", modePrisma: "ESPECES" as const },
  { id: "CARTE", modePrisma: "CARTE" as const },
  { id: "MOBILE_MONEY", modePrisma: "MOBILE_MONEY" as const },
  { id: "ASSURANCE", modePrisma: "VIREMENT" as const },
  { id: "VIREMENT", modePrisma: "VIREMENT" as const },
] as const;

export const DESTINATIONS_APRES_ENCAISSEMENT = [
  "LABORATOIRE",
  "PHARMACIE",
  "AUCUNE",
] as const;
