"use client";

import { useState, type ReactNode } from "react";
import {
  BarreLateraleClient,
  EnTeteClient,
} from "@/features/client/layout-client";
import { NavigationBasseClient } from "@/features/client/navigation-basse-client";
import { ToastNotificationGlobale } from "@/features/notifications/composants/toast-notification-globale";
import { GestionnaireAlertesNotifications } from "@/features/notifications/composants/gestionnaire-alertes-notifications";
import { FournisseurNotifications } from "@/features/notifications/fournisseur-notifications";
import type { UtilisateurClient } from "@/lib/auth/props-utilisateur-client";

export type { UtilisateurClient };

interface PropsMiseEnPageClient {
  utilisateur: UtilisateurClient;
  titre: string;
  sousTitre: string;
  children: ReactNode;
}

export function MiseEnPageClient({
  utilisateur,
  titre,
  sousTitre,
  children,
}: PropsMiseEnPageClient) {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <FournisseurNotifications>
      <div className="flex h-full min-h-0 w-full flex-1 min-w-0 overflow-x-clip overflow-y-hidden bg-[#f1f5f9]">
        <BarreLateraleClient
          utilisateur={utilisateur}
          ouvert={menuOuvert}
          onFermer={() => setMenuOuvert(false)}
        />

        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
          <EnTeteClient
            titre={titre}
            sousTitre={sousTitre}
            utilisateur={utilisateur}
            onMenu={() => setMenuOuvert(true)}
          />

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-clip overscroll-contain px-3 py-3 pb-[calc(6.75rem+env(safe-area-inset-bottom))] sm:px-4 lg:px-6 lg:py-6 lg:pb-6">
            {children}
          </main>
        </div>

        <NavigationBasseClient onMenu={() => setMenuOuvert(true)} />
        <GestionnaireAlertesNotifications />
        <ToastNotificationGlobale />
      </div>
    </FournisseurNotifications>
  );
}
