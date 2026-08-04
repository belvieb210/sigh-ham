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

/** Toutes les salles sauf INFIRMIERS — MEDECINS en premier (parcours classique) */
export const ORIENTATIONS_RAPIDES_INFIRMIERS: {
  value: CodeSalle;
  labelKey: string;
  descriptionKey: string;
  couleur: string;
}[] = [
  {
    value: "MEDECINS",
    labelKey: "MEDECINS",
    descriptionKey: "MEDECINS",
    couleur: "border-blue-300 bg-blue-50 text-blue-700",
  },
  {
    value: "RECEPTION",
    labelKey: "RECEPTION",
    descriptionKey: "RECEPTION",
    couleur: "border-slate-300 bg-slate-50 text-slate-700",
  },
  {
    value: "CAISSE",
    labelKey: "CAISSE",
    descriptionKey: "CAISSE",
    couleur: "border-rose-200 bg-rose-50 text-rose-700",
  },
  {
    value: "LABORATOIRE",
    labelKey: "LABORATOIRE",
    descriptionKey: "LABORATOIRE",
    couleur: "border-cyan-200 bg-cyan-50 text-cyan-800",
  },
  {
    value: "PHARMACIE",
    labelKey: "PHARMACIE",
    descriptionKey: "PHARMACIE",
    couleur: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    value: "HOSPITALISATION",
    labelKey: "HOSPITALISATION",
    descriptionKey: "HOSPITALISATION",
    couleur: "border-indigo-200 bg-indigo-50 text-indigo-800",
  },
  {
    value: "EGLISE",
    labelKey: "EGLISE",
    descriptionKey: "EGLISE",
    couleur: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    value: "MEDECINS_EXTERNES",
    labelKey: "MEDECINS_EXTERNES",
    descriptionKey: "MEDECINS_EXTERNES",
    couleur: "border-orange-200 bg-orange-50 text-orange-800",
  },
];

export const CODES_ORIENTATION_INFIRMIERS: CodeSalle[] =
  ORIENTATIONS_RAPIDES_INFIRMIERS.map((o) => o.value);

export const EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES =
  "sigh:infirmiers-patients-modifies";

export const ICONES_ACTIONS_INFIRMIERS = {
  dossier: ClipboardList,
} as const;
