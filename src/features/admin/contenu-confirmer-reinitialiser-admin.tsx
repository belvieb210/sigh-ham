"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2, RotateCcw } from "lucide-react";
import {
  CadreActionPatientAdmin,
  type PatientGouvernance,
} from "@/features/admin/cadre-action-patient-admin";
import type { UtilisateurAdmin } from "@/features/admin/mise-en-page-admin";
import { Bouton } from "@/components/ui/bouton";
import {
  CLASSE_CHAMP_RECEPTION,
  CLASSE_LABEL_RECEPTION,
} from "@/constants/reception";

type VisiteReset = {
  dossierId: string;
  numeroDossier: string;
  statut: string;
  ouvertLe: string;
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

export function ContenuConfirmerReinitialiserAdmin({
  utilisateur,
  patientId,
  dossierId,
}: {
  utilisateur: UtilisateurAdmin;
  patientId: string;
  dossierId: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientGouvernance | null>(null);
  const [visite, setVisite] = useState<VisiteReset | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setChargement(true);
      setErreur(null);
      try {
        const res = await fetch(`/api/admin/patients/${patientId}/visites`);
        const data = (await res.json()) as {
          patient?: PatientGouvernance;
          visites?: VisiteReset[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message);
        if (ignore) return;
        setPatient(data.patient ?? null);
        setVisite(
          (data.visites ?? []).find((v) => v.dossierId === dossierId) ?? null
        );
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
  }, [patientId, dossierId, t]);

  const confirmer = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      const res = await fetch(
        `/api/admin/patients/${patientId}/visites/${dossierId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmation }),
        }
      );
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message);
      router.push("/sigh/admin/patients");
      router.refresh();
    } catch (e: unknown) {
      setErreur(
        e instanceof Error ? e.message : t("admin.patients.actions.erreur")
      );
    } finally {
      setEnCours(false);
    }
  };

  return (
    <CadreActionPatientAdmin
      utilisateur={utilisateur}
      icone={RotateCcw}
      titre={t("admin.patients.actions.resetConfirmerTitre")}
      description={t("admin.patients.actions.resetConfirmerDesc")}
      fil={visite?.numeroDossier ?? t("admin.patients.menu.reinitialiser")}
      patient={patient}
    >
      {chargement ? (
        <p className="flex items-center gap-2 text-sm text-texte-secondaire">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("admin.common.chargement")}
        </p>
      ) : null}
      {erreur ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {erreur}
        </p>
      ) : null}

      {!chargement && visite ? (
        <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-red-800">
            {t("admin.patients.actions.visite")} {visite.numeroDossier}
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-texte-principal">
            <li>
              {visite.totaux.transferts} {t("admin.patients.actions.nTransferts")}
            </li>
            <li>
              {visite.totaux.factures} {t("admin.patients.actions.nFactures")}
            </li>
            <li>
              {visite.totaux.examensLaboratoire}{" "}
              {t("admin.patients.actions.nExamens")}
            </li>
            <li>
              {visite.totaux.consultations}{" "}
              {t("admin.patients.actions.nConsultations")}
            </li>
            <li>
              {visite.totaux.ordonnances}{" "}
              {t("admin.patients.actions.nOrdonnances")}
            </li>
            <li>
              {visite.totaux.ventesPharmacie}{" "}
              {t("admin.patients.actions.nVentes")}
            </li>
          </ul>
          <p className="mt-4 text-sm text-red-800">
            {t("admin.patients.actions.resetAvertissement")}
          </p>
          <label className="mt-4 block" htmlFor="confirm-vis">
            <span className={CLASSE_LABEL_RECEPTION}>
              {t("admin.patients.actions.saisirNumero", {
                numero: visite.numeroDossier,
              })}
            </span>
            <input
              id="confirm-vis"
              className={CLASSE_CHAMP_RECEPTION}
              value={confirmation}
              autoComplete="off"
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={visite.numeroDossier}
            />
          </label>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Bouton
              type="button"
              variante="contour"
              onClick={() =>
                router.push(`/sigh/admin/patients/${patientId}/reinitialiser`)
              }
            >
              {t("admin.patients.annuler")}
            </Bouton>
            <Bouton
              type="button"
              variante="danger"
              disabled={
                enCours ||
                confirmation.trim().toUpperCase() !==
                  visite.numeroDossier.toUpperCase()
              }
              onClick={() => void confirmer()}
            >
              {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("admin.patients.actions.confirmerReset")}
            </Bouton>
          </div>
        </div>
      ) : null}

      {!chargement && !visite && !erreur ? (
        <p className="text-sm text-texte-secondaire">
          {t("admin.patients.actions.visiteIntrouvable")}
        </p>
      ) : null}
    </CadreActionPatientAdmin>
  );
}
