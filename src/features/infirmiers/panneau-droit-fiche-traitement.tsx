"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  Download,
  Loader2,
} from "lucide-react";
import { useFicheTraitementInfirmiersOptionnel } from "@/features/infirmiers/contexte-fiche-traitement-infirmiers";
import { useSelectionInfirmiersOptionnel } from "@/features/infirmiers/contexte-selection-infirmiers";
import {
  calculerAlerteFinTraitement,
  cleDateLigne,
  formaterDateAffichage,
} from "@/lib/infirmiers/fiche-traitement-utils";
import type { LigneTraitementResume } from "@/lib/infirmiers/types-fiche-traitement";
import { cn } from "@/lib/utils";

function grouperLignesParDate(lignes: LigneTraitementResume[]) {
  const map = new Map<string, LigneTraitementResume[]>();
  for (const l of lignes) {
    const cle = cleDateLigne(l.effectueLe);
    const existant = map.get(cle) ?? [];
    existant.push(l);
    map.set(cle, existant);
  }
  return [...map.entries()];
}

function AlerteFin({ finEffectiveLe }: { finEffectiveLe: string }) {
  const { t } = useTranslation();
  const alerte = calculerAlerteFinTraitement(finEffectiveLe);

  if (alerte.niveau === "ok") return null;

  const styles = {
    proche: "bg-amber-50 text-amber-900 border-amber-200",
    aujourdhui: "bg-orange-50 text-orange-900 border-orange-200",
    depasse: "bg-red-50 text-red-900 border-red-200",
  } as const;

  const messages = {
    proche: t("infirmiers.ficheTraitement.alerte.proche", {
      jours: alerte.joursRestants,
    }),
    aujourdhui: t("infirmiers.ficheTraitement.alerte.aujourdhui"),
    depasse: t("infirmiers.ficheTraitement.alerte.depasse"),
  } as const;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs",
        styles[alerte.niveau]
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{messages[alerte.niveau]}</span>
    </div>
  );
}

