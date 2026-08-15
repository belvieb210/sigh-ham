"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Check, ClipboardList } from "lucide-react";
import { BadgeTypePersonneCaisse } from "@/features/caisse/badge-type-personne-caisse";
import {
  MiseEnPageCaisse,
  type UtilisateurCaisse,
} from "@/features/caisse/mise-en-page-caisse";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
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

interface EstimationCaisse {
  id: string;
  dossierId?: string;
  numeroPatient: string;
  numeroDossier?: string;
  nomComplet: string;
  typeEstimation: "CONVENTION_EGLISE" | "MEDECIN_EXTERNE" | "PHARMACIE_CLIENT";
  libelleSource: string | null;
  nomConvention: string | null;
  totalPatientUsd: number;
  montantCdf?: number;
  honoraireUsd: number;
  honorairePct: number;
  emetteurNom: string;
  emisLe: string;
  envoyeCaisseLe: string | null;
  traiteLe: string | null;
  traiteParNom: string | null;
  statut: string;
  numeroFacture?: string | null;
  nbMedicaments?: number;
  estClientWalkIn?: boolean;
}

function formaterUsd(n: number) {
  return `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formaterCdf(n: number) {
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FC`;
}

function libelleType(type: EstimationCaisse["typeEstimation"]) {
  if (type === "MEDECIN_EXTERNE") return "Médecin externe";
  if (type === "PHARMACIE_CLIENT") return "Client pharmacie";
  return "Service conventionné";
}

function estEstimationPharmacieClient(e: EstimationCaisse) {
  return e.typeEstimation === "PHARMACIE_CLIENT";
}

