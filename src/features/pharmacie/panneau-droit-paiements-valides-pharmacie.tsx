"use client";

import { useTranslation } from "react-i18next";
import { PackageCheck, Pill } from "lucide-react";
import type { PaiementValidePharmacie } from "@/lib/pharmacie/lister-paiements-valides-pharmacie";
import { cn } from "@/lib/utils";

function initiales(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || "—";
}

function libelleSexe(sexe: string | null, t: (k: string) => string) {
  if (sexe === "FEMININ") return t("pharmacie.nouveauClient.sexeF");
  if (sexe === "MASCULIN") return t("pharmacie.nouveauClient.sexeM");
  return "—";
}

function libelleType(type: string, t: (k: string) => string) {
  if (type === "ORDONNANCE") return t("pharmacie.paiementsValides.typeOrdonnance");
  if (type === "DIRECTE") return t("pharmacie.paiementsValides.typeDirecte");
  return type;
}

function libelleStatut(statut: string, t: (k: string) => string) {
  if (statut === "PAYEE") return t("pharmacie.paiementsValides.statutPayee");
  if (statut === "DELIVREE") return t("pharmacie.paiementsValides.statutDelivree");
  return statut;
}

function formaterMontant(n: number) {
  return `${n.toLocaleString("fr-FR")} CDF`;
}

function formaterDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
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
      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("pharmacie.paiementsValides.panneauResume")}
        </h2>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
            {paiement ? initiales(paiement.prenom, paiement.nom) : "—"}
          </div>
          <p className="mt-3 text-sm font-semibold text-texte-principal">
            {paiement?.nomComplet ?? t("pharmacie.panneau.aucunPatient")}
          </p>
          {paiement?.numeroPatient && (
            <p className="mt-0.5 font-mono text-[11px] text-texte-secondaire">
              {paiement.numeroPatient}
            </p>
          )}
        </div>
        {paiement && (
          <div className="mt-4 space-y-2 text-left text-xs">
            <div className="flex justify-between gap-2">
              <span className="text-texte-secondaire">{t("pharmacie.nouveauClient.age")}</span>
              <span className="font-medium">{paiement.age ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-texte-secondaire">{t("pharmacie.nouveauClient.sexe")}</span>
              <span className="font-medium">{libelleSexe(paiement.sexe, t)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-texte-secondaire">{t("pharmacie.vente.telephone")}</span>
              <span className="font-medium">{paiement.telephone}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-texte-secondaire">{t("pharmacie.vente.dossier")}</span>
              <span className="font-mono font-medium">{paiement.numeroDossier}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-texte-secondaire">{t("pharmacie.paiementsValides.colVente")}</span>
              <span className="font-medium text-bleu-medical">{paiement.numero}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-texte-secondaire">{t("pharmacie.vente.colMontant")}</span>
              <span className="font-semibold">{formaterMontant(paiement.montantTotal)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-texte-secondaire">{t("pharmacie.paiementsValides.colPaiement")}</span>
              <span className="font-medium">
                {formaterDate(paiement.payeeLe)} · {paiement.heurePaiement}
              </span>
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
        )}
        {!paiement && (
          <p className="mt-4 text-center text-xs text-texte-secondaire">
            {t("pharmacie.paiementsValides.selectionnerListe")}
          </p>
        )}
      </section>

      {paiement && (
        <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t("pharmacie.panneau.actionsRapides")}
          </h2>
          {paiement.statut === "PAYEE" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onDelivrer(paiement.id)}
              className="flex w-full min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
            >
              <PackageCheck className="h-6 w-6" strokeWidth={1.75} />
              {t("pharmacie.vente.remettre")}
            </button>
          ) : (
            <div className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-gris-tres-clair/50 p-3 text-center text-xs text-texte-secondaire">
              <Pill className="h-6 w-6 opacity-50" strokeWidth={1.75} />
              {t("pharmacie.paiementsValides.dejaDelivree")}
            </div>
          )}
        </section>
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
