"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BarreLateraleCaisse,
  EnTeteCaisse,
} from "@/features/caisse/layout-caisse";
import { NavigationBasseCaisse } from "@/features/caisse/navigation-basse-caisse";
import { ToastNotificationGlobale } from "@/features/notifications/composants/toast-notification-globale";
import { GestionnaireAlertesNotifications } from "@/features/notifications/composants/gestionnaire-alertes-notifications";
import { FournisseurNotifications } from "@/features/notifications/fournisseur-notifications";
import type { UtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export type { UtilisateurCaisse };

interface PropsMiseEnPageCaisse {
  utilisateur: UtilisateurCaisse;
  titre: string;
  sousTitre: string;
  children: ReactNode;
}

export function MiseEnPageCaisse({
  utilisateur,
  titre,
  sousTitre,
  children,
}: PropsMiseEnPageCaisse) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [badgeFile, setBadgeFile] = useState(0);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/caisse/stats");
        const data = (await res.json()) as {
          stats?: { patientsEnAttente?: number };
        };
        if (!annule && res.ok) {
          setBadgeFile(data.stats?.patientsEnAttente ?? 0);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  return (
    <FournisseurNotifications>
      <div className="flex h-[100dvh] w-full overflow-hidden bg-[#f1f5f9]">
        <BarreLateraleCaisse
          utilisateur={utilisateur}
          ouvert={menuOuvert}
          onFermer={() => setMenuOuvert(false)}
          badgeFile={badgeFile}
        />

        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
          <EnTeteCaisse
            titre={titre}
            sousTitre={sousTitre}
            utilisateur={utilisateur}
            onMenu={() => setMenuOuvert(true)}
          />

          <div className="flex min-h-0 flex-1">
            <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-4 lg:px-6 lg:py-6 lg:pb-6">
              {children}
            </main>
          </div>
        </div>

        <NavigationBasseCaisse onMenu={() => setMenuOuvert(true)} />
        <GestionnaireAlertesNotifications />
        <ToastNotificationGlobale />
      </div>
    </FournisseurNotifications>
  );
}
