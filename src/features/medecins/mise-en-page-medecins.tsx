"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BarreLateraleMedecins,
  EnTeteMedecins,
} from "@/features/medecins/layout-medecins";
import { NavigationBasseMedecins } from "@/features/medecins/navigation-basse-medecins";
import { FournisseurOrientationMedecins } from "@/features/medecins/contexte-orientation-medecins";
import { FournisseurSelectionMedecins } from "@/features/medecins/contexte-selection-medecins";
import { ToastNotificationGlobale } from "@/features/notifications/composants/toast-notification-globale";
import { GestionnaireAlertesNotifications } from "@/features/notifications/composants/gestionnaire-alertes-notifications";
import { FournisseurNotifications } from "@/features/notifications/fournisseur-notifications";
import type { UtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export type { UtilisateurMedecins };

interface PropsMiseEnPageMedecins {
  utilisateur: UtilisateurMedecins;
  titre: string;
  sousTitre: string;
  panneauDroit?: ReactNode;
  activerSelection?: boolean;
  children: ReactNode;
}

export function MiseEnPageMedecins({
  utilisateur,
  titre,
  sousTitre,
  panneauDroit,
  activerSelection = false,
  children,
}: PropsMiseEnPageMedecins) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [badgeFile, setBadgeFile] = useState(0);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/medecins/stats");
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
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden bg-[#f1f5f9]">
      <BarreLateraleMedecins
        utilisateur={utilisateur}
        ouvert={menuOuvert}
        onFermer={() => setMenuOuvert(false)}
        badgeFile={badgeFile}
      />

      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
        <EnTeteMedecins
          titre={titre}
          sousTitre={sousTitre}
          utilisateur={utilisateur}
          onMenu={() => setMenuOuvert(true)}
        />

        <div className="flex min-h-0 flex-1">
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 pb-[calc(6.75rem+env(safe-area-inset-bottom))] sm:px-4 lg:px-6 lg:py-6 lg:pb-6">
            {children}
          </main>

          {panneauDroit && (
            <aside className="hidden shrink-0 overflow-y-auto border-l border-gris-bordure bg-[#f8fafc] p-4 xl:block xl:w-[300px]">
              {panneauDroit}
            </aside>
          )}
        </div>
      </div>

      <NavigationBasseMedecins onMenu={() => setMenuOuvert(true)} />
      <GestionnaireAlertesNotifications />
      <ToastNotificationGlobale />
    </div>
  );

  return (
    <FournisseurNotifications>
      <FournisseurOrientationMedecins>
        {activerSelection ? (
          <FournisseurSelectionMedecins>{contenu}</FournisseurSelectionMedecins>
        ) : (
          contenu
        )}
      </FournisseurOrientationMedecins>
    </FournisseurNotifications>
  );
}
