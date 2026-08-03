"use client";

import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MiseEnPageReception, type UtilisateurReception } from "@/features/reception/mise-en-page-reception";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { ListePatientsEnregistres } from "@/features/reception/liste-patients-enregistres";
import {
  PanneauDroitReception,
  SectionsMobileReception,
} from "@/features/reception/panneau-droit-reception";

interface PropsContenuPatientsEnregistres {
  utilisateur: UtilisateurReception;
}

export function ContenuPatientsEnregistres({ utilisateur }: PropsContenuPatientsEnregistres) {
  const { t } = useTranslation();

  return (
    <MiseEnPageReception
      utilisateur={utilisateur}
      titre={t("reception.pages.enregistres.titre")}
      sousTitre={t("reception.layout.sousTitre")}
      panneauDroit={<PanneauDroitReception variante="transferts" />}
      activerSelectionTransfert
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={Users}
          titre={t("reception.pages.enregistres.titre")}
          description={t("reception.pages.enregistres.description")}
          fil={[
            { label: t("reception.common.reception"), href: "/sigh/reception" },
            { label: t("reception.pages.enregistres.fil") },
          ]}
        />

        <div className="space-y-4 lg:space-y-5">
          <ListePatientsEnregistres />
          <SectionsMobileReception variante="transferts" />
        </div>
      </div>
    </MiseEnPageReception>
  );
}
