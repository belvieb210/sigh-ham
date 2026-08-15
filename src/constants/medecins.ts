/** Toutes les salles sauf MEDECINS (origine) — orientations universelles */
import { metaOrientationsSauf } from "@/lib/transferts/orientations-universelles";
import type { CodeSalle } from "@/generated/prisma/client";
import {
  Home,
  Users,
  Stethoscope,
  Pill,
  CalendarPlus,
  Settings,
  MessageSquare,
  Bell,
  UserCircle,
  ClipboardList,
  FileText,
  NotebookPen,
  ArrowRightLeft,
  BarChart3,
  CalendarDays,
} from "lucide-react";

/** Clés de compteurs pour badges sidebar */
export type CleBadgeMedecins =
  | "fileAttente"
  | "patientsDuJour"
  | "ordonnances"
  | "patientsTransferes";

export const NAVIGATION_MEDECINS = {
  tableauDeBord: [
    { href: "/sigh/medecins", id: "accueil", icone: Home, actif: true },
  ],
  salle: [
    {
      href: "/sigh/medecins/file-attente",
      id: "fileAttente",
      icone: Users,
      badge: "fileAttente" as CleBadgeMedecins,
    },
    {
      href: "/sigh/medecins/patients-du-jour",
      id: "patientsDuJour",
      icone: CalendarDays,
      badge: "patientsDuJour" as CleBadgeMedecins,
    },
    {
      href: "/sigh/medecins/consultation",
      id: "consultation",
      icone: Stethoscope,
    },
    {
      href: "/sigh/medecins/ordonnances",
      id: "ordonnances",
      icone: Pill,
      badge: "ordonnances" as CleBadgeMedecins,
    },
    {
      href: "/sigh/medecins/notes",
      id: "notesMedicales",
      icone: NotebookPen,
    },
    {
      href: "/sigh/medecins/patients-transferes",
      id: "patientsTransferes",
      icone: ArrowRightLeft,
      badge: "patientsTransferes" as CleBadgeMedecins,
    },
    {
      href: "/sigh/medecins/rendez-vous",
      id: "rendezVous",
      icone: CalendarPlus,
    },
    {
      href: "/sigh/medecins/rapports",
      id: "rapports",
      icone: BarChart3,
    },
  ],
  communication: [
    { href: "/sigh/medecins/messagerie", id: "messagerie", icone: MessageSquare },
    { href: "/sigh/medecins/notifications", id: "notifications", icone: Bell },
  ],
  parametres: [
    {
      href: "/sigh/medecins/parametres",
      id: "parametresConsultation",
      icone: Settings,
    },
    { href: "/sigh/medecins/profil", id: "profil", icone: UserCircle },
  ],
} as const;

export const NAVIGATION_BASSE_MEDECINS = [
  { href: "/sigh/medecins", id: "accueil", icone: Home },
  { href: "/sigh/medecins/file-attente", id: "fileAttente", icone: Users },
  {
    href: "/sigh/medecins/consultation",
    id: "consultation",
    icone: Stethoscope,
    fab: true,
  },
  { href: "/sigh/medecins/ordonnances", id: "ordonnances", icone: Pill },
] as const;

export const ORIENTATIONS_RAPIDES_MEDECINS = metaOrientationsSauf("MEDECINS");

export const CODES_ORIENTATION_MEDECINS: CodeSalle[] =
  ORIENTATIONS_RAPIDES_MEDECINS.map((o) => o.value);

export const EVENEMENT_MEDECINS_PATIENTS_MODIFIES = "sigh:medecins-patients-modifies";

export const ICONES_ACTIONS_MEDECINS = {
  dossier: ClipboardList,
  cr: FileText,
} as const;
