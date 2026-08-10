"use client";

import { useTranslation } from "react-i18next";
import { PackageCheck, Pill } from "lucide-react";
import { ApercuFacturePharmaciePanneau } from "@/features/pharmacie/apercu-facture-pharmacie-panneau";
import type { PaiementValidePharmacie } from "@/lib/pharmacie/lister-paiements-valides-pharmacie";
import { cn } from "@/lib/utils";

function libelleStatut(statut: string, t: (k: string) => string) {
  if (statut === "PAYEE") return t("pharmacie.paiementsValides.statutPayee");
  if (statut === "DELIVREE") return t("pharmacie.paiementsValides.statutDelivree");
  return statut;
}

function formaterMontant(n: number) {
  return `${n.toLocaleString("fr-FR")} CDF`;
}

function ContenuPanneau({
  paiement,
  busy,
  onDelivrer,
}: {
  paiement: PaiementValidePharmacie | null;
  busy: boolean;
  onDelivrer: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <ApercuFacturePharmaciePanneau venteId={paiement?.id ?? null} />

      {paiement && (
        <>
          <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
              {t("pharmacie.paiementsValides.panneauResume")}
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-texte-secondaire">{t("pharmacie.vente.colPatient")}</span>
                <span className="font-semibold text-texte-principal">{paiement.nomComplet}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-texte-secondaire">{t("pharmacie.paiementsValides.colVente")}</span>
                <span className="font-mono font-medium text-bleu-medical">{paiement.numero}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-texte-secondaire">{t("pharmacie.vente.colMontant")}</span>
                <span className="font-semibold">{formaterMontant(paiement.montantTotal)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-texte-secondaire">{t("pharmacie.paiementsValides.colStatut")}</span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                    paiement.statut === "PAYEE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  )}
                >
                  {libelleStatut(paiement.statut, t)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
              {t("pharmacie.panneau.actionsRapides")}
            </h2>
            {paiement.statut === "PAYEE" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onDelivrer(paiement.id)}
                className="flex w-full min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
              >
                <PackageCheck className="h-6 w-6" strokeWidth={1.75} />
                {t("pharmacie.vente.remettre")}
              </button>
            ) : (
              <div className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-gris-tres-clair/50 p-3 text-center text-xs text-texte-secondaire">
                <Pill className="h-6 w-6 opacity-50" strokeWidth={1.75} />
                {t("pharmacie.paiementsValides.dejaDelivree")}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

export function PanneauDroitPaiementsValidesPharmacie({
  paiement,
  busy,
  onDelivrer,
}: {
  paiement: PaiementValidePharmacie | null;
  busy: boolean;
  onDelivrer: (id: string) => void;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4">
      <ContenuPanneau paiement={paiement} busy={busy} onDelivrer={onDelivrer} />
    </aside>
  );
}

export function SectionsMobilePaiementsValidesPharmacie({
  paiement,
  busy,
  onDelivrer,
}: {
  paiement: PaiementValidePharmacie | null;
  busy: boolean;
  onDelivrer: (id: string) => void;
}) {
  return (
    <div className="space-y-4 xl:hidden">
      <ContenuPanneau paiement={paiement} busy={busy} onDelivrer={onDelivrer} />
    </div>
  );
}
