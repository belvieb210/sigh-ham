/** Navigation et orientations — Salle Pharmacie */

import {
  Home,
  Users,
  Pill,
  Wallet,
  PackageCheck,
  BarChart3,
  History,
  Settings,
  MessageSquare,
  Bell,
  UserCircle,
  UserPlus,
  FileText,
} from "lucide-react";
import { metaOrientationsSauf } from "@/lib/transferts/orientations-universelles";
import type { CodeSalle } from "@/generated/prisma/client";

export const NAVIGATION_PHARMACIE = {
  tableauDeBord: [{ href: "/sigh/pharmacie", id: "accueil", icone: Home }],
  pharmacie: [
    { href: "/sigh/pharmacie/patients", id: "patients", icone: Users, badge: true },
    { href: "/sigh/pharmacie/nouveau-client", id: "nouveauClient", icone: UserPlus },
    { href: "/sigh/pharmacie/vente", id: "vente", icone: Pill },
    { href: "/sigh/pharmacie/attente-paiement", id: "attentePaiement", icone: Wallet },
    { href: "/sigh/pharmacie/paiements-valides", id: "paiementsValides", icone: PackageCheck },
    { href: "/sigh/pharmacie/remise", id: "remise", icone: FileText },
    { href: "/sigh/pharmacie/rapports", id: "rapports", icone: BarChart3 },
    { href: "/sigh/pharmacie/historique", id: "historique", icone: History },
  ],
  communication: [
    { href: "/sigh/pharmacie/messagerie", id: "messagerie", icone: MessageSquare },
    { href: "/sigh/pharmacie/notifications", id: "notifications", icone: Bell },
  ],
  parametres: [
    { href: "/sigh/pharmacie/profil", id: "profil", icone: UserCircle },
    { href: "/sigh/pharmacie/parametres", id: "parametres", icone: Settings },
  ],
} as const;

export const NAVIGATION_BASSE_PHARMACIE = [
  { href: "/sigh/pharmacie", id: "accueil", icone: Home },
  { href: "/sigh/pharmacie/patients", id: "patients", icone: Users },
  { href: "/sigh/pharmacie/vente", id: "vente", icone: Pill, fab: true },
  { href: "/sigh/pharmacie/nouveau-client", id: "nouveauClient", icone: UserPlus },
] as const;

export const ORIENTATIONS_RAPIDES_PHARMACIE = metaOrientationsSauf("PHARMACIE");

export const CODES_ORIENTATION_PHARMACIE: CodeSalle[] =
  ORIENTATIONS_RAPIDES_PHARMACIE.map((o) => o.value);

export const EVENEMENT_PHARMACIE_MODIFIE = "sigh:pharmacie-modifie";
/** Alias historique pour les listeners file patients */
export const EVENEMENT_PHARMACIE_PATIENTS_MODIFIES = EVENEMENT_PHARMACIE_MODIFIE;
