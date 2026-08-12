"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, SlidersHorizontal, Users } from "lucide-react";
import { BoutonsOutilsListe } from "@/components/ui/boutons-outils-liste";
import { CaseCocheLigne } from "@/components/ui/case-coche-ligne";
import { EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES } from "@/constants/infirmiers";
import {
  compterFiltresActifs,
  FILTRES_FACTURATION_VIDES,
  FormulaireFiltresFacturationCaisse,
  type FiltresFacturationCaisse,
} from "@/features/caisse/formulaire-filtres-facturation-caisse";
import {
  MiseEnPageInfirmiers,
  type UtilisateurInfirmiers,
} from "@/features/infirmiers/mise-en-page-infirmiers";
import { MenuActionsTransfertInfirmiers } from "@/features/infirmiers/menu-actions-transfert-infirmiers";
import {
  PanneauDroitInfirmiers,
  SectionsMobileInfirmiersPatients,
} from "@/features/infirmiers/panneau-droit-infirmiers";
import { useSelectionInfirmiers } from "@/features/infirmiers/contexte-selection-infirmiers";
import type { PatientFileInfirmiers } from "@/lib/infirmiers/types";
import { cn } from "@/lib/utils";

interface PropsContenuPatientsInfirmiers {
  utilisateur: UtilisateurInfirmiers;
}

function patientCorrespondFiltres(
  p: PatientFileInfirmiers,
  f: FiltresFacturationCaisse
): boolean {
  const nom = f.nom.trim().toLowerCase();
  const prenom = f.prenom.trim().toLowerCase();
  const tel = f.telephone.trim().toLowerCase();
  const enreg = f.numeroEnreg.trim().toLowerCase();
  const idEntite = f.idEntite.trim().toLowerCase();
  if (nom && !`${p.nom} ${p.nomComplet}`.toLowerCase().includes(nom)) return false;
  if (prenom && !`${p.prenom} ${p.nomComplet}`.toLowerCase().includes(prenom))
    return false;
  if (tel && !(p.telephone || "").toLowerCase().includes(tel)) return false;
  if (
    enreg &&
    !(p.numeroDossier || "").toLowerCase().includes(enreg) &&
    !(p.numeroPatient || "").toLowerCase().includes(enreg)
  ) {
    return false;
  }
  if (
    idEntite &&
    !(p.numeroPatient || "").toLowerCase().includes(idEntite) &&
    !(p.dossierId || "").toLowerCase().includes(idEntite)
  ) {
    return false;
  }
  return true;
}

