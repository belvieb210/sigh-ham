"use client";

import { Construction } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { IdPageReceptionAvenir } from "@/constants/reception";
import {
  Bell,
  ClipboardList,
  FlaskConical,
  History,
  MessageSquare,
  Search,
  Settings,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import {
  MiseEnPageEglise,
  type UtilisateurEglise,
} from "@/features/eglise/mise-en-page-eglise";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import {
  ESPACE_API_EGLISE,
  FournisseurEspaceApi,
  useEspaceApi,
} from "@/features/reception/contexte-espace-api";

const ICONES_PAGES: Record<IdPageReceptionAvenir, LucideIcon> = {
  recherche: Search,
  historique: History,
  messagerie: MessageSquare,
  notifications: Bell,
  motifs: ClipboardList,
  examens: FlaskConical,
  examensDisponibles: FlaskConical,
  utilisateurs: UserCog,
  parametres: Settings,
};

function CorpsAvenir({ page }: { page: IdPageReceptionAvenir }) {
  const { t } = useTranslation();
  const espace = useEspaceApi();
  const Icone = ICONES_PAGES[page];

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <EnTetePageReception
        icone={Icone}
        titre={t(`reception.pages.${page}.titre`)}
        description={t(`reception.pages.${page}.description`)}
        fil={[
          { label: t(espace.cleFilRacine), href: espace.cheminBase },
          { label: t(`reception.pages.${page}.fil`) },
        ]}
      />

      <div className="mt-6 rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bleu-medical-clair text-bleu-medical">
          <Construction className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h2 className="text-lg font-bold text-texte-principal">
          {t("reception.pages.aVenir.titre")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-texte-secondaire">
          {t("reception.pages.aVenir.description")}
        </p>
      </div>
    </div>
  );
}

export function ContenuPageEgliseAvenir({
  utilisateur,
  page,
}: {
  utilisateur: UtilisateurEglise;
  page: IdPageReceptionAvenir;
}) {
  const { t } = useTranslation();

  return (
    <FournisseurEspaceApi espace={ESPACE_API_EGLISE}>
      <MiseEnPageEglise
        utilisateur={utilisateur}
        titre={t(`reception.pages.${page}.titre`)}
        sousTitre={t("eglise.layout.sousTitre")}
      >
        <CorpsAvenir page={page} />
      </MiseEnPageEglise>
    </FournisseurEspaceApi>
  );
}
