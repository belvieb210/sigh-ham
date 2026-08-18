"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRightLeft, Loader2, RotateCcw, Undo2 } from "lucide-react";
import {
  CadreActionPatientAdmin,
  type PatientGouvernance,
} from "@/features/admin/cadre-action-patient-admin";
import { ListeOutilsVisitesAdmin } from "@/features/admin/liste-outils-visites-admin";
import type { UtilisateurAdmin } from "@/features/admin/mise-en-page-admin";
import { Bouton } from "@/components/ui/bouton";
import { cn } from "@/lib/utils";

export type TransfertGouvernance = {
  id: string;
  numeroTransfert: string | null;
  statut: string;
  emisLe: string;
  salleOrigine: { code: string; nom: string };
  salleDestination: { code: string; nom: string };
  recuperationStatut: string | null;
  annulable: boolean;
  restorable: boolean;
};

export type VisiteTransferts = {
  dossierId: string;
  numeroDossier: string;
  statut: string;
  ouvertLe: string;
  salleEnregistrement?: string;
  transferts: TransfertGouvernance[];
};

export function ContenuVisitesTransfertsAdmin({
  utilisateur,
  patientId,
  mode,
}: {
  utilisateur: UtilisateurAdmin;
  patientId: string;
  mode: "annuler" | "restaurer";
}) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<PatientGouvernance | null>(null);
  const [visites, setVisites] = useState<VisiteTransferts[]>([]);
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
          fetch(`/api/admin/patients/${patientId}/transferts`),
          fetch("/api/admin/salles"),
        ]);
        const data = (await res.json()) as {
          patient?: PatientGouvernance;
          visites?: VisiteTransferts[];
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

  const visitesFiltrees = useMemo(
    () =>
      visites
        .map((v) => ({
          ...v,
          transferts: v.transferts.filter((tr) =>
            mode === "annuler" ? tr.annulable : tr.restorable
          ),
          salles: v.transferts.map((tr) => tr.salleDestination.code),
          texte: v.transferts
            .map((tr) => `${tr.salleOrigine.nom} ${tr.salleDestination.nom}`)
            .join(" "),
        }))
        .filter((v) => v.transferts.length > 0),
    [visites, mode]
  );
  const Icone = mode === "annuler" ? Undo2 : RotateCcw;
  const base =
    mode === "annuler"
      ? `/sigh/admin/patients/${patientId}/annuler-transfert`
      : `/sigh/admin/patients/${patientId}/restaurer-transfert`;

  return (
    <CadreActionPatientAdmin
      utilisateur={utilisateur}
      icone={Icone}
      titre={
        mode === "annuler"
          ? t("admin.patients.actions.annulerTitre")
          : t("admin.patients.actions.restaurerTitre")
      }
      description={
        mode === "annuler"
          ? t("admin.patients.actions.annulerDesc")
          : t("admin.patients.actions.restaurerDesc")
      }
      fil={
        mode === "annuler"
          ? t("admin.patients.menu.annulerTransfert")
          : t("admin.patients.menu.restaurerTransfert")
      }
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
          visites={visitesFiltrees}
          salles={salles}
          vide={
            mode === "annuler"
              ? t("admin.patients.actions.aucunAnnulable")
              : t("admin.patients.actions.aucunRestaurable")
          }
          nomExport={`transferts-${patient?.numeroPatient ?? "patient"}.csv`}
          colonnesExport={[
            t("admin.patients.actions.visite"),
            t("admin.patients.colonnes.statut"),
            t("admin.patients.filtres.salle"),
          ]}
          ligneExport={(v) => [
            v.numeroDossier,
            v.statut,
            v.transferts.map((tr) => tr.salleDestination.nom).join(" | "),
          ]}
          renderVisite={(v, coche, onCoche) => (
            <article
              key={v.dossierId}
              className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
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
                    <span className="text-xs text-texte-secondaire">
                      {t(`admin.patients.statutsDossier.${v.statut}`, {
                        defaultValue: v.statut,
                      })}
                    </span>
                  </span>
                </label>
                <Link href={`${base}/${v.dossierId}`}>
                  <Bouton type="button" taille="petit">
                    {mode === "annuler"
                      ? t("admin.patients.actions.choisirSallesAnnuler")
                      : t("admin.patients.actions.choisirSallesRestaurer")}
                  </Bouton>
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-gris-bordure rounded-lg border border-gris-bordure">
                {v.transferts.map((tr) => (
                  <li
                    key={tr.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <span className="inline-flex items-center gap-2 text-texte-principal">
                      <ArrowRightLeft className="h-3.5 w-3.5 text-texte-secondaire" />
                      {tr.salleOrigine.nom}
                      <span className="text-texte-secondaire">→</span>
                      {tr.salleDestination.nom}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        tr.statut === "ANNULE" || tr.statut === "REFUSE"
                          ? "bg-red-50 text-red-700"
                          : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {t(`admin.patients.statutsTransfert.${tr.statut}`, {
                        defaultValue: tr.statut,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          )}
        />
      ) : null}
    </CadreActionPatientAdmin>
  );
}
