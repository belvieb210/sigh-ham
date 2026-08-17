"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2, Save } from "lucide-react";
import {
  MiseEnPageInfirmiers,
  type UtilisateurInfirmiers,
} from "@/features/infirmiers/mise-en-page-infirmiers";
import { PanneauDroitInfirmiers } from "@/features/infirmiers/panneau-droit-infirmiers";
import type {
  ConstanteVitaleResume,
  PatientFileInfirmiers,
} from "@/lib/infirmiers/types";
import { EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES } from "@/constants/infirmiers";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";

interface Props {
  utilisateur: UtilisateurInfirmiers;
}

type Formulaire = {
  temperature: string;
  tensionSystolique: string;
  tensionDiastolique: string;
  frequenceCardiaque: string;
  frequenceRespiratoire: string;
  poidsKg: string;
  tailleCm: string;
  saturationO2: string;
  glycemie: string;
  observations: string;
};

const FORM_VIDE: Formulaire = {
  temperature: "",
  tensionSystolique: "",
  tensionDiastolique: "",
  frequenceCardiaque: "",
  frequenceRespiratoire: "",
  poidsKg: "",
  tailleCm: "",
  saturationO2: "",
  glycemie: "",
  observations: "",
};

export function ContenuConstantesInfirmiers({ utilisateur }: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPageInfirmiers
      utilisateur={utilisateur}
      titre={t("infirmiers.constantes.titre")}
      sousTitre={t("infirmiers.constantes.sousTitre")}
      panneauDroit={<PanneauDroitInfirmiers />}
      activerSelection
    >
      <FormulaireConstantesInfirmiers />
    </MiseEnPageInfirmiers>
  );
}

