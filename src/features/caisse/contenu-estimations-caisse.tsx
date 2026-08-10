"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import {
  MiseEnPageCaisse,
  type UtilisateurCaisse,
} from "@/features/caisse/mise-en-page-caisse";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";

const PAR_PAGE = 15;

interface EstimationCaisse {
  id: string;
  numeroPatient: string;
  nomComplet: string;
  nomConvention: string | null;
  totalPatientUsd: number;
  honoraireUsd: number;
  emetteurNom: string;
  emisLe: string;
  envoyeCaisseLe: string | null;
  statut: string;
}

function formaterUsd(n: number) {
  return `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  const totalPages = Math.max(1, Math.ceil(estimations.length / PAR_PAGE));
  const debut = (page - 1) * PAR_PAGE;
  const pageItems = estimations.slice(debut, debut + PAR_PAGE);

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre="Estimations conventionnées"
      sousTitre="Documents transmis par le service conventionné"
      panneauDroit={
        selection ? (
          <div className="space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
              Récapitulatif honoraires
            </h2>
            <p className="text-xs text-texte-secondaire">Émetteur</p>
            <p className="text-sm font-semibold">{selection.emetteurNom}</p>
            <p className="text-xs text-texte-secondaire">
              Convention : {selection.nomConvention || "—"}
            </p>
            <hr />
            <p className="text-sm">
              Total patient :{" "}
              <strong>{formaterUsd(selection.totalPatientUsd)}</strong>
            </p>
            <p className="text-sm text-emerald-700">
              Honoraires dus (5 %) :{" "}
              <strong>{formaterUsd(selection.honoraireUsd)}</strong>
            </p>
            <a
              href={`/api/caisse/estimations/${selection.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full justify-center rounded-lg bg-bleu-medical px-3 py-2 text-sm text-white"
            >
              Voir le PDF
            </a>
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
          description="Estimations PDF reçues du service conventionné"
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
                <th className="px-4 py-3">Émetteur</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Honoraire 5 %</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {chargement ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    Chargement…
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-texte-secondaire">
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
                    onClick={() => setSelection(e)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{e.nomComplet}</div>
                      <div className="text-xs text-texte-secondaire">{e.numeroPatient}</div>
                    </td>
                    <td className="px-4 py-3">{e.emetteurNom}</td>
                    <td className="px-4 py-3">{formaterUsd(e.totalPatientUsd)}</td>
                    <td className="px-4 py-3">{formaterUsd(e.honoraireUsd)}</td>
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
