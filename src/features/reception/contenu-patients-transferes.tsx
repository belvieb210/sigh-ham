"use client";

import { ArrowRightLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MiseEnPageReception, type UtilisateurReception } from "@/features/reception/mise-en-page-reception";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { ListePatientsTransferes } from "@/features/reception/liste-patients-transferes";
import {
  PanneauDroitReception,
  SectionsMobileReception,
} from "@/features/reception/panneau-droit-reception";

interface PropsContenuPatientsTransferes {
  utilisateur: UtilisateurReception;
}

export function ContenuPatientsTransferes({ utilisateur }: PropsContenuPatientsTransferes) {
  const { t } = useTranslation();

  return (
    <MiseEnPageReception
      utilisateur={utilisateur}
      titre={t("reception.layout.titre")}
      sousTitre={t("reception.layout.sousTitre")}
      panneauDroit={<PanneauDroitReception variante="transferts" />}
      activerSelectionTransfert
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={ArrowRightLeft}
          titre={t("reception.pages.transferts.titre")}
          description={t("reception.pages.transferts.description")}
          fil={[
            { label: t("reception.common.reception"), href: "/sigh/reception" },
            { label: t("reception.pages.transferts.fil") },
          ]}
        />

        <div className="space-y-4 lg:space-y-5">
          <ListePatientsTransferes />
          <SectionsMobileReception variante="transferts" />
        </div>
      </div>
    </MiseEnPageReception>
  );
}