function ListePatientsInterne({
  patients,
  chargement,
  erreur,
  onRafraichir,
}: {
  patients: PatientFileInfirmiers[];
  chargement: boolean;
  erreur: string | null;
  onRafraichir: () => void;
}) {
  const { t } = useTranslation();
  const {
    patientSelectionne,
    selectionnerPatient,
    dossiersCoches,
    basculerDossierCoche,
    definirCoches,
    synchroniserSelection,
  } = useSelectionInfirmiers();

  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );
  const [filtresAppliques, setFiltresAppliques] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );

  const filtrés = useMemo(
    () => patients.filter((p) => patientCorrespondFiltres(p, filtresAppliques)),
    [patients, filtresAppliques]
  );

  const nbFiltresActifs = compterFiltresActifs(filtresAppliques, {
    ignorerNumeroFacture: true,
  });

  useEffect(() => {
    synchroniserSelection(patients);
  }, [patients, synchroniserSelection]);

  const tousCoches =
    filtrés.length > 0 && filtrés.every((p) => dossiersCoches.includes(p.dossierId));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-texte-secondaire">
            {dossiersCoches.length > 0
              ? t("infirmiers.patients.sousTitreListeSelection", {
                  count: filtrés.length,
                  selection: dossiersCoches.length,
                })
              : t("infirmiers.patients.sousTitreListe", { count: filtrés.length })}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setFiltresOuverts((o) => !o)}
            aria-expanded={filtresOuverts}
            aria-label={
              filtresOuverts
                ? t("caisse.facturation.fermerFiltres")
                : t("caisse.facturation.ouvrirFiltres")
            }
            className={cn(
              "relative inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors",
              filtresOuverts
                ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
            )}
          >
            <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
            <span
              className={cn(
                "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm",
                nbFiltresActifs > 0 ? "bg-red-500" : "bg-slate-400"
              )}
            >
              {nbFiltresActifs}
            </span>
          </button>
          <BoutonsOutilsListe
            toutSelectionne={tousCoches}
            onSelectionnerTout={() =>
              definirCoches(
                filtrés.map((p) => p.dossierId),
                !tousCoches
              )
            }
            onExporter={() => {
              const ids =
                dossiersCoches.length > 0
                  ? dossiersCoches
                  : filtrés.map((p) => p.dossierId);
              const lignes = patients.filter((p) => ids.includes(p.dossierId));
              const csv = [
                "numero;nom;prenom;telephone;motif;statut;heure",
                ...lignes.map(
                  (p) =>
                    `${p.numeroPatient};${p.nom};${p.prenom};${p.telephone};${p.motif};${p.statut};${p.heure}`
                ),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "patients-infirmiers.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            labelSelectionnerTout={t("infirmiers.patients.selectionnerTout")}
            labelExporter={t("caisse.transferts.exporterSelection")}
          />
        </div>
      </div>

      {filtresOuverts ? (
        <FormulaireFiltresFacturationCaisse
          valeurs={brouillonFiltres}
          onChange={setBrouillonFiltres}
          onRechercher={() => {
            setFiltresAppliques(brouillonFiltres);
            setFiltresOuverts(false);
          }}
          onReinitialiser={() => {
            setBrouillonFiltres(FILTRES_FACTURATION_VIDES);
            setFiltresAppliques(FILTRES_FACTURATION_VIDES);
          }}
          idPrefix="filtre-patients-infirmiers"
          masquerNumeroFacture
        />
      ) : null}

      {chargement ? (
        <div className="flex items-center gap-2 py-10 text-sm text-texte-secondaire">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("infirmiers.patients.chargement")}
        </div>
      ) : erreur ? (
        <p className="text-sm text-red-600">{erreur}</p>
      ) : filtrés.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-4 py-10 text-center">
          <p className="text-sm font-medium text-texte-principal">
            {t("infirmiers.patients.vide")}
          </p>
          <p className="mt-1 text-xs text-texte-secondaire">
            {t("infirmiers.patients.videAide")}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm xl:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-gris-bordure bg-gris-tres-clair/60 text-xs uppercase tracking-wide text-texte-secondaire">
                <tr>
                  <th className="px-3 py-3">
                    <CaseCocheLigne
                      coche={tousCoches}
                      onChange={(coche) =>
                        definirCoches(
                          filtrés.map((p) => p.dossierId),
                          coche
                        )
                      }
                      ariaLabel={t("infirmiers.patients.selectionnerTout")}
                    />
                  </th>
                  <th className="px-3 py-3">{t("infirmiers.patients.colonnes.ordre")}</th>
                  <th className="px-3 py-3">{t("infirmiers.patients.colonnes.patient")}</th>
                  <th className="px-3 py-3">{t("infirmiers.patients.colonnes.motif")}</th>
                  <th className="px-3 py-3">{t("infirmiers.patients.colonnes.provenance")}</th>
                  <th className="px-3 py-3">{t("infirmiers.patients.colonnes.orientation")}</th>
                  <th className="px-3 py-3">{t("infirmiers.patients.colonnes.statut")}</th>
                  <th className="px-3 py-3">{t("infirmiers.patients.colonnes.heure")}</th>
                  <th className="px-3 py-3">{t("infirmiers.patients.colonnes.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtrés.map((p) => {
                  const selectionne = patientSelectionne?.dossierId === p.dossierId;
                  return (
                    <tr
                      key={p.cleListe}
                      onClick={() => selectionnerPatient(p)}
                      className={cn(
                        "cursor-pointer border-b border-gris-bordure/70 transition-colors hover:bg-bleu-medical-clair/20",
                        selectionne && "bg-bleu-medical-clair/40"
                      )}
                    >
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <CaseCocheLigne
                          coche={dossiersCoches.includes(p.dossierId)}
                          onChange={() => basculerDossierCoche(p.dossierId)}
                          ariaLabel={p.nomComplet}
                        />
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">{p.numeroOrdre}</td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-texte-principal">{p.nomComplet}</p>
                        <p className="font-mono text-[11px] text-texte-secondaire">
                          {p.numeroPatient}
                        </p>
                      </td>
                      <td className="max-w-[10rem] truncate px-3 py-3 text-texte-secondaire">
                        {p.motif}
                      </td>
                      <td className="px-3 py-3 text-texte-secondaire">{p.provenance}</td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            p.orientationCouleur
                          )}
                        >
                          {p.orientation}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            p.statutCouleur
                          )}
                        >
                          {p.statut}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-texte-secondaire">{p.heure}</td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <MenuActionsTransfertInfirmiers
                          patient={p}
                          onRafraichir={onRafraichir}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 xl:hidden">
            {filtrés.map((p) => {
              const selectionne = patientSelectionne?.dossierId === p.dossierId;
              return (
                <li key={p.cleListe}>
                  <button
                    type="button"
                    onClick={() => selectionnerPatient(p)}
                    className={cn(
                      "w-full rounded-xl border bg-white p-4 text-left shadow-sm transition-colors",
                      selectionne
                        ? "border-bleu-medical bg-bleu-medical-clair/30"
                        : "border-gris-bordure"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <CaseCocheLigne
                        coche={dossiersCoches.includes(p.dossierId)}
                        onChange={() => basculerDossierCoche(p.dossierId)}
                        ariaLabel={p.nomComplet}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-texte-principal">
                              {p.nomComplet}
                            </p>
                            <p className="font-mono text-[11px] text-texte-secondaire">
                              {p.numeroPatient} · #{p.numeroOrdre}
                            </p>
                          </div>
                          <span onClick={(e) => e.stopPropagation()}>
                            <MenuActionsTransfertInfirmiers
                              patient={p}
                              onRafraichir={onRafraichir}
                            />
                          </span>
                        </div>
                        <p className="mt-2 truncate text-xs text-texte-secondaire">
                          {p.motif}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-medium",
                              p.orientationCouleur
                            )}
                          >
                            {p.orientation}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-medium",
                              p.statutCouleur
                            )}
                          >
                            {p.statut}
                          </span>
                          <span className="text-[11px] text-texte-secondaire">
                            {p.heure}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

export function ContenuPatientsInfirmiers({ utilisateur }: PropsContenuPatientsInfirmiers) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<PatientFileInfirmiers[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/infirmiers/patients");
      const data = (await res.json()) as {
        patients?: PatientFileInfirmiers[];
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("infirmiers.patients.erreur"));
        setPatients([]);
        return;
      }
      setPatients(data.patients ?? []);
    } catch {
      setErreur(t("infirmiers.patients.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    const onModifie = () => void charger();
    window.addEventListener(EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES, onModifie);
    return () =>
      window.removeEventListener(EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES, onModifie);
  }, [charger]);

  return (
    <MiseEnPageInfirmiers
      utilisateur={utilisateur}
      titre={t("infirmiers.patients.titre")}
      sousTitre={t("infirmiers.patients.sousTitre")}
      panneauDroit={<PanneauDroitInfirmiers />}
      activerSelection
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-4 lg:space-y-5">
        <div>
          <p className="text-xs text-texte-secondaire">
            {t("infirmiers.layout.titre")} &gt; {t("infirmiers.patients.fil")}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Users className="h-5 w-5 text-bleu-medical" />
            <h2 className="text-xl font-bold text-texte-principal sm:text-2xl">
              {t("infirmiers.patients.titre")}
            </h2>
          </div>
          <p className="mt-1 text-sm text-texte-secondaire">
            {t("infirmiers.patients.description")}
          </p>
        </div>

        <ListePatientsInterne
          patients={patients}
          chargement={chargement}
          erreur={erreur}
          onRafraichir={charger}
        />
        <SectionsMobileInfirmiersPatients />
      </div>
    </MiseEnPageInfirmiers>
  );
}
