"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MoreVertical,
  Printer,
  Receipt,
  SlidersHorizontal,
} from "lucide-react";
import {
  compterFiltresActifs,
  FILTRES_FACTURATION_VIDES,
  FormulaireFiltresFacturationCaisse,
  type FiltresFacturationCaisse,
} from "@/features/caisse/formulaire-filtres-facturation-caisse";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import {
  calculerAge,
  formaterMontantCaisse,
  initiales,
} from "@/features/caisse/utils-format";
import { BadgeTypePersonneCaisse } from "@/features/caisse/badge-type-personne-caisse";
import { imprimerEtiquettesTubesFacture } from "@/lib/caisse/imprimer-etiquettes-tubes";
import { imprimerRecuCaisseThermique } from "@/lib/caisse/imprimer-recu-thermique";
import type { FactureResumeJour } from "@/lib/caisse/types";
import { LigneNumeroVisiteResume } from "@/components/ui/ligne-numero-visite-resume";
import { cn } from "@/lib/utils";

function ouvrirFacturePharma(fac: FactureResumeJour) {
  imprimerRecuCaisseThermique(fac);
}

export type VarianteFacturesCaisse = "toutes" | "impression";

interface PropsContenuFacturesJourCaisse {
  utilisateur: UtilisateurCaisse;
  /** `impression` = factures payées ou avec avance (partiellement payées) */
  variante?: VarianteFacturesCaisse;
}

const PAR_PAGE_FACTURES = 15;
const PAR_PAGE_IMPRESSION = 30;

function statutAffiche(fac: FactureResumeJour) {
  if (fac.statut === "PAYEE") return "payee" as const;
  if (
    fac.statut === "PARTIELLEMENT_PAYEE" ||
    fac.modeFacture === "AVANCE"
  ) {
    return "payeeAvance" as const;
  }
  if (fac.montantPaye > 0) return "partielle" as const;
  return "impayee" as const;
}

function classeStatutUi(statutUi: ReturnType<typeof statutAffiche>) {
  return cn(
    "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
    statutUi === "payee" && "bg-emerald-50 text-emerald-700",
    statutUi === "payeeAvance" && "bg-sky-50 text-sky-700",
    statutUi === "partielle" && "bg-amber-50 text-amber-700",
    statutUi === "impayee" && "bg-red-50 text-red-700"
  );
}

function estFactureImprimable(fac: FactureResumeJour) {
  return fac.statut === "PAYEE" || fac.statut === "PARTIELLEMENT_PAYEE";
}

