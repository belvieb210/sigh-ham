/** Navigation et orientations — Salle Médecins (§8) */

import {
  Home,
  Users,
  Stethoscope,
  FlaskConical,
  Pill,
  BedDouble,
  CalendarPlus,
  History,
  Settings,
  MessageSquare,
  Bell,
  UserCircle,
  ClipboardList,
  FileText,
} from "lucide-react";
import type { CodeSalle } from "@/generated/prisma/client";

export const NAVIGATION_MEDECINS = {
  tableauDeBord: [{ href: "/sigh/medecins", id: "accueil", icone: Home }],
  medecins: [
    {
      href: "/sigh/medecins/patients",
      id: "patients",
      icone: Users,
      badge: true,
    },
    {
      href: "/sigh/medecins/consultation",
      id: "consultation",
      icone: Stethoscope,
    },
    {
      href: "/sigh/medecins/examens",
      id: "examens",
      icone: FlaskConical,
    },
    {
      href: "/sigh/medecins/ordonnances",
      id: "ordonnances",
      icone: Pill,
    },
    {
      href: "/sigh/medecins/hospitalisations",
      id: "hospitalisations",
      icone: BedDouble,
    },
    {
      href: "/sigh/medecins/rendez-vous",
      id: "rendezVous",
      icone: CalendarPlus,
    },
    {
      href: "/sigh/medecins/historique",
      id: "historique",
      icone: History,
    },
  ],
  communication: [
    { href: "/sigh/medecins/messagerie", id: "messagerie", icone: MessageSquare },
    { href: "/sigh/medecins/notifications", id: "notifications", icone: Bell },
  ],
  parametres: [
    { href: "/sigh/medecins/profil", id: "profil", icone: UserCircle },
    { href: "/sigh/medecins/parametres", id: "parametres", icone: Settings },
  ],
} as const;

export const NAVIGATION_BASSE_MEDECINS = [
  { href: "/sigh/medecins", id: "accueil", icone: Home },
  { href: "/sigh/medecins/patients", id: "patients", icone: Users },
  { href: "/sigh/medecins/consultation", id: "consultation", icone: Stethoscope, fab: true },
  { href: "/sigh/medecins/ordonnances", id: "ordonnances", icone: Pill },
] as const;

/** Toutes les salles sauf MEDECINS (origine) */
export const ORIENTATIONS_RAPIDES_MEDECINS: {
  value: CodeSalle;
  labelKey: string;
  descriptionKey: string;
  couleur: string;
}[] = [
  {
    value: "INFIRMIERS",
    labelKey: "INFIRMIERS",
    descriptionKey: "INFIRMIERS",
    couleur: "border-violet-300 bg-violet-50 text-violet-700",
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

export const CODES_ORIENTATION_MEDECINS: CodeSalle[] =
  ORIENTATIONS_RAPIDES_MEDECINS.map((o) => o.value);

export const EVENEMENT_MEDECINS_PATIENTS_MODIFIES = "sigh:medecins-patients-modifies";

export const ICONES_ACTIONS_MEDECINS = {
  dossier: ClipboardList,
  cr: FileText,
} as const;
