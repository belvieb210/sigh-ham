"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Layers, Loader2, Plus, Save } from "lucide-react";
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

type ExamenOpt = { id: string; code: string; libelle: string; prix: number };

type PaquetItem = {
  id: string;
  code: string;
  libelle: string;
  description: string | null;
  prix: number;
  actif: boolean;
  ordre: number;
  nbExamens: number;
  prixSommeExamens: number;
  examens: { typeExamenId: string; code: string; libelle: string }[];
};

const FORM_VIDE = {
  code: "",
  libelle: "",
  description: "",
  prix: "0",
  ordre: "0",
  actif: true,
  typeExamenIds: [] as string[],
};

export function ContenuPaquetsBilansAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<PaquetItem[]>([]);
  const [examens, setExamens] = useState<ExamenOpt[]>([]);
  const [q, setQ] = useState("");
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
      const [pRes, eRes] = await Promise.all([
        fetch(`/api/admin/paquets-bilans?${params}`),
        fetch("/api/admin/examens?actif=true"),
      ]);
      const pData = (await pRes.json()) as { paquets?: PaquetItem[]; message?: string };
      const eData = (await eRes.json()) as { examens?: ExamenOpt[] };
      if (!pRes.ok) throw new Error(pData.message ?? t("admin.common.erreur"));
      setListe(pData.paquets ?? []);
      setExamens(eData.examens ?? []);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setChargement(false);
    }
  }, [q, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const ouvrirCreation = () => {
    setModeCreation(true);
    setSelectionId(null);
    setForm({ ...FORM_VIDE, typeExamenIds: [] });
  };

  const ouvrirEdition = (item: PaquetItem) => {
    setModeCreation(false);
    setSelectionId(item.id);
    setForm({
      code: item.code,
      libelle: item.libelle,
      description: item.description ?? "",
      prix: String(item.prix),
      ordre: String(item.ordre),
      actif: item.actif,
      typeExamenIds: item.examens.map((e) => e.typeExamenId),
    });
  };

  const basculerExamen = (id: string) => {
    setForm((f) => ({
      ...f,
      typeExamenIds: f.typeExamenIds.includes(id)
        ? f.typeExamenIds.filter((x) => x !== id)
        : [...f.typeExamenIds, id],
    }));
  };

  const sauvegarder = async () => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const payload = {
        code: form.code,
        libelle: form.libelle,
        description: form.description || null,
        prix: Number(form.prix),
        ordre: Number(form.ordre),
        actif: form.actif,
        typeExamenIds: form.typeExamenIds,
      };
      const res = await fetch(
        modeCreation
          ? "/api/admin/paquets-bilans"
          : `/api/admin/paquets-bilans/${selectionId}`,
        {
          method: modeCreation ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as { message?: string; paquet?: PaquetItem };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? t("admin.common.enregistrer"));
      if (data.paquet) {
        setSelectionId(data.paquet.id);
        setModeCreation(false);
      }
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const sommeSelection = form.typeExamenIds.reduce((s, id) => {
    const e = examens.find((x) => x.id === id);
    return s + (e?.prix ?? 0);
  }, 0);

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.paquetsBilans.titre")}
      sousTitre={t("admin.paquetsBilans.description")}
    >
      <div className="mx-auto max-w-7xl space-y-4 pb-8">
        <EnTetePageReception
          icone={Layers}
          titre={t("admin.paquetsBilans.titre")}
          description={t("admin.paquetsBilans.description")}
          fil={[
            { label: t("admin.layout.titre"), href: "/sigh/admin" },
            { label: t("admin.paquetsBilans.titre") },
          ]}
        />

        <div className="flex flex-wrap items-end gap-3">
          <label className="block text-sm">
            <span className={CLASSE_LABEL_RECEPTION}>{t("admin.paquetsBilans.recherche")}</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={CLASSE_CHAMP_RECEPTION}
              placeholder={t("admin.paquetsBilans.recherchePlaceholder")}
            />
          </label>
          <Bouton taille="petit" onClick={() => void charger()}>
            {t("admin.paquetsBilans.rechercher")}
          </Bouton>
          <Bouton taille="petit" onClick={ouvrirCreation}>
            <Plus className="mr-1 h-4 w-4" />
            {t("admin.paquetsBilans.nouveau")}
          </Bouton>
        </div>

        {message && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {erreur && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
          <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            {chargement ? (
              <div className="flex items-center justify-center gap-2 py-16">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : liste.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-texte-secondaire">
                {t("admin.paquetsBilans.vide")}
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gris-tres-clair text-left text-xs uppercase text-texte-secondaire">
                  <tr>
                    <th className="px-4 py-3">{t("admin.paquetsBilans.colCode")}</th>
                    <th className="px-4 py-3">{t("admin.paquetsBilans.colLibelle")}</th>
                    <th className="px-4 py-3">{t("admin.paquetsBilans.colExamens")}</th>
                    <th className="px-4 py-3">{t("admin.paquetsBilans.colPrix")}</th>
                    <th className="px-4 py-3">{t("admin.paquetsBilans.colStatut")}</th>
                  </tr>
                </thead>
                <tbody>
                  {liste.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => ouvrirEdition(p)}
                      className={`cursor-pointer border-t hover:bg-gris-tres-clair/50 ${
                        selectionId === p.id ? "bg-bleu-medical-clair/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                      <td className="px-4 py-3 font-medium">{p.libelle}</td>
                      <td className="px-4 py-3">{p.nbExamens}</td>
                      <td className="px-4 py-3 font-semibold">
                        {p.prix.toLocaleString("fr-FR")} FC
                        <span className="ml-1 text-[10px] font-normal text-texte-secondaire">
                          ({t("admin.paquetsBilans.sommeIndividuelle")}{" "}
                          {p.prixSommeExamens.toLocaleString("fr-FR")})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            p.actif
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {p.actif
                            ? t("admin.paquetsBilans.actif")
                            : t("admin.paquetsBilans.inactif")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {(modeCreation || selectionId) && (
            <aside className="space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold text-texte-principal">
                {modeCreation
                  ? t("admin.paquetsBilans.creer")
                  : t("admin.paquetsBilans.modifier")}
              </h3>
              <label className="block text-sm">
                <span className={CLASSE_LABEL_RECEPTION}>{t("admin.paquetsBilans.code")}</span>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className={CLASSE_CHAMP_RECEPTION}
                />
              </label>
              <label className="block text-sm">
                <span className={CLASSE_LABEL_RECEPTION}>{t("admin.paquetsBilans.libelle")}</span>
                <input
                  value={form.libelle}
                  onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
                  className={CLASSE_CHAMP_RECEPTION}
                />
              </label>
              <label className="block text-sm">
                <span className={CLASSE_LABEL_RECEPTION}>
                  {t("admin.paquetsBilans.prixForfait")}
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.prix}
                  onChange={(e) => setForm((f) => ({ ...f, prix: e.target.value }))}
                  className={CLASSE_CHAMP_RECEPTION}
                />
                <span className="mt-1 block text-xs text-texte-secondaire">
                  {t("admin.paquetsBilans.sommeSelection")}: {sommeSelection.toLocaleString("fr-FR")}{" "}
                  FC
                </span>
              </label>
              <div>
                <p className={CLASSE_LABEL_RECEPTION}>{t("admin.paquetsBilans.examensInclus")}</p>
                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gris-bordure p-2">
                  {examens.map((e) => (
                    <label
                      key={e.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gris-tres-clair"
                    >
                      <input
                        type="checkbox"
                        checked={form.typeExamenIds.includes(e.id)}
                        onChange={() => basculerExamen(e.id)}
                      />
                      <span>
                        {e.code} — {e.libelle}
                      </span>
                      <span className="ml-auto text-xs text-texte-secondaire">
                        {e.prix.toLocaleString("fr-FR")} FC
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.actif}
                  onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))}
                />
                {t("admin.paquetsBilans.actif")}
              </label>
              <Bouton className="w-full" disabled={enCours} onClick={() => void sauvegarder()}>
                <Save className="mr-1 h-4 w-4" />
                {t("admin.common.enregistrer")}
              </Bouton>
            </aside>
          )}
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
