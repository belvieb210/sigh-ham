"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { History, Loader2, Share2, SlidersHorizontal } from "lucide-react";
import { PaginationListe } from "@/components/ui/pagination-liste";
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
import {
  PanneauDroitHistoriqueInfirmiers,
  SectionsMobileHistoriqueInfirmiers,
} from "@/features/infirmiers/panneau-droit-historique-infirmiers";
import type {
  HistoriqueCompletDossierInfirmiers,
  PatientHistoriqueInfirmiers,
} from "@/lib/infirmiers/types";
import { cn } from "@/lib/utils";

interface Props {
  utilisateur: UtilisateurInfirmiers;
}

function formaterMesure(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function patientHistoriqueCorrespondFiltres(
  p: PatientHistoriqueInfirmiers,
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

export function ContenuHistoriqueInfirmiers({ utilisateur }: Props) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<PatientHistoriqueInfirmiers[]>([]);
  const [patientSelectionne, setPatientSelectionne] =
    useState<PatientHistoriqueInfirmiers | null>(null);
  const [detail, setDetail] = useState<HistoriqueCompletDossierInfirmiers | null>(
    null
  );
  const [chargement, setChargement] = useState(true);
  const [chargementDetail, setChargementDetail] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );
  const [filtresAppliques, setFiltresAppliques] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );
  const [pageListe, setPageListe] = useState(1);

  const chargerPatients = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/infirmiers/historique");
      const data = (await res.json()) as {
        patients?: PatientHistoriqueInfirmiers[];
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("infirmiers.historique.erreur"));
        return;
      }
      setPatients(data.patients ?? []);
    } catch {
      setErreur(t("infirmiers.historique.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void chargerPatients();
  }, [chargerPatients]);

  useEffect(() => {
    if (!patientSelectionne) {
      setDetail(null);
      return;
    }

    let annule = false;
    (async () => {
      setChargementDetail(true);
      try {
        const res = await fetch(
          `/api/infirmiers/historique?dossierId=${encodeURIComponent(patientSelectionne.dossierId)}`
        );
        const data = (await res.json()) as {
          detail?: HistoriqueCompletDossierInfirmiers;
        };
        if (!annule) {
          setDetail(data.detail ?? null);
        }
      } catch {
        if (!annule) setDetail(null);
      } finally {
        if (!annule) setChargementDetail(false);
      }
    })();

    return () => {
      annule = true;
    };
  }, [patientSelectionne]);

  const filtrés = useMemo(
    () => patients.filter((p) => patientHistoriqueCorrespondFiltres(p, filtresAppliques)),
    [patients, filtresAppliques]
  );

  const PAR_PAGE = 8;
  const totalPages = Math.max(1, Math.ceil(filtrés.length / PAR_PAGE));
  const pageCourante = Math.min(pageListe, totalPages);
  const debutPage = (pageCourante - 1) * PAR_PAGE;
  const patientsPage = filtrés.slice(debutPage, debutPage + PAR_PAGE);

  useEffect(() => {
    setPageListe(1);
  }, [filtresAppliques]);

  const nbFiltresActifs = compterFiltresActifs(filtresAppliques, {
    ignorerNumeroFacture: true,
  });

  const panneauProps = {
    patient: patientSelectionne,
    detail,
    chargementDetail,
  };

  return (
    <MiseEnPageInfirmiers
      utilisateur={utilisateur}
      titre={t("infirmiers.historique.titre")}
      sousTitre={t("infirmiers.historique.sousTitre")}
      panneauDroit={<PanneauDroitHistoriqueInfirmiers {...panneauProps} />}
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-bleu-medical" />
              <h2 className="text-xl font-bold text-texte-principal">
                {t("infirmiers.historique.listeTitre")}
              </h2>
            </div>
            <p className="mt-1 text-sm text-texte-secondaire">
              {t("infirmiers.historique.listeDescription")}
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
            <button
              type="button"
              onClick={() => {
                const csv = [
                  "numero;nom;prenom;telephone;consultations;derniere_mesure",
                  ...filtrés.map(
                    (p) =>
                      `${p.numeroPatient};${p.nom};${p.prenom};${p.telephone};${p.nbConsultations};${p.derniereMesureLe}`
                  ),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "historique-infirmiers.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              aria-label={t("caisse.transferts.exporterSelection")}
              title={t("caisse.transferts.exporterSelection")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gris-bordure bg-white text-texte-principal transition-colors hover:bg-gris-tres-clair"
            >
              <Share2 className="h-5 w-5" strokeWidth={2} />
            </button>
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
            idPrefix="filtre-historique-infirmiers"
            masquerNumeroFacture
          />
        ) : null}

        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("infirmiers.historique.chargement")}
          </div>
        ) : erreur ? (
          <p className="text-sm text-red-600">{erreur}</p>
        ) : filtrés.length === 0 ? (
          <p className="text-sm text-texte-secondaire">{t("infirmiers.historique.vide")}</p>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white">
              <table className="tableau-sigh">
                <thead className="border-b border-gris-bordure bg-slate-50 text-xs uppercase text-texte-secondaire">
                  <tr>
                    <th className="px-2 py-1.5">{t("infirmiers.historique.colonnes.patient")}</th>
                    <th className="px-2 py-1.5">{t("infirmiers.historique.colonnes.mesure")}</th>
                    <th className="px-2 py-1.5">{t("infirmiers.historique.colonnes.resume")}</th>
                    <th className="px-2 py-1.5">{t("infirmiers.historique.nbConsultations")}</th>
                  </tr>
                </thead>
                <tbody>
                  {patientsPage.map((p) => {
                    const c = p.derniereConstante;
                    const selectionne = patientSelectionne?.dossierId === p.dossierId;
                    return (
                      <tr
                        key={p.dossierId}
                        onClick={() => setPatientSelectionne(p)}
                        className={cn(
                          "cursor-pointer border-b border-gris-bordure/60 hover:bg-slate-50",
                          selectionne && "bg-bleu-medical-clair/40"
                        )}
                      >
                        <td className="px-2 py-1.5">
                          <p className="font-medium text-texte-principal">{p.nomComplet}</p>
                          <p className="font-mono text-xs text-texte-secondaire">
                            {p.numeroDossier}
                          </p>
                        </td>
                        <td className="px-2 py-1.5 text-texte-secondaire">
                          {formaterMesure(p.derniereMesureLe)}
                        </td>
                        <td className="px-2 py-1.5 text-xs text-texte-secondaire">
                          {c ? (
                            <>
                              T° {c.temperature ?? "—"} · Poids {c.poidsKg ?? "—"} · TA{" "}
                              {c.tensionSystolique ?? "—"}/{c.tensionDiastolique ?? "—"}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-texte-secondaire">
                          {p.nbConsultations}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <PaginationListe
                page={pageCourante}
                totalPages={totalPages}
                totalItems={filtrés.length}
                parPage={PAR_PAGE}
                onChange={setPageListe}
              />
            </div>
          </>
        )}

        <SectionsMobileHistoriqueInfirmiers {...panneauProps} />
      </div>
    </MiseEnPageInfirmiers>
  );
}
