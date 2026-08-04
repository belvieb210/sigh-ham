/** Navigation et orientations — Salle Infirmiers (§7) */

import {
  Home,
  Users,
  Activity,
  History,
  Settings,
  MessageSquare,
  Bell,
  UserCircle,
  ClipboardList,
} from "lucide-react";
import { metaOrientationsSauf } from "@/lib/transferts/orientations-universelles";
import type { CodeSalle } from "@/generated/prisma/client";

export const NAVIGATION_INFIRMIERS = {
  tableauDeBord: [{ href: "/sigh/infirmiers", id: "accueil", icone: Home }],
  infirmiers: [
    {
      href: "/sigh/infirmiers/patients",
      id: "patients",
      icone: Users,
      badge: true,
    },
    {
      href: "/sigh/infirmiers/constantes",
      id: "constantes",
      icone: Activity,
    },
    {
      href: "/sigh/infirmiers/historique",
      id: "historique",
      icone: History,
    },
  ],
  communication: [
    {
      href: "/sigh/infirmiers/messagerie",
      id: "messagerie",
      icone: MessageSquare,
    },
    {
      href: "/sigh/infirmiers/notifications",
      id: "notifications",
      icone: Bell,
    },
  ],
  parametres: [
    { href: "/sigh/infirmiers/profil", id: "profil", icone: UserCircle },
    { href: "/sigh/infirmiers/parametres", id: "parametres", icone: Settings },
  ],
} as const;

export const NAVIGATION_BASSE_INFIRMIERS = [
  { href: "/sigh/infirmiers", id: "accueil", icone: Home },
  { href: "/sigh/infirmiers/patients", id: "patients", icone: Users },
  {
    href: "/sigh/infirmiers/constantes",
    id: "constantes",
    icone: Activity,
    fab: true,
  },
  { href: "/sigh/infirmiers/historique", id: "historique", icone: History },
] as const;

export const ORIENTATIONS_RAPIDES_INFIRMIERS = metaOrientationsSauf("INFIRMIERS");

export const CODES_ORIENTATION_INFIRMIERS: CodeSalle[] =
  ORIENTATIONS_RAPIDES_INFIRMIERS.map((o) => o.value);

export const EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES =
  "sigh:infirmiers-patients-modifies";

export const ICONES_ACTIONS_INFIRMIERS = {
  dossier: ClipboardList,
} as const;
