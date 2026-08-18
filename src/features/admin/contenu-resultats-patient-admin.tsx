"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlaskConical, Loader2 } from "lucide-react";
import {
  CadreActionPatientAdmin,
  type PatientGouvernance,
} from "@/features/admin/cadre-action-patient-admin";
import { ListeOutilsVisitesAdmin } from "@/features/admin/liste-outils-visites-admin";
import type { UtilisateurAdmin } from "@/features/admin/mise-en-page-admin";
import { cn } from "@/lib/utils";

type ResultatLigne = {
  parametre: string;
  valeur: string | null;
  unite: string | null;
  normeMin: string | null;
  normeMax: string | null;
  anormal: boolean | null;
  flag: string | null;
  commentaire: string | null;
  nonRequis: boolean;
};

type ExamenResultat = {
  id: string;
  libelle: string;
  statut: string;
  resultatLe: string | null;
  resultats: ResultatLigne[];
};

type VisiteResultats = {
  dossierId: string;
  numeroDossier: string;
  statut: string;
  ouvertLe: string;
  salleEnregistrement?: string;
  factures: {
    id: string;
    numeroFacture: string;
    statut: string;
    examens: ExamenResultat[];
  }[];
  horsFacture: ExamenResultat[];
};

function BlocExamen({ ex }: { ex: ExamenResultat }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border border-gris-bordure bg-white px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-texte-principal">{ex.libelle}</p>
        <span className="text-[11px] font-medium uppercase tracking-wide text-texte-secondaire">
          {t(`admin.patients.statutsExamen.${ex.statut}`, {
            defaultValue: ex.statut,
          })}
        </span>
      </div>
      {ex.resultats.length === 0 ? (
        <p className="mt-1 text-xs text-texte-secondaire">
          {t("admin.patients.actions.sansResultat")}
        </p>
      ) : (
        <table className="mt-2 w-full text-xs">
          <tbody>
            {ex.resultats.map((r, i) => (
              <tr key={`${ex.id}-${i}`} className="border-t border-gris-bordure/70">
                <td className="py-1 pr-2 text-texte-secondaire">{r.parametre}</td>
                <td
                  className={cn(
                    "py-1 font-medium",
                    r.anormal ? "text-red-700" : "text-texte-principal"
                  )}
                >
                  {r.nonRequis ? "—" : r.valeur ?? "—"}
                  {r.unite ? ` ${r.unite}` : ""}
                  {r.flag ? ` (${r.flag})` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function ContenuResultatsPatientAdmin({
  utilisateur,
  patientId,
}: {
  utilisateur: UtilisateurAdmin;
  patientId: string;
}) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<PatientGouvernance | null>(null);
  const [visites, setVisites] = useState<VisiteResultats[]>([]);
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
          fetch(`/api/admin/patients/${patientId}/resultats`),
          fetch("/api/admin/salles"),
        ]);
        const data = (await res.json()) as {
          patient?: PatientGouvernance;
          visites?: VisiteResultats[];
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

  const visitesEnrichies = useMemo(
    () =>
      visites.map((v) => ({
        ...v,
        texte: [
          ...v.factures.map((f) => f.numeroFacture),
          ...v.factures.flatMap((f) => f.examens.map((e) => e.libelle)),
          ...v.horsFacture.map((e) => e.libelle),
        ].join(" "),
      })),
    [visites]
  );

  return (
    <CadreActionPatientAdmin
      utilisateur={utilisateur}
      icone={FlaskConical}
      titre={t("admin.patients.actions.resultatsTitre")}
      description={t("admin.patients.actions.resultatsDesc")}
      fil={t("admin.patients.menu.resultat")}
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
          visites={visitesEnrichies}
          salles={salles}
          vide={t("admin.patients.actions.aucunResultat")}
          nomExport={`resultats-${patient?.numeroPatient ?? "patient"}.csv`}
          colonnesExport={[
            t("admin.patients.actions.visite"),
            t("admin.patients.colonnes.statut"),
            t("admin.patients.actions.facture"),
          ]}
          ligneExport={(v) => [
            v.numeroDossier,
            v.statut,
            v.factures.map((f) => f.numeroFacture).join(" | "),
          ]}
          renderVisite={(v, coche, onCoche) => (
            <article
              key={v.dossierId}
              className="rounded-xl border border-gris-bordure bg-slate-50/70 p-4 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
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
              </div>
              {v.factures.length === 0 && v.horsFacture.length === 0 ? (
                <p className="text-sm text-texte-secondaire">
                  {t("admin.patients.actions.aucunExamenVisite")}
                </p>
              ) : null}
              <div className="space-y-3">
                {v.factures.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-lg border border-gris-bordure bg-white p-3"
                  >
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-bleu-medical">
                      {t("admin.patients.actions.facture")} {f.numeroFacture}
                    </p>
                    <div className="space-y-2">
                      {f.examens.length === 0 ? (
                        <p className="text-xs text-texte-secondaire">
                          {t("admin.patients.actions.aucunExamenFacture")}
                        </p>
                      ) : (
                        f.examens.map((ex) => <BlocExamen key={ex.id} ex={ex} />)
                      )}
                    </div>
                  </div>
                ))}
                {v.horsFacture.length > 0 ? (
                  <div className="rounded-lg border border-dashed border-gris-bordure bg-white p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                      {t("admin.patients.actions.horsFacture")}
                    </p>
                    <div className="space-y-2">
                      {v.horsFacture.map((ex) => (
                        <BlocExamen key={ex.id} ex={ex} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          )}
        />
      ) : null}
    </CadreActionPatientAdmin>
  );
}