function ResumePatient() {
  const { t } = useTranslation();
  const selection = useSelectionInfirmiersOptionnel();
  const resume = selection?.resume;

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
        {t("infirmiers.panneau.resumePatient")}
      </h2>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
          {resume && !resume.vide ? resume.initiales : "—"}
        </div>
        <p className="mt-3 text-sm font-semibold text-texte-principal">
          {resume?.nomComplet ?? t("infirmiers.panneau.aucunPatient")}
        </p>
        {resume?.numeroPatient && (
          <p className="mt-0.5 font-mono text-[11px] text-texte-secondaire">
            {resume.numeroPatient}
          </p>
        )}
      </div>
      <div className="mt-4 space-y-2 text-left text-xs">
        <div className="flex justify-between gap-2">
          <span className="text-texte-secondaire">{t("infirmiers.panneau.age")}</span>
          <span className="font-medium text-texte-principal">{resume?.age ?? "—"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-texte-secondaire">{t("infirmiers.panneau.telephone")}</span>
          <span className="font-medium text-texte-principal">
            {resume?.telephone ?? "—"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-texte-secondaire">{t("infirmiers.panneau.motif")}</span>
          <span className="max-w-[60%] truncate font-medium text-texte-principal">
            {resume?.motif ?? "—"}
          </span>
        </div>
      </div>
    </section>
  );
}

function OrientationRapideTraitement() {
  const { t } = useTranslation();
  const ctx = useFicheTraitementInfirmiersOptionnel();
  const fiche = ctx?.ficheActive;

  const groupes = fiche ? grouperLignesParDate(fiche.lignes) : [];

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
        {t("infirmiers.panneau.orientationRapide")}
      </h2>
      {!fiche ? (
        <p className="text-xs text-texte-secondaire">
          {t("infirmiers.ficheTraitement.panneau.aucuneFiche")}
        </p>
      ) : groupes.length === 0 ? (
        <p className="text-xs text-texte-secondaire">
          {t("infirmiers.ficheTraitement.panneau.aucuneLigne")}
        </p>
      ) : (
        <div className="space-y-3">
          {groupes.map(([date, lignes]) => (
            <div key={date}>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-bleu-medical">
                {date}
              </p>
              <ul className="space-y-1.5">
                {lignes.map((l, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-gris-bordure/70 bg-gris-tres-clair/40 px-2.5 py-2 text-xs"
                  >
                    <p className="font-medium text-texte-principal">{l.medicament}</p>
                    <p className="text-texte-secondaire">
                      {l.doseQuantite || "—"}
                      {l.nomTraiteur ? ` · ${l.nomTraiteur}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ActionsRapidesTraitement() {
  const { t } = useTranslation();
  const ctx = useFicheTraitementInfirmiersOptionnel();
  const fiche = ctx?.ficheActive;

  async function action(type: "cloturer" | "prolonger") {
    if (!ctx || !fiche) return;
    ctx.definirActionEnCours(true);
    ctx.definirMessagePanneau(null);
    try {
      const res = await fetch(`/api/infirmiers/fiches-traitement/${fiche.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: type,
          jours: type === "prolonger" ? 3 : undefined,
        }),
      });
      const data = (await res.json()) as { message?: string; fiche?: typeof fiche };
      if (!res.ok) {
        throw new Error(data.message ?? t("infirmiers.ficheTraitement.erreurAction"));
      }
      if (data.fiche) {
        ctx.definirFicheActive(data.fiche);
      }
      await ctx.rafraichirFichesDossier(fiche.dossierId);
      ctx.definirMessagePanneau(data.message ?? t("infirmiers.ficheTraitement.actionOk"));
    } catch (e) {
      ctx.definirMessagePanneau(
        e instanceof Error ? e.message : t("infirmiers.ficheTraitement.erreurAction")
      );
    } finally {
      ctx.definirActionEnCours(false);
    }
  }

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
        {t("infirmiers.panneau.actionsRapides")}
      </h2>

      {!fiche ? (
        <p className="text-xs text-texte-secondaire">
          {t("infirmiers.ficheTraitement.panneau.selectionnerFiche")}
        </p>
      ) : (
        <div className="space-y-3">
          {fiche.statut === "EN_COURS" ? (
            <AlerteFin finEffectiveLe={fiche.finEffectiveLe} />
          ) : null}

          <div className="rounded-lg border border-gris-bordure bg-gris-tres-clair/30 px-3 py-2 text-xs">
            <p className="text-texte-secondaire">
              {t("infirmiers.ficheTraitement.panneau.periode")}
            </p>
            <p className="font-medium text-texte-principal">
              {formaterDateAffichage(fiche.debutTraitementLe)} →{" "}
              {formaterDateAffichage(fiche.finEffectiveLe)}
            </p>
            <p className="mt-0.5 text-texte-secondaire">
              {t("infirmiers.ficheTraitement.panneau.statut")} : {fiche.statut}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {fiche.statut === "EN_COURS" ? (
              <>
                <button
                  type="button"
                  disabled={ctx?.actionEnCours}
                  onClick={() => void action("cloturer")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-xs font-medium hover:bg-gris-tres-clair disabled:opacity-50"
                >
                  {ctx?.actionEnCours ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {t("infirmiers.ficheTraitement.actions.cloturer")}
                </button>
                <button
                  type="button"
                  disabled={ctx?.actionEnCours}
                  onClick={() => void action("prolonger")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-xs font-medium hover:bg-gris-tres-clair disabled:opacity-50"
                >
                  {ctx?.actionEnCours ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarPlus className="h-4 w-4 text-bleu-medical" />
                  )}
                  {t("infirmiers.ficheTraitement.actions.prolonger")}
                </button>
              </>
            ) : null}

            <Link
              href={`/api/infirmiers/fiches-traitement/${fiche.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-bleu-medical px-3 py-2.5 text-xs font-medium text-white hover:bg-bleu-medical/90"
            >
              <Download className="h-4 w-4" />
              {t("infirmiers.ficheTraitement.actions.telechargerPdf")}
            </Link>
          </div>

          {ctx?.messagePanneau ? (
            <p
              className={cn(
                "text-xs",
                ctx.messagePanneau.toLowerCase().includes("impossible") ||
                  ctx.messagePanneau.toLowerCase().includes("erreur")
                  ? "text-red-600"
                  : "text-emerald-700"
              )}
            >
              {ctx.messagePanneau}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

export function PanneauDroitFicheTraitement() {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4">
      <ResumePatient />
      <OrientationRapideTraitement />
      <ActionsRapidesTraitement />
    </aside>
  );
}

export function SectionsMobileFicheTraitementInfirmiers() {
  return (
    <div className="space-y-4 xl:hidden">
      <ResumePatient />
      <OrientationRapideTraitement />
      <ActionsRapidesTraitement />
    </div>
  );
}
