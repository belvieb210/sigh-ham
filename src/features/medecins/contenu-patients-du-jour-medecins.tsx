"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  Pill,
  SlidersHorizontal,
  Stethoscope,
} from "lucide-react";
import { BoutonsOutilsListe } from "@/components/ui/boutons-outils-liste";
import { PaginationListe } from "@/components/ui/pagination-liste";
import {
  compterFiltresActifs,
  FILTRES_FACTURATION_VIDES,
  FormulaireFiltresFacturationCaisse,
  type FiltresFacturationCaisse,
} from "@/features/caisse/formulaire-filtres-facturation-caisse";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import { PanneauDroitMedecins } from "@/features/medecins/panneau-droit-medecins";
import type { PatientDuJour } from "@/lib/medecins/types";
import { cn } from "@/lib/utils";

interface Props {
  utilisateur: UtilisateurMedecins;
}

const PAR_PAGE = 12;

function correspondFiltres(p: PatientDuJour, f: FiltresFacturationCaisse) {
  const nom = f.nom.trim().toLowerCase();
  const prenom = f.prenom.trim().toLowerCase();
  const tel = f.telephone.trim().toLowerCase();
  const enreg = f.numeroEnreg.trim().toLowerCase();
  const idEntite = f.idEntite.trim().toLowerCase();
  if (nom && !p.nomComplet.toLowerCase().includes(nom)) return false;
  if (prenom && !p.nomComplet.toLowerCase().includes(prenom)) return false;
  if (tel && !(p.telephone || "").toLowerCase().includes(tel)) return false;
  if (enreg && !(p.numeroDossier || "").toLowerCase().includes(enreg)) return false;
  if (idEntite && !(p.dossierId || "").toLowerCase().includes(idEntite)) return false;
  return true;
}

export function ContenuPatientsDuJourMedecins({ utilisateur }: Props) {
  const { t, i18n } = useTranslation();
  const [patients, setPatients] = useState<PatientDuJour[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState(FILTRES_FACTURATION_VIDES);
  const [filtresAppliques, setFiltresAppliques] = useState(FILTRES_FACTURATION_VIDES);
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<string[]>([]);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/medecins/patients-du-jour");
      const data = (await res.json()) as {
        patients?: PatientDuJour[];
        erreur?: string;
      };
      if (!res.ok || !data.patients) {
        setErreur(data.erreur ?? t("medecins.patientsDuJour.erreur"));
        return;
      }
      setPatients(data.patients);
    } catch {
      setErreur(t("medecins.patientsDuJour.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const filtrés = useMemo(
    () => patients.filter((p) => correspondFiltres(p, filtresAppliques)),
    [patients, filtresAppliques]
  );

  useEffect(() => {
    setPage(1);
  }, [filtresAppliques]);

  const nbFiltres = compterFiltresActifs(filtresAppliques, {
    ignorerNumeroFacture: true,
  });
  const totalPages = Math.max(1, Math.ceil(filtrés.length / PAR_PAGE));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * PAR_PAGE;
  const pagePatients = filtrés.slice(debut, debut + PAR_PAGE);
  const tousCoches =
    pagePatients.length > 0 &&
    pagePatients.every((p) => selection.includes(p.dossierId));

  const formater = (iso: string) =>
    new Date(iso).toLocaleTimeString(i18n.language || "fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.patientsDuJour.titre")}
      sousTitre={t("medecins.patientsDuJour.sousTitre")}
      panneauDroit={<PanneauDroitMedecins />}
      activerSelection
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-texte-principal">
              Patients du jour
            </h2>
            <p className="mt-1 text-sm text-texte-secondaire">
              Patients enregistrés / orientés vers les médecins aujourd&apos;hui.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFiltresOuverts((o) => !o)}
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
                  "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                  nbFiltres > 0 ? "bg-red-500" : "bg-slate-400"
                )}
              >
                {nbFiltres}
              </span>
            </button>
            <BoutonsOutilsListe
              toutSelectionne={tousCoches}
              onSelectionnerTout={() => {
                const ids = pagePatients.map((p) => p.dossierId);
                setSelection((prev) =>
                  tousCoches
                    ? prev.filter((id) => !ids.includes(id))
                    : [...new Set([...prev, ...ids])]
                );
              }}
              onExporter={() => {
                const ids = selection.length
                  ? selection
                  : filtrés.map((p) => p.dossierId);
                const rows = patients.filter((p) => ids.includes(p.dossierId));
                const csv = [
                  "dossier;patient;telephone;motif;medecin;heure",
                  ...rows.map(
                    (p) =>
                      `${p.numeroDossier};${p.nomComplet};${p.telephone};${p.motif};${p.medecin};${formater(p.debutLe)}`
                  ),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "patients-du-jour.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              labelSelectionnerTout={t("medecins.patients.selectionnerTout")}
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
            idPrefix="filtre-patients-jour"
            masquerNumeroFacture
          />
        ) : null}

        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.patientsDuJour.chargement")}
          </div>
        ) : erreur ? (
          <p className="text-sm text-red-600">{erreur}</p>
        ) : filtrés.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gris-bordure bg-white p-8 text-center text-sm text-texte-secondaire">
            {nbFiltres > 0
              ? t("caisse.facturation.filtres.aucunResultat")
              : t("medecins.patientsDuJour.vide")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                <tr>
                  <th className="px-4 py-3 font-semibold">Patient</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                    Téléphone
                  </th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">
                    Motif
                  </th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                    Médecin
                  </th>
                  <th className="px-4 py-3 font-semibold">Heure</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gris-bordure">
                {pagePatients.map((p) => (
                  <tr
                    key={`${p.dossierId}-${p.consultationId ?? "file"}`}
                    className="hover:bg-gris-tres-clair/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-texte-principal">
                        {p.nomComplet}
                      </p>
                      <p className="text-xs text-texte-secondaire">
                        {p.numeroDossier}
                        {p.enFile ? (
                          <span className="ml-2 rounded-full bg-bleu-medical-clair px-1.5 py-0.5 text-[10px] font-medium text-bleu-medical">
                            En file
                          </span>
                        ) : null}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-texte-secondaire sm:table-cell">
                      {p.telephone || "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-texte-secondaire md:table-cell">
                      {p.motif || "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-texte-secondaire lg:table-cell">
                      {p.medecin}
                    </td>
                    <td className="px-4 py-3 text-texte-secondaire">
                      {formater(p.debutLe)}
                      {p.finLe ? (
                        <span className="ml-1 text-emerald-700">✓</span>
                      ) : (
                        <span className="ml-1 text-amber-600">…</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/sigh/medecins/consultation?dossier=${encodeURIComponent(p.dossierId)}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-bleu-medical px-2.5 py-1.5 text-xs font-medium text-white"
                        >
                          <Stethoscope className="h-3.5 w-3.5" />
                          Consultation
                        </Link>
                        <Link
                          href={`/sigh/medecins/ordonnances?dossier=${encodeURIComponent(p.dossierId)}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-bleu-medical bg-white px-2.5 py-1.5 text-xs font-medium text-bleu-medical"
                        >
                          <Pill className="h-3.5 w-3.5" />
                          Ordonnances
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationListe
              page={pageCourante}
              totalPages={totalPages}
              totalItems={filtrés.length}
              parPage={PAR_PAGE}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </MiseEnPageMedecins>
  );
}
