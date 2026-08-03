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
import { MiseEnPageReception, type UtilisateurReception } from "@/features/reception/mise-en-page-reception";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";

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

interface PropsContenuPageReceptionAvenir {
  utilisateur: UtilisateurReception;
  page: IdPageReceptionAvenir;
}

export function ContenuPageReceptionAvenir({
  utilisateur,
  page,
}: PropsContenuPageReceptionAvenir) {
  const { t } = useTranslation();
  const Icone = ICONES_PAGES[page];

  return (
    <MiseEnPageReception
      utilisateur={utilisateur}
      titre={t(`reception.pages.${page}.titre`)}
      sousTitre={t("reception.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[900px]">
        <EnTetePageReception
          icone={Icone}
          titre={t(`reception.pages.${page}.titre`)}
          description={t(`reception.pages.${page}.description`)}
          fil={[
            { label: t("reception.common.reception"), href: "/sigh/reception" },
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
    </MiseEnPageReception>
  );
}
