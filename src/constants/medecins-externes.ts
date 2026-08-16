/** Navigation — Médecins externes = réception (sans pages cliniques / admin inutiles) */

import {
  Home,
  UserPlus,
  Users,
  ArrowRightLeft,
  Search,
  History,
  ClipboardList,
  FlaskConical,
  UserCircle,
  MessageSquare,
  Bell,
} from "lucide-react";
import { metaOrientationsSauf } from "@/lib/transferts/orientations-universelles";
import type { CodeSalle } from "@/generated/prisma/client";

export const BADGES_NAVIGATION_MEDECINS_EXTERNES = {
  messagerie: 0,
  notifications: 0,
} as const;

/** Même structure que la réception (principal) — sans section clinique médicale */
export const NAVIGATION_MEDECINS_EXTERNES = {
  principal: [
    { href: "/sigh/medecins-externes", id: "accueil", icone: Home, actif: true },
    {
      href: "/sigh/medecins-externes/nouveau",
      id: "nouveauPatient",
      icone: UserPlus,
    },
    {
      href: "/sigh/medecins-externes/enregistres",
      id: "patientsEnregistres",
      icone: Users,
    },
    {
      href: "/sigh/medecins-externes/transferts",
      id: "patientsTransferes",
      icone: ArrowRightLeft,
    },
    {
      href: "/sigh/medecins-externes/examens-disponibles",
      id: "examensDisponibles",
      icone: FlaskConical,
    },
    {
      href: "/sigh/medecins-externes/recherche",
      id: "rechercherPatient",
      icone: Search,
    },
    {
      href: "/sigh/medecins-externes/historique",
      id: "historique",
      icone: History,
    },
    {
      href: "/sigh/medecins-externes/estimations",
      id: "estimations",
      icone: ClipboardList,
    },
  ],
  /** Section retirée volontairement (Consultation, Ordonnances, Examens, Historique médical). */
  clinique: [] as const,
  communication: [
    {
      href: "/sigh/medecins-externes/messagerie",
      id: "messagerie",
      icone: MessageSquare,
      badge: BADGES_NAVIGATION_MEDECINS_EXTERNES.messagerie,
      badgeVariant: "bleu" as const,
    },
    {
      href: "/sigh/medecins-externes/notifications",
      id: "notifications",
      icone: Bell,
      badge: BADGES_NAVIGATION_MEDECINS_EXTERNES.notifications,
      badgeVariant: "rouge" as const,
    },
  ],
  parametres: [
    {
      href: "/sigh/medecins-externes/profil",
      id: "profil",
      icone: UserCircle,
    },
  ],
} as const;

export const NAVIGATION_BASSE_MEDECINS_EXTERNES = [
  { href: "/sigh/medecins-externes", id: "accueil", icone: Home },
  { href: "/sigh/medecins-externes/nouveau", id: "nouveau", icone: UserPlus },
  {
    href: "/sigh/medecins-externes/enregistres",
    id: "patients",
    icone: Users,
  },
  {
    href: "/sigh/medecins-externes/transferts",
    id: "transferes",
    icone: ArrowRightLeft,
  },
] as const;

/** Médecins externes : transfert uniquement vers la Caisse */
export const ORIENTATIONS_RAPIDES_MEDECINS_EXTERNES = metaOrientationsSauf(
  "MEDECINS_EXTERNES"
);

export const CODES_ORIENTATION_MEDECINS_EXTERNES: CodeSalle[] = ["CAISSE"];

export function filtrerOrientationsMedecinsExternes(
  orientations: string[]
): CodeSalle[] {
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

export const EVENEMENT_MEDECINS_EXTERNES_MODIFIE =
  "sigh:medecins-externes-patients-modifies";
export const EVENEMENT_MEDECINS_EXTERNES_PATIENTS_MODIFIES =
  EVENEMENT_MEDECINS_EXTERNES_MODIFIE;
