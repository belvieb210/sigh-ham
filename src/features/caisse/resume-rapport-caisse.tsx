"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { GraphiqueEncaissements } from "@/features/caisse/graphique-encaissements";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { RapportCaissePayload } from "@/lib/caisse/types";
import { cn } from "@/lib/utils";

interface PropsResumeRapportCaisse {
  rapport: RapportCaissePayload;
}

function LigneResume({
  label,
  valeur,
  emphase,
}: {
  label: string;
  valeur: string;
  emphase?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-gris-bordure/60 py-2.5 last:border-0">
      <span className="text-xs text-texte-secondaire">{label}</span>
      <span
        className={cn(
          "text-right text-sm tabular-nums text-texte-principal",
          emphase && "font-bold"
        )}
      >
        {valeur}
      </span>
    </div>
  );
}

export function ResumeRapportCaisse({ rapport }: PropsResumeRapportCaisse) {
  const { t } = useTranslation();
  const { agregats, comparaison, repartitionModes, caissiers, serie, facturesOuvertes, devise } =
    rapport;
  const variation = comparaison.variationPct;
  const positif = variation != null && variation >= 0;

  const pointsGraphique = serie.map((p) => ({
    date: p.cle,
    label: p.label,
    montant: p.montant,
  }));

  return (
    <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
      <section className="rounded-2xl border border-gris-bordure bg-white p-5 shadow-sm">
        <h3 className="text-center text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("caisse.rapports.resume.titre")}
        </h3>
        <p className="mt-2 text-center text-sm font-semibold capitalize text-texte-principal">
          {rapport.labelPeriode}
        </p>

        <div className="mt-4">
          <LigneResume
            label={t("caisse.rapports.resume.facturesEmises")}
            valeur={String(agregats.facturesCount)}
          />
          <LigneResume
            label={t("caisse.rapports.resume.montantFacture")}
            valeur={formaterMontantCaisse(agregats.facturesMontant, devise)}
          />
          <LigneResume
            label={t("caisse.rapports.resume.encaissements")}
            valeur={String(agregats.encaissementsCount)}
          />
          <LigneResume
            label={t("caisse.rapports.resume.montantEncaisse")}
            valeur={formaterMontantCaisse(agregats.encaissementsMontant, devise)}
            emphase
          />
          <LigneResume
            label={t("caisse.rapports.resume.resteDu")}
            valeur={formaterMontantCaisse(agregats.resteDu, devise)}
          />
          <LigneResume
            label={t("caisse.rapports.resume.facturesOuvertes")}
            valeur={String(agregats.facturesOuvertesCount)}
          />
        </div>

        {variation != null && (
          <p
            className={cn(
              "mt-3 text-center text-xs font-medium",
              positif ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {positif ? "↑" : "↓"} {Math.abs(variation)}%{" "}
            {t("caisse.rapports.resume.vsPrecedent", {
              label: comparaison.labelPrecedent,
            })}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-gris-bordure bg-white p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("caisse.rapports.resume.repartitionModes")}
        </h3>
        {repartitionModes.length === 0 ? (
          <p className="mt-3 text-xs text-texte-secondaire">
            {t("caisse.rapports.resume.aucuneRepartition")}
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {repartitionModes.map((r) => (
              <li key={r.mode}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-texte-principal">
                    {t(`caisse.modesPaiement.${r.mode}`)}
                  </span>
                  <span className="tabular-nums text-texte-secondaire">
                    {formaterMontantCaisse(r.montant, devise)} · {r.partPct}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gris-tres-clair">
                  <div
                    className="h-full rounded-full bg-bleu-medical"
                    style={{ width: `${Math.min(100, Math.max(2, r.partPct))}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {caissiers.length > 0 && (
        <section className="rounded-2xl border border-gris-bordure bg-white p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t("caisse.rapports.resume.caissiers")}
          </h3>
          <ul className="mt-3 divide-y divide-gris-bordure/70">
            {caissiers.slice(0, 5).map((c) => (
              <li
                key={c.caissierId}
                className="flex items-baseline justify-between gap-2 py-2 text-sm"
              >
                <span className="truncate text-texte-principal">{c.nom}</span>
                <span className="shrink-0 tabular-nums font-semibold text-texte-principal">
                  {formaterMontantCaisse(c.montant, devise)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pointsGraphique.length > 0 && (
        <section className="rounded-2xl border border-gris-bordure bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t("caisse.rapports.resume.evolution")}
          </h3>
          <GraphiqueEncaissements
            points={pointsGraphique}
            labelAxeY={t("caisse.rapports.resume.montantEncaisse")}
            labelSerie={t("caisse.rapports.resume.evolution")}
          />
        </section>
      )}

      <section className="rounded-2xl border border-gris-bordure bg-white p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("caisse.rapports.resume.facturesOuvertesTitre")}
        </h3>
        {facturesOuvertes.length === 0 ? (
          <p className="mt-3 text-xs text-texte-secondaire">
            {t("caisse.rapports.videOuvertes")}
          </p>
        ) : (
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {facturesOuvertes.slice(0, 8).map((f) => (
              <li key={f.id} className="border-b border-gris-bordure/50 pb-2 last:border-0">
                <Link
                  href={`/sigh/caisse/facturation?dossier=${f.dossierId}`}
                  className="text-sm font-semibold text-bleu-medical hover:underline"
                >
                  {f.numeroFacture}
                </Link>
                <p className="truncate text-xs text-texte-secondaire">{f.patient}</p>
                <p className="mt-0.5 text-xs font-medium tabular-nums text-texte-principal">
                  {t("caisse.rapports.resume.reste")}:{" "}
                  {formaterMontantCaisse(f.reste, f.devise)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
