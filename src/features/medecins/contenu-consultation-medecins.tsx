"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  Plus,
  Printer,
  Save,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import { imprimerCrConsultation } from "@/lib/medecins/imprimer-cr-consultation";
import type {
  ConsultationDetailMedecins,
  ConstanteVitaleResume,
  PatientFileMedecins,
} from "@/lib/medecins/types";

interface PropsContenuConsultationMedecins {
  utilisateur: UtilisateurMedecins;
}

export function ContenuConsultationMedecins({
  utilisateur,
}: PropsContenuConsultationMedecins) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier")?.trim() ?? "";

  const [patients, setPatients] = useState<PatientFileMedecins[]>([]);
  const [dossierId, setDossierId] = useState(dossierUrl);
  const [consultation, setConsultation] =
    useState<ConsultationDetailMedecins | null>(null);
  const [constantes, setConstantes] = useState<ConstanteVitaleResume | null>(
    null
  );
  const [motif, setMotif] = useState("");
  const [anamnese, setAnamnese] = useState("");
  const [examenClinique, setExamenClinique] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [diagLibelle, setDiagLibelle] = useState("");
  const [diagCode, setDiagCode] = useState("");
  const [diagPrincipal, setDiagPrincipal] = useState(false);
  const [acteType, setActeType] = useState("SOIN");
  const [acteLibelle, setActeLibelle] = useState("");
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const patientSelectionne = useMemo(
    () => patients.find((p) => p.dossierId === dossierId) ?? null,
    [patients, dossierId]
  );

  const cloturee = Boolean(consultation?.finLe);

  const appliquerConsultation = useCallback(
    (c: ConsultationDetailMedecins | null) => {
      setConsultation(c);
      if (c) {
        setMotif(c.motif);
        setAnamnese(c.anamnese ?? "");
        setExamenClinique(c.examenClinique ?? "");
        setConclusion(c.conclusion ?? "");
      } else {
        setMotif(patientSelectionne?.motif !== "—" ? patientSelectionne?.motif ?? "" : "");
        setAnamnese("");
        setExamenClinique("");
        setConclusion("");
      }
    },
    [patientSelectionne?.motif]
  );

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/medecins/patients");
        const data = (await res.json()) as {
          patients?: PatientFileMedecins[];
          erreur?: string;
        };
        if (annule) return;
        if (!res.ok) {
          setErreur(data.erreur ?? t("medecins.erreurs.chargementPatients"));
          return;
        }
        setPatients(data.patients ?? []);
      } catch {
        if (!annule) setErreur(t("medecins.erreurs.chargementPatients"));
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [t]);

  useEffect(() => {
    if (dossierUrl) setDossierId(dossierUrl);
  }, [dossierUrl]);

  useEffect(() => {
    if (!dossierId) {
      appliquerConsultation(null);
      setConstantes(null);
      return;
    }

    let annule = false;
    (async () => {
      setErreur(null);
      try {
        const [resConsult, resDetail] = await Promise.all([
          fetch(`/api/medecins/consultations?dossierId=${encodeURIComponent(dossierId)}`),
          fetch(`/api/medecins/patients/${encodeURIComponent(dossierId)}`),
        ]);
        const dataConsult = (await resConsult.json()) as {
          consultation?: ConsultationDetailMedecins | null;
        };
        const dataDetail = (await resDetail.json()) as {
          patient?: { constantesVitales?: ConstanteVitaleResume | null; motif?: string };
        };
        if (annule) return;
        appliquerConsultation(dataConsult.consultation ?? null);
        setConstantes(dataDetail.patient?.constantesVitales ?? null);
        if (!dataConsult.consultation && dataDetail.patient?.motif) {
          setMotif((m) => m || (dataDetail.patient?.motif !== "—" ? dataDetail.patient?.motif ?? "" : ""));
        }
      } catch {
        if (!annule) setErreur(t("medecins.consultation.erreurChargement"));
      }
    })();

    return () => {
      annule = true;
    };
  }, [dossierId, appliquerConsultation, t]);

  async function sauvegarder() {
    if (!dossierId || !motif.trim()) {
      setErreur(t("medecins.consultation.motifRequis"));
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      if (!consultation) {
        const res = await fetch("/api/medecins/consultations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dossierId,
            motif,
            anamnese,
            examenClinique,
            conclusion,
          }),
        });
        const data = (await res.json()) as {
          consultation?: ConsultationDetailMedecins;
          erreur?: string;
        };
        if (!res.ok || !data.consultation) {
          setErreur(data.erreur ?? t("medecins.actions.erreurInattendue"));
          return;
        }
        appliquerConsultation(data.consultation);
        setMessage(t("medecins.consultation.enregistree"));
      } else {
        const res = await fetch(`/api/medecins/consultations/${consultation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ motif, anamnese, examenClinique, conclusion }),
        });
        const data = (await res.json()) as {
          consultation?: ConsultationDetailMedecins;
          erreur?: string;
        };
        if (!res.ok || !data.consultation) {
          setErreur(data.erreur ?? t("medecins.actions.erreurInattendue"));
          return;
        }
        appliquerConsultation(data.consultation);
        setMessage(t("medecins.consultation.enregistree"));
      }
    } catch {
      setErreur(t("medecins.actions.erreurInattendue"));
    } finally {
      setEnCours(false);
    }
  }

  async function cloturer() {
    if (!consultation) {
      await sauvegarder();
      return;
    }
    setEnCours(true);
    setErreur(null);
    try {
      await fetch(`/api/medecins/consultations/${consultation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motif, anamnese, examenClinique, conclusion }),
      });
      const res = await fetch(`/api/medecins/consultations/${consultation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cloturer" }),
      });
      const data = (await res.json()) as {
        consultation?: ConsultationDetailMedecins;
        erreur?: string;
      };
      if (!res.ok || !data.consultation) {
        setErreur(data.erreur ?? t("medecins.actions.erreurInattendue"));
        return;
      }
      appliquerConsultation(data.consultation);
      setMessage(t("medecins.consultation.cloturee"));
    } catch {
      setErreur(t("medecins.actions.erreurInattendue"));
    } finally {
      setEnCours(false);
    }
  }

  async function ajouterDiag() {
    if (!consultation || !diagLibelle.trim()) return;
    setEnCours(true);
    try {
      const res = await fetch(
        `/api/medecins/consultations/${consultation.id}/diagnostics`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            libelle: diagLibelle,
            codeCim: diagCode || null,
            principal: diagPrincipal,
          }),
        }
      );
      const data = (await res.json()) as {
        diagnostic?: ConsultationDetailMedecins["diagnostics"][number];
        erreur?: string;
      };
      if (!res.ok || !data.diagnostic) {
        setErreur(data.erreur ?? t("medecins.actions.erreurInattendue"));
        return;
      }
      setConsultation({
        ...consultation,
        diagnostics: [...consultation.diagnostics, data.diagnostic],
      });
      setDiagLibelle("");
      setDiagCode("");
      setDiagPrincipal(false);
    } finally {
      setEnCours(false);
    }
  }

  async function supprimerDiag(id: string) {
    if (!consultation) return;
    const res = await fetch(`/api/medecins/diagnostics/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setConsultation({
      ...consultation,
      diagnostics: consultation.diagnostics.filter((d) => d.id !== id),
    });
  }

  async function ajouterActeUi() {
    if (!consultation || !acteLibelle.trim()) return;
    setEnCours(true);
    try {
      const res = await fetch(
        `/api/medecins/consultations/${consultation.id}/actes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ typeActe: acteType, libelle: acteLibelle }),
        }
      );
      const data = (await res.json()) as {
        acte?: ConsultationDetailMedecins["actes"][number];
        erreur?: string;
      };
      if (!res.ok || !data.acte) {
        setErreur(data.erreur ?? t("medecins.actions.erreurInattendue"));
        return;
      }
      setConsultation({
        ...consultation,
        actes: [...consultation.actes, data.acte],
      });
      setActeLibelle("");
    } finally {
      setEnCours(false);
    }
  }

  async function supprimerActeUi(id: string) {
    if (!consultation) return;
    const res = await fetch(`/api/medecins/actes/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setConsultation({
      ...consultation,
      actes: consultation.actes.filter((a) => a.id !== id),
    });
  }

  async function imprimer() {
    if (!consultation) return;
    await imprimerCrConsultation({
      hopital: "HAM — Centre des diagnostics et d'analyses médicales",
      medecin: consultation.medecin || `${utilisateur.prenom} ${utilisateur.nom}`,
      patient: consultation.patient.nomComplet,
      numeroDossier: consultation.patient.numeroDossier,
      motif: consultation.motif,
      anamnese: consultation.anamnese,
      examenClinique: consultation.examenClinique,
      conclusion: consultation.conclusion,
      diagnostics: consultation.diagnostics.map((d) => ({
        libelle: d.libelle,
        codeCim: d.codeCim,
        principal: d.principal,
      })),
      actes: consultation.actes.map((a) => ({
        libelle: a.libelle,
        typeActe: a.typeActe,
        quantite: a.quantite,
      })),
      debutLe: consultation.debutLe,
      finLe: consultation.finLe,
    });
  }

  const champ =
    "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2 text-sm text-texte-principal outline-none focus:border-bleu-medical";

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.consultation.titre")}
      sousTitre={t("medecins.consultation.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-5">
        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.consultation.chargement")}
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <label className="text-xs font-medium text-texte-secondaire">
                {t("medecins.consultation.selectionPatient")}
              </label>
              <select
                className={`${champ} mt-1`}
                value={dossierId}
                onChange={(e) => setDossierId(e.target.value)}
              >
                <option value="">{t("medecins.consultation.choisirPatient")}</option>
                {patients.map((p) => (
                  <option key={p.dossierId} value={p.dossierId}>
                    {p.nomComplet} — {p.numeroDossier}
                  </option>
                ))}
              </select>
            </div>

            {dossierId ? (
              <>
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm lg:col-span-2">
                    <h3 className="text-sm font-semibold text-texte-principal">
                      {consultation?.patient.nomComplet ??
                        patientSelectionne?.nomComplet ??
                        "—"}
                    </h3>
                    <p className="mt-1 text-xs text-texte-secondaire">
                      {t("medecins.consultation.dossier")}{" "}
                      {consultation?.patient.numeroDossier ??
                        patientSelectionne?.numeroDossier}{" "}
                      · {consultation?.patient.sexe ?? patientSelectionne?.sexe ?? "—"}{" "}
                      · {patientSelectionne?.age != null ? `${patientSelectionne.age} ans` : ""}
                    </p>
                    {constantes ? (
                      <p className="mt-3 text-xs text-texte-secondaire">
                        {t("medecins.consultation.constantes")} : T°{" "}
                        {constantes.temperature ?? "—"} · TA{" "}
                        {constantes.tensionSystolique ?? "—"}/
                        {constantes.tensionDiastolique ?? "—"} · FC{" "}
                        {constantes.frequenceCardiaque ?? "—"} · FR{" "}
                        {constantes.frequenceRespiratoire ?? "—"} · SpO₂{" "}
                        {constantes.saturationO2 ?? "—"} ·{" "}
                        {constantes.poidsKg ?? "—"} kg · {constantes.tailleCm ?? "—"}{" "}
                        cm
                        {constantes.glycemie != null
                          ? ` · Gly ${constantes.glycemie}`
                          : ""}
                        {constantes.observations
                          ? ` — ${constantes.observations}`
                          : ""}
                      </p>
                    ) : (
                      <p className="mt-3 text-xs text-texte-secondaire">
                        {t("medecins.consultation.pasConstantes")}
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                    <p className="text-xs text-texte-secondaire">
                      {cloturee
                        ? t("medecins.consultation.statutCloturee")
                        : consultation
                          ? t("medecins.consultation.statutOuverte")
                          : t("medecins.consultation.statutNouvelle")}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm md:col-span-2">
                    <div>
                      <label className="text-xs font-medium text-texte-secondaire">
                        {t("medecins.consultation.motif")}
                      </label>
                      <input
                        className={`${champ} mt-1`}
                        value={motif}
                        disabled={cloturee}
                        onChange={(e) => setMotif(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-texte-secondaire">
                        {t("medecins.consultation.anamnese")}
                      </label>
                      <textarea
                        className={`${champ} mt-1 min-h-[80px]`}
                        value={anamnese}
                        disabled={cloturee}
                        onChange={(e) => setAnamnese(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-texte-secondaire">
                        {t("medecins.consultation.examenClinique")}
                      </label>
                      <textarea
                        className={`${champ} mt-1 min-h-[80px]`}
                        value={examenClinique}
                        disabled={cloturee}
                        onChange={(e) => setExamenClinique(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-texte-secondaire">
                        {t("medecins.consultation.conclusion")}
                      </label>
                      <textarea
                        className={`${champ} mt-1 min-h-[80px]`}
                        value={conclusion}
                        disabled={cloturee}
                        onChange={(e) => setConclusion(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                    <h4 className="text-sm font-semibold">
                      {t("medecins.consultation.diagnostics")}
                    </h4>
                    <ul className="mt-3 space-y-2">
                      {(consultation?.diagnostics ?? []).map((d) => (
                        <li
                          key={d.id}
                          className="flex items-start justify-between gap-2 rounded-lg bg-gris-fond px-3 py-2 text-sm"
                        >
                          <span>
                            {d.principal ? "★ " : ""}
                            {d.libelle}
                            {d.codeCim ? ` (${d.codeCim})` : ""}
                          </span>
                          {!cloturee && (
                            <button
                              type="button"
                              onClick={() => void supprimerDiag(d.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                    {!cloturee && consultation && (
                      <div className="mt-3 space-y-2">
                        <input
                          className={champ}
                          placeholder={t("medecins.consultation.libelleDiagnostic")}
                          value={diagLibelle}
                          onChange={(e) => setDiagLibelle(e.target.value)}
                        />
                        <input
                          className={champ}
                          placeholder={t("medecins.consultation.codeCim")}
                          value={diagCode}
                          onChange={(e) => setDiagCode(e.target.value)}
                        />
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={diagPrincipal}
                            onChange={(e) => setDiagPrincipal(e.target.checked)}
                          />
                          {t("medecins.consultation.principal")}
                        </label>
                        <button
                          type="button"
                          onClick={() => void ajouterDiag()}
                          className="inline-flex items-center gap-1 rounded-lg bg-bleu-medical px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t("medecins.consultation.ajouterDiagnostic")}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                    <h4 className="text-sm font-semibold">
                      {t("medecins.consultation.actes")}
                    </h4>
                    <ul className="mt-3 space-y-2">
                      {(consultation?.actes ?? []).map((a) => (
                        <li
                          key={a.id}
                          className="flex items-start justify-between gap-2 rounded-lg bg-gris-fond px-3 py-2 text-sm"
                        >
                          <span>
                            {a.libelle} · {a.typeActe} ×{a.quantite}
                          </span>
                          {!cloturee && (
                            <button
                              type="button"
                              onClick={() => void supprimerActeUi(a.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                    {!cloturee && consultation && (
                      <div className="mt-3 space-y-2">
                        <input
                          className={champ}
                          placeholder={t("medecins.consultation.typeActe")}
                          value={acteType}
                          onChange={(e) => setActeType(e.target.value)}
                        />
                        <input
                          className={champ}
                          placeholder={t("medecins.consultation.libelleActe")}
                          value={acteLibelle}
                          onChange={(e) => setActeLibelle(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => void ajouterActeUi()}
                          className="inline-flex items-center gap-1 rounded-lg bg-bleu-medical px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t("medecins.consultation.ajouterActe")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {message && <p className="text-sm text-emerald-700">{message}</p>}
                {erreur && <p className="text-sm text-red-600">{erreur}</p>}

                <div className="flex flex-wrap gap-2">
                  {!cloturee && (
                    <>
                      <button
                        type="button"
                        disabled={enCours}
                        onClick={() => void sauvegarder()}
                        className="inline-flex items-center gap-2 rounded-lg bg-bleu-medical px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {enCours ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {t("medecins.consultation.enregistrer")}
                      </button>
                      <button
                        type="button"
                        disabled={enCours || !consultation}
                        onClick={() => void cloturer()}
                        className="inline-flex items-center gap-2 rounded-lg border border-gris-bordure bg-white px-4 py-2 text-sm font-semibold text-texte-principal disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" />
                        {t("medecins.consultation.cloturer")}
                      </button>
                    </>
                  )}
                  {consultation && (
                    <button
                      type="button"
                      onClick={() => void imprimer()}
                      className="inline-flex items-center gap-2 rounded-lg border border-gris-bordure bg-white px-4 py-2 text-sm font-semibold"
                    >
                      <Printer className="h-4 w-4" />
                      {t("medecins.consultation.imprimerCr")}
                    </button>
                  )}
                  {cloturee && (
                    <Link
                      href={`/sigh/medecins/file-attente`}
                      className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {t("medecins.consultation.lienOrientation")}
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-texte-secondaire">
                {t("medecins.consultation.aideSelection")}
              </p>
            )}
          </>
        )}
      </div>
    </MiseEnPageMedecins>
  );
}
