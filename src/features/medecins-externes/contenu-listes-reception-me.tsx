"use client";

import { Users, ArrowRightLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  MiseEnPageMedecinsExternes,
  type UtilisateurMedecinsExternes,
} from "@/features/medecins-externes/mise-en-page-medecins-externes";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { ListePatientsEnregistres } from "@/features/reception/liste-patients-enregistres";
import { ListePatientsTransferes } from "@/features/reception/liste-patients-transferes";
import {
  PanneauDroitReception,
  SectionsMobileReception,
} from "@/features/reception/panneau-droit-reception";
import {
  ESPACE_API_MEDECINS_EXTERNES,
  FournisseurEspaceApi,
  useEspaceApi,
} from "@/features/reception/contexte-espace-api";

function useFilRacine() {
  const { t } = useTranslation();
  const espace = useEspaceApi();
  return { label: t(espace.cleFilRacine), href: espace.cheminBase };
}

function CorpsEnregistres() {
  const { t } = useTranslation();
  const fil = useFilRacine();
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <EnTetePageReception
        icone={Users}
        titre={t("reception.pages.enregistres.titre")}
        description={t("reception.pages.enregistres.description")}
        fil={[fil, { label: t("reception.pages.enregistres.fil") }]}
      />
      <div className="space-y-4 lg:space-y-5">
        <ListePatientsEnregistres />
        <SectionsMobileReception variante="transferts" />
      </div>
    </div>
  );
}

function CorpsTransferes() {
  const { t } = useTranslation();
  const fil = useFilRacine();
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <EnTetePageReception
        icone={ArrowRightLeft}
        titre={t("reception.pages.transferts.titre")}
        description={t("reception.pages.transferts.description")}
        fil={[fil, { label: t("reception.pages.transferts.fil") }]}
      />
      <div className="space-y-4 lg:space-y-5">
        <ListePatientsTransferes />
        <SectionsMobileReception variante="transferts" />
      </div>
    </div>
  );
}

export function ContenuPatientsEnregistresMedecinsExternes({
  utilisateur,
}: {
  utilisateur: UtilisateurMedecinsExternes;
}) {
  const { t } = useTranslation();

  return (
    <FournisseurEspaceApi espace={ESPACE_API_MEDECINS_EXTERNES}>
      <MiseEnPageMedecinsExternes
        utilisateur={utilisateur}
        titre={t("reception.pages.enregistres.titre")}
        sousTitre={t("medecinsExternes.layout.sousTitre")}
        panneauDroit={<PanneauDroitReception variante="transferts" />}
        activerSelectionTransfert
      >
        <CorpsEnregistres />
      </MiseEnPageMedecinsExternes>
    </FournisseurEspaceApi>
  );
}

export function ContenuPatientsTransferesMedecinsExternes({
  utilisateur,
}: {
  utilisateur: UtilisateurMedecinsExternes;
}) {
  const { t } = useTranslation();

  return (
    <FournisseurEspaceApi espace={ESPACE_API_MEDECINS_EXTERNES}>
      <MiseEnPageMedecinsExternes
        utilisateur={utilisateur}
        titre={t("reception.pages.transferts.titre")}
        sousTitre={t("medecinsExternes.layout.sousTitre")}
        panneauDroit={<PanneauDroitReception variante="transferts" />}
        activerSelectionTransfert
      >
        <CorpsTransferes />
      </MiseEnPageMedecinsExternes>
    </FournisseurEspaceApi>
  );
}
