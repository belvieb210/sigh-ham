"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BarreLateraleInfirmiers,
  EnTeteInfirmiers,
} from "@/features/infirmiers/layout-infirmiers";
import { NavigationBasseInfirmiers } from "@/features/infirmiers/navigation-basse-infirmiers";
import { FournisseurOrientationInfirmiers } from "@/features/infirmiers/contexte-orientation-infirmiers";
import { FournisseurSelectionInfirmiers } from "@/features/infirmiers/contexte-selection-infirmiers";
import { ToastNotificationGlobale } from "@/features/notifications/composants/toast-notification-globale";
import { GestionnaireAlertesNotifications } from "@/features/notifications/composants/gestionnaire-alertes-notifications";
import { FournisseurNotifications } from "@/features/notifications/fournisseur-notifications";
import type { UtilisateurInfirmiers } from "@/lib/auth/props-utilisateur-infirmiers";

export type { UtilisateurInfirmiers };

interface PropsMiseEnPageInfirmiers {
  utilisateur: UtilisateurInfirmiers;
  titre: string;
  sousTitre: string;
  panneauDroit?: ReactNode;
  activerSelection?: boolean;
  children: ReactNode;
}

export function MiseEnPageInfirmiers({
  utilisateur,
  titre,
  sousTitre,
  panneauDroit,
  activerSelection = false,
  children,
}: PropsMiseEnPageInfirmiers) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [badgeFile, setBadgeFile] = useState(0);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/infirmiers/stats");
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

  const contenu = (
    <div className="flex h-full min-h-0 w-full flex-1 min-w-0 overflow-x-clip overflow-y-hidden bg-[#f1f5f9]">
      <BarreLateraleInfirmiers
        utilisateur={utilisateur}
        ouvert={menuOuvert}
        onFermer={() => setMenuOuvert(false)}
        badgeFile={badgeFile}
      />

      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
        <EnTeteInfirmiers
          titre={titre}
          sousTitre={sousTitre}
          utilisateur={utilisateur}
          onMenu={() => setMenuOuvert(true)}
        />

        <div className="flex min-h-0 min-w-0 flex-1">
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-clip overscroll-contain px-3 py-3 pb-[calc(6.75rem+env(safe-area-inset-bottom))] sm:px-4 lg:px-6 lg:py-6 lg:pb-6">
            {children}
          </main>

          {panneauDroit && (
            <aside className="hidden min-w-0 shrink-0 overflow-x-hidden overflow-y-auto border-l border-gris-bordure bg-[#f8fafc] p-4 xl:block xl:w-[300px]">
              {panneauDroit}
            </aside>
          )}
        </div>
      </div>

      <NavigationBasseInfirmiers onMenu={() => setMenuOuvert(true)} />
      <GestionnaireAlertesNotifications />
      <ToastNotificationGlobale />
    </div>
  );

  return (
    <FournisseurNotifications>
      <FournisseurOrientationInfirmiers>
        {activerSelection ? (
          <FournisseurSelectionInfirmiers>{contenu}</FournisseurSelectionInfirmiers>
        ) : (
          contenu
        )}
      </FournisseurOrientationInfirmiers>
    </FournisseurNotifications>
  );
}
