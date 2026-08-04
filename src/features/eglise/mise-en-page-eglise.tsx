"use client";

import { useState, type ReactNode } from "react";
import {
  BarreLateraleEglise,
  EnTeteEglise,
} from "@/features/eglise/layout-eglise";
import { NavigationBasseEglise } from "@/features/eglise/navigation-basse-eglise";
import {
  ESPACE_API_EGLISE,
  FournisseurEspaceApi,
} from "@/features/reception/contexte-espace-api";
import { FournisseurResumePatient } from "@/features/reception/contexte-resume-patient";
import { FournisseurOrientationRapide } from "@/features/reception/contexte-orientation-rapide";
import { FournisseurSelectionTransfert } from "@/features/reception/contexte-selection-transfert";
import { ToastNotificationGlobale } from "@/features/notifications/composants/toast-notification-globale";
import { GestionnaireAlertesNotifications } from "@/features/notifications/composants/gestionnaire-alertes-notifications";
import { FournisseurNotifications } from "@/features/notifications/fournisseur-notifications";
import type { UtilisateurEglise } from "@/lib/auth/props-utilisateur-eglise";

export type { UtilisateurEglise };

interface PropsMiseEnPageEglise {
  utilisateur: UtilisateurEglise;
  titre: string;
  sousTitre: string;
  panneauDroit?: ReactNode;
  activerSelectionTransfert?: boolean;
  children: ReactNode;
}

export function MiseEnPageEglise({
  utilisateur,
  titre,
  sousTitre,
  panneauDroit,
  activerSelectionTransfert = false,
  children,
}: PropsMiseEnPageEglise) {
  const [menuOuvert, setMenuOuvert] = useState(false);

  const contenu = (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden bg-[#f1f5f9]">
      <BarreLateraleEglise
        utilisateur={utilisateur}
        ouvert={menuOuvert}
        onFermer={() => setMenuOuvert(false)}
      />

      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
        <EnTeteEglise
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

      <NavigationBasseEglise onMenu={() => setMenuOuvert(true)} />
      <GestionnaireAlertesNotifications />
      <ToastNotificationGlobale />
    </div>
  );

  return (
    <FournisseurEspaceApi espace={ESPACE_API_EGLISE}>
      <FournisseurNotifications>
        <FournisseurResumePatient>
          <FournisseurOrientationRapide initial={["CAISSE"]}>
            {activerSelectionTransfert ? (
              <FournisseurSelectionTransfert>{contenu}</FournisseurSelectionTransfert>
            ) : (
              contenu
            )}
          </FournisseurOrientationRapide>
        </FournisseurResumePatient>
      </FournisseurNotifications>
    </FournisseurEspaceApi>
  );
}
