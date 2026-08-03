/** Navigation — Salle Laboratoire (patients transférés après paiement caisse) */

import {
  Home,
  Users,
  FlaskConical,
  ClipboardEdit,
  ShieldCheck,
  CheckCircle2,
  History,
  Package,
  Settings,
  BarChart3,
  MessageSquare,
  Bell,
  UserCircle,
} from "lucide-react";

export const NAVIGATION_LABORATOIRE = {
  tableauDeBord: [{ href: "/sigh/laboratoire", id: "accueil", icone: Home }],
  laboratoire: [
    {
      href: "/sigh/laboratoire/patients",
      id: "patientsTransferees",
      icone: Users,
      badge: true,
    },
    {
      href: "/sigh/laboratoire/examens-en-cours",
      id: "examensEnCours",
      icone: FlaskConical,
    },
    {
      href: "/sigh/laboratoire/saisie-resultats",
      id: "saisieResultats",
      icone: ClipboardEdit,
    },
    {
      href: "/sigh/laboratoire/resultats-a-valider",
      id: "resultatsAValider",
      icone: ShieldCheck,
    },
    {
      href: "/sigh/laboratoire/resultats-valides",
      id: "resultatsValides",
      icone: CheckCircle2,
    },
    {
      href: "/sigh/laboratoire/historique",
      id: "historique",
      icone: History,
    },
    {
      href: "/sigh/laboratoire/stock-reactifs",
      id: "stockReactifs",
      icone: Package,
    },
  ],
  rapports: [
    { href: "/sigh/laboratoire/rapports", id: "rapports", icone: BarChart3 },
  ],
  communication: [
    {
      href: "/sigh/laboratoire/messagerie",
      id: "messagerie",
      icone: MessageSquare,
    },
    {
      href: "/sigh/laboratoire/notifications",
      id: "notifications",
      icone: Bell,
    },
  ],
  parametres: [
    {
      href: "/sigh/laboratoire/parametres",
      id: "parametres",
      icone: Settings,
    },
    { href: "/sigh/laboratoire/profil", id: "profil", icone: UserCircle },
  ],
} as const;

export const NAVIGATION_BASSE_LABORATOIRE = [
  { href: "/sigh/laboratoire", id: "accueil", icone: Home },
  { href: "/sigh/laboratoire/patients", id: "patients", icone: Users, fab: true },
  {
    href: "/sigh/laboratoire/examens-en-cours",
    id: "examens",
    icone: FlaskConical,
  },
  {
    href: "/sigh/laboratoire/resultats-a-valider",
    id: "validation",
    icone: ShieldCheck,
  },
] as const;
