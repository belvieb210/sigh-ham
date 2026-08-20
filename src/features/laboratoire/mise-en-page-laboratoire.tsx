"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  BarreLateraleLaboratoire,
  EnTeteLaboratoire,
} from "@/features/laboratoire/layout-laboratoire";
import { NavigationBasseLaboratoire } from "@/features/laboratoire/navigation-basse-laboratoire";
import { ToastNotificationGlobale } from "@/features/notifications/composants/toast-notification-globale";
import { GestionnaireAlertesNotifications } from "@/features/notifications/composants/gestionnaire-alertes-notifications";
import { FournisseurNotifications } from "@/features/notifications/fournisseur-notifications";
import { EVENT_RAFRAICHIR_NOTIFICATIONS } from "@/features/notifications/utilitaires-notifications";
import type { UtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";

export type { UtilisateurLaboratoire };

const CLE_DERNIERE_VUE_FILE = "sigh.labo.file.derniereVueIso";

function lireDerniereVueFile(): string | null {
  try {
    return localStorage.getItem(CLE_DERNIERE_VUE_FILE);
  } catch {
    return null;
  }
}

function ecrireDerniereVueFile(iso: string) {
  try {
    localStorage.setItem(CLE_DERNIERE_VUE_FILE, iso);
  } catch {
    /* ignore */
  }
}

function compterNonVus(arrivees: string[], derniereVueIso: string | null): number {
  if (!arrivees.length) return 0;
  if (!derniereVueIso) return arrivees.length;
  const seuil = new Date(derniereVueIso).getTime();
  if (Number.isNaN(seuil)) return arrivees.length;
  return arrivees.filter((iso) => {
    const t = new Date(iso).getTime();
    return !Number.isNaN(t) && t > seuil;
  }).length;
}

interface PropsMiseEnPageLaboratoire {
  utilisateur: UtilisateurLaboratoire;
  titre: string;
  sousTitre: string;
  children: ReactNode;
  /** Panneau droit sticky (desktop ≥ xl) — comme réception / caisse */
  panneauDroit?: ReactNode;
  /** Barre de recherche en-tête — uniquement accueil */
  afficherRechercheEnTete?: boolean;
}

export function MiseEnPageLaboratoire({
  utilisateur,
  titre,
  sousTitre,
  children,
  panneauDroit,
  afficherRechercheEnTete = false,
}: PropsMiseEnPageLaboratoire) {
  const pathname = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [badgeFile, setBadgeFile] = useState(0);
  const [badgesStatut, setBadgesStatut] = useState<Partial<Record<string, number>>>(
    {}
  );
  const [arriveesFile, setArriveesFile] = useState<string[]>([]);

  useEffect(() => {
    let annule = false;

    const chargerBadge = async () => {
      try {
        const res = await fetch("/api/laboratoire/stats");
        const data = (await res.json()) as {
          stats?: {
            patientsEnFile?: number;
            arriveesFileIso?: string[];
            compteursStatutAnalyse?: Record<string, number>;
          };
        };
        if (!annule && res.ok) {
          const arrivees = data.stats?.arriveesFileIso ?? [];
          setArriveesFile(arrivees);
          setBadgesStatut(data.stats?.compteursStatutAnalyse ?? {});

          const surPatients =
            pathname === "/sigh/laboratoire/patients" ||
            pathname.startsWith("/sigh/laboratoire/patients/");
          const surRecus =
            pathname === "/sigh/laboratoire/recus" ||
            pathname.startsWith("/sigh/laboratoire/recus/");
          /** Ouvrir Patients ou Reçus marque les arrivées comme vues */
          if (surPatients || surRecus) {
            const maintenant = new Date().toISOString();
            ecrireDerniereVueFile(maintenant);
            setBadgeFile(0);
          } else {
            setBadgeFile(compterNonVus(arrivees, lireDerniereVueFile()));
          }
        }
      } catch {
        /* ignore */
      }
    };

    void chargerBadge();
    const onNotif = () => void chargerBadge();
    window.addEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, onNotif);
    const interval = window.setInterval(() => void chargerBadge(), 15000);

    return () => {
      annule = true;
      window.removeEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, onNotif);
      window.clearInterval(interval);
    };
  }, [pathname]);

  /** Marquer les arrivées comme vues (Patients ou Reçus) */
  useEffect(() => {
    const surPatients =
      pathname === "/sigh/laboratoire/patients" ||
      pathname.startsWith("/sigh/laboratoire/patients/");
    const surRecus =
      pathname === "/sigh/laboratoire/recus" ||
      pathname.startsWith("/sigh/laboratoire/recus/");
    if (!surPatients && !surRecus) return;
    ecrireDerniereVueFile(new Date().toISOString());
    setBadgeFile(0);
  }, [pathname, arriveesFile]);

  return (
    <FournisseurNotifications>
      <div className="flex h-full min-h-0 w-full flex-1 min-w-0 overflow-x-clip overflow-y-hidden bg-[#f1f5f9]">
        <BarreLateraleLaboratoire
          utilisateur={utilisateur}
          ouvert={menuOuvert}
          onFermer={() => setMenuOuvert(false)}
          badgeFile={badgeFile}
          badgesStatut={badgesStatut}
        />

        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
          <EnTeteLaboratoire
            titre={titre}
            sousTitre={sousTitre}
            utilisateur={utilisateur}
            onMenu={() => setMenuOuvert(true)}
            afficherRecherche={afficherRechercheEnTete}
          />

          <div className="flex min-h-0 min-w-0 flex-1">
            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-3 pb-[calc(6.75rem+env(safe-area-inset-bottom))] sm:px-4 lg:px-6 lg:py-6 lg:pb-6">
              {children}
            </main>

            {panneauDroit && (
              <aside className="hidden min-w-0 shrink-0 overflow-x-hidden overflow-y-auto border-l border-gris-bordure bg-[#f8fafc] p-4 xl:block xl:w-[300px]">
                {panneauDroit}
              </aside>
            )}
          </div>
        </div>

        <NavigationBasseLaboratoire onMenu={() => setMenuOuvert(true)} />
        <GestionnaireAlertesNotifications />
        <ToastNotificationGlobale />
      </div>
    </FournisseurNotifications>
  );
}
