import {
  INFOS_LEGALES_TICKET,
} from "@/constants/ticket-thermique";
import type { DetailRecuPublic } from "@/lib/caisse/recu-public";
import { formaterMontantCaisse, formaterDate, calculerAge } from "@/features/caisse/utils-format";

const LIBELLES_STATUT: Record<string, string> = {
  PAYEE: "Payée",
  PARTIELLEMENT_PAYEE: "Partiellement payée",
  EMISE: "Émise",
  PRESCRIT: "Prescrit",
  PRELEVE: "Prélevé",
  EN_ANALYSE: "En analyse",
  TERMINE: "Terminé",
  FACTURE: "Facturé",
};

function libelleStatut(code: string) {
  return LIBELLES_STATUT[code] ?? code.replaceAll("_", " ");
}

interface PropsContenuRecuPublic {
  detail: DetailRecuPublic;
}

export function ContenuRecuPublic({ detail }: PropsContenuRecuPublic) {
  const L = INFOS_LEGALES_TICKET;
  const reste = Math.max(0, detail.montantTotal - detail.montantPaye);
  const age = calculerAge(detail.patient.dateNaissance);
  const nomComplet = `${detail.patient.prenom} ${detail.patient.nom}`.trim();
  const libellePaye =
    reste > 0 || detail.modeFacture === "AVANCE" ? "Avance" : "Payé";

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      <header className="bg-[#0f2744] px-4 pb-8 pt-6 text-white">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/90">
          HAM Laboratoire
        </p>
        <h1 className="mt-2 text-center text-xl font-bold tracking-tight">
          Reçu de caisse
        </h1>
        <p className="mt-1 text-center text-sm text-slate-300">
          {detail.numeroFacture}
        </p>
      </header>

      <main className="-mt-4 space-y-3 px-3 pb-10 sm:mx-auto sm:max-w-lg">
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Patient
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">{nomComplet}</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {detail.patient.numeroPatient}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                detail.statut === "PAYEE"
                  ? "bg-emerald-50 text-emerald-700"
                  : detail.statut === "PARTIELLEMENT_PAYEE"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-slate-100 text-slate-700"
              }`}
            >
              {libelleStatut(detail.statut)}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Âge</dt>
              <dd className="font-medium">{age != null ? `${age} ans` : "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Sexe</dt>
              <dd className="font-medium">{detail.patient.sexe || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Téléphone</dt>
              <dd className="font-medium">{detail.patient.telephone || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Dossier</dt>
              <dd className="font-medium">{detail.dossier.numeroDossier}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Facture
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">N° facture</dt>
              <dd className="font-semibold text-sky-700">{detail.numeroFacture}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Date</dt>
              <dd className="font-medium">
                {detail.emiseLe ? formaterDate(detail.emiseLe) : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Paiement</dt>
              <dd className="font-medium">
                {detail.modePaiement?.replaceAll("_", " ") || "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Examens & prestations
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Liés à cette facture uniquement
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {detail.lignes.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-500">
                Aucune prestation sur cette facture.
              </li>
            ) : (
              detail.lignes.map((l, i) => {
                const examen = detail.examens[i];
                return (
                  <li key={`${l.libelle}-${i}`} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{l.libelle}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {examen?.code ? `${examen.code} · ` : ""}
                        {libelleStatut(examen?.statut ?? "FACTURE")}
                        {l.quantite > 1 ? ` · ×${l.quantite}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums">
                      {formaterMontantCaisse(l.montant, detail.devise)}
                    </p>
                  </li>
                );
              })
            )}
          </ul>
          <div className="space-y-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-600">Total</span>
              <span className="font-bold text-sky-800">
                {formaterMontantCaisse(detail.montantTotal, detail.devise)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-600">{libellePaye}</span>
              <span className="font-semibold">
                {formaterMontantCaisse(detail.montantPaye, detail.devise)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-600">Reste</span>
              <span
                className={`font-bold ${reste <= 0 ? "text-emerald-600" : "text-amber-700"}`}
              >
                {formaterMontantCaisse(reste, detail.devise)}
              </span>
            </div>
          </div>
        </section>

        <footer className="rounded-2xl bg-white px-4 py-5 text-center text-xs leading-relaxed text-slate-500 shadow-sm ring-1 ring-slate-200/80">
          <p className="font-semibold text-slate-700">{L.sloganPied}</p>
          <p className="mt-2">{L.adresseLigne1}</p>
          <p>{L.adresseLigne2}</p>
          <p>{L.ville}</p>
          <p className="mt-2">{L.telephones}</p>
          <p>{L.email}</p>
        </footer>
      </main>
    </div>
  );
}
