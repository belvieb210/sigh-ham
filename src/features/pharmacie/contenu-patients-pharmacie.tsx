"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Search, Users } from "lucide-react";
import { CaseCocheLigne } from "@/components/ui/case-coche-ligne";
import { EVENEMENT_PHARMACIE_PATIENTS_MODIFIES } from "@/constants/pharmacie";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import { MenuActionsTransfertPharmacie } from "@/features/pharmacie/menu-actions-transfert-pharmacie";
import {
  PanneauDroitPharmacie,
  SectionsMobilePharmaciePatients,
} from "@/features/pharmacie/panneau-droit-pharmacie";
import { useSelectionPharmacie } from "@/features/pharmacie/contexte-selection-pharmacie";
import type { PatientFilePharmacie } from "@/lib/pharmacie/types";
import { cn } from "@/lib/utils";

interface PropsContenuPatientsPharmacie {
  utilisateur: UtilisateurPharmacie;
}

function ListePatientsInterne({
  patients,
  chargement,
  erreur,
  recherche,
  setRecherche,
  onRafraichir,
}: {
  patients: PatientFilePharmacie[];
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
  } = useSelectionPharmacie();

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
              ? t("pharmacie.patients.sousTitreListeSelection", {
                  count: filtrés.length,
                  selection: dossiersCoches.length,
                })
              : t("pharmacie.patients.sousTitreListe", { count: filtrés.length })}
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("pharmacie.patients.recherche")}
            className="w-full rounded-xl border border-gris-bordure bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-bleu-medical focus:ring-2 focus:ring-bleu-medical/20"
          />
        </div>
      </div>

      {chargement ? (
        <div className="flex items-center gap-2 py-10 text-sm text-texte-secondaire">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("pharmacie.patients.chargement")}
        </div>
      ) : erreur ? (
        <p className="text-sm text-red-600">{erreur}</p>
      ) : filtrés.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-4 py-10 text-center">
          <p className="text-sm font-medium text-texte-principal">
            {t("pharmacie.patients.vide")}
          </p>
          <p className="mt-1 text-xs text-texte-secondaire">
            {t("pharmacie.patients.videAide")}
          </p>
        </div>
      ) : (
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <table className="tableau-sigh">
              <thead className="border-b border-gris-bordure bg-gris-tres-clair/60 text-xs uppercase tracking-wide text-texte-secondaire">
                <tr>
                  <th className="px-2 py-1.5">
                    <CaseCocheLigne
                      coche={tousCoches}
                      onChange={(coche) =>
                        definirCoches(
                          filtrés.map((p) => p.dossierId),
                          coche
                        )
                      }
                      ariaLabel={t("pharmacie.patients.selectionnerTout")}
                    />
                  </th>
                  <th className="px-2 py-1.5">{t("pharmacie.patients.colonnes.ordre")}</th>
                  <th className="px-2 py-1.5">{t("pharmacie.patients.colonnes.patient")}</th>
                  <th className="px-2 py-1.5">{t("pharmacie.patients.colonnes.motif")}</th>
                  <th className="px-2 py-1.5">{t("pharmacie.patients.colonnes.provenance")}</th>
                  <th className="px-2 py-1.5">{t("pharmacie.patients.colonnes.orientation")}</th>
                  <th className="px-2 py-1.5">{t("pharmacie.patients.colonnes.statut")}</th>
                  <th className="px-2 py-1.5">{t("pharmacie.patients.colonnes.heure")}</th>
                  <th className="px-2 py-1.5">{t("pharmacie.patients.colonnes.actions")}</th>
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
                      <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                        <CaseCocheLigne
                          coche={dossiersCoches.includes(p.dossierId)}
                          onChange={() => basculerDossierCoche(p.dossierId)}
                          ariaLabel={p.nomComplet}
                        />
                      </td>
                      <td className="px-2 py-1.5 font-mono text-xs">{p.numeroOrdre}</td>
                      <td className="px-2 py-1.5">
                        <p className="font-medium text-texte-principal">{p.nomComplet}</p>
                        <p className="font-mono text-[11px] text-texte-secondaire">
                          {p.numeroPatient}
                        </p>
                      </td>
                      <td className="max-w-[10rem] truncate px-2 py-1.5 text-texte-secondaire">
                        {p.motif}
                      </td>
                      <td className="px-2 py-1.5 text-texte-secondaire">{p.provenance}</td>
                      <td className="px-2 py-1.5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            p.orientationCouleur
                          )}
                        >
                          {p.orientation}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            p.statutCouleur
                          )}
                        >
                          {p.statut}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-texte-secondaire">{p.heure}</td>
                      <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                        <MenuActionsTransfertPharmacie
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
      )}
    </div>
  );
}

export function ContenuPatientsPharmacie({ utilisateur }: PropsContenuPatientsPharmacie) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<PatientFilePharmacie[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/pharmacie/patients");
      const data = (await res.json()) as {
        patients?: PatientFilePharmacie[];
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("pharmacie.patients.erreur"));
        setPatients([]);
        return;
      }
      setPatients(data.patients ?? []);
    } catch {
      setErreur(t("pharmacie.patients.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    const onModifie = () => void charger();
    window.addEventListener(EVENEMENT_PHARMACIE_PATIENTS_MODIFIES, onModifie);
    return () =>
      window.removeEventListener(EVENEMENT_PHARMACIE_PATIENTS_MODIFIES, onModifie);
  }, [charger]);

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={t("pharmacie.patients.titre")}
      sousTitre={t("pharmacie.patients.sousTitre")}
      panneauDroit={<PanneauDroitPharmacie />}
      activerSelection
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-4 lg:space-y-5">
        <div>
          <p className="text-xs text-texte-secondaire">
            {t("pharmacie.layout.titre")} &gt; {t("pharmacie.patients.fil")}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Users className="h-5 w-5 text-bleu-medical" />
            <h2 className="text-xl font-bold text-texte-principal sm:text-2xl">
              {t("pharmacie.patients.titre")}
            </h2>
          </div>
          <p className="mt-1 text-sm text-texte-secondaire">
            {t("pharmacie.patients.description")}
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
        <SectionsMobilePharmaciePatients />
      </div>
    </MiseEnPagePharmacie>
  );
}
