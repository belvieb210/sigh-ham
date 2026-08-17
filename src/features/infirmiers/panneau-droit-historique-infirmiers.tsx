"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Download, FileText, Loader2 } from "lucide-react";
import { LigneNumeroVisiteResume } from "@/components/ui/ligne-numero-visite-resume";
import type {
  HistoriqueCompletDossierInfirmiers,
  PatientHistoriqueInfirmiers,
} from "@/lib/infirmiers/types";
import { cn } from "@/lib/utils";

interface Props {
  patient: PatientHistoriqueInfirmiers | null;
  detail: HistoriqueCompletDossierInfirmiers | null;
  chargementDetail: boolean;
}

function formaterMesure(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function PanneauDroitHistoriqueInfirmiers({
  patient,
  detail,
  chargementDetail,
}: Props) {
  const { t } = useTranslation();
  const dossierId = patient?.dossierId;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4">
      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("infirmiers.panneau.resumePatient")}
        </h2>
        {!patient ? (
          <p className="text-xs text-texte-secondaire">
            {t("infirmiers.historique.selectionnerPatient")}
          </p>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {patient.prenom.charAt(0)}
                {patient.nom.charAt(0)}
              </div>
              <p className="mt-3 text-sm font-semibold text-texte-principal">
                {patient.nomComplet}
              </p>
              <p className="font-mono text-[11px] text-texte-secondaire">
                {patient.numeroPatient}
              </p>
            </div>
            <div className="mt-4 space-y-2 text-left text-xs">
              <LigneNumeroVisiteResume
                label={t("infirmiers.panneau.numeroVisite")}
                numeroDossier={patient.numeroDossier}
              />
              <div className="flex justify-between gap-2">
                <span className="text-texte-secondaire">{t("infirmiers.panneau.age")}</span>
                <span className="font-medium">
                  {patient.age != null ? `${patient.age} ans` : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-texte-secondaire">{t("infirmiers.panneau.telephone")}</span>
                <span className="font-medium">{patient.telephone}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-texte-secondaire">
                  {t("infirmiers.historique.nbConsultations")}
                </span>
                <span className="font-medium">{patient.nbConsultations}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-texte-secondaire">
                  {t("infirmiers.historique.derniereMesure")}
                </span>
                <span className="font-medium text-right">
                  {formaterMesure(patient.derniereMesureLe)}
                </span>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("infirmiers.historique.detailsTitre")}
        </h2>
        {!patient ? (
          <p className="text-xs text-texte-secondaire">—</p>
        ) : chargementDetail ? (
          <div className="flex items-center gap-2 text-xs text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("infirmiers.historique.chargementDetail")}
          </div>
        ) : !detail || detail.constantes.length === 0 ? (
          <p className="text-xs text-texte-secondaire">{t("infirmiers.historique.vide")}</p>
        ) : (
          <div className="max-h-[280px] space-y-2 overflow-y-auto">
            {detail.constantes.map((c, index) => {
              const prec = detail.constantes[index + 1];
              return (
                <div
                  key={c.id}
                  className="rounded-lg border border-gris-bordure/70 bg-gris-tres-clair/40 px-2.5 py-2 text-xs"
                >
                  <p className="font-medium text-bleu-medical">
                    {formaterMesure(c.mesureLe)}
                  </p>
                  <p className="mt-1 text-texte-secondaire">
                    T° {c.temperature ?? "—"} · Poids {c.poidsKg ?? "—"} kg · TA{" "}
                    {c.tensionSystolique ?? "—"}/{c.tensionDiastolique ?? "—"} · FC{" "}
                    {c.frequenceCardiaque ?? "—"} · SpO₂ {c.saturationO2 ?? "—"}
                  </p>
                  {prec && c.poidsKg != null && prec.poidsKg != null ? (
                    <p
                      className={cn(
                        "mt-0.5",
                        c.poidsKg - prec.poidsKg > 0
                          ? "text-emerald-700"
                          : c.poidsKg - prec.poidsKg < 0
                            ? "text-red-600"
                            : "text-texte-secondaire"
                      )}
                    >
                      Δ poids : {(c.poidsKg - prec.poidsKg).toFixed(1)} kg
                    </p>
                  ) : null}
                  {c.infirmier ? (
                    <p className="mt-0.5 text-texte-secondaire">{c.infirmier}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("infirmiers.panneau.actionsRapides")}
        </h2>
        {!dossierId ? (
          <p className="text-xs text-texte-secondaire">
            {t("infirmiers.historique.selectionnerPatient")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            <Link
              href={`/api/infirmiers/historique/${dossierId}/pdf-consultations`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-bleu-medical px-3 py-2.5 text-xs font-medium text-white hover:bg-bleu-medical/90"
            >
              <Download className="h-4 w-4" />
              {t("infirmiers.historique.pdfConsultations")}
            </Link>
            <Link
              href={`/api/infirmiers/historique/${dossierId}/pdf-traitements`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-xs font-medium hover:bg-gris-tres-clair",
                detail?.nbFichesTraitement === 0 && "pointer-events-none opacity-50"
              )}
            >
              <FileText className="h-4 w-4 text-bleu-medical" />
              {t("infirmiers.historique.pdfTraitements")}
            </Link>
          </div>
        )}
      </section>
    </aside>
  );
}

export function SectionsMobileHistoriqueInfirmiers(props: Props) {
  return (
    <div className="space-y-4 xl:hidden">
      <PanneauDroitHistoriqueInfirmiers {...props} />
    </div>
  );
}
