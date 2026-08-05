"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Pill, Plus, Save } from "lucide-react";
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

type MedicamentItem = {
  id: string;
  code: string;
  nom: string;
  categorie: string | null;
  forme: string | null;
  dosage: string | null;
  prixAchat: number | null;
  prixUnitaire: number;
  stockMinimum: number;
  emplacement: string | null;
  actif: boolean;
};

const FORM_VIDE = {
  code: "",
  nom: "",
  categorie: "",
  forme: "",
  dosage: "",
  prixAchat: "",
  prixUnitaire: "0",
  stockMinimum: "10",
  emplacement: "",
  actif: true,
};

export function ContenuMedicamentsAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<MedicamentItem[]>([]);
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
      const res = await fetch(`/api/admin/medicaments?${params}`);
      const data = (await res.json()) as {
        medicaments?: MedicamentItem[];
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setListe(data.medicaments ?? []);
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

  const ouvrirEdition = (item: MedicamentItem) => {
    setModeCreation(false);
    setSelectionId(item.id);
    setForm({
      code: item.code,
      nom: item.nom,
      categorie: item.categorie ?? "",
      forme: item.forme ?? "",
      dosage: item.dosage ?? "",
      prixAchat: item.prixAchat != null ? String(item.prixAchat) : "",
      prixUnitaire: String(item.prixUnitaire),
      stockMinimum: String(item.stockMinimum),
      emplacement: item.emplacement ?? "",
      actif: item.actif,
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
        nom: form.nom,
        categorie: form.categorie || null,
        forme: form.forme || null,
        dosage: form.dosage || null,
        prixAchat: form.prixAchat === "" ? null : Number(form.prixAchat),
        prixUnitaire: Number(form.prixUnitaire),
        stockMinimum: Number(form.stockMinimum),
        emplacement: form.emplacement || null,
        actif: form.actif,
      };
      const res = await fetch(
        modeCreation
          ? "/api/admin/medicaments"
          : `/api/admin/medicaments/${selectionId}`,
        {
          method: modeCreation ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as {
        message?: string;
        medicament?: MedicamentItem;
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? t("admin.common.enregistrer"));
      if (data.medicament) {
        setSelectionId(data.medicament.id);
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
      titre={t("admin.medicaments.titre")}
      sousTitre={t("admin.medicaments.description")}
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <EnTetePageReception
          icone={Pill}
          titre={t("admin.medicaments.titre")}
          description={t("admin.medicaments.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.medicaments.titre") },
          ]}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <input
              className={`${CLASSE_CHAMP_RECEPTION} max-w-xs`}
              placeholder={t("admin.medicaments.recherche")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className={`${CLASSE_CHAMP_RECEPTION} max-w-[180px]`}
              value={filtreActif}
              onChange={(e) => setFiltreActif(e.target.value)}
            >
              <option value="">{t("admin.medicaments.tous")}</option>
              <option value="true">{t("admin.medicaments.actifs")}</option>
              <option value="false">{t("admin.medicaments.inactifs")}</option>
            </select>
          </div>
          <Bouton type="button" taille="petit" onClick={ouvrirCreation}>
            <Plus className="h-4 w-4" />
            {t("admin.medicaments.nouveau")}
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
                {t("admin.medicaments.vide")}
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
                          {item.nom}
                        </p>
                        <p className="text-xs text-texte-secondaire">
                          {item.code}
                          {item.forme ? ` · ${item.forme}` : ""}
                          {item.dosage ? ` ${item.dosage}` : ""} ·{" "}
                          {item.prixUnitaire} $
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
                          ? t("admin.medicaments.actif")
                          : t("admin.medicaments.inactif")}
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
                  ? t("admin.medicaments.nouveau")
                  : t("admin.medicaments.modifier")}
              </h3>
              <div className="mt-3 space-y-3">
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("admin.medicaments.code")}
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
                    {t("admin.medicaments.nom")}
                  </label>
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.nom}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nom: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("admin.medicaments.categorie")}
                    </label>
                    <input
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form.categorie}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, categorie: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("admin.medicaments.forme")}
                    </label>
                    <input
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form.forme}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, forme: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("admin.medicaments.dosage")}
                  </label>
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.dosage}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dosage: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("admin.medicaments.prixAchat")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form.prixAchat}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, prixAchat: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("admin.medicaments.prixUnitaire")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form.prixUnitaire}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, prixUnitaire: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("admin.medicaments.stockMinimum")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form.stockMinimum}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, stockMinimum: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("admin.medicaments.emplacement")}
                    </label>
                    <input
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form.emplacement}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, emplacement: e.target.value }))
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
                  {t("admin.medicaments.actif")}
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
