"use client";

import { ArrowRightLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ListePatientsTransfertsCaisse } from "@/features/caisse/liste-patients-transferts-caisse";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import {
  PanneauDroitCaisse,
  SectionsMobileCaisseTransferts,
} from "@/features/caisse/panneau-droit-caisse";

interface PropsContenuPatientsTransfertsCaisse {
  utilisateur: UtilisateurCaisse;
}

export function ContenuPatientsTransfertsCaisse({
  utilisateur,
}: PropsContenuPatientsTransfertsCaisse) {
  const { t } = useTranslation();

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t("caisse.layout.titre")}
      sousTitre={t("caisse.layout.sousTitre")}
      panneauDroit={<PanneauDroitCaisse />}
      activerSelectionTransfert
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-4 lg:space-y-5">
        <div>
          <p className="text-xs text-texte-secondaire">
            {t("caisse.common.caisse")} &gt; {t("caisse.transferts.fil")}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-bleu-medical" />
            <h2 className="text-xl font-bold text-texte-principal sm:text-2xl">
              {t("caisse.transferts.titre")}
            </h2>
          </div>
          <p className="mt-1 text-sm text-texte-secondaire">
            {t("caisse.transferts.description")}
          </p>
        </div>

        <ListePatientsTransfertsCaisse />
        <SectionsMobileCaisseTransferts />
      </div>
    </MiseEnPageCaisse>
  );
}