function FormulaireConstantesInfirmiers() {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier")?.trim() ?? "";

  const [patients, setPatients] = useState<PatientFileInfirmiers[]>([]);
  const [dossierId, setDossierId] = useState(dossierUrl);
  const [historique, setHistorique] = useState<ConstanteVitaleResume[]>([]);
  const [form, setForm] = useState<Formulaire>(FORM_VIDE);
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const patient = patients.find((p) => p.dossierId === dossierId) ?? null;

  const chargerPatients = useCallback(async () => {
    const res = await fetch("/api/infirmiers/patients");
    const data = (await res.json()) as { patients?: PatientFileInfirmiers[] };
    setPatients(data.patients ?? []);
  }, []);

  const chargerDetail = useCallback(async (id: string) => {
    const res = await fetch(`/api/infirmiers/constantes?dossierId=${encodeURIComponent(id)}`);
    const data = (await res.json()) as {
      constantes?: ConstanteVitaleResume[];
      erreur?: string;
    };
    if (!res.ok) throw new Error(data.erreur ?? "Erreur");
    setHistorique(data.constantes ?? []);
  }, []);

  useEffect(() => {
    let annule = false;
    (async () => {
      setChargement(true);
      try {
        await chargerPatients();
        if (dossierUrl && !annule) {
          setDossierId(dossierUrl);
          await chargerDetail(dossierUrl);
        }
      } catch {
        if (!annule) setErreur(t("infirmiers.constantes.erreurChargement"));
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [chargerPatients, chargerDetail, dossierUrl, t]);

  useEffect(() => {
    if (!dossierId) {
      setHistorique([]);
      return;
    }
    void chargerDetail(dossierId).catch(() =>
      setErreur(t("infirmiers.constantes.erreurChargement"))
    );
  }, [dossierId, chargerDetail, t]);

  const majChamp = (cle: keyof Formulaire, valeur: string) => {
    setForm((f) => ({ ...f, [cle]: valeur }));
  };

  const enregistrer = async () => {
    if (!dossierId) {
      setErreur(t("infirmiers.constantes.selectionnerPatient"));
      return;
    }
    setEnregistrement(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/infirmiers/constantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId,
          temperature: form.temperature,
          tensionSystolique: form.tensionSystolique,
          tensionDiastolique: form.tensionDiastolique,
          frequenceCardiaque: form.frequenceCardiaque,
          frequenceRespiratoire: form.frequenceRespiratoire,
          poidsKg: form.poidsKg,
          tailleCm: form.tailleCm,
          saturationO2: form.saturationO2,
          glycemie: form.glycemie,
          observations: form.observations,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setErreur(data.message ?? t("infirmiers.constantes.erreurSave"));
        return;
      }
      setMessage(data.message ?? t("infirmiers.constantes.succes"));
      setForm(FORM_VIDE);
      await chargerDetail(dossierId);
      await chargerPatients();
      window.dispatchEvent(new CustomEvent(EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES));
    } catch {
      setErreur(t("infirmiers.constantes.erreurSave"));
    } finally {
      setEnregistrement(false);
    }
  };

  const champs: { cle: keyof Formulaire; label: string }[] = [
    { cle: "temperature", label: t("infirmiers.constantes.champs.temperature") },
    { cle: "tensionSystolique", label: t("infirmiers.constantes.champs.tensionSystolique") },
    { cle: "tensionDiastolique", label: t("infirmiers.constantes.champs.tensionDiastolique") },
    { cle: "frequenceCardiaque", label: t("infirmiers.constantes.champs.frequenceCardiaque") },
    {
      cle: "frequenceRespiratoire",
      label: t("infirmiers.constantes.champs.frequenceRespiratoire"),
    },
    { cle: "poidsKg", label: t("infirmiers.constantes.champs.poidsKg") },
    { cle: "tailleCm", label: t("infirmiers.constantes.champs.tailleCm") },
    { cle: "saturationO2", label: t("infirmiers.constantes.champs.saturationO2") },
    { cle: "glycemie", label: t("infirmiers.constantes.champs.glycemie") },
  ];

  const formater = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(i18n.language || "fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  return (
      <div className="mx-auto w-full max-w-[900px] space-y-6">
        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("infirmiers.constantes.chargement")}
          </div>
        ) : (
          <>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>
                {t("infirmiers.constantes.patient")}
              </label>
              <select
                className={CLASSE_CHAMP_RECEPTION}
                value={dossierId}
                onChange={(e) => setDossierId(e.target.value)}
              >
                <option value="">{t("infirmiers.constantes.choisirPatient")}</option>
                {patients.map((p) => (
                  <option key={p.dossierId} value={p.dossierId}>
                    {p.nomComplet} — {p.numeroDossier}
                  </option>
                ))}
              </select>
            </div>

            {patient && (
              <div className="rounded-xl border border-gris-bordure bg-white p-4 text-sm shadow-sm">
                <p className="font-semibold text-texte-principal">{patient.nomComplet}</p>
                <p className="text-texte-secondaire">
                  {patient.sexe ?? "—"}
                  {patient.age != null ? ` · ${patient.age} ans` : ""} ·{" "}
                  {patient.telephone}
                </p>
                <p className="mt-1 text-xs text-texte-secondaire">
                  {t("infirmiers.constantes.motif")} : {patient.motif}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-texte-principal">
                {t("infirmiers.constantes.nouvelleMesure")}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {champs.map((c) => (
                  <div key={c.cle}>
                    <label className={CLASSE_LABEL_RECEPTION}>{c.label}</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form[c.cle]}
                      onChange={(e) => majChamp(c.cle, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("infirmiers.constantes.champs.observations")}
                </label>
                <textarea
                  className={CLASSE_CHAMP_RECEPTION}
                  rows={3}
                  value={form.observations}
                  onChange={(e) => majChamp("observations", e.target.value)}
                />
              </div>
              {erreur && <p className="mt-3 text-sm text-red-600">{erreur}</p>}
              {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
              <button
                type="button"
                disabled={enregistrement || !dossierId}
                onClick={() => void enregistrer()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-bleu-medical px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {enregistrement ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t("infirmiers.constantes.enregistrer")}
              </button>
            </div>

            {historique.length > 0 && (
              <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-texte-principal">
                  {t("infirmiers.constantes.historiqueDossier")}
                </h2>
                <ul className="space-y-2">
                  {historique.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-lg border border-gris-bordure/80 bg-slate-50 px-3 py-2 text-xs text-texte-secondaire"
                    >
                      <span className="font-medium text-texte-principal">
                        {formater(c.mesureLe)}
                      </span>
                      {" · "}T° {c.temperature ?? "—"} · TA {c.tensionSystolique ?? "—"}/
                      {c.tensionDiastolique ?? "—"} · FC {c.frequenceCardiaque ?? "—"} · FR{" "}
                      {c.frequenceRespiratoire ?? "—"} · SpO₂ {c.saturationO2 ?? "—"} ·{" "}
                      {c.poidsKg ?? "—"} kg · {c.tailleCm ?? "—"} cm
                      {c.observations ? (
                        <p className="mt-1 italic">{c.observations}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
  );
}
