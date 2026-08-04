/** Toutes les salles sauf MEDECINS (origine) — orientations universelles */
import { metaOrientationsSauf } from "@/lib/transferts/orientations-universelles";
import type { CodeSalle } from "@/generated/prisma/client";
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

export const ORIENTATIONS_RAPIDES_MEDECINS = metaOrientationsSauf("MEDECINS");

export const CODES_ORIENTATION_MEDECINS: CodeSalle[] =
  ORIENTATIONS_RAPIDES_MEDECINS.map((o) => o.value);

export const EVENEMENT_MEDECINS_PATIENTS_MODIFIES = "sigh:medecins-patients-modifies";

export const ICONES_ACTIONS_MEDECINS = {
  dossier: ClipboardList,
  cr: FileText,
} as const;
