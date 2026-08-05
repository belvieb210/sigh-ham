/** Navigation — Centre d'administration */

import {
  Home,
  Users,
  Shield,
  Building2,
  Settings,
  ScrollText,
  BarChart3,
  MessageSquare,
  Bell,
  UserCircle,
  DatabaseBackup,
  Activity,
  Lock,
} from "lucide-react";

export const NAVIGATION_ADMIN = {
  principal: [
    { href: "/sigh/admin", id: "accueil", icone: Home, actif: true },
    { href: "/sigh/admin/supervision", id: "supervision", icone: Activity },
    { href: "/sigh/admin/statistiques", id: "statistiques", icone: BarChart3 },
  ],
  gouvernance: [
    { href: "/sigh/admin/utilisateurs", id: "utilisateurs", icone: Users },
    { href: "/sigh/admin/roles", id: "roles", icone: Shield },
    { href: "/sigh/admin/services", id: "services", icone: Building2 },
  ],
  systeme: [
    { href: "/sigh/admin/parametres", id: "parametres", icone: Settings },
    { href: "/sigh/admin/securite", id: "securite", icone: Lock },
    { href: "/sigh/admin/audit", id: "audit", icone: ScrollText },
    { href: "/sigh/admin/sauvegardes", id: "sauvegardes", icone: DatabaseBackup },
  ],
  communication: [
    { href: "/sigh/admin/messagerie", id: "messagerie", icone: MessageSquare },
    { href: "/sigh/admin/notifications", id: "notifications", icone: Bell },
  ],
  compte: [
    { href: "/sigh/admin/profil", id: "profil", icone: UserCircle },
  ],
} as const;

export const NAVIGATION_BASSE_ADMIN = [
  { href: "/sigh/admin", id: "accueil", icone: Home },
  { href: "/sigh/admin/utilisateurs", id: "utilisateurs", icone: Users },
  { href: "/sigh/admin/audit", id: "audit", icone: ScrollText },
  { href: "/sigh/admin/parametres", id: "parametres", icone: Settings },
] as const;

export const EVENEMENT_ADMIN_UTILISATEURS_MODIFIES =
  "sigh:admin-utilisateurs-modifies";
