"use client";

import { useState, type ReactNode } from "react";
import {
  BarreLateraleReception,
  EnTeteSigh,
} from "@/features/reception/layout-reception";
import { NavigationBasseReception } from "@/features/reception/navigation-basse-reception";
import { FournisseurResumePatient } from "@/features/reception/contexte-resume-patient";
import { FournisseurOrientationRapide } from "@/features/reception/contexte-orientation-rapide";
import { FournisseurSelectionTransfert } from "@/features/reception/contexte-selection-transfert";
import { ToastNotificationGlobale } from "@/features/notifications/composants/toast-notification-globale";
import { GestionnaireAlertesNotifications } from "@/features/notifications/composants/gestionnaire-alertes-notifications";
import { FournisseurNotifications } from "@/features/notifications/fournisseur-notifications";
import type { UtilisateurReception } from "@/lib/auth/props-utilisateur-reception";

export type { UtilisateurReception };

interface PropsMiseEnPageReception {
  utilisateur: UtilisateurReception;
  titre: string;
  sousTitre: string;
  panneauDroit?: ReactNode;
  /** Active la sélection patient ↔ panneau sur la page transferts */
  activerSelectionTransfert?: boolean;
  children: ReactNode;
}

export function MiseEnPageReception({
  utilisateur,
  titre,
  sousTitre,
  panneauDroit,
  activerSelectionTransfert = false,
  children,
}: PropsMiseEnPageReception) {
  const [menuOuvert, setMenuOuvert] = useState(false);

  const contenu = (
      <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden bg-[#f1f5f9]">
      <BarreLateraleReception
        utilisateur={utilisateur}
        ouvert={menuOuvert}
        onFermer={() => setMenuOuvert(false)}
      />

      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
        <EnTeteSigh
          titre={titre}
          sousTitre={sousTitre}
          utilisateur={utilisateur}
          onMenu={() => setMenuOuvert(true)}
        />

        <div className="flex min-h-0 min-w-0 flex-1">
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 pb-[calc(6.75rem+env(safe-area-inset-bottom))] sm:px-4 lg:px-6 lg:py-6 lg:pb-6">
            {children}
          </main>

          {panneauDroit && (
            <aside className="hidden min-w-0 shrink-0 overflow-x-hidden overflow-y-auto border-l border-gris-bordure bg-[#f8fafc] p-4 xl:block xl:w-[300px]">
              {panneauDroit}
            </aside>
          )}
        </div>
      </div>

      <NavigationBasseReception onMenu={() => setMenuOuvert(true)} />
      <GestionnaireAlertesNotifications />
      <ToastNotificationGlobale />
    </div>
  );

  return (
    <FournisseurNotifications>
      <FournisseurResumePatient>
        <FournisseurOrientationRapide>
          {activerSelectionTransfert ? (
            <FournisseurSelectionTransfert>{contenu}</FournisseurSelectionTransfert>
          ) : (
            contenu
          )}
        </FournisseurOrientationRapide>
      </FournisseurResumePatient>
    </FournisseurNotifications>
  );
}
