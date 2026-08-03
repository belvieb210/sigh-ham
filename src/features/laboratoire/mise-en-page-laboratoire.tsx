"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BarreLateraleLaboratoire,
  EnTeteLaboratoire,
} from "@/features/laboratoire/layout-laboratoire";
import { NavigationBasseLaboratoire } from "@/features/laboratoire/navigation-basse-laboratoire";
import { ToastNotificationGlobale } from "@/features/notifications/composants/toast-notification-globale";
import { GestionnaireAlertesNotifications } from "@/features/notifications/composants/gestionnaire-alertes-notifications";
import { FournisseurNotifications } from "@/features/notifications/fournisseur-notifications";
import type { UtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";

export type { UtilisateurLaboratoire };

interface PropsMiseEnPageLaboratoire {
  utilisateur: UtilisateurLaboratoire;
  titre: string;
  sousTitre: string;
  children: ReactNode;
}

export function MiseEnPageLaboratoire({
  utilisateur,
  titre,
  sousTitre,
  children,
}: PropsMiseEnPageLaboratoire) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [badgeFile, setBadgeFile] = useState(0);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/laboratoire/stats");
        const data = (await res.json()) as {
          stats?: { patientsEnFile?: number };
        };
        if (!annule && res.ok) {
          setBadgeFile(data.stats?.patientsEnFile ?? 0);
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
      <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden bg-[#f1f5f9]">
        <BarreLateraleLaboratoire
          utilisateur={utilisateur}
          ouvert={menuOuvert}
          onFermer={() => setMenuOuvert(false)}
          badgeFile={badgeFile}
        />

        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
          <EnTeteLaboratoire
            titre={titre}
            sousTitre={sousTitre}
            utilisateur={utilisateur}
            onMenu={() => setMenuOuvert(true)}
          />

          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 pb-[calc(6.75rem+env(safe-area-inset-bottom))] sm:px-4 lg:px-6 lg:py-6 lg:pb-6">
            {children}
          </main>
        </div>

        <NavigationBasseLaboratoire onMenu={() => setMenuOuvert(true)} />
        <GestionnaireAlertesNotifications />
        <ToastNotificationGlobale />
      </div>
    </FournisseurNotifications>
  );
}
