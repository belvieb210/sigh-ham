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
  UserCog,
  UserCircle,
  MessageSquare,
  Bell,
  FileText,
  Award,
} from "lucide-react";
import { ORIENTATIONS_RAPIDES } from "@/constants/reception";
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
    { href: "/sigh/eglise/rapports", id: "rapports", icone: FileText },
    { href: "/sigh/eglise/certificats", id: "certificats", icone: Award },
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
    { href: "/sigh/eglise/motifs", id: "motifsVisite", icone: ClipboardList },
    {
      href: "/sigh/eglise/examens-initiaux",
      id: "examensInitiaux",
      icone: FlaskConical,
    },
    { href: "/sigh/eglise/utilisateurs", id: "utilisateurs", icone: UserCog },
    { href: "/sigh/eglise/parametres", id: "parametres", icone: Settings },
  ],
} as const;

export const NAVIGATION_BASSE_EGLISE = [
  { href: "/sigh/eglise", id: "accueil", icone: Home },
  { href: "/sigh/eglise/nouveau", id: "nouveau", icone: UserPlus },
  { href: "/sigh/eglise/enregistres", id: "patients", icone: Users },
  { href: "/sigh/eglise/transferts", id: "transferes", icone: ArrowRightLeft },
] as const;

export const ORIENTATIONS_RAPIDES_EGLISE = ORIENTATIONS_RAPIDES;

export const CODES_ORIENTATION_EGLISE: CodeSalle[] = ORIENTATIONS_RAPIDES.map(
  (o) => o.value as CodeSalle
);

export const EVENEMENT_EGLISE_PATIENTS_MODIFIES = "sigh:eglise-patients-modifies";
