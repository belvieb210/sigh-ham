/** Navigation — Médecins externes = réception + pages médicales */

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
  UserCog,
  UserCircle,
  MessageSquare,
  Bell,
  Stethoscope,
  Pill,
} from "lucide-react";
import { ORIENTATIONS_RAPIDES } from "@/constants/reception";
import type { CodeSalle } from "@/generated/prisma/client";

export const BADGES_NAVIGATION_MEDECINS_EXTERNES = {
  messagerie: 0,
  notifications: 0,
} as const;

/** Même structure que la réception (principal) + section clinique médicale */
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
  ],
  clinique: [
    {
      href: "/sigh/medecins-externes/consultation",
      id: "consultation",
      icone: Stethoscope,
    },
    {
      href: "/sigh/medecins-externes/ordonnances",
      id: "ordonnances",
      icone: Pill,
    },
    {
      href: "/sigh/medecins-externes/examens",
      id: "examens",
      icone: FlaskConical,
    },
    {
      href: "/sigh/medecins-externes/historique-medical",
      id: "historiqueMedical",
      icone: ClipboardList,
    },
  ],
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
    {
      href: "/sigh/medecins-externes/motifs",
      id: "motifsVisite",
      icone: ClipboardList,
    },
    {
      href: "/sigh/medecins-externes/examens-initiaux",
      id: "examensInitiaux",
      icone: FlaskConical,
    },
    {
      href: "/sigh/medecins-externes/utilisateurs",
      id: "utilisateurs",
      icone: UserCog,
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

/** Identique à la réception (mêmes destinations / libellés / couleurs) */
export const ORIENTATIONS_RAPIDES_MEDECINS_EXTERNES = ORIENTATIONS_RAPIDES;

export const CODES_ORIENTATION_MEDECINS_EXTERNES: CodeSalle[] =
  ORIENTATIONS_RAPIDES.map((o) => o.value as CodeSalle);

export const EVENEMENT_MEDECINS_EXTERNES_MODIFIE =
  "sigh:medecins-externes-patients-modifies";
export const EVENEMENT_MEDECINS_EXTERNES_PATIENTS_MODIFIES =
  EVENEMENT_MEDECINS_EXTERNES_MODIFIE;
