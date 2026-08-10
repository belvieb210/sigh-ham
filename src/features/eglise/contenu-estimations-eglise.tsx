"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, Download, Send } from "lucide-react";
import {
  MiseEnPageEglise,
  type UtilisateurEglise,
} from "@/features/eglise/mise-en-page-eglise";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { ESPACE_API_EGLISE, FournisseurEspaceApi } from "@/features/reception/contexte-espace-api";
import { Bouton } from "@/components/ui/bouton";

const PAR_PAGE = 15;

interface EstimationItem {
  id: string;
  numeroPatient: string;
  nomComplet: string;
  nomConvention: string | null;
  totalPatientUsd: number;
  honoraireUsd: number;
  statut: string;
  emisLe: string;
  pdfUrl: string | null;
}

function formaterUsd(n: number) {
  return `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function CorpsEstimations() {
  const { t } = useTranslation();
  const [estimations, setEstimations] = useState<EstimationItem[]>([]);
  const [totaux, setTotaux] = useState({ totalPatients: 0, honoraires: 0, count: 0 });
  const [chargement, setChargement] = useState(true);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const res = await fetch("/api/eglise/estimations");
      const data = (await res.json()) as {
        estimations?: EstimationItem[];
        totauxJour?: typeof totaux;
      };
      if (!res.ok) throw new Error("Chargement impossible.");
      setEstimations(data.estimations ?? []);
      setTotaux(data.totauxJour ?? { totalPatients: 0, honoraires: 0, count: 0 });
    } catch {
      setEstimations([]);
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

  const envoyerCaisse = async (id: string) => {
    setMessage(null);
    const res = await fetch(`/api/eglise/estimations/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "envoyer-caisse" }),
    });
    const data = (await res.json()) as { message?: string };
    setMessage(data.message ?? (res.ok ? "Transmis." : "Erreur."));
    if (res.ok) void charger();
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-4">
      <EnTetePageReception
        icone={ClipboardList}
        titre={t("eglise.estimations.titre")}
        description={t("eglise.estimations.description")}
        fil={[
          { label: t("eglise.common.salle"), href: "/sigh/eglise" },
          { label: t("eglise.estimations.fil") },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gris-bordure bg-white p-4">
          <p className="text-xs font-bold uppercase text-texte-secondaire">
            {t("eglise.estimations.totalJour")}
          </p>
          <p className="text-2xl font-bold text-bleu-medical">
            {formaterUsd(totaux.totalPatients)}
          </p>
        </div>
        <div className="rounded-xl border border-gris-bordure bg-white p-4">
          <p className="text-xs font-bold uppercase text-texte-secondaire">
            {t("eglise.estimations.honorairesJour")}
          </p>
          <p className="text-2xl font-bold text-emerald-700">
            {formaterUsd(totaux.honoraires)}
          </p>
        </div>
      </div>

      {message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
      )}

      <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gris-tres-clair text-left text-xs uppercase text-texte-secondaire">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Convention</th>
              <th className="px-4 py-3">{t("eglise.estimations.montant")}</th>
              <th className="px-4 py-3">{t("eglise.estimations.honoraire")}</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chargement ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-texte-secondaire">
                  {t("eglise.common.chargement")}
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-texte-secondaire">
                  {t("eglise.estimations.vide")}
                </td>
              </tr>
            ) : (
              pageItems.map((e) => (
                <tr key={e.id} className="border-t border-gris-bordure">
                  <td className="px-4 py-3">
                    <div className="font-medium">{e.nomComplet}</div>
                    <div className="text-xs text-texte-secondaire">{e.numeroPatient}</div>
                  </td>
                  <td className="px-4 py-3">{e.nomConvention || "—"}</td>
                  <td className="px-4 py-3">{formaterUsd(e.totalPatientUsd)}</td>
                  <td className="px-4 py-3 text-emerald-700">{formaterUsd(e.honoraireUsd)}</td>
                  <td className="px-4 py-3">{e.statut.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/api/eglise/estimations/${e.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-gris-tres-clair"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </a>
                      {e.statut === "EMIS" && (
                        <button
                          type="button"
                          onClick={() => void envoyerCaisse(e.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-bleu-medical px-2 py-1 text-xs text-white"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Caisse
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {estimations.length > PAR_PAGE && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs">
            <span>
              {debut + 1}–{Math.min(debut + PAR_PAGE, estimations.length)} / {estimations.length}
            </span>
            <div className="flex gap-2">
              <Bouton
                variante="contour"
                taille="petit"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Préc.
              </Bouton>
              <Bouton
                variante="contour"
                taille="petit"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Suiv.
              </Bouton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ContenuEstimationsEglise({
  utilisateur,
}: {
  utilisateur: UtilisateurEglise;
}) {
  const { t } = useTranslation();
  return (
    <FournisseurEspaceApi espace={ESPACE_API_EGLISE}>
      <MiseEnPageEglise
        utilisateur={utilisateur}
        titre={t("eglise.estimations.titre")}
        sousTitre={t("eglise.layout.sousTitre")}
      >
        <CorpsEstimations />
      </MiseEnPageEglise>
    </FournisseurEspaceApi>
  );
}
