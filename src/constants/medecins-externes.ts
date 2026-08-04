/** Navigation et orientations — Médecins externes */

import {
  Home,
  Users,
  UserPlus,
  Stethoscope,
  ClipboardList,
  FlaskConical,
  History,
  MessageSquare,
  Bell,
  UserCircle,
  Settings,
} from "lucide-react";
import { metaOrientationsSauf } from "@/lib/transferts/orientations-universelles";
import type { CodeSalle } from "@/generated/prisma/client";

export const NAVIGATION_MEDECINS_EXTERNES = {
  tableauDeBord: [
    { href: "/sigh/medecins-externes", id: "accueil", icone: Home },
  ],
  clinique: [
    {
      href: "/sigh/medecins-externes/patients",
      id: "patients",
      icone: Users,
      badge: true,
    },
    {
      href: "/sigh/medecins-externes/nouveau",
      id: "nouveau",
      icone: UserPlus,
    },
    {
      href: "/sigh/medecins-externes/consultation",
      id: "consultation",
      icone: Stethoscope,
    },
    {
      href: "/sigh/medecins-externes/ordonnances",
      id: "ordonnances",
      icone: ClipboardList,
    },
    {
      href: "/sigh/medecins-externes/examens",
      id: "examens",
      icone: FlaskConical,
    },
    {
      href: "/sigh/medecins-externes/historique",
      id: "historique",
      icone: History,
    },
  ],
  communication: [
    {
      href: "/sigh/medecins-externes/messagerie",
      id: "messagerie",
      icone: MessageSquare,
    },
    {
      href: "/sigh/medecins-externes/notifications",
      id: "notifications",
      icone: Bell,
    },
  ],
  parametres: [
    {
      href: "/sigh/medecins-externes/profil",
      id: "profil",
      icone: UserCircle,
    },
    {
      href: "/sigh/medecins-externes/parametres",
      id: "parametres",
      icone: Settings,
    },
  ],
} as const;

export const NAVIGATION_BASSE_MEDECINS_EXTERNES = [
  { href: "/sigh/medecins-externes", id: "accueil", icone: Home },
  { href: "/sigh/medecins-externes/patients", id: "patients", icone: Users },
  {
    href: "/sigh/medecins-externes/nouveau",
    id: "nouveau",
    icone: UserPlus,
    fab: true,
  },
  {
    href: "/sigh/medecins-externes/consultation",
    id: "consultation",
    icone: Stethoscope,
  },
] as const;

export const ORIENTATIONS_RAPIDES_MEDECINS_EXTERNES =
  metaOrientationsSauf("MEDECINS_EXTERNES");

export const CODES_ORIENTATION_MEDECINS_EXTERNES: CodeSalle[] =
  ORIENTATIONS_RAPIDES_MEDECINS_EXTERNES.map((o) => o.value);

export const EVENEMENT_MEDECINS_EXTERNES_MODIFIE =
  "sigh:medecins-externes-modifie";
export const EVENEMENT_MEDECINS_EXTERNES_PATIENTS_MODIFIES =
  EVENEMENT_MEDECINS_EXTERNES_MODIFIE;
