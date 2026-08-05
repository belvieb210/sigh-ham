"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlaskConical, Loader2, Plus, Save } from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";
import {
  CLASSE_CHAMP_RECEPTION,
  CLASSE_LABEL_RECEPTION,
} from "@/constants/reception";

type ExamenItem = {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  delaiHeures: number;
  actif: boolean;
  packPrenuptial: boolean;
};

const FORM_VIDE = {
  code: "",
  libelle: "",
  categorie: "",
  prix: "0",
  delaiHeures: "24",
  actif: true,
  packPrenuptial: false,
};

export function ContenuExamensAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<ExamenItem[]>([]);
  const [q, setQ] = useState("");
  const [filtreActif, setFiltreActif] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [modeCreation, setModeCreation] = useState(false);
  const [form, setForm] = useState({ ...FORM_VIDE });
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (filtreActif) params.set("actif", filtreActif);
      const res = await fetch(`/api/admin/examens?${params}`);
      const data = (await res.json()) as {
        examens?: ExamenItem[];
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setListe(data.examens ?? []);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setChargement(false);
    }
  }, [q, filtreActif, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const ouvrirCreation = () => {
    setModeCreation(true);
    setSelectionId(null);
    setForm({ ...FORM_VIDE });
    setMessage(null);
    setErreur(null);
  };

  const ouvrirEdition = (item: ExamenItem) => {
    setModeCreation(false);
    setSelectionId(item.id);
    setForm({
      code: item.code,
      libelle: item.libelle,
      categorie: item.categorie,
      prix: String(item.prix),
      delaiHeures: String(item.delaiHeures),
      actif: item.actif,
      packPrenuptial: item.packPrenuptial,
    });
    setMessage(null);
    setErreur(null);
  };

  const sauvegarder = async () => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const payload = {
        code: form.code,
        libelle: form.libelle,
        categorie: form.categorie,
        prix: Number(form.prix),
        delaiHeures: Number(form.delaiHeures),
        actif: form.actif,
        packPrenuptial: form.packPrenuptial,
      };
      const res = await fetch(
        modeCreation
          ? "/api/admin/examens"
          : `/api/admin/examens/${selectionId}`,
        {
          method: modeCreation ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as {
        message?: string;
        examen?: ExamenItem;
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? t("admin.common.enregistrer"));
      if (data.examen) {
        setSelectionId(data.examen.id);
        setModeCreation(false);
      }
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.examens.titre")}
      sousTitre={t("admin.examens.description")}
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <EnTetePageReception
          icone={FlaskConical}
          titre={t("admin.examens.titre")}
          description={t("admin.examens.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.examens.titre") },
          ]}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <input
              className={`${CLASSE_CHAMP_RECEPTION} max-w-xs`}
              placeholder={t("admin.examens.recherche")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className={`${CLASSE_CHAMP_RECEPTION} max-w-[180px]`}
              value={filtreActif}
              onChange={(e) => setFiltreActif(e.target.value)}
            >
              <option value="">{t("admin.examens.tous")}</option>
              <option value="true">{t("admin.examens.actifs")}</option>
              <option value="false">{t("admin.examens.inactifs")}</option>
            </select>
          </div>
          <Bouton type="button" taille="petit" onClick={ouvrirCreation}>
            <Plus className="h-4 w-4" />
            {t("admin.examens.nouveau")}
          </Bouton>
        </div>

        {erreur ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-xl border border-gris-bordure bg-white shadow-sm">
            {chargement ? (
              <div className="flex items-center gap-2 p-6 text-sm text-texte-secondaire">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("admin.common.chargement")}
              </div>
            ) : liste.length === 0 ? (
              <p className="p-6 text-sm text-texte-secondaire">
                {t("admin.examens.vide")}
              </p>
            ) : (
              <ul className="divide-y divide-gris-bordure">
                {liste.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => ouvrirEdition(item)}
                      className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-gris-tres-clair ${
                        selectionId === item.id ? "bg-bleu-medical-clair/40" : ""
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-texte-principal">
                          {item.libelle}
                        </p>
                        <p className="text-xs text-texte-secondaire">
                          {item.code} · {item.categorie} · {item.prix} $ ·{" "}
                          {item.delaiHeures}h
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          item.actif
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.actif
                          ? t("admin.examens.actif")
                          : t("admin.examens.inactif")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {(modeCreation || selectionId) && (
            <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-texte-principal">
                {modeCreation
                  ? t("admin.examens.nouveau")
                  : t("admin.examens.modifier")}
              </h3>
              <div className="mt-3 space-y-3">
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("admin.examens.code")}
                  </label>
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("admin.examens.libelle")}
                  </label>
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.libelle}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, libelle: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("admin.examens.categorie")}
                  </label>
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.categorie}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, categorie: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("admin.examens.prix")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form.prix}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, prix: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("admin.examens.delai")}
                    </label>
                    <input
                      type="number"
                      min={1}
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form.delaiHeures}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, delaiHeures: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.actif}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, actif: e.target.checked }))
                    }
                  />
                  {t("admin.examens.actif")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.packPrenuptial}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        packPrenuptial: e.target.checked,
                      }))
                    }
                  />
                  {t("admin.examens.packPrenuptial")}
                </label>
                <Bouton
                  type="button"
                  disabled={enCours}
                  onClick={() => void sauvegarder()}
                >
                  <Save className="h-4 w-4" />
                  {t("admin.common.enregistrer")}
                </Bouton>
              </div>
            </div>
          )}
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
