"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Download, Send, FileText, Upload } from "lucide-react";
import { AffichageResumePatient } from "@/features/reception/affichage-resume-patient";
import { useResumePatient } from "@/features/reception/contexte-resume-patient";
import { useSelectionTransfertOptionnel } from "@/features/reception/contexte-selection-transfert";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
import { Bouton } from "@/components/ui/bouton";

interface EstimationResume {
  id: string;
  totalPatientUsd: number;
  honoraireUsd: number;
  honorairePct?: number;
  statut: string;
}

function formaterUsd(n: number) {
  return `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PanneauEstimationMedecinExterne() {
  const { t } = useTranslation();
  const espace = useEspaceApi();
  const selection = useSelectionTransfertOptionnel();
  const [estimation, setEstimation] = useState<EstimationResume | null>(null);
  const [estimationsMultiples, setEstimationsMultiples] = useState<EstimationResume[]>([]);
  const [totauxSelection, setTotauxSelection] = useState({ total: 0, honoraire: 0 });
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const dossierIds = useMemo(() => {
    if ((selection?.dossiersCoches?.length ?? 0) > 0) {
      return selection!.dossiersCoches!;
    }
    const id = selection?.patientSelectionne?.dossierId;
    return id ? [id] : [];
  }, [selection?.dossiersCoches, selection?.patientSelectionne?.dossierId]);

  const chargerEstimation = useCallback(async (dossierId: string) => {
    try {
      const res = await fetch(
        `/api/medecins-externes/estimations?dossierId=${encodeURIComponent(dossierId)}`
      );
      const data = (await res.json()) as { estimation?: EstimationResume | null };
      if (res.ok && data.estimation) return data.estimation;
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  useEffect(() => {
    if (dossierIds.length !== 1) {
      setEstimation(null);
      if (dossierIds.length === 0) {
        setEstimationsMultiples([]);
        setTotauxSelection({ total: 0, honoraire: 0 });
      }
      return;
    }
    void (async () => {
      const est = await chargerEstimation(dossierIds[0]!);
      setEstimation(est);
    })();
  }, [dossierIds, chargerEstimation]);

  useEffect(() => {
    if (dossierIds.length <= 1) {
      setEstimationsMultiples([]);
      return;
    }
    void (async () => {
      const items: EstimationResume[] = [];
      let total = 0;
      let honoraire = 0;
      for (const id of dossierIds) {
        const est = await chargerEstimation(id);
        if (est) {
          items.push(est);
          total += est.totalPatientUsd;
          honoraire += est.honoraireUsd;
        }
      }
      setEstimationsMultiples(items);
      setTotauxSelection({ total, honoraire });
    })();
  }, [dossierIds, chargerEstimation]);

  const genererEstimation = async () => {
    if (dossierIds.length !== 1) return;
    setEnCours(true);
    setMessage(null);
    try {
      const res = await fetch("/api/medecins-externes/estimations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId: dossierIds[0] }),
      });
      const data = (await res.json()) as { message?: string; estimation?: EstimationResume };
      if (!res.ok) throw new Error(data.message ?? "Erreur.");
      setEstimation(data.estimation ?? null);
      setMessage(data.message ?? "Estimation créée.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setEnCours(false);
    }
  };

  const envoyerCaisse = async (estimationId: string) => {
    setEnCours(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/medecins-externes/estimations/${estimationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "envoyer-caisse" }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Erreur.");
      setMessage(data.message ?? "Transmis à la caisse.");
      window.dispatchEvent(new CustomEvent(espace.evenementPatientsModifies));
      if (dossierIds.length === 1) {
        const est = await chargerEstimation(dossierIds[0]!);
        setEstimation(est);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setEnCours(false);
    }
  };

  const uploadPdf = async (file: File, estimationId: string) => {
    setEnCours(true);
    const form = new FormData();
    form.append("fichier", file);
    form.append("estimationId", estimationId);
    try {
      const res = await fetch("/api/medecins-externes/estimations/upload", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { message?: string };
      setMessage(data.message ?? (res.ok ? "PDF mis à jour." : "Erreur."));
    } finally {
      setEnCours(false);
    }
  };

  const confirmerTransfert = async () => {
    const transfertId = selection?.patientSelectionne?.transfertId;
    if (!transfertId) return;
    setEnCours(true);
    setMessage(null);
    try {
      const res = await fetch(
        `${espace.prefixeApi}/transferts/${encodeURIComponent(transfertId)}/actions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "confirmer" }),
        }
      );
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Confirmation impossible.");
      setMessage(data.message ?? "Transfert confirmé.");
      window.dispatchEvent(new CustomEvent(espace.evenementPatientsModifies));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setEnCours(false);
    }
  };

  const peutConfirmer =
    selection?.patientSelectionne?.statutTransfert === "EN_ATTENTE" &&
    !selection?.patientSelectionne?.enRecuperation;

  const estimationsActives =
    dossierIds.length > 1 ? estimationsMultiples : estimation ? [estimation] : [];

  return (
    <>
      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("medecinsExternes.panneau.syntheseEstimation")}
        </h2>

        {dossierIds.length === 0 ? (
          <p className="text-xs text-texte-secondaire">
            {t("medecinsExternes.panneau.aucuneEstimation")}
          </p>
        ) : dossierIds.length > 1 ? (
          <div className="space-y-2 text-sm">
            <p>{t("medecinsExternes.panneau.selectionMultiple", { count: dossierIds.length })}</p>
            <p>
              {t("medecinsExternes.panneau.totalEstime")} :{" "}
              <strong>{formaterUsd(totauxSelection.total)}</strong>
            </p>
            <p className="text-emerald-700">
              {t("medecinsExternes.panneau.honorairesDus")} :{" "}
              <strong>{formaterUsd(totauxSelection.honoraire)}</strong>
            </p>
          </div>
        ) : estimation ? (
          <div className="space-y-2 text-sm">
            <p>
              {t("medecinsExternes.panneau.totalEstime")} :{" "}
              <strong>{formaterUsd(estimation.totalPatientUsd)}</strong>
            </p>
            <p className="text-emerald-700">
              {t("medecinsExternes.panneau.honorairesDusPct", {
                pct: estimation.honorairePct ?? 20,
              })}{" "}
              : <strong>{formaterUsd(estimation.honoraireUsd)}</strong>
            </p>
            <p className="text-xs text-texte-secondaire">
              Statut : {estimation.statut.replace("_", " ")}
            </p>
          </div>
        ) : (
          <Bouton taille="petit" onClick={() => void genererEstimation()} disabled={enCours}>
            <FileText className="mr-1 h-4 w-4" />
            {t("medecinsExternes.panneau.genererEstimation")}
          </Bouton>
        )}

        {message && <p className="mt-2 text-xs text-emerald-700">{message}</p>}
      </section>

      {dossierIds.length >= 1 && estimationsActives.length > 0 && (
        <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            Actions rapides
          </h2>
          <div className="flex flex-col gap-2">
            {estimationsActives.map((est) => (
              <div key={est.id} className="space-y-2 border-b border-gris-bordure pb-2 last:border-0">
                {estimationsActives.length > 1 && (
                  <p className="text-xs text-texte-secondaire">Estimation #{est.id.slice(0, 8)}</p>
                )}
                <a
                  href={`/api/medecins-externes/estimations/${est.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gris-tres-clair"
                >
                  <Download className="h-4 w-4" />
                  {t("medecinsExternes.estimations.telecharger")}
                </a>
                {est.statut === "EMIS" && (
                  <Bouton
                    taille="petit"
                    className="w-full"
                    disabled={enCours}
                    onClick={() => void envoyerCaisse(est.id)}
                  >
                    <Send className="mr-1 h-4 w-4" />
                    {t("medecinsExternes.estimations.envoyerCaisse")}
                  </Bouton>
                )}
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm hover:bg-gris-tres-clair">
                  <Upload className="h-4 w-4" />
                  {t("medecinsExternes.estimations.importerPdf")}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadPdf(f, est.id);
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        </section>
      )}

      {peutConfirmer && dossierIds.length === 1 && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-800">
            {t("medecinsExternes.panneau.confirmationTransfert")}
          </h2>
          <p className="mb-3 text-xs text-emerald-900">
            {t("medecinsExternes.panneau.confirmationTransfertAide")}
          </p>
          <Bouton
            taille="petit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={enCours}
            onClick={() => void confirmerTransfert()}
          >
            <Check className="mr-1 h-4 w-4" />
            {t("medecinsExternes.panneau.confirmerTransfert")}
          </Bouton>
        </section>
      )}
    </>
  );
}

export function PanneauDroitEstimationMedecinExterne() {
  const { t } = useTranslation();
  const { resume } = useResumePatient();

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("reception.panneau.resumePatient")}
        </h2>
        <AffichageResumePatient resume={resume} variante="complet" />
      </section>
      <PanneauEstimationMedecinExterne />
    </div>
  );
}

export function SectionsMobileEstimationMedecinExterne() {
  const { t } = useTranslation();
  const { resume } = useResumePatient();

  return (
    <div className="space-y-4 xl:hidden">
      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("reception.panneau.resumePatient")}
        </h2>
        <AffichageResumePatient resume={resume} variante="compact" />
      </section>
      <PanneauEstimationMedecinExterne />
    </div>
  );
}
