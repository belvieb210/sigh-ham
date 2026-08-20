"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";

export interface FiltresModerationAdmin {
  statut: "" | "nouveau" | "en_cours" | "resolu" | "bloque" | "supprime" | "suspendu";
  categorie: "" | "messages" | "conversations" | "groupes" | "fichiers" | "suspensions";
}

export const FILTRES_MODERATION_ADMIN_VIDES: FiltresModerationAdmin = {
  statut: "",
  categorie: "",
};

export function compterFiltresModerationAdmin(f: FiltresModerationAdmin): number {
  let n = 0;
  if (f.statut) n += 1;
  if (f.categorie) n += 1;
  return n;
}

export function FormulaireFiltresModerationAdmin({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
}: {
  valeurs: FiltresModerationAdmin;
  onChange: (v: FiltresModerationAdmin) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-gris-bordure bg-gris-tres-clair/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={CLASSE_LABEL_RECEPTION}>
            {t("admin.moderation.filtreTousStatuts")}
          </label>
          <select
            className={CLASSE_CHAMP_RECEPTION}
            value={valeurs.statut}
            onChange={(e) =>
              onChange({
                ...valeurs,
                statut: e.target.value as FiltresModerationAdmin["statut"],
              })
            }
          >
            <option value="">{t("admin.moderation.filtreTousStatuts")}</option>
            <option value="nouveau">{t("admin.moderation.statutNouveau")}</option>
            <option value="en_cours">{t("admin.moderation.statutEnCours")}</option>
            <option value="resolu">{t("admin.moderation.statutResolu")}</option>
            <option value="bloque">{t("admin.moderation.statutBloque")}</option>
            <option value="supprime">{t("admin.moderation.statutSupprime")}</option>
            <option value="suspendu">{t("admin.moderation.statutSuspendu")}</option>
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL_RECEPTION}>
            {t("admin.moderation.categorieTous")}
          </label>
          <select
            className={CLASSE_CHAMP_RECEPTION}
            value={valeurs.categorie}
            onChange={(e) =>
              onChange({
                ...valeurs,
                categorie: e.target.value as FiltresModerationAdmin["categorie"],
              })
            }
          >
            <option value="">{t("admin.moderation.categorieTous")}</option>
            <option value="messages">{t("admin.moderation.typeMessage")}</option>
            <option value="conversations">{t("admin.moderation.typeConversation")}</option>
            <option value="groupes">{t("admin.moderation.typeGroupe")}</option>
            <option value="fichiers">{t("admin.moderation.typeFichier")}</option>
            <option value="suspensions">{t("admin.moderation.typeSuspension")}</option>
          </select>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Bouton type="button" taille="petit" onClick={onRechercher}>
          <Search className="h-4 w-4" />
          {t("admin.moderation.appliquerFiltres")}
        </Bouton>
        <Bouton type="button" taille="petit" variante="contour" onClick={onReinitialiser}>
          {t("admin.moderation.reinitialiserFiltres")}
        </Bouton>
      </div>
    </div>
  );
}
