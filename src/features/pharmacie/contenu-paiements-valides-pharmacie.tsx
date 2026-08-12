"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, SlidersHorizontal } from "lucide-react";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import {
  compterFiltresPaiementsValides,
  FILTRES_PAIEMENTS_VALIDES_VIDES,
  paiementValideCorrespondFiltres,
  type FiltresPaiementsValidesPharmacie,
} from "@/features/pharmacie/filtres-paiements-valides-pharmacie";
import {
  PanneauDroitPaiementsValidesPharmacie,
  SectionsMobilePaiementsValidesPharmacie,
} from "@/features/pharmacie/panneau-droit-paiements-valides-pharmacie";
import type { PaiementValidePharmacie } from "@/lib/pharmacie/lister-paiements-valides-pharmacie";
import { cn } from "@/lib/utils";

function libelleSexe(sexe: string | null) {
  if (sexe === "FEMININ") return "F";
  if (sexe === "MASCULIN") return "M";
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

function FormulaireFiltres({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
}: {
  valeurs: FiltresPaiementsValidesPharmacie;
  onChange: (v: FiltresPaiementsValidesPharmacie) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
}) {
  const { t } = useTranslation();
  const maj = <K extends keyof FiltresPaiementsValidesPharmacie>(
    cle: K,
    valeur: FiltresPaiementsValidesPharmacie[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  const CLASSE_CHAMP =
    "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";
  const CLASSE_LABEL =
    "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={CLASSE_LABEL} htmlFor="pv-date-du">
            {t("caisse.facturation.filtres.dateDu")}
          </label>
          <input
            id="pv-date-du"
            type="date"
            className={CLASSE_CHAMP}
            value={valeurs.dateDu}
            onChange={(e) => maj("dateDu", e.target.value)}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="pv-date-au">
            {t("caisse.facturation.filtres.dateAu")}
          </label>
          <input
            id="pv-date-au"
            type="date"
            className={CLASSE_CHAMP}
            value={valeurs.dateAu}
            onChange={(e) => maj("dateAu", e.target.value)}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="pv-nom">
            {t("pharmacie.vente.nom")}
          </label>
          <input
            id="pv-nom"
            className={CLASSE_CHAMP}
            value={valeurs.nom}
            onChange={(e) => maj("nom", e.target.value)}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="pv-prenom">
            {t("pharmacie.vente.prenom")}
          </label>
          <input
            id="pv-prenom"
            className={CLASSE_CHAMP}
            value={valeurs.prenom}
            onChange={(e) => maj("prenom", e.target.value)}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="pv-num-patient">
            {t("pharmacie.paiementsValides.colNumPatient")}
          </label>
          <input
            id="pv-num-patient"
            className={CLASSE_CHAMP}
            value={valeurs.numeroPatient}
            onChange={(e) => maj("numeroPatient", e.target.value)}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="pv-num-vente">
            {t("pharmacie.paiementsValides.colVente")}
          </label>
          <input
            id="pv-num-vente"
            className={CLASSE_CHAMP}
            value={valeurs.numeroVente}
            onChange={(e) => maj("numeroVente", e.target.value)}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="pv-tel">
            {t("pharmacie.vente.telephone")}
          </label>
          <input
            id="pv-tel"
            type="tel"
            className={CLASSE_CHAMP}
            value={valeurs.telephone}
            onChange={(e) => maj("telephone", e.target.value)}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="pv-sexe">
            {t("pharmacie.nouveauClient.sexe")}
          </label>
          <select
            id="pv-sexe"
            className={CLASSE_CHAMP}
            value={valeurs.sexe}
            onChange={(e) =>
              maj("sexe", e.target.value as FiltresPaiementsValidesPharmacie["sexe"])
            }
          >
            <option value="">{t("pharmacie.vente.choisir")}</option>
            <option value="MASCULIN">{t("pharmacie.nouveauClient.sexeM")}</option>
            <option value="FEMININ">{t("pharmacie.nouveauClient.sexeF")}</option>
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="pv-type">
            {t("pharmacie.paiementsValides.colType")}
          </label>
          <select
            id="pv-type"
            className={CLASSE_CHAMP}
            value={valeurs.type}
            onChange={(e) =>
              maj("type", e.target.value as FiltresPaiementsValidesPharmacie["type"])
            }
          >
            <option value="">{t("pharmacie.vente.filtreTous")}</option>
            <option value="DIRECTE">{t("pharmacie.paiementsValides.typeDirecte")}</option>
            <option value="ORDONNANCE">{t("pharmacie.paiementsValides.typeOrdonnance")}</option>
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="pv-statut">
            {t("pharmacie.paiementsValides.colStatut")}
          </label>
          <select
            id="pv-statut"
            className={CLASSE_CHAMP}
            value={valeurs.statut}
            onChange={(e) =>
              maj("statut", e.target.value as FiltresPaiementsValidesPharmacie["statut"])
            }
          >
            <option value="">{t("pharmacie.vente.filtreTous")}</option>
            <option value="PAYEE">{t("pharmacie.paiementsValides.statutPayee")}</option>
            <option value="DELIVREE">{t("pharmacie.paiementsValides.statutDelivree")}</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRechercher}
          className="rounded-lg bg-bleu-medical px-4 py-2 text-sm font-semibold text-white hover:bg-bleu-medical/90"
        >
          {t("caisse.facturation.filtres.rechercher")}
        </button>
        <button
          type="button"
          onClick={onReinitialiser}
          className="rounded-lg border border-gris-bordure px-4 py-2 text-sm font-semibold hover:bg-gris-tres-clair"
        >
          {t("caisse.facturation.filtres.reinitialiser")}
        </button>
      </div>
    </section>
  );
}

export function ContenuPaiementsValidesPharmacie({
  utilisateur,
}: {
  utilisateur: UtilisateurPharmacie;
}) {
  const { t } = useTranslation();
  const [paiements, setPaiements] = useState<PaiementValidePharmacie[]>([]);
  const [chargement, setChargement] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState(FILTRES_PAIEMENTS_VALIDES_VIDES);
  const [filtresAppliques, setFiltresAppliques] = useState(FILTRES_PAIEMENTS_VALIDES_VIDES);
  const [selectionne, setSelectionne] = useState<PaiementValidePharmacie | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const res = await fetch("/api/pharmacie/paiements-valides");
      const data = (await res.json()) as { paiements?: PaiementValidePharmacie[] };
      if (res.ok) setPaiements(data.paiements ?? []);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  const nbFiltresActifs = compterFiltresPaiementsValides(filtresAppliques);

  const paiementsFiltres = useMemo(
    () => paiements.filter((p) => paiementValideCorrespondFiltres(p, filtresAppliques)),
    [paiements, filtresAppliques]
  );

  const delivrer = async (venteId: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pharmacie/ventes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delivrer", venteId }),
      });
      const data = (await res.json()) as { message?: string };
      setMessage(data.message ?? (res.ok ? "OK" : t("pharmacie.common.erreur")));
      await charger();
      if (res.ok) {
        setSelectionne((prev) =>
          prev?.id === venteId ? { ...prev, statut: "DELIVREE" } : prev
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={t("pharmacie.vente.paiementsValides")}
      sousTitre={t("pharmacie.paiementsValides.sousTitre")}
      panneauDroit={
        <PanneauDroitPaiementsValidesPharmacie
          paiement={selectionne}
          busy={busy}
          onDelivrer={(id) => void delivrer(id)}
        />
      }
    >
      <div className="space-y-4">
        {message && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-texte-secondaire">
            {t("pharmacie.paiementsValides.listeAide")}
          </p>
          <button
            type="button"
            onClick={() => setFiltresOuverts((o) => !o)}
            aria-expanded={filtresOuverts}
            className={cn(
              "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors",
              filtresOuverts
                ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                : "border-gris-bordure bg-white hover:bg-gris-tres-clair"
            )}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span
              className={cn(
                "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                nbFiltresActifs > 0 ? "bg-red-500" : "bg-slate-400"
              )}
            >
              {nbFiltresActifs}
            </span>
          </button>
        </div>

        {filtresOuverts && (
          <FormulaireFiltres
            valeurs={brouillonFiltres}
            onChange={setBrouillonFiltres}
            onRechercher={() => {
              setFiltresAppliques(brouillonFiltres);
              setFiltresOuverts(false);
            }}
            onReinitialiser={() => {
              setBrouillonFiltres(FILTRES_PAIEMENTS_VALIDES_VIDES);
              setFiltresAppliques(FILTRES_PAIEMENTS_VALIDES_VIDES);
            }}
          />
        )}

        <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
          <div className="border-b border-gris-bordure px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-texte-principal">
              {t("pharmacie.paiementsValides.listeTitre", { count: paiementsFiltres.length })}
            </h3>
          </div>
          {chargement ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-texte-secondaire">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : paiementsFiltres.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
              {nbFiltresActifs > 0
                ? t("caisse.facturation.filtres.aucunResultat")
                : t("pharmacie.paiementsValides.listeVide")}
            </p>
          ) : (
            <div className="overflow-hidden">
              <table className="tableau-sigh">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                  <tr>
                    <th className="px-4 py-2.5">N°</th>
                    <th className="px-4 py-2.5">{t("pharmacie.paiementsValides.colVente")}</th>
                    <th className="px-4 py-2.5">{t("pharmacie.vente.colPatient")}</th>
                    <th className="hidden px-4 py-2.5 sm:table-cell">
                      {t("pharmacie.paiementsValides.colNumPatient")}
                    </th>
                    <th className="hidden px-4 py-2.5 md:table-cell">
                      {t("pharmacie.paiementsValides.colType")}
                    </th>
                    <th className="px-4 py-2.5">{t("pharmacie.vente.colMontant")}</th>
                    <th className="hidden px-4 py-2.5 lg:table-cell">
                      {t("pharmacie.paiementsValides.colPaiement")}
                    </th>
                    <th className="px-4 py-2.5">{t("pharmacie.paiementsValides.colStatut")}</th>
                    <th className="px-4 py-2.5">{t("pharmacie.vente.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paiementsFiltres.map((p, index) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectionne(p)}
                      className={cn(
                        "cursor-pointer border-t border-gris-bordure/70 hover:bg-slate-50",
                        selectionne?.id === p.id && "bg-bleu-medical-clair/30"
                      )}
                    >
                      <td className="px-4 py-3 tabular-nums text-texte-secondaire">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-bleu-medical">
                        {p.numero}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{p.nomComplet}</p>
                        <p className="text-[11px] text-texte-secondaire lg:hidden">
                          {p.heurePaiement}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-xs sm:table-cell">
                        {p.numeroPatient}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                            p.estClientWalkIn
                              ? "bg-violet-100 text-violet-800"
                              : "bg-blue-100 text-blue-800"
                          )}
                        >
                          {p.estClientWalkIn
                            ? t("pharmacie.paiementsValides.badgeClient")
                            : libelleType(p.type, t)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums">
                        {formaterMontant(p.montantTotal)}
                      </td>
                      <td className="hidden px-4 py-3 tabular-nums text-texte-secondaire lg:table-cell">
                        {p.heurePaiement}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                            p.statut === "PAYEE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          )}
                        >
                          {libelleStatut(p.statut, t)}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {p.statut === "PAYEE" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void delivrer(p.id)}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            {t("pharmacie.vente.remettre")}
                          </button>
                        ) : (
                          <span className="text-xs text-texte-secondaire">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <SectionsMobilePaiementsValidesPharmacie
          paiement={selectionne}
          busy={busy}
          onDelivrer={(id) => void delivrer(id)}
        />
      </div>
    </MiseEnPagePharmacie>
  );
}
