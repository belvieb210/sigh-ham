"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Pill, UserPlus } from "lucide-react";
import type { ClientEnregistrePharmacie } from "@/lib/pharmacie/lister-clients-enregistres-pharmacie";
import { cn } from "@/lib/utils";

function initiales(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || "—";
}

function libelleSexe(sexe: string | null, t: (k: string) => string) {
  if (sexe === "FEMININ") return t("pharmacie.nouveauClient.sexeF");
  if (sexe === "MASCULIN") return t("pharmacie.nouveauClient.sexeM");
  return "—";
}

function ContenuPanneau({
  client,
}: {
  client: ClientEnregistrePharmacie | null;
}) {
  const { t } = useTranslation();

  return (
    <>
      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("pharmacie.nouveauClient.panneauResume")}
        </h2>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
            {client ? initiales(client.prenom, client.nom) : "—"}
          </div>
          <p className="mt-3 text-sm font-semibold text-texte-principal">
            {client?.nomComplet ?? t("pharmacie.panneau.aucunPatient")}
          </p>
          {client?.numeroDossier && (
            <p className="mt-0.5 font-mono text-[11px] text-texte-secondaire">
              {client.numeroDossier}
            </p>
          )}
        </div>
        <div className="mt-4 space-y-2 text-left text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("pharmacie.panneau.age")}</span>
            <span className="font-medium text-texte-principal">
              {client?.age != null ? `${client.age} ans` : "—"}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("pharmacie.nouveauClient.sexe")}</span>
            <span className="font-medium text-texte-principal">
              {client ? libelleSexe(client.sexe, t) : "—"}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("pharmacie.panneau.telephone")}</span>
            <span className="font-medium text-texte-principal">
              {client?.telephone ?? "—"}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("pharmacie.nouveauClient.adresse")}</span>
            <span className="max-w-[60%] truncate text-right font-medium text-texte-principal">
              {client?.adresse ?? "—"}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("pharmacie.vente.dossier")}</span>
            <span className="font-mono font-medium text-texte-principal">
              {client?.numeroDossier ?? "—"}
            </span>
          </div>
        </div>
        {!client && (
          <p className="mt-3 text-center text-xs text-texte-secondaire">
            {t("pharmacie.nouveauClient.selectionnerListe")}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("pharmacie.panneau.actionsRapides")}
        </h2>
        <div className="grid grid-cols-1 gap-2">
          <Link
            href={
              client
                ? `/sigh/pharmacie/vente?dossier=${encodeURIComponent(client.dossierId)}`
                : "/sigh/pharmacie/vente"
            }
            className={cn(
              "flex min-h-[72px] items-center justify-center gap-3 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-sm font-medium text-texte-principal",
              client
                ? "hover:border-bleu-medical hover:bg-bleu-medical-clair"
                : "pointer-events-none opacity-50"
            )}
            aria-disabled={!client}
            tabIndex={client ? 0 : -1}
          >
            <Pill className="h-5 w-5 shrink-0 text-bleu-medical" strokeWidth={1.75} />
            {t("pharmacie.nouveauClient.ouvrirVente")}
          </Link>
          <Link
            href="/sigh/pharmacie/vente"
            className="flex min-h-[56px] items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-white p-3 text-xs font-medium text-texte-principal hover:bg-gris-tres-clair"
          >
            <UserPlus className="h-4 w-4 text-bleu-medical" />
            {t("pharmacie.nouveauClient.allerVente")}
          </Link>
        </div>
      </section>
    </>
  );
}

export function PanneauDroitNouveauClientPharmacie({
  client,
}: {
  client: ClientEnregistrePharmacie | null;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4">
      <ContenuPanneau client={client} />
    </aside>
  );
}

export function SectionsMobileNouveauClientPharmacie({
  client,
}: {
  client: ClientEnregistrePharmacie | null;
}) {
  return (
    <div className="space-y-4 xl:hidden">
      <ContenuPanneau client={client} />
    </div>
  );
}
