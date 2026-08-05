/** Navigation — Service Client (CMS site public) */

import {
  Home,
  Megaphone,
  Image as ImageIcon,
  LayoutTemplate,
  Stethoscope,
  Images,
  Mail,
  MessageSquare,
  Bell,
  UserCircle,
  FileText,
} from "lucide-react";

export const NAVIGATION_CLIENT = {
  principal: [
    { href: "/sigh/client", id: "accueil", icone: Home, actif: true },
    { href: "/sigh/client/messages", id: "messages", icone: Mail },
  ],
  contenu: [
    { href: "/sigh/client/campagnes", id: "campagnes", icone: Megaphone },
    { href: "/sigh/client/hero", id: "hero", icone: ImageIcon },
    { href: "/sigh/client/services", id: "services", icone: LayoutTemplate },
    { href: "/sigh/client/pages", id: "pages", icone: FileText },
    { href: "/sigh/client/medecins", id: "medecins", icone: Stethoscope },
    { href: "/sigh/client/galerie", id: "galerie", icone: Images },
  ],
  communication: [
    { href: "/sigh/client/messagerie", id: "messagerie", icone: MessageSquare },
    { href: "/sigh/client/notifications", id: "notifications", icone: Bell },
  ],
  compte: [
    { href: "/sigh/client/profil", id: "profil", icone: UserCircle },
  ],
} as const;

export const NAVIGATION_BASSE_CLIENT = [
  { href: "/sigh/client", id: "accueil", icone: Home },
  { href: "/sigh/client/campagnes", id: "campagnes", icone: Megaphone },
  { href: "/sigh/client/hero", id: "hero", icone: ImageIcon },
  { href: "/sigh/client/messages", id: "messages", icone: Mail },
] as const;
