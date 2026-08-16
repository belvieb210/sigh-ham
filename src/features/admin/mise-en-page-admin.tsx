"use client";

import { useState, type ReactNode } from "react";
import {
  BarreLateraleAdmin,
  EnTeteAdmin,
} from "@/features/admin/layout-admin";
import { NavigationBasseAdmin } from "@/features/admin/navigation-basse-admin";
import { ToastNotificationGlobale } from "@/features/notifications/composants/toast-notification-globale";
import { GestionnaireAlertesNotifications } from "@/features/notifications/composants/gestionnaire-alertes-notifications";
import { FournisseurNotifications } from "@/features/notifications/fournisseur-notifications";
import type { UtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export type { UtilisateurAdmin };

interface PropsMiseEnPageAdmin {
  utilisateur: UtilisateurAdmin;
  titre: string;
  sousTitre: string;
  children: ReactNode;
}

export function MiseEnPageAdmin({
  utilisateur,
  titre,
  sousTitre,
  children,
}: PropsMiseEnPageAdmin) {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <FournisseurNotifications>
      <div className="flex h-full min-h-0 w-full flex-1 min-w-0 overflow-x-clip overflow-y-hidden bg-[#f1f5f9]">
        <BarreLateraleAdmin
          utilisateur={utilisateur}
          ouvert={menuOuvert}
          onFermer={() => setMenuOuvert(false)}
        />

        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
          <EnTeteAdmin
            titre={titre}
            sousTitre={sousTitre}
            utilisateur={utilisateur}
            onMenu={() => setMenuOuvert(true)}
          />

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-clip overscroll-contain px-3 py-3 pb-[calc(6.75rem+env(safe-area-inset-bottom))] sm:px-4 lg:px-6 lg:py-6 lg:pb-6">
            {children}
          </main>
        </div>

        <NavigationBasseAdmin onMenu={() => setMenuOuvert(true)} />
        <GestionnaireAlertesNotifications />
        <ToastNotificationGlobale />
      </div>
    </FournisseurNotifications>
  );
}
