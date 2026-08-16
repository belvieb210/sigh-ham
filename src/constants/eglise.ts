/** Navigation — Service Église (réception + rapports/certificats) */

import {
  Home,
  UserPlus,
  Users,
  ArrowRightLeft,
  Search,
  History,
  ClipboardList,
  FlaskConical,
  Settings,
  UserCircle,
  MessageSquare,
  Bell,
} from "lucide-react";
import { metaOrientationsSauf } from "@/lib/transferts/orientations-universelles";
import type { CodeSalle } from "@/generated/prisma/client";

export const NAVIGATION_EGLISE = {
  principal: [
    { href: "/sigh/eglise", id: "accueil", icone: Home, actif: true },
    { href: "/sigh/eglise/nouveau", id: "nouveauPatient", icone: UserPlus },
    { href: "/sigh/eglise/enregistres", id: "patientsEnregistres", icone: Users },
    {
      href: "/sigh/eglise/transferts",
      id: "patientsTransferes",
      icone: ArrowRightLeft,
    },
    {
      href: "/sigh/eglise/examens-disponibles",
      id: "examensDisponibles",
      icone: FlaskConical,
    },
    { href: "/sigh/eglise/recherche", id: "rechercherPatient", icone: Search },
    { href: "/sigh/eglise/historique", id: "historique", icone: History },
  ],
  eglise: [
    { href: "/sigh/eglise/estimations", id: "estimations", icone: ClipboardList },
  ],
  communication: [
    {
      href: "/sigh/eglise/messagerie",
      id: "messagerie",
      icone: MessageSquare,
    },
    {
      href: "/sigh/eglise/notifications",
      id: "notifications",
      icone: Bell,
    },
  ],
  parametres: [
    { href: "/sigh/eglise/profil", id: "profil", icone: UserCircle },
    { href: "/sigh/eglise/parametres", id: "parametres", icone: Settings },
  ],
} as const;

export const NAVIGATION_BASSE_EGLISE = [
  { href: "/sigh/eglise", id: "accueil", icone: Home },
  { href: "/sigh/eglise/nouveau", id: "nouveau", icone: UserPlus },
  { href: "/sigh/eglise/enregistres", id: "patients", icone: Users },
  { href: "/sigh/eglise/transferts", id: "transferes", icone: ArrowRightLeft },
] as const;

export const ORIENTATIONS_RAPIDES_EGLISE = metaOrientationsSauf("EGLISE");

export const CODES_ORIENTATION_EGLISE: CodeSalle[] = ["CAISSE"];

export function filtrerOrientationsEglise(orientations: string[]): CodeSalle[] {
  const codes = [
    ...new Set(
      orientations
        .map((o) => o.trim())
        .filter((o) => o === "CAISSE") as CodeSalle[]
    ),
  ];
  if (codes.length === 0) return ["CAISSE"];
  return codes;
}

export const EVENEMENT_EGLISE_PATIENTS_MODIFIES = "sigh:eglise-patients-modifies";
