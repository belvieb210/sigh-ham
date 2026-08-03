"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { RapportAvoirsPayload } from "@/lib/caisse/types";

interface Props {
  rapport: RapportAvoirsPayload;
}

function Ligne({ label, valeur, emphase }: { label: string; valeur: string; emphase?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-gris-bordure/60 py-2.5 last:border-0">
      <span className="text-xs text-texte-secondaire">{label}</span>
      <span className={`text-right text-sm tabular-nums text-texte-principal ${emphase ? "font-bold" : ""}`}>
        {valeur}
      </span>
    </div>
  );
}

export function ResumeAvoirsCaisse({ rapport }: Props) {
  const { t } = useTranslation();
  const { agregats, devise, ledger } = rapport;
  const ouvertes = ledger.filter((l) => l.type === "OUVERT" || l.reste > 0).slice(0, 8);

  return (
    <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
      <section className="rounded-2xl border border-gris-bordure bg-white p-5 shadow-sm">
        <h3 className="text-center text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("caisse.avoirs.resume.titre")}
        </h3>
        <p className="mt-2 text-center text-sm font-semibold text-texte-principal">
          {rapport.labelPeriode}
        </p>
        <div className="mt-4">
          <Ligne
            label={t("caisse.avoirs.resume.avances")}
            valeur={`${agregats.avancesCount} · ${formaterMontantCaisse(agregats.avancesMontant, devise)}`}
          />
          <Ligne
            label={t("caisse.avoirs.resume.soldes")}
            valeur={`${agregats.soldesCount} · ${formaterMontantCaisse(agregats.soldesMontant, devise)}`}
          />
          <Ligne
            label={t("caisse.avoirs.resume.ouvertes")}
            valeur={String(agregats.ouvertesCount)}
          />
          <Ligne
            label={t("caisse.avoirs.resume.resteDu")}
            valeur={formaterMontantCaisse(agregats.resteDu, devise)}
            emphase
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gris-bordure bg-white p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("caisse.avoirs.resume.aSuivre")}
        </h3>
        {ouvertes.length === 0 ? (
          <p className="mt-3 text-xs text-texte-secondaire">{t("caisse.avoirs.videOuvertes")}</p>
        ) : (
          <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
            {ouvertes.map((f) => (
              <li key={f.id} className="border-b border-gris-bordure/50 pb-2 last:border-0">
                <Link
                  href={`/sigh/caisse/facturation?dossier=${f.dossierId}`}
                  className="text-sm font-semibold text-bleu-medical hover:underline"
                >
                  {f.numeroFacture}
                </Link>
                <p className="truncate text-xs text-texte-secondaire">{f.patient}</p>
                <p className="mt-0.5 text-xs font-medium tabular-nums">
                  {t("caisse.avoirs.resume.reste")}: {formaterMontantCaisse(f.reste, f.devise)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