export function ContenuEstimationsCaisse({
  utilisateur,
}: {
  utilisateur: UtilisateurCaisse;
}) {
  const { t } = useTranslation();
  const [estimations, setEstimations] = useState<EstimationCaisse[]>([]);
  const [selection, setSelection] = useState<EstimationCaisse[]>([]);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresEstimations>(FILTRES_ESTIMATIONS_VIDES);
  const [appliques, setAppliques] = useState<FiltresEstimations>(FILTRES_ESTIMATIONS_VIDES);

  const idsSelection = new Set(selection.map((s) => s.id));
  const panneau = selection.length === 1 ? selection[0]! : null;

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

  const estimationsFiltrees = useMemo(
    () =>
      estimations.filter((e) =>
        estimationCorrespondFiltres(
          {
            ...e,
            libelleSource: e.libelleSource ?? e.nomConvention,
          },
          appliques,
          { avecType: true }
        )
      ),
    [estimations, appliques]
  );

  const nbFiltres = compterFiltresEstimations(appliques, { avecType: true });
  const totalPages = Math.max(1, Math.ceil(estimationsFiltrees.length / PAR_PAGE));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * PAR_PAGE;
  const pageItems = estimationsFiltrees.slice(debut, debut + PAR_PAGE);

  const toutSelectionne =
    estimationsFiltrees.length > 0 &&
    estimationsFiltrees.every((e) => idsSelection.has(e.id));

  const basculerSelection = (item: EstimationCaisse) => {
    const next = new Set(idsSelection);
    if (next.has(item.id)) next.delete(item.id);
    else next.add(item.id);
    setSelection(estimations.filter((e) => next.has(e.id)));
    setMessage(null);
  };

  const basculerSelectionTout = () => {
    if (toutSelectionne) {
      setSelection([]);
      return;
    }
    setSelection(estimationsFiltrees);
  };

  const exporterSelection = () => {
    const coches = estimations.filter((e) => idsSelection.has(e.id));
    const cibles = coches.length > 0 ? coches : estimationsFiltrees;
    exporterEstimationsCsv(cibles, { inclureType: true, inclureMontants: true });
  };

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
        setEstimations((prev) =>
          prev.map((e) => (e.id === data.estimation!.id ? data.estimation! : e))
        );
        setSelection((prev) =>
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

  const totauxSelection = selection.reduce(
    (acc, e) => ({
      total: acc.total + e.totalPatientUsd,
      honoraire: acc.honoraire + e.honoraireUsd,
    }),
    { total: 0, honoraire: 0 }
  );

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre="Estimations honoraires"
      sousTitre="Documents transmis par le service conventionné et les médecins externes"
      panneauDroit={
        selection.length > 1 ? (
          <div className="space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
              Récapitulatif honoraires
            </h2>
            <p className="text-sm">{selection.length} estimations sélectionnées</p>
            <p className="text-sm">
              Total patients : <strong>{formaterUsd(totauxSelection.total)}</strong>
            </p>
            <p className="text-sm text-emerald-700">
              Honoraires : <strong>{formaterUsd(totauxSelection.honoraire)}</strong>
            </p>
          </div>
        ) : panneau ? (
          <div className="space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
              {estEstimationPharmacieClient(panneau)
                ? "Vente client pharmacie"
                : "Récapitulatif honoraires"}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">{panneau.nomComplet}</p>
              <BadgeTypePersonneCaisse estClientWalkIn={panneau.estClientWalkIn ?? estEstimationPharmacieClient(panneau)} />
            </div>
            <p className="text-xs text-texte-secondaire">Émetteur</p>
            <p className="text-sm font-semibold">{panneau.emetteurNom}</p>
            <p className="text-xs text-texte-secondaire">
              Source : {libelleType(panneau.typeEstimation)}
            </p>
            {estEstimationPharmacieClient(panneau) ? (
              <>
                <p className="text-xs text-texte-secondaire">
                  Facture : {panneau.numeroFacture ?? "—"}
                </p>
                <p className="text-xs text-texte-secondaire">
                  {panneau.nbMedicaments ?? 0} médicament(s)
                </p>
              </>
            ) : (
              <p className="text-xs text-texte-secondaire">
                {panneau.typeEstimation === "MEDECIN_EXTERNE"
                  ? `Médecin : ${panneau.libelleSource || "—"}`
                  : `Convention : ${panneau.nomConvention || panneau.libelleSource || "—"}`}
              </p>
            )}
            <hr />
            {estEstimationPharmacieClient(panneau) ? (
              <p className="text-sm">
                Montant :{" "}
                <strong>{formaterCdf(panneau.montantCdf ?? 0)}</strong>
              </p>
            ) : (
              <>
                <p className="text-sm">
                  Total patient : <strong>{formaterUsd(panneau.totalPatientUsd)}</strong>
                </p>
                <p className="text-sm text-emerald-700">
                  Honoraires dus ({panneau.honorairePct} %) :{" "}
                  <strong>{formaterUsd(panneau.honoraireUsd)}</strong>
                </p>
              </>
            )}
            <p className="text-xs text-texte-secondaire">
              Statut : {panneau.statut.replace("_", " ")}
            </p>
            {panneau.traiteLe && (
              <p className="text-xs text-emerald-700">
                Approuvé le {new Date(panneau.traiteLe).toLocaleString("fr-FR")}
                {panneau.traiteParNom ? ` par ${panneau.traiteParNom}` : ""}
              </p>
            )}
            {estEstimationPharmacieClient(panneau) && panneau.dossierId ? (
              <Link
                href={`/sigh/caisse/facturation?dossier=${panneau.dossierId}`}
                className="inline-flex w-full justify-center rounded-lg bg-bleu-medical px-3 py-2 text-sm text-white"
              >
                Encaisser à la facturation
              </Link>
            ) : (
              <a
                href={`/api/caisse/estimations/${panneau.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full justify-center rounded-lg bg-bleu-medical px-3 py-2 text-sm text-white"
              >
                Voir le PDF
              </a>
            )}
            {!estEstimationPharmacieClient(panneau) &&
              panneau.statut === "ENVOYEE_CAISSE" && (
              <Bouton
                taille="petit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={enCours}
                onClick={() => void approuverPaiement(panneau.id)}
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
            variante="caisse"
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

        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gris-tres-clair text-left text-xs uppercase text-texte-secondaire">
              <tr>
                <th className="w-10 px-4 py-3" />
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
                  <td colSpan={7} className="px-4 py-8 text-center">
                    Chargement…
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-texte-secondaire">
                    Aucune estimation reçue.
                  </td>
                </tr>
              ) : (
                pageItems.map((e) => (
                  <tr
                    key={e.id}
                    className={`cursor-pointer border-t hover:bg-gris-tres-clair ${
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
                      <div className="flex flex-wrap items-center gap-1.5 font-medium">
                        {e.nomComplet}
                        <BadgeTypePersonneCaisse
                          estClientWalkIn={e.estClientWalkIn ?? estEstimationPharmacieClient(e)}
                        />
                      </div>
                      <div className="text-xs text-texte-secondaire">
                        {e.estClientWalkIn || estEstimationPharmacieClient(e)
                          ? e.numeroDossier ?? e.numeroPatient
                          : e.numeroPatient}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{libelleType(e.typeEstimation)}</div>
                      <div className="text-xs text-texte-secondaire">
                        {e.libelleSource || e.nomConvention || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">{e.emetteurNom}</td>
                    <td className="px-4 py-3">
                      {estEstimationPharmacieClient(e)
                        ? formaterCdf(e.montantCdf ?? 0)
                        : formaterUsd(e.totalPatientUsd)}
                    </td>
                    <td className="px-4 py-3">
                      {estEstimationPharmacieClient(e) ? (
                        "—"
                      ) : (
                        <>
                          {formaterUsd(e.honoraireUsd)}{" "}
                          <span className="text-xs text-texte-secondaire">
                            ({e.honorairePct} %)
                          </span>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3">{e.statut.replace("_", " ")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {estimationsFiltrees.length > PAR_PAGE && (
            <div className="flex justify-between border-t px-4 py-2 text-xs">
              <span>
                {debut + 1}–{Math.min(debut + PAR_PAGE, estimationsFiltrees.length)} /{" "}
                {estimationsFiltrees.length}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pageCourante <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded border px-2 py-1 disabled:opacity-40"
                >
                  Préc.
                </button>
                <button
                  type="button"
                  disabled={pageCourante >= totalPages}
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
