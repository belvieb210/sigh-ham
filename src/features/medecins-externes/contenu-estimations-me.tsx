"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, Download, Send, Upload } from "lucide-react";
import {
  MiseEnPageMedecinsExternes,
  type UtilisateurMedecinsExternes,
} from "@/features/medecins-externes/mise-en-page-medecins-externes";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import {
  ESPACE_API_MEDECINS_EXTERNES,
  FournisseurEspaceApi,
} from "@/features/reception/contexte-espace-api";
import { Bouton } from "@/components/ui/bouton";
import {
  estimationCorrespondFiltres,
  type FiltresEstimations,
} from "@/features/estimations/filtres-estimations";
import {
  BarreOutilsListeEstimations,
  compterFiltresEstimations,
  exporterEstimationsCsv,
  FILTRES_ESTIMATIONS_VIDES,
  FormulaireFiltresEstimations,
} from "@/features/estimations/outils-liste-estimations";

const PAR_PAGE = 15;

interface EstimationItem {
  id: string;
  numeroPatient: string;
  nomComplet: string;
  libelleSource: string | null;
  totalPatientUsd: number;
  honoraireUsd: number;
  honorairePct: number;
  statut: string;
  emisLe: string;
  pdfUrl: string | null;
}

function formaterUsd(n: number) {
  return `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PanneauEstimationSelection({
  selection,
  totauxSelection,
  countSelection,
  message,
  onEnvoyerCaisse,
  onUploadPdf,
}: {
  selection: EstimationItem | null;
  totauxSelection: { total: number; honoraire: number };
  countSelection: number;
  message: string | null;
  onEnvoyerCaisse: (id: string) => void;
  onUploadPdf: (file: File, id: string) => void;
}) {
  const { t } = useTranslation();

  if (countSelection > 1) {
    return (
      <div className="space-y-4">
        <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t("reception.panneau.resumePatient")}
          </h2>
          <p className="text-sm">
            {t("medecinsExternes.panneau.selectionMultiple", { count: countSelection })}
          </p>
        </section>
        <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t("medecinsExternes.panneau.syntheseEstimation")}
          </h2>
          <p className="text-sm">
            {t("medecinsExternes.panneau.totalEstime")} :{" "}
            <strong>{formaterUsd(totauxSelection.total)}</strong>
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            {t("medecinsExternes.panneau.honorairesDus")} :{" "}
            <strong>{formaterUsd(totauxSelection.honoraire)}</strong>
          </p>
        </section>
        {message && <p className="text-xs text-emerald-700">{message}</p>}
      </div>
    );
  }

  if (!selection) {
    return (
      <p className="rounded-xl border border-dashed border-gris-bordure bg-white p-4 text-sm text-texte-secondaire">
        {t("medecinsExternes.panneau.aucuneEstimation")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("reception.panneau.resumePatient")}
        </h2>
        <p className="font-semibold">{selection.nomComplet}</p>
        <p className="text-xs text-texte-secondaire">{selection.numeroPatient}</p>
        <p className="mt-2 text-xs text-texte-secondaire">
          {t("medecinsExternes.estimations.medecin")} : {selection.libelleSource || "—"}
        </p>
      </section>

      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("medecinsExternes.panneau.recapitulatifHonoraires")}
        </h2>
        <p className="text-sm">
          {t("medecinsExternes.panneau.totalEstime")} :{" "}
          <strong>{formaterUsd(selection.totalPatientUsd)}</strong>
        </p>
        <p className="mt-2 text-sm text-emerald-700">
          {t("medecinsExternes.panneau.honorairesDusPct", { pct: selection.honorairePct })}{" "}
          : <strong>{formaterUsd(selection.honoraireUsd)}</strong>
        </p>
        <p className="mt-2 text-xs text-texte-secondaire">
          Statut : {selection.statut.replace("_", " ")}
        </p>
      </section>

      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          Actions rapides
        </h2>
        <div className="flex flex-col gap-2">
          <a
            href={`/api/medecins-externes/estimations/${selection.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gris-tres-clair"
          >
            <Download className="h-4 w-4" />
            {t("medecinsExternes.estimations.voirPdf")}
          </a>
          {selection.statut === "EMIS" && (
            <Bouton taille="petit" className="w-full" onClick={() => onEnvoyerCaisse(selection.id)}>
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
                if (f) onUploadPdf(f, selection.id);
              }}
            />
          </label>
        </div>
        {message && <p className="mt-2 text-xs text-emerald-700">{message}</p>}
      </section>
    </div>
  );
}

