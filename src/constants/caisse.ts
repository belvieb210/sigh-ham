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
  ArrowRightLeft,
} from "lucide-react";

export const NAVIGATION_CAISSE = {
  tableauDeBord: [{ href: "/sigh/caisse", id: "accueil", icone: Home }],
  caisse: [
    { href: "/sigh/caisse/facturation", id: "facturation", icone: Receipt },
    { href: "/sigh/caisse/transferts", id: "transferts", icone: ArrowRightLeft, badge: true },
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
  { href: "/sigh/caisse/transferts", id: "patients", icone: Users },
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

/** Types de facture (UI) — suite métier à brancher plus tard */
export const TYPES_FACTURE_CAISSE_UI = [
  { id: "NORMALE" as const, destination: "LABORATOIRE" as const },
  { id: "PHARMACIE" as const, destination: "PHARMACIE" as const },
] as const;

/** Orientations rapides — mêmes possibilités que la réception (+ laboratoire) */
export const ORIENTATIONS_RAPIDES_CAISSE = [
  {
    value: "INFIRMIERS",
    label: "Infirmiers",
    description: "Prise de signes vitaux",
    couleur: "border-violet-300 bg-violet-50 text-violet-700",
  },
  {
    value: "MEDECINS",
    label: "Médecin",
    description: "Consultation médicale",
    couleur: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    value: "LABORATOIRE",
    label: "Laboratoire",
    description: "Analyses et prélèvements",
    couleur: "border-cyan-200 bg-cyan-50 text-cyan-800",
  },
  {
    value: "CAISSE",
    label: "Caisse",
    description: "Facturation et paiement",
    couleur: "border-rose-200 bg-rose-50 text-rose-700",
  },
  {
    value: "MEDECINS_EXTERNES",
    label: "Médecin externe",
    description: "Patient référé par un médecin",
    couleur: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    value: "EGLISE",
    label: "Église",
    description: "Examens prénuptiaux",
    couleur: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    value: "PHARMACIE",
    label: "Pharmacie",
    description: "Délivrance des médicaments",
    couleur: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
] as const;

export const COULEURS_ORIENTATION_CAISSE: Record<string, string> = {
  Infirmiers: "bg-violet-100 text-violet-700",
  Médecin: "bg-blue-100 text-blue-700",
  "Médecin externe": "bg-amber-100 text-amber-800",
  Caisse: "bg-rose-100 text-rose-700",
  Laboratoire: "bg-cyan-100 text-cyan-800",
  Église: "bg-emerald-100 text-emerald-700",
  Pharmacie: "bg-indigo-100 text-indigo-700",
  "Non orienté": "bg-slate-100 text-slate-600",
};

export const EVENEMENT_CAISSE_PATIENTS_MODIFIES = "caisse:patients-modifies";