export function ContenuFacturesJourCaisse({
  utilisateur,
  variante = "toutes",
}: PropsContenuFacturesJourCaisse) {
  const { t } = useTranslation();
  const modeImpression = variante === "impression";
  const parPage = modeImpression ? PAR_PAGE_IMPRESSION : PAR_PAGE_FACTURES;
  const titreKey = modeImpression
    ? "caisse.impressionFacture.titre"
    : "caisse.factures.titre";
  const sousTitreKey = modeImpression
    ? "caisse.impressionFacture.sousTitre"
    : "caisse.factures.sousTitre";
  const videKey = modeImpression
    ? "caisse.impressionFacture.vide"
    : "caisse.factures.vide";

  const [factures, setFactures] = useState<FactureResumeJour[]>([]);
  const [chargement, setChargement] = useState(true);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );
  const [filtresAppliques, setFiltresAppliques] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );
  const [menuOuvertId, setMenuOuvertId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [approbationId, setApprobationId] = useState<string | null>(null);
  const [messageAction, setMessageAction] = useState<string | null>(null);

  const approuverFacture = async (fac: FactureResumeJour) => {
    setApprobationId(fac.id);
    setMessageAction(null);
    try {
      const res = await fetch(`/api/caisse/factures/${fac.id}/approuver`, {
        method: "POST",
      });
      const data = (await res.json()) as { erreur?: string };
      if (!res.ok) {
        setMessageAction(data.erreur || t("caisse.factures.approuverErreur"));
        return;
      }
      setFactures((liste) =>
        liste.map((f) =>
          f.id === fac.id
            ? { ...f, approuvee: true, approuveeLe: new Date().toISOString() }
            : f
        )
      );
      setMessageAction(t("caisse.factures.approuverOk"));
      setMenuOuvertId(null);
    } catch {
      setMessageAction(t("caisse.factures.approuverErreur"));
    } finally {
      setApprobationId(null);
    }
  };

  const ouvrirBarreCode = async (fac: FactureResumeJour) => {
    setMenuOuvertId(null);
    setMessageAction(null);
    const resultat = await imprimerEtiquettesTubesFacture(fac.id);
    if (!resultat.ok) {
      setMessageAction(resultat.erreur || t("caisse.factures.barreCodeErreur"));
    }
  };

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/caisse/factures");
        const data = (await res.json()) as { factures?: FactureResumeJour[] };
        if (!annule && res.ok) {
          const brutes = data.factures ?? [];
          const liste = modeImpression
            ? brutes.filter(estFactureImprimable)
            : brutes;
          setFactures(liste);
          if (liste[0]) setSelectionId(liste[0].id);
        }
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [modeImpression]);

  const facturesFiltrees = useMemo(() => {
    const f = filtresAppliques;
    return factures.filter((fac) => {
      if (modeImpression && !estFactureImprimable(fac)) return false;
      if (f.nom.trim() && !fac.nom.toLowerCase().includes(f.nom.trim().toLowerCase())) {
        return false;
      }
      if (
        f.prenom.trim() &&
        !fac.prenom.toLowerCase().includes(f.prenom.trim().toLowerCase())
      ) {
        return false;
      }
      if (f.telephone.trim()) {
        const tel = (fac.telephone ?? "").replace(/\s+/g, "");
        if (!tel.includes(f.telephone.trim().replace(/\s+/g, ""))) return false;
      }
      if (f.numeroFacture.trim()) {
        if (
          !fac.numeroFacture
            .toLowerCase()
            .includes(f.numeroFacture.trim().toLowerCase())
        ) {
          return false;
        }
      }
      if (f.numeroEnreg.trim()) {
        const enreg = f.numeroEnreg.trim().toLowerCase();
        if (
          !fac.numeroDossier.toLowerCase().includes(enreg) &&
          !fac.numeroPatient.toLowerCase().includes(enreg)
        ) {
          return false;
        }
      }
      if (f.idEntite.trim()) {
        const id = f.idEntite.trim().toLowerCase();
        if (
          !fac.dossierId.toLowerCase().includes(id) &&
          !fac.numeroPatient.toLowerCase().includes(id) &&
          !fac.id.toLowerCase().includes(id)
        ) {
          return false;
        }
      }
      if (f.dateDu || f.dateAu) {
        const jour = (fac.emiseLe ?? "").slice(0, 10);
        if (!jour) return false;
        if (f.dateDu && jour < f.dateDu) return false;
        if (f.dateAu && jour > f.dateAu) return false;
      }
      return true;
    });
  }, [factures, filtresAppliques, modeImpression]);

  const nbFiltresActifs = compterFiltresActifs(filtresAppliques);

  const totalPages = Math.max(1, Math.ceil(facturesFiltrees.length / parPage));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * parPage;
  const facturesPage = facturesFiltrees.slice(debut, debut + parPage);

  useEffect(() => {
    setPage(1);
  }, [filtresAppliques]);

  const factureSelectionnee = useMemo(
    () =>
      facturesFiltrees.find((f) => f.id === selectionId) ??
      facturesFiltrees[0] ??
      null,
    [facturesFiltrees, selectionId]
  );

  useEffect(() => {
    if (
      factureSelectionnee &&
      selectionId !== factureSelectionnee.id &&
      !facturesFiltrees.some((f) => f.id === selectionId)
    ) {
      setSelectionId(factureSelectionnee.id);
    }
  }, [factureSelectionnee, facturesFiltrees, selectionId]);

  const age = calculerAge(factureSelectionnee?.dateNaissance ?? null);
  const reste = factureSelectionnee
    ? Math.max(0, factureSelectionnee.montantTotal - factureSelectionnee.montantPaye)
    : 0;

  const appliquerFiltres = () => {
    setFiltresAppliques(brouillonFiltres);
    setPage(1);
  };

  const reinitialiserFiltres = () => {
    setBrouillonFiltres(FILTRES_FACTURATION_VIDES);
    setFiltresAppliques(FILTRES_FACTURATION_VIDES);
    setPage(1);
  };

  const libelleModePaiement = (fac: FactureResumeJour) => {
    if (fac.modeFacture === "PRISE_EN_CHARGE") {
      return t("caisse.modesFacture.PRISE_EN_CHARGE");
    }
    if (fac.modePaiement) {
      return t(`caisse.modesPaiement.${fac.modePaiement}`);
    }
    return "—";
  };

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t(titreKey)}
      sousTitre={t(sousTitreKey)}
    >
      <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-texte-principal">
              {t(titreKey)}
            </h2>
            <p className="mt-1 text-sm text-texte-secondaire">
              {t(sousTitreKey)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFiltresOuverts((o) => !o)}
            aria-expanded={filtresOuverts}
            aria-label={
              filtresOuverts
                ? t("caisse.facturation.fermerFiltres")
                : t("caisse.facturation.ouvrirFiltres")
            }
            className={cn(
              "relative inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors",
              filtresOuverts
                ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
            )}
          >
            <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
            <span
              className={cn(
                "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm",
                nbFiltresActifs > 0 ? "bg-red-500" : "bg-slate-400"
              )}
            >
              {nbFiltresActifs}
            </span>
          </button>
        </div>

        {filtresOuverts && (
          <FormulaireFiltresFacturationCaisse
            valeurs={brouillonFiltres}
            onChange={setBrouillonFiltres}
            onRechercher={appliquerFiltres}
            onReinitialiser={reinitialiserFiltres}
          />
        )}

        {messageAction && (
          <p
            className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800"
            role="status"
          >
            {messageAction}
          </p>
        )}

        {chargement ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-white py-16 text-sm text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : factures.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-14 text-center text-sm text-texte-secondaire">
            {t(videKey)}
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
              {facturesFiltrees.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-texte-secondaire">
                  {t("caisse.facturation.filtres.aucunResultat")}
                </p>
              ) : (
                <>
                <div className="conteneur-tableau-sigh">
        <table className="tableau-sigh">
                    <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                      <tr>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.factures.numero")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.factures.patient")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.factures.examens")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold text-right">
                          {t("caisse.factures.montant")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.factures.modePaiement")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.factures.statut")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold text-center">
                          {t("caisse.factures.action")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturesPage.map((f) => {
                        const statutUi = statutAffiche(f);
                        const actif = factureSelectionnee?.id === f.id;
                        const nb = f.nombreLignes || f.nombreExamens;
                        return (
                          <tr
                            key={f.id}
                            onClick={() => {
                              setSelectionId(f.id);
                              setMenuOuvertId(null);
                            }}
                            className={cn(
                              "cursor-pointer border-t border-gris-bordure/80 transition-colors",
                              actif
                                ? "bg-bleu-medical-clair/40"
                                : "hover:bg-gris-tres-clair/60"
                            )}
                          >
                            <td className="px-2 py-1.5">
                              <span className="font-semibold text-bleu-medical">
                                {f.numeroFacture}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              <p className="flex flex-wrap items-center gap-1.5 font-semibold text-texte-principal">
                                <span>
                                  {f.prenom} {f.nom}
                                </span>
                                <BadgeTypePersonneCaisse estClientWalkIn={f.estClientWalkIn} />
                              </p>
                              <p className="text-xs text-texte-secondaire">
                                ID:{" "}
                                {f.estClientWalkIn ? f.numeroDossier : f.numeroPatient}
                              </p>
                            </td>
                            <td className="px-2 py-1.5 font-semibold text-texte-principal">
                              {f.estClientWalkIn
                                ? t("caisse.facturation.nbMedicaments", {
                                    count: f.nombreLignes || nb,
                                  })
                                : t("caisse.factures.nbExamens", { count: nb })}
                            </td>
                            <td className="px-2 py-1.5 text-right font-bold tabular-nums text-texte-principal">
                              {formaterMontantCaisse(f.montantTotal, f.devise)}
                            </td>
                            <td className="px-2 py-1.5 text-texte-secondaire">
                              {libelleModePaiement(f)}
                            </td>
                            <td className="px-2 py-1.5">
                              <span className={classeStatutUi(statutUi)}>
                                {t(`caisse.factures.statutsUi.${statutUi}`)}
                              </span>
                            </td>
                            <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                              <div className="relative flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectionId(f.id)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-texte-secondaire hover:bg-gris-tres-clair hover:text-bleu-medical"
                                  aria-label={t("caisse.factures.voir")}
                                  title={t("caisse.factures.voir")}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectionId(f.id);
                                    imprimerRecuCaisseThermique(f);
                                  }}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-texte-secondaire hover:bg-gris-tres-clair hover:text-bleu-medical"
                                  aria-label={t("caisse.factures.imprimer")}
                                  title={t("caisse.factures.imprimer")}
                                >
                                  <Printer className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMenuOuvertId((id) => (id === f.id ? null : f.id))
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-texte-secondaire hover:bg-gris-tres-clair hover:text-bleu-medical"
                                  aria-label={t("caisse.factures.plusActions")}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                {menuOuvertId === f.id && (
                                  <div className="absolute right-0 top-10 z-20 min-w-[200px] overflow-hidden rounded-lg border border-gris-bordure bg-white py-1 shadow-lg">
                                    {f.isPharmacie ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setMenuOuvertId(null);
                                          ouvrirFacturePharma(f);
                                        }}
                                        className="block w-full px-3 py-2 text-left text-sm text-texte-principal hover:bg-gris-tres-clair"
                                      >
                                        {t("caisse.factures.facturePharma")}
                                      </button>
                                    ) : (
                                      <Link
                                        href={`/sigh/caisse/facturation?dossier=${f.dossierId}&facture=${f.id}`}
                                        className="block px-3 py-2 text-sm text-texte-principal hover:bg-gris-tres-clair"
                                        onClick={() => setMenuOuvertId(null)}
                                      >
                                        {t("caisse.factures.ouvrirFacturation")}
                                      </Link>
                                    )}
                                    {!f.approuvee ? (
                                      <button
                                        type="button"
                                        disabled={approbationId === f.id}
                                        onClick={() => void approuverFacture(f)}
                                        className="block w-full px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                      >
                                        {approbationId === f.id
                                          ? t("caisse.factures.approuverEnCours")
                                          : t("caisse.factures.approuver")}
                                      </button>
                                    ) : f.isPharmacie ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setMenuOuvertId(null);
                                          ouvrirFacturePharma(f);
                                        }}
                                        className="block w-full px-3 py-2 text-left text-sm font-medium text-bleu-medical hover:bg-bleu-medical-clair"
                                      >
                                        {t("caisse.factures.facturePharma")}
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => void ouvrirBarreCode(f)}
                                        className="block w-full px-3 py-2 text-left text-sm font-medium text-bleu-medical hover:bg-bleu-medical-clair"
                                      >
                                        {t("caisse.factures.barreCode")}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gris-bordure px-2 py-1.5 text-xs text-texte-secondaire">
                  <p>
                    {t("caisse.factures.pagination", {
                      debut: facturesFiltrees.length === 0 ? 0 : debut + 1,
                      fin: Math.min(debut + parPage, facturesFiltrees.length),
                      total: facturesFiltrees.length,
                    })}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={pageCourante <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      {t("caisse.factures.prec")}
                    </button>
                    <button
                      type="button"
                      disabled={pageCourante >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 disabled:opacity-40"
                    >
                      {t("caisse.factures.suiv")}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                </>
              )}
            </section>

            <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
              {factureSelectionnee ? (
                <>
                  <section className="rounded-2xl border border-gris-bordure bg-white p-5 shadow-sm">
                    <h3 className="text-center text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                      {t("caisse.factures.resumePatient")}
                    </h3>
                    <div className="mt-4 flex flex-col items-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700">
                        {initiales(
                          factureSelectionnee.prenom,
                          factureSelectionnee.nom
                        )}
                      </div>
                      <p className="mt-3 text-base font-bold text-texte-principal">
                        {factureSelectionnee.prenom} {factureSelectionnee.nom}
                      </p>
                      <p className="mt-0.5 text-sm text-texte-secondaire">
                        {t("caisse.factures.brevet", {
                          numero: factureSelectionnee.numeroPatient,
                        })}
                      </p>
                    </div>
                    <div className="mt-5 space-y-2.5 border-t border-gris-bordure/70 pt-4 text-sm">
                      <LigneNumeroVisiteResume
                        label={t("caisse.factures.numeroVisite")}
                        numeroDossier={factureSelectionnee.numeroDossier}
                      />
                      <div className="flex justify-between gap-3">
                        <span className="text-texte-secondaire">{t("caisse.factures.age")}</span>
                        <span className="font-medium text-texte-principal">
                          {age != null
                            ? t("caisse.facturation.age", { age })
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-texte-secondaire">
                          {t("caisse.factures.telephone")}
                        </span>
                        <span className="font-medium text-texte-principal">
                          {factureSelectionnee.telephone || "—"}
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-gris-bordure bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-bleu-medical" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                        {t("caisse.factures.detailsFacture")}
                      </h3>
                    </div>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-texte-secondaire">
                          {t("caisse.factures.numero")}
                        </span>
                        <span className="font-semibold text-bleu-medical">
                          {factureSelectionnee.numeroFacture}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-texte-secondaire">
                          {t("caisse.factures.statut")}
                        </span>
                        <span className={classeStatutUi(statutAffiche(factureSelectionnee))}>
                          {t(
                            `caisse.factures.statutsUi.${statutAffiche(factureSelectionnee)}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-texte-secondaire">
                          {t("caisse.factures.modePaiement")}
                        </span>
                        <span className="font-medium">
                          {libelleModePaiement(factureSelectionnee)}
                        </span>
                      </div>
                    </div>

                    <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto border-t border-gris-bordure/70 pt-3">
                      {factureSelectionnee.lignes.length === 0 ? (
                        <li className="text-sm text-texte-secondaire">
                          {t("caisse.factures.aucuneLigne")}
                        </li>
                      ) : (
                        factureSelectionnee.lignes.map((l, i) => (
                          <li
                            key={`${l.libelle}-${i}`}
                            className="flex items-start justify-between gap-2 text-sm"
                          >
                            <span className="text-texte-principal">{l.libelle}</span>
                            <span className="shrink-0 font-semibold tabular-nums">
                              {formaterMontantCaisse(
                                l.montant,
                                factureSelectionnee.devise
                              )}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>

                    <div className="mt-4 space-y-2 border-t border-gris-bordure pt-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-texte-secondaire">
                          {t("caisse.factures.total")}
                        </span>
                        <span className="font-bold text-bleu-medical">
                          {formaterMontantCaisse(
                            factureSelectionnee.montantTotal,
                            factureSelectionnee.devise
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-texte-secondaire">
                          {t("caisse.factures.paye")}
                        </span>
                        <span className="font-medium">
                          {formaterMontantCaisse(
                            factureSelectionnee.montantPaye,
                            factureSelectionnee.devise
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-texte-secondaire">
                          {t("caisse.facturation.resteAPayer")}
                        </span>
                        <span
                          className={cn(
                            "font-bold",
                            reste <= 0 ? "text-emerald-600" : "text-amber-700"
                          )}
                        >
                          {formaterMontantCaisse(reste, factureSelectionnee.devise)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <button
                        type="button"
                        onClick={() => imprimerRecuCaisseThermique(factureSelectionnee)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-bleu-medical bg-white px-2 py-1.5 text-sm font-semibold text-bleu-medical hover:bg-bleu-medical-clair"
                      >
                        <Printer className="h-4 w-4" />
                        {t("caisse.factures.imprimer")}
                      </button>
                      {factureSelectionnee.isPharmacie ? (
                        <button
                          type="button"
                          onClick={() => ouvrirFacturePharma(factureSelectionnee)}
                          className="inline-flex w-full items-center justify-center rounded-lg bg-bleu-medical px-2 py-1.5 text-sm font-semibold text-white hover:bg-bleu-medical-fonce"
                        >
                          {t("caisse.factures.facturePharma")}
                        </button>
                      ) : (
                        <Link
                          href={`/sigh/caisse/facturation?dossier=${factureSelectionnee.dossierId}&facture=${factureSelectionnee.id}`}
                          className="inline-flex w-full items-center justify-center rounded-lg bg-bleu-medical px-2 py-1.5 text-sm font-semibold text-white hover:bg-bleu-medical-fonce"
                        >
                          {t("caisse.factures.ouvrirFacturation")}
                        </Link>
                      )}
                    </div>
                  </section>
                </>
              ) : (
                <section className="rounded-2xl border border-dashed border-gris-bordure bg-white px-5 py-10 text-center text-sm text-texte-secondaire">
                  {t("caisse.factures.selectionnerFacture")}
                </section>
              )}
            </aside>
          </div>
        )}
      </div>
    </MiseEnPageCaisse>
  );
}
