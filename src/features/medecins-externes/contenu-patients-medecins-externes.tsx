"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Search, Users } from "lucide-react";
import { CaseCocheLigne } from "@/components/ui/case-coche-ligne";
import { EVENEMENT_MEDECINS_EXTERNES_PATIENTS_MODIFIES } from "@/constants/medecins-externes";
import {
  MiseEnPageMedecinsExternes,
  type UtilisateurMedecinsExternes,
} from "@/features/medecins-externes/mise-en-page-medecins-externes";
import { MenuActionsTransfertMedecinsExternes } from "@/features/medecins-externes/menu-actions-transfert-medecins-externes";
import {
  PanneauDroitMedecinsExternes,
  SectionsMobileMedecinsExternesPatients,
} from "@/features/medecins-externes/panneau-droit-medecins-externes";
import { useSelectionMedecinsExternes } from "@/features/medecins-externes/contexte-selection-medecins-externes";
import type { PatientFileMedecinsExternes } from "@/lib/medecins-externes/types";
import { cn } from "@/lib/utils";

interface PropsContenuPatientsMedecinsExternes {
  utilisateur: UtilisateurMedecinsExternes;
}

function ListePatientsInterne({
  patients,
  chargement,
  erreur,
  recherche,
  setRecherche,
  onRafraichir,
}: {
  patients: PatientFileMedecinsExternes[];
  chargement: boolean;
  erreur: string | null;
  recherche: string;
  setRecherche: (v: string) => void;
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
  } = useSelectionMedecinsExternes();

  const filtrés = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      [p.nomComplet, p.telephone, p.numeroDossier, p.numeroPatient, p.motif]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [patients, recherche]);

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
              ? t("medecinsExternes.patients.sousTitreListeSelection", {
                  count: filtrés.length,
                  selection: dossiersCoches.length,
                })
              : t("medecinsExternes.patients.sousTitreListe", { count: filtrés.length })}
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("medecinsExternes.patients.recherche")}
            className="w-full rounded-xl border border-gris-bordure bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-bleu-medical focus:ring-2 focus:ring-bleu-medical/20"
          />
        </div>
      </div>

      {chargement ? (
        <div className="flex items-center gap-2 py-10 text-sm text-texte-secondaire">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("medecinsExternes.patients.chargement")}
        </div>
      ) : erreur ? (
        <p className="text-sm text-red-600">{erreur}</p>
      ) : filtrés.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-4 py-10 text-center">
          <p className="text-sm font-medium text-texte-principal">
            {t("medecinsExternes.patients.vide")}
          </p>
          <p className="mt-1 text-xs text-texte-secondaire">
            {t("medecinsExternes.patients.videAide")}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm lg:block">
            <table className="w-full text-left text-sm">
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
                      ariaLabel={t("medecinsExternes.patients.selectionnerTout")}
                    />
                  </th>
                  <th className="px-3 py-3">{t("medecinsExternes.patients.colonnes.ordre")}</th>
                  <th className="px-3 py-3">{t("medecinsExternes.patients.colonnes.patient")}</th>
                  <th className="px-3 py-3">{t("medecinsExternes.patients.colonnes.motif")}</th>
                  <th className="px-3 py-3">{t("medecinsExternes.patients.colonnes.provenance")}</th>
                  <th className="px-3 py-3">{t("medecinsExternes.patients.colonnes.orientation")}</th>
                  <th className="px-3 py-3">{t("medecinsExternes.patients.colonnes.statut")}</th>
                  <th className="px-3 py-3">{t("medecinsExternes.patients.colonnes.heure")}</th>
                  <th className="px-3 py-3">{t("medecinsExternes.patients.colonnes.actions")}</th>
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
                        <MenuActionsTransfertMedecinsExternes
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
          <ul className="space-y-3 lg:hidden">
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
                            <MenuActionsTransfertMedecinsExternes
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

export function ContenuPatientsMedecinsExternes({ utilisateur }: PropsContenuPatientsMedecinsExternes) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<PatientFileMedecinsExternes[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/medecins-externes/patients");
      const data = (await res.json()) as {
        patients?: PatientFileMedecinsExternes[];
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("medecinsExternes.patients.erreur"));
        setPatients([]);
        return;
      }
      setPatients(data.patients ?? []);
    } catch {
      setErreur(t("medecinsExternes.patients.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    const onModifie = () => void charger();
    window.addEventListener(EVENEMENT_MEDECINS_EXTERNES_PATIENTS_MODIFIES, onModifie);
    return () =>
      window.removeEventListener(EVENEMENT_MEDECINS_EXTERNES_PATIENTS_MODIFIES, onModifie);
  }, [charger]);

  return (
    <MiseEnPageMedecinsExternes
      utilisateur={utilisateur}
      titre={t("medecinsExternes.patients.titre")}
      sousTitre={t("medecinsExternes.patients.sousTitre")}
      panneauDroit={<PanneauDroitMedecinsExternes />}
      activerSelection
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-4 lg:space-y-5">
        <div>
          <p className="text-xs text-texte-secondaire">
            {t("medecinsExternes.layout.titre")} &gt; {t("medecinsExternes.patients.fil")}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Users className="h-5 w-5 text-bleu-medical" />
            <h2 className="text-xl font-bold text-texte-principal sm:text-2xl">
              {t("medecinsExternes.patients.titre")}
            </h2>
          </div>
          <p className="mt-1 text-sm text-texte-secondaire">
            {t("medecinsExternes.patients.description")}
          </p>
        </div>

        <ListePatientsInterne
          patients={patients}
          chargement={chargement}
          erreur={erreur}
          recherche={recherche}
          setRecherche={setRecherche}
          onRafraichir={charger}
        />
        <SectionsMobileMedecinsExternesPatients />
      </div>
    </MiseEnPageMedecinsExternes>
  );
}
