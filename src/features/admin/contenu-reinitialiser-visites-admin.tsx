"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Loader2, RotateCcw } from "lucide-react";
import {
  CadreActionPatientAdmin,
  type PatientGouvernance,
} from "@/features/admin/cadre-action-patient-admin";
import { ListeOutilsVisitesAdmin } from "@/features/admin/liste-outils-visites-admin";
import type { UtilisateurAdmin } from "@/features/admin/mise-en-page-admin";
import { Bouton } from "@/components/ui/bouton";

type VisiteReset = {
  dossierId: string;
  numeroDossier: string;
  statut: string;
  ouvertLe: string;
  salleEnregistrement?: string;
  totaux: {
    transferts: number;
    factures: number;
    examensLaboratoire: number;
    consultations: number;
    ordonnances: number;
    ventesPharmacie: number;
    passages: number;
  };
};

export function ContenuReinitialiserVisitesAdmin({
  utilisateur,
  patientId,
}: {
  utilisateur: UtilisateurAdmin;
  patientId: string;
}) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<PatientGouvernance | null>(null);
  const [visites, setVisites] = useState<VisiteReset[]>([]);
  const [salles, setSalles] = useState<{ code: string; nom: string }[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setChargement(true);
      setErreur(null);
      try {
        const [res, sRes] = await Promise.all([
          fetch(`/api/admin/patients/${patientId}/visites`),
          fetch("/api/admin/salles"),
        ]);
        const data = (await res.json()) as {
          patient?: PatientGouvernance;
          visites?: VisiteReset[];
          message?: string;
        };
        const sData = (await sRes.json()) as {
          salles?: { code: string; nom: string }[];
        };
        if (!res.ok) throw new Error(data.message);
        if (ignore) return;
        setPatient(data.patient ?? null);
        setVisites(data.visites ?? []);
        setSalles(sData.salles ?? []);
      } catch (e: unknown) {
        if (!ignore) {
          setErreur(
            e instanceof Error ? e.message : t("admin.patients.actions.erreur")
          );
        }
      } finally {
        if (!ignore) setChargement(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [patientId, t]);

  return (
    <CadreActionPatientAdmin
      utilisateur={utilisateur}
      icone={RotateCcw}
      titre={t("admin.patients.actions.resetTitre")}
      description={t("admin.patients.actions.resetDesc")}
      fil={t("admin.patients.menu.reinitialiser")}
      patient={patient}
    >
      {chargement ? (
        <p className="flex items-center gap-2 text-sm text-texte-secondaire">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("admin.common.chargement")}
        </p>
      ) : null}
      {erreur ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {erreur}
        </p>
      ) : null}
      {!chargement && !erreur ? (
        <ListeOutilsVisitesAdmin
          visites={visites}
          salles={salles}
          vide={t("admin.patients.actions.aucuneVisite")}
          nomExport={`visites-${patient?.numeroPatient ?? "patient"}.csv`}
          colonnesExport={[
            t("admin.patients.actions.visite"),
            t("admin.patients.colonnes.statut"),
            t("admin.patients.actions.nFactures"),
            t("admin.patients.actions.nExamens"),
          ]}
          ligneExport={(v) => [
            v.numeroDossier,
            v.statut,
            String(v.totaux.factures),
            String(v.totaux.examensLaboratoire),
          ]}
          renderVisite={(v, coche, onCoche) => (
            <article
              key={v.dossierId}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
            >
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 accent-bleu-medical"
                  checked={coche}
                  onChange={onCoche}
                />
                <span>
                  <span className="block text-sm font-bold text-texte-principal">
                    {t("admin.patients.actions.visite")} {v.numeroDossier}
                  </span>
                  <span className="mt-1 block text-xs text-texte-secondaire">
                    {t(`admin.patients.statutsDossier.${v.statut}`, {
                      defaultValue: v.statut,
                    })}
                    {" · "}
                    {v.totaux.transferts} {t("admin.patients.actions.nTransferts")}
                    {" · "}
                    {v.totaux.factures} {t("admin.patients.actions.nFactures")}
                    {" · "}
                    {v.totaux.examensLaboratoire}{" "}
                    {t("admin.patients.actions.nExamens")}
                  </span>
                </span>
              </label>
              <Link
                href={`/sigh/admin/patients/${patientId}/reinitialiser/${v.dossierId}`}
              >
                <Bouton type="button" variante="danger" taille="petit">
                  {t("admin.patients.actions.reinitialiserCetteVisite")}
                </Bouton>
              </Link>
            </article>
          )}
        />
      ) : null}
    </CadreActionPatientAdmin>
  );
}
