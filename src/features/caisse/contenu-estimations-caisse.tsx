"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ClipboardList } from "lucide-react";
import {
  MiseEnPageCaisse,
  type UtilisateurCaisse,
} from "@/features/caisse/mise-en-page-caisse";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";

const PAR_PAGE = 15;

interface EstimationCaisse {
  id: string;
  numeroPatient: string;
  nomComplet: string;
  typeEstimation: "CONVENTION_EGLISE" | "MEDECIN_EXTERNE";
  libelleSource: string | null;
  nomConvention: string | null;
  totalPatientUsd: number;
  honoraireUsd: number;
  honorairePct: number;
  emetteurNom: string;
  emisLe: string;
  envoyeCaisseLe: string | null;
  traiteLe: string | null;
  traiteParNom: string | null;
  statut: string;
}

function formaterUsd(n: number) {
  return `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function libelleType(type: EstimationCaisse["typeEstimation"]) {
  return type === "MEDECIN_EXTERNE" ? "Médecin externe" : "Service conventionné";
}

export function ContenuEstimationsCaisse({
  utilisateur,
}: {
  utilisateur: UtilisateurCaisse;
}) {
  const { t } = useTranslation();
  const [estimations, setEstimations] = useState<EstimationCaisse[]>([]);
  const [selection, setSelection] = useState<EstimationCaisse | null>(null);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const res = await fetch("/api/caisse/estimations");
      const data = (await res.json()) as { estimations?: EstimationCaisse[] };
      setEstimations(data.estimations ?? []);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  const approuverPaiement = async (id: string) => {
    setEnCours(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/caisse/estimations/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approuver-honoraires" }),
      });
      const data = (await res.json()) as {
        message?: string;
        estimation?: EstimationCaisse;
      };
      if (!res.ok) throw new Error(data.message ?? "Erreur.");
      setMessage(data.message ?? "Paiement approuvé.");
      if (data.estimation) {
        setSelection(data.estimation);
        setEstimations((prev) =>
          prev.map((e) => (e.id === data.estimation!.id ? data.estimation! : e))
        );
      } else {
        await charger();
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setEnCours(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(estimations.length / PAR_PAGE));
  const debut = (page - 1) * PAR_PAGE;
  const pageItems = estimations.slice(debut, debut + PAR_PAGE);

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre="Estimations honoraires"
      sousTitre="Documents transmis par le service conventionné et les médecins externes"
      panneauDroit={
        selection ? (
          <div className="space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
              Récapitulatif honoraires
            </h2>
            <p className="text-xs text-texte-secondaire">Émetteur</p>
            <p className="text-sm font-semibold">{selection.emetteurNom}</p>
            <p className="text-xs text-texte-secondaire">
              Source : {libelleType(selection.typeEstimation)}
            </p>
            <p className="text-xs text-texte-secondaire">
              {selection.typeEstimation === "MEDECIN_EXTERNE"
                ? `Médecin : ${selection.libelleSource || "—"}`
                : `Convention : ${selection.nomConvention || selection.libelleSource || "—"}`}
            </p>
            <hr />
            <p className="text-sm">
              Total patient :{" "}
              <strong>{formaterUsd(selection.totalPatientUsd)}</strong>
            </p>
            <p className="text-sm text-emerald-700">
              Honoraires dus ({selection.honorairePct} %) :{" "}
              <strong>{formaterUsd(selection.honoraireUsd)}</strong>
            </p>
            <p className="text-xs text-texte-secondaire">
              Statut : {selection.statut.replace("_", " ")}
            </p>
            {selection.traiteLe && (
              <p className="text-xs text-emerald-700">
                Approuvé le {new Date(selection.traiteLe).toLocaleString("fr-FR")}
                {selection.traiteParNom ? ` par ${selection.traiteParNom}` : ""}
              </p>
            )}
            <a
              href={`/api/caisse/estimations/${selection.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full justify-center rounded-lg bg-bleu-medical px-3 py-2 text-sm text-white"
            >
              Voir le PDF
            </a>
            {selection.statut === "ENVOYEE_CAISSE" && (
              <Bouton
                taille="petit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={enCours}
                onClick={() => void approuverPaiement(selection.id)}
              >
                <Check className="mr-1 h-4 w-4" />
                Approuver le paiement
              </Bouton>
            )}
            {message && <p className="text-xs text-emerald-700">{message}</p>}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-4 text-sm text-texte-secondaire">
            Sélectionnez une estimation pour voir le détail et le PDF.
          </p>
        )
      }
    >
      <div className="mx-auto max-w-[1200px] space-y-4">
        <EnTetePageReception
          icone={ClipboardList}
          titre="Voir estimations"
          description="Estimations PDF reçues (conventionnés et médecins externes)"
          fil={[
            { label: "Caisse", href: "/sigh/caisse" },
            { label: "Estimations" },
          ]}
        />
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gris-tres-clair text-left text-xs uppercase text-texte-secondaire">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Émetteur</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Honoraire</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {chargement ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    Chargement…
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-texte-secondaire">
                    Aucune estimation reçue.
                  </td>
                </tr>
              ) : (
                pageItems.map((e) => (
                  <tr
                    key={e.id}
                    className={`cursor-pointer border-t hover:bg-gris-tres-clair ${
                      selection?.id === e.id ? "bg-bleu-medical-clair/30" : ""
                    }`}
                    onClick={() => {
                      setSelection(e);
                      setMessage(null);
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{e.nomComplet}</div>
                      <div className="text-xs text-texte-secondaire">{e.numeroPatient}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{libelleType(e.typeEstimation)}</div>
                      <div className="text-xs text-texte-secondaire">
                        {e.libelleSource || e.nomConvention || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">{e.emetteurNom}</td>
                    <td className="px-4 py-3">{formaterUsd(e.totalPatientUsd)}</td>
                    <td className="px-4 py-3">
                      {formaterUsd(e.honoraireUsd)}{" "}
                      <span className="text-xs text-texte-secondaire">({e.honorairePct} %)</span>
                    </td>
                    <td className="px-4 py-3">{e.statut.replace("_", " ")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {estimations.length > PAR_PAGE && (
            <div className="flex justify-between border-t px-4 py-2 text-xs">
              <span>
                {debut + 1}–{Math.min(debut + PAR_PAGE, estimations.length)} /{" "}
                {estimations.length}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded border px-2 py-1 disabled:opacity-40"
                >
                  Préc.
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border px-2 py-1 disabled:opacity-40"
                >
                  Suiv.
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MiseEnPageCaisse>
  );
}
