"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Layers, Loader2, Plus } from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import {
  FormulairePaquetBilanAdmin,
  type FormPaquetBilan,
} from "@/features/admin/formulaire-paquet-bilan-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";
import {
  CLASSE_CHAMP_RECEPTION,
  CLASSE_LABEL_RECEPTION,
} from "@/constants/reception";
import type { ExamenPaquetOpt } from "@/lib/admin/filtrer-examens-paquet";

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

const FORM_VIDE: FormPaquetBilan = {
  code: "",
  libelle: "",
  description: "",
  prix: "0",
  remise: "0",
  ordre: "0",
  actif: true,
  typeExamenIds: [],
};

function calculerRemiseInitiale(prixForfait: number, somme: number): string {
  if (somme <= 0 || prixForfait <= 0) return "0";
  const pct = Math.round((1 - prixForfait / somme) * 100);
  return String(Math.max(0, Math.min(100, pct)));
}

export function ContenuPaquetsBilansAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<PaquetItem[]>([]);
  const [examens, setExamens] = useState<ExamenPaquetOpt[]>([]);
  const [q, setQ] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [modeFormulaire, setModeFormulaire] = useState<"liste" | "creation" | "edition">(
    "liste"
  );
  const [form, setForm] = useState<FormPaquetBilan>({ ...FORM_VIDE });
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
      const eData = (await eRes.json()) as {
        examens?: {
          id: string;
          code: string;
          libelle: string;
          prix: number;
          categorie: string;
        }[];
      };
      if (!pRes.ok) throw new Error(pData.message ?? t("admin.common.erreur"));
      setListe(pData.paquets ?? []);
      setExamens(
        (eData.examens ?? []).map((e) => ({
          id: e.id,
          code: e.code,
          libelle: e.libelle,
          prix: e.prix,
          categorie: e.categorie,
        }))
      );
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
    setModeFormulaire("creation");
    setSelectionId(null);
    setForm({ ...FORM_VIDE, typeExamenIds: [] });
    setMessage(null);
    setErreur(null);
  };

  const ouvrirEdition = (item: PaquetItem) => {
    setModeFormulaire("edition");
    setSelectionId(item.id);
    setForm({
      code: item.code,
      libelle: item.libelle,
      description: item.description ?? "",
      prix: String(item.prix),
      remise: calculerRemiseInitiale(item.prix, item.prixSommeExamens),
      ordre: String(item.ordre),
      actif: item.actif,
      typeExamenIds: item.examens.map((e) => e.typeExamenId),
    });
    setMessage(null);
    setErreur(null);
  };

  const fermerFormulaire = () => {
    setModeFormulaire("liste");
    setSelectionId(null);
    setForm({ ...FORM_VIDE });
  };

  const sauvegarder = async () => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const payload = {
        code: form.code.trim(),
        libelle: form.libelle.trim(),
        description: form.description.trim() || null,
        prix: Number(form.prix),
        ordre: Number(form.ordre),
        actif: form.actif,
        typeExamenIds: form.typeExamenIds,
      };
      const res = await fetch(
        modeFormulaire === "creation"
          ? "/api/admin/paquets-bilans"
          : `/api/admin/paquets-bilans/${selectionId}`,
        {
          method: modeFormulaire === "creation" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as { message?: string; paquet?: PaquetItem };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? t("admin.common.enregistrer"));
      if (data.paquet) {
        setSelectionId(data.paquet.id);
        setModeFormulaire("edition");
      }
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const afficheFormulaire = modeFormulaire !== "liste";

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.paquetsBilans.titre")}
      sousTitre={t("admin.paquetsBilans.description")}
    >
      <div className="mx-auto max-w-7xl space-y-4 pb-8">
        {!afficheFormulaire && (
          <EnTetePageReception
            icone={Layers}
            titre={t("admin.paquetsBilans.titre")}
            description={t("admin.paquetsBilans.description")}
            fil={[
              { label: t("admin.layout.titre"), href: "/sigh/admin" },
              { label: t("admin.paquetsBilans.titre") },
            ]}
          />
        )}

        {afficheFormulaire && (
          <button
            type="button"
            onClick={fermerFormulaire}
            className="inline-flex items-center gap-1 text-sm font-medium text-bleu-medical hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("admin.paquetsBilans.form.retourListe")}
          </button>
        )}

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

        {afficheFormulaire ? (
          <FormulairePaquetBilanAdmin
            mode={modeFormulaire === "creation" ? "creation" : "edition"}
            form={form}
            onChange={setForm}
            examens={examens}
            enCours={enCours}
            onAnnuler={fermerFormulaire}
            onSauvegarder={() => void sauvegarder()}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-3">
              <label className="block min-w-[200px] flex-1 text-sm">
                <span className={CLASSE_LABEL_RECEPTION}>
                  {t("admin.paquetsBilans.recherche")}
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void charger()}
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
                <div className="conteneur-tableau-sigh">
                  <table className="tableau-sigh min-w-[640px]">
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
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  );
}
