"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { History, Loader2 } from "lucide-react";
import { PaginationListe } from "@/components/ui/pagination-liste";
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
  const [recherche, setRecherche] = useState("");
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

  const filtrés = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.nomComplet.toLowerCase().includes(q) ||
        p.numeroDossier.toLowerCase().includes(q) ||
        p.numeroPatient.toLowerCase().includes(q)
    );
  }, [patients, recherche]);

  const PAR_PAGE = 8;
  const totalPages = Math.max(1, Math.ceil(filtrés.length / PAR_PAGE));
  const pageCourante = Math.min(pageListe, totalPages);
  const debutPage = (pageCourante - 1) * PAR_PAGE;
  const patientsPage = filtrés.slice(debutPage, debutPage + PAR_PAGE);

  useEffect(() => {
    setPageListe(1);
  }, [recherche]);

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-bleu-medical" />
            <h2 className="text-lg font-bold text-texte-principal">
              {t("infirmiers.historique.listeTitre")}
            </h2>
          </div>
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("infirmiers.historique.recherche")}
            className="h-10 w-full max-w-xs rounded-lg border border-gris-bordure bg-white px-3 text-sm"
          />
        </div>

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
            <div className="space-y-3 md:hidden">
              {patientsPage.map((p) => (
                <button
                  key={p.dossierId}
                  type="button"
                  onClick={() => setPatientSelectionne(p)}
                  className={cn(
                    "block w-full rounded-xl border bg-white p-4 text-left shadow-sm",
                    patientSelectionne?.dossierId === p.dossierId
                      ? "border-bleu-medical ring-1 ring-bleu-medical"
                      : "border-gris-bordure"
                  )}
                >
                  <p className="font-semibold text-texte-principal">{p.nomComplet}</p>
                  <p className="font-mono text-xs text-texte-secondaire">
                    {p.numeroDossier} · {formaterMesure(p.derniereMesureLe)}
                  </p>
                  <p className="mt-1 text-xs text-texte-secondaire">
                    {p.nbConsultations} consultation(s)
                  </p>
                </button>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-gris-bordure bg-white md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-gris-bordure bg-slate-50 text-xs uppercase text-texte-secondaire">
                  <tr>
                    <th className="px-4 py-3">{t("infirmiers.historique.colonnes.patient")}</th>
                    <th className="px-4 py-3">{t("infirmiers.historique.colonnes.mesure")}</th>
                    <th className="px-4 py-3">{t("infirmiers.historique.colonnes.resume")}</th>
                    <th className="px-4 py-3">{t("infirmiers.historique.nbConsultations")}</th>
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
                        <td className="px-4 py-3">
                          <p className="font-medium text-texte-principal">{p.nomComplet}</p>
                          <p className="font-mono text-xs text-texte-secondaire">
                            {p.numeroDossier}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-texte-secondaire">
                          {formaterMesure(p.derniereMesureLe)}
                        </td>
                        <td className="px-4 py-3 text-xs text-texte-secondaire">
                          {c ? (
                            <>
                              T° {c.temperature ?? "—"} · Poids {c.poidsKg ?? "—"} · TA{" "}
                              {c.tensionSystolique ?? "—"}/{c.tensionDiastolique ?? "—"}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-texte-secondaire">
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