function CorpsEstimations({
  onSelectionChange,
  idsSelection,
  message,
}: {
  onSelectionChange: (items: EstimationItem[]) => void;
  idsSelection: Set<string>;
  message: string | null;
}) {
  const { t } = useTranslation();
  const [estimations, setEstimations] = useState<EstimationItem[]>([]);
  const [totaux, setTotaux] = useState({ totalPatients: 0, honoraires: 0, count: 0 });
  const [chargement, setChargement] = useState(true);
  const [page, setPage] = useState(1);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresEstimations>(FILTRES_ESTIMATIONS_VIDES);
  const [appliques, setAppliques] = useState<FiltresEstimations>(FILTRES_ESTIMATIONS_VIDES);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/medecins-externes/estimations");
      const data = (await res.json()) as {
        estimations?: EstimationItem[];
        totauxJour?: typeof totaux;
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? "Chargement impossible.");
      setEstimations(data.estimations ?? []);
      setTotaux(data.totauxJour ?? { totalPatients: 0, honoraires: 0, count: 0 });
    } catch (e) {
      setEstimations([]);
      setErreur(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  const estimationsFiltrees = useMemo(
    () => estimations.filter((e) => estimationCorrespondFiltres(e, appliques)),
    [estimations, appliques]
  );

  const nbFiltres = compterFiltresEstimations(appliques);
  const totalPages = Math.max(1, Math.ceil(estimationsFiltrees.length / PAR_PAGE));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * PAR_PAGE;
  const pageItems = estimationsFiltrees.slice(debut, debut + PAR_PAGE);

  const toutSelectionne =
    estimationsFiltrees.length > 0 &&
    estimationsFiltrees.every((e) => idsSelection.has(e.id));

  const basculerSelection = (item: EstimationItem) => {
    const next = new Set(idsSelection);
    if (next.has(item.id)) next.delete(item.id);
    else next.add(item.id);
    onSelectionChange(estimations.filter((e) => next.has(e.id)));
  };

  const basculerSelectionTout = () => {
    if (toutSelectionne) {
      onSelectionChange([]);
      return;
    }
    onSelectionChange(estimationsFiltrees);
  };

  const exporterSelection = () => {
    const coches = estimations.filter((e) => idsSelection.has(e.id));
    const cibles = coches.length > 0 ? coches : estimationsFiltrees;
    exporterEstimationsCsv(cibles, { inclureMontants: true });
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-4">
      <EnTetePageReception
        icone={ClipboardList}
        titre={t("medecinsExternes.estimations.titre")}
        description={t("medecinsExternes.estimations.description")}
        fil={[
          { label: t("medecinsExternes.layout.titre"), href: "/sigh/medecins-externes" },
          { label: t("medecinsExternes.estimations.fil") },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gris-bordure bg-white p-4">
          <p className="text-xs font-bold uppercase text-texte-secondaire">
            {t("medecinsExternes.estimations.totalJour")}
          </p>
          <p className="text-2xl font-bold text-bleu-medical">{formaterUsd(totaux.totalPatients)}</p>
        </div>
        <div className="rounded-xl border border-gris-bordure bg-white p-4">
          <p className="text-xs font-bold uppercase text-texte-secondaire">
            {t("medecinsExternes.estimations.honorairesJour")}
          </p>
          <p className="text-2xl font-bold text-emerald-700">{formaterUsd(totaux.honoraires)}</p>
        </div>
      </div>

      {erreur && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
      )}
      {message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
      )}

      <BarreOutilsListeEstimations
        filtresOuverts={filtresOuverts}
        onBasculerFiltres={() => setFiltresOuverts((o) => !o)}
        nbFiltres={nbFiltres}
        toutSelectionne={toutSelectionne}
        onSelectionnerTout={basculerSelectionTout}
        onExporter={exporterSelection}
        labelSelectionnerTout={t("reception.liste.selectionnerTout")}
        labelExporter={t("reception.liste.exporterSelection")}
      />

      {filtresOuverts && (
        <FormulaireFiltresEstimations
          valeurs={brouillon}
          onChange={setBrouillon}
          variante="emission"
          onRechercher={() => {
            setAppliques(brouillon);
            setPage(1);
          }}
          onReinitialiser={() => {
            setBrouillon(FILTRES_ESTIMATIONS_VIDES);
            setAppliques(FILTRES_ESTIMATIONS_VIDES);
            setPage(1);
          }}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gris-tres-clair text-left text-xs uppercase text-texte-secondaire">
            <tr>
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">{t("medecinsExternes.estimations.medecin")}</th>
              <th className="px-4 py-3">{t("medecinsExternes.estimations.montant")}</th>
              <th className="px-4 py-3">{t("medecinsExternes.estimations.honoraire")}</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {chargement ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-texte-secondaire">
                  {t("medecinsExternes.common.chargement")}
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-texte-secondaire">
                  {t("medecinsExternes.estimations.vide")}
                </td>
              </tr>
            ) : (
              pageItems.map((e) => (
                <tr
                  key={e.id}
                  className={`cursor-pointer border-t border-gris-bordure hover:bg-gris-tres-clair ${
                    idsSelection.has(e.id) ? "bg-bleu-medical-clair/30" : ""
                  }`}
                  onClick={() => basculerSelection(e)}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={idsSelection.has(e.id)}
                      onChange={() => basculerSelection(e)}
                      onClick={(ev) => ev.stopPropagation()}
                      className="rounded border-gris-bordure"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{e.nomComplet}</div>
                    <div className="text-xs text-texte-secondaire">{e.numeroPatient}</div>
                  </td>
                  <td className="px-4 py-3">{e.libelleSource || "—"}</td>
                  <td className="px-4 py-3">{formaterUsd(e.totalPatientUsd)}</td>
                  <td className="px-4 py-3 text-emerald-700">{formaterUsd(e.honoraireUsd)}</td>
                  <td className="px-4 py-3">{e.statut.replace("_", " ")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {estimationsFiltrees.length > PAR_PAGE && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs">
            <span>
              {debut + 1}–{Math.min(debut + PAR_PAGE, estimationsFiltrees.length)} /{" "}
              {estimationsFiltrees.length}
            </span>
            <div className="flex gap-2">
              <Bouton
                variante="contour"
                taille="petit"
                disabled={pageCourante <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Préc.
              </Bouton>
              <Bouton
                variante="contour"
                taille="petit"
                disabled={pageCourante >= totalPages}
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

export function ContenuEstimationsMedecinsExternes({
  utilisateur,
}: {
  utilisateur: UtilisateurMedecinsExternes;
}) {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<EstimationItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const idsSelection = new Set(selection.map((s) => s.id));
  const totauxSelection = selection.reduce(
    (acc, e) => ({
      total: acc.total + e.totalPatientUsd,
      honoraire: acc.honoraire + e.honoraireUsd,
    }),
    { total: 0, honoraire: 0 }
  );

  const envoyerCaisse = async (id: string) => {
    setMessage(null);
    const res = await fetch(`/api/medecins-externes/estimations/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "envoyer-caisse" }),
    });
    const data = (await res.json()) as { message?: string };
    setMessage(data.message ?? (res.ok ? "Transmis à la caisse." : "Erreur."));
  };

  const uploadPdf = async (file: File, id: string) => {
    setMessage(null);
    const form = new FormData();
    form.append("fichier", file);
    form.append("estimationId", id);
    const res = await fetch("/api/medecins-externes/estimations/upload", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { message?: string };
    setMessage(data.message ?? (res.ok ? "PDF mis à jour." : "Erreur."));
  };

  return (
    <FournisseurEspaceApi espace={ESPACE_API_MEDECINS_EXTERNES}>
      <MiseEnPageMedecinsExternes
        utilisateur={utilisateur}
        titre={t("medecinsExternes.estimations.titre")}
        sousTitre={t("medecinsExternes.layout.sousTitre")}
        panneauDroit={
          <PanneauEstimationSelection
            selection={selection.length === 1 ? selection[0]! : null}
            totauxSelection={totauxSelection}
            countSelection={selection.length}
            message={message}
            onEnvoyerCaisse={(id) => void envoyerCaisse(id)}
            onUploadPdf={(file, id) => void uploadPdf(file, id)}
          />
        }
      >
        <CorpsEstimations
          onSelectionChange={setSelection}
          idsSelection={idsSelection}
          message={message}
        />
      </MiseEnPageMedecinsExternes>
    </FournisseurEspaceApi>
  );
}
