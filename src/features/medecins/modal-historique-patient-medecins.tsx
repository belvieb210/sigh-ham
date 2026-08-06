"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  GitCompare,
  Loader2,
  Pill,
  Stethoscope,
  X,
} from "lucide-react";
import {
  imprimerCrConsultation,
  imprimerHistoriqueDossierPdf,
  imprimerOrdonnancePdf,
} from "@/lib/medecins/imprimer-pdfs-medecins";
import {
  construireDifferencesHistorique,
  consultationVersDonneesPdf,
  ordonnanceVersDonneesPdf,
} from "@/lib/medecins/pdf-donnees-medecins";
import type {
  ConsultationDetailMedecins,
  ConstanteVitaleResume,
  OrdonnanceMedecins,
} from "@/lib/medecins/types";
import { cn } from "@/lib/utils";

export type PatientHistoriqueCible = {
  dossierId: string;
  nomComplet: string;
  numeroDossier: string;
  telephone?: string;
};

interface Props {
  patient: PatientHistoriqueCible | null;
  onFermer: () => void;
}

export function ModalHistoriquePatientMedecins({ patient, onFermer }: Props) {
  const [consultations, setConsultations] = useState<ConsultationDetailMedecins[]>(
    []
  );
  const [ordonnances, setOrdonnances] = useState<OrdonnanceMedecins[]>([]);
  const [constantesVitales, setConstantesVitales] =
    useState<ConstanteVitaleResume | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [pdfEnCours, setPdfEnCours] = useState<string | null>(null);
  const [consultA, setConsultA] = useState("");
  const [consultB, setConsultB] = useState("");
  const [ordA, setOrdA] = useState("");
  const [ordB, setOrdB] = useState("");

  const charger = useCallback(async (dossierId: string) => {
    setChargement(true);
    setErreur(null);
    try {
      const [resC, resO] = await Promise.all([
        fetch(
          `/api/medecins/consultations?dossierId=${encodeURIComponent(dossierId)}`
        ),
        fetch(
          `/api/medecins/ordonnances?dossierId=${encodeURIComponent(dossierId)}`
        ),
      ]);
      const dataC = (await resC.json()) as {
        historique?: ConsultationDetailMedecins[];
        consultation?: ConsultationDetailMedecins | null;
        constantesVitales?: ConstanteVitaleResume | null;
        erreur?: string;
      };
      const dataO = (await resO.json()) as {
        ordonnances?: OrdonnanceMedecins[];
        erreur?: string;
      };
      if (!resC.ok) throw new Error(dataC.erreur ?? "Consultations indisponibles.");
      if (!resO.ok) throw new Error(dataO.erreur ?? "Ordonnances indisponibles.");

      const hist = dataC.historique ?? [];
      const ouverte = dataC.consultation;
      const fusion = [...hist];
      if (ouverte && !fusion.some((c) => c.id === ouverte.id)) {
        fusion.unshift(ouverte);
      }
      fusion.sort(
        (a, b) => new Date(b.debutLe).getTime() - new Date(a.debutLe).getTime()
      );
      setConsultations(fusion);
      setOrdonnances(dataO.ordonnances ?? []);
      setConstantesVitales(dataC.constantesVitales ?? null);
      if (fusion.length >= 2) {
        setConsultA(fusion[fusion.length - 1].id);
        setConsultB(fusion[0].id);
      } else if (fusion.length === 1) {
        setConsultA(fusion[0].id);
        setConsultB(fusion[0].id);
      }
      const ords = dataO.ordonnances ?? [];
      if (ords.length >= 2) {
        setOrdA(ords[ords.length - 1].id);
        setOrdB(ords[0].id);
      } else if (ords.length === 1) {
        setOrdA(ords[0].id);
        setOrdB(ords[0].id);
      }
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur de chargement.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    if (!patient) {
      setConsultations([]);
      setOrdonnances([]);
      setConstantesVitales(null);
      return;
    }
    void charger(patient.dossierId);
  }, [patient, charger]);

  const extrasPdf = useMemo(
    () => ({
      telephone: patient?.telephone,
      age: consultations[0]?.patient.age,
      sexe: consultations[0]?.patient.sexe,
      constantesVitales,
    }),
    [patient?.telephone, consultations, constantesVitales]
  );

  const diffs = useMemo(() => {
    const cSel = consultations.filter(
      (c) => c.id === consultA || c.id === consultB
    );
    const oSel = ordonnances.filter((o) => o.id === ordA || o.id === ordB);
    return construireDifferencesHistorique(
      cSel.map((c) =>
        consultationVersDonneesPdf(c, { constantesVitales })
      ),
      oSel.map((o) =>
        ordonnanceVersDonneesPdf(o, {
          ...extrasPdf,
          signesVitauxConsultation:
            consultations.find((c) => c.id === consultA || c.id === consultB)
              ?.formulaireClinique?.signesVitaux ??
            consultations[0]?.formulaireClinique?.signesVitaux,
        })
      )
    );
  }, [
    consultations,
    ordonnances,
    consultA,
    consultB,
    ordA,
    ordB,
    constantesVitales,
    extrasPdf,
  ]);

  const comparaisonLibelle = useMemo(() => {
    const parts: string[] = [];
    const ca = consultations.find((c) => c.id === consultA);
    const cb = consultations.find((c) => c.id === consultB);
    if (ca && cb && ca.id !== cb.id) {
      parts.push(
        `Consult. ${new Date(ca.debutLe).toLocaleDateString("fr-FR")} ↔ ${new Date(cb.debutLe).toLocaleDateString("fr-FR")}`
      );
    }
    const oa = ordonnances.find((o) => o.id === ordA);
    const ob = ordonnances.find((o) => o.id === ordB);
    if (oa && ob && oa.id !== ob.id) {
      parts.push(
        `Ord. ${new Date(oa.prescritLe).toLocaleDateString("fr-FR")} ↔ ${new Date(ob.prescritLe).toLocaleDateString("fr-FR")}`
      );
    }
    return parts.length > 0 ? parts.join(" · ") : null;
  }, [consultations, ordonnances, consultA, consultB, ordA, ordB]);

  async function pdfConsultation(c: ConsultationDetailMedecins) {
    setPdfEnCours(c.id);
    try {
      const ok = await imprimerCrConsultation(
        consultationVersDonneesPdf(c, { constantesVitales })
      );
      if (!ok) setErreur("Impossible de générer le PDF consultation.");
    } finally {
      setPdfEnCours(null);
    }
  }

  async function pdfOrdonnance(o: OrdonnanceMedecins) {
    setPdfEnCours(o.id);
    try {
      const ref = consultations[0];
      const ok = await imprimerOrdonnancePdf(
        ordonnanceVersDonneesPdf(o, {
          telephone: patient?.telephone ?? ref?.patient.telephone,
          age: ref?.patient.age,
          sexe: ref?.patient.sexe,
          constantesVitales,
          signesVitauxConsultation: ref?.formulaireClinique?.signesVitaux,
        })
      );
      if (!ok) setErreur("Impossible de générer le PDF ordonnance.");
    } finally {
      setPdfEnCours(null);
    }
  }

  async function pdfSynthese() {
    if (!patient) return;
    setPdfEnCours("synthese");
    try {
      const consultPdf = consultations.map((c) =>
        consultationVersDonneesPdf(c, { constantesVitales })
      );
      const ordPdf = ordonnances.map((o) =>
        ordonnanceVersDonneesPdf(o, {
          telephone: patient.telephone,
          age: consultations[0]?.patient.age,
          sexe: consultations[0]?.patient.sexe,
          constantesVitales,
          signesVitauxConsultation:
            consultations[0]?.formulaireClinique?.signesVitaux,
        })
      );
      const ok = await imprimerHistoriqueDossierPdf({
        patient: patient.nomComplet,
        numeroDossier: patient.numeroDossier,
        telephone: patient.telephone,
        age: consultations[0]?.patient.age,
        sexe: consultations[0]?.patient.sexe,
        consultations: consultPdf,
        ordonnances: ordPdf,
        differences: diffs,
        comparaisonLibelle,
      });
      if (!ok) setErreur("Impossible de générer le PDF historique.");
    } finally {
      setPdfEnCours(null);
    }
  }

  if (!patient) return null;

  const formater = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-historique-patient"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gris-bordure bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gris-bordure px-4 py-3">
          <div>
            <h2
              id="titre-historique-patient"
              className="text-lg font-bold text-texte-principal"
            >
              Historique médical
            </h2>
            <p className="text-sm text-texte-secondaire">
              {patient.nomComplet} · {patient.numeroDossier}
            </p>
          </div>
          <button
            type="button"
            onClick={onFermer}
            className="rounded-lg border border-gris-bordure p-2 hover:bg-gris-tres-clair"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
          {chargement ? (
            <div className="flex items-center gap-2 text-sm text-texte-secondaire">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement de l&apos;historique…
            </div>
          ) : null}
          {erreur ? <p className="text-sm text-red-600">{erreur}</p> : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pdfEnCours === "synthese" || chargement}
              onClick={() => void pdfSynthese()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-bleu-medical px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {pdfEnCours === "synthese" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              PDF historique + comparaisons
            </button>
          </div>

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase text-texte-secondaire">
              <Stethoscope className="h-4 w-4 text-bleu-medical" />
              Consultations ({consultations.length})
            </h3>
            {consultations.length === 0 ? (
              <p className="text-sm text-texte-secondaire">Aucune consultation.</p>
            ) : (
              <ul className="space-y-2">
                {consultations.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gris-bordure px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-texte-principal">
                        {c.motif || "Consultation"}
                      </p>
                      <p className="text-xs text-texte-secondaire">
                        {formater(c.debutLe)} · {c.medecin}
                        {c.finLe ? " · clôturée" : " · ouverte"}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={pdfEnCours === c.id}
                      onClick={() => void pdfConsultation(c)}
                      className="inline-flex items-center gap-1 rounded-lg bg-bleu-medical px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      {pdfEnCours === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      PDF
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase text-texte-secondaire">
              <Pill className="h-4 w-4 text-bleu-medical" />
              Ordonnances ({ordonnances.length})
            </h3>
            {ordonnances.length === 0 ? (
              <p className="text-sm text-texte-secondaire">Aucune ordonnance.</p>
            ) : (
              <ul className="space-y-2">
                {ordonnances.map((o) => (
                  <li
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gris-bordure px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-texte-principal">
                        Ordonnance · {o.lignes.length} médicament(s)
                      </p>
                      <p className="text-xs text-texte-secondaire">
                        {formater(o.prescritLe)} · {o.medecin}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={pdfEnCours === o.id}
                      onClick={() => void pdfOrdonnance(o)}
                      className="inline-flex items-center gap-1 rounded-lg border border-bleu-medical bg-white px-2.5 py-1.5 text-xs font-medium text-bleu-medical disabled:opacity-50"
                    >
                      {pdfEnCours === o.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      PDF
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase text-amber-900">
              <GitCompare className="h-4 w-4" />
              Comparaison
            </h3>
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              {consultations.length >= 2 ? (
                <>
                  <label className="text-xs">
                    Consultation A
                    <select
                      className="mt-1 w-full rounded-lg border border-gris-bordure bg-white px-2 py-1.5 text-sm"
                      value={consultA}
                      onChange={(e) => setConsultA(e.target.value)}
                    >
                      {consultations.map((c) => (
                        <option key={c.id} value={c.id}>
                          {formater(c.debutLe)} — {c.motif.slice(0, 40)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs">
                    Consultation B
                    <select
                      className="mt-1 w-full rounded-lg border border-gris-bordure bg-white px-2 py-1.5 text-sm"
                      value={consultB}
                      onChange={(e) => setConsultB(e.target.value)}
                    >
                      {consultations.map((c) => (
                        <option key={c.id} value={c.id}>
                          {formater(c.debutLe)} — {c.motif.slice(0, 40)}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : null}
              {ordonnances.length >= 2 ? (
                <>
                  <label className="text-xs">
                    Ordonnance A
                    <select
                      className="mt-1 w-full rounded-lg border border-gris-bordure bg-white px-2 py-1.5 text-sm"
                      value={ordA}
                      onChange={(e) => setOrdA(e.target.value)}
                    >
                      {ordonnances.map((o) => (
                        <option key={o.id} value={o.id}>
                          {formater(o.prescritLe)} — {o.lignes.length} méd.
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs">
                    Ordonnance B
                    <select
                      className="mt-1 w-full rounded-lg border border-gris-bordure bg-white px-2 py-1.5 text-sm"
                      value={ordB}
                      onChange={(e) => setOrdB(e.target.value)}
                    >
                      {ordonnances.map((o) => (
                        <option key={o.id} value={o.id}>
                          {formater(o.prescritLe)} — {o.lignes.length} méd.
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : null}
            </div>
            {diffs.length === 0 ? (
              <p className="text-xs text-texte-secondaire">
                Sélectionnez deux actes pour afficher les différences, ou un seul
                acte disponible.
              </p>
            ) : (
              <ul className="max-h-48 space-y-1 overflow-y-auto text-xs">
                {diffs.map((d, i) => (
                  <li
                    key={`${d.champ}-${i}`}
                    className={cn(
                      "rounded-md px-2 py-1",
                      d.type === "ajoute" && "bg-emerald-50 text-emerald-800",
                      d.type === "retire" && "bg-red-50 text-red-800",
                      d.type === "modifie" && "bg-amber-100 text-amber-900"
                    )}
                  >
                    <span className="font-semibold">
                      [{d.domaine}] {d.champ}
                    </span>
                    {" — "}
                    {d.type === "ajoute"
                      ? `Ajouté : ${d.apres}`
                      : d.type === "retire"
                        ? `Retiré : ${d.avant}`
                        : `${d.avant || "—"} → ${d.apres || "—"}`}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
