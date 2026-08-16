"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
import {
  Clock,
  FlaskConical,
  Layers,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { CLASSE_CHAMP_RECEPTION } from "@/constants/reception";
import {
  calculerMontantSelectionExamens,
  idsExamensDansPaquets,
} from "@/lib/reception/montant-selection-examens";
import type { PaquetBilanReception, TypeExamenReception } from "@/lib/reception/types";
import { cn } from "@/lib/utils";

function formaterPrix(prix: number): string {
  return `$ ${prix.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

interface PropsSelectionExamensInitiaux {
  selectionExamens: TypeExamenReception[];
  selectionPaquets: PaquetBilanReception[];
  onChangeExamens: (examens: TypeExamenReception[]) => void;
  onChangePaquets: (paquets: PaquetBilanReception[]) => void;
  lectureSeule?: boolean;
}

export function SelectionExamensInitiaux({
  selectionExamens,
  selectionPaquets,
  onChangeExamens,
  onChangePaquets,
  lectureSeule = false,
}: PropsSelectionExamensInitiaux) {
  const espace = useEspaceApi();
  const { t } = useTranslation();
  const [recherche, setRecherche] = useState("");
  const [recherchePaquet, setRecherchePaquet] = useState("");
  const [resultats, setResultats] = useState<TypeExamenReception[]>([]);
  const [resultatsPaquets, setResultatsPaquets] = useState<PaquetBilanReception[]>([]);
  const [chargement, setChargement] = useState(false);
  const [chargementPaquets, setChargementPaquets] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreurPaquets, setErreurPaquets] = useState<string | null>(null);
  const [listeOuverte, setListeOuverte] = useState(false);
  const [listePaquetsOuverte, setListePaquetsOuverte] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const conteneurPaquetsRef = useRef<HTMLDivElement>(null);

  const idsExamensSelectionnes = useMemo(
    () => new Set(selectionExamens.map((e) => e.id)),
    [selectionExamens]
  );
  const idsPaquetsSelectionnes = useMemo(
    () => new Set(selectionPaquets.map((p) => p.id)),
    [selectionPaquets]
  );
  const idsDansPaquets = useMemo(
    () => idsExamensDansPaquets(selectionPaquets),
    [selectionPaquets]
  );

  const montantTotal = useMemo(
    () => calculerMontantSelectionExamens(selectionPaquets, selectionExamens),
    [selectionPaquets, selectionExamens]
  );

  const nombreElements =
    selectionPaquets.length +
    selectionExamens.filter((e) => !idsDansPaquets.has(e.id)).length;

  const chargerExamens = useCallback(
    async (terme: string) => {
      setChargement(true);
      setErreur(null);

      try {
        const params = new URLSearchParams();
        if (terme.trim()) params.set("q", terme.trim());
        params.set("limite", "12");

        const res = await fetch(
          `${espace.prefixeApi}/examens?${params.toString()}`
        );
        if (!res.ok) throw new Error(t("reception.examens.indisponible"));

        const data = (await res.json()) as { examens?: TypeExamenReception[] };
        setResultats(data.examens ?? []);
      } catch {
        setErreur(t("reception.examens.chargement"));
        setResultats([]);
      } finally {
        setChargement(false);
      }
    },
    [espace.prefixeApi, t]
  );

  const chargerPaquets = useCallback(
    async (terme: string) => {
      setChargementPaquets(true);
      setErreurPaquets(null);

      try {
        const params = new URLSearchParams();
        if (terme.trim()) params.set("q", terme.trim());

        const res = await fetch(
          `${espace.prefixeApi}/paquets-bilans?${params.toString()}`
        );
        if (!res.ok) throw new Error(t("reception.paquets.indisponible"));

        const data = (await res.json()) as { paquets?: PaquetBilanReception[] };
        setResultatsPaquets(data.paquets ?? []);
      } catch {
        setErreurPaquets(t("reception.paquets.chargement"));
        setResultatsPaquets([]);
      } finally {
        setChargementPaquets(false);
      }
    },
    [espace.prefixeApi, t]
  );

  useEffect(() => {
    const delai = window.setTimeout(() => {
      chargerExamens(recherche);
    }, 280);

    return () => window.clearTimeout(delai);
  }, [recherche, chargerExamens]);

  useEffect(() => {
    const delai = window.setTimeout(() => {
      chargerPaquets(recherchePaquet);
    }, 280);

    return () => window.clearTimeout(delai);
  }, [recherchePaquet, chargerPaquets]);

  useEffect(() => {
    const fermerSiClicExterieur = (event: MouseEvent) => {
      if (!conteneurRef.current?.contains(event.target as Node)) {
        setListeOuverte(false);
      }
      if (!conteneurPaquetsRef.current?.contains(event.target as Node)) {
        setListePaquetsOuverte(false);
      }
    };

    document.addEventListener("mousedown", fermerSiClicExterieur);
    return () => document.removeEventListener("mousedown", fermerSiClicExterieur);
  }, []);

  const ajouterExamen = (examen: TypeExamenReception) => {
    if (idsExamensSelectionnes.has(examen.id) || idsDansPaquets.has(examen.id)) return;
    onChangeExamens([...selectionExamens, examen]);
    setListeOuverte(false);
  };

  const retirerExamen = (id: string) => {
    onChangeExamens(selectionExamens.filter((e) => e.id !== id));
  };

  const ajouterPaquet = (paquet: PaquetBilanReception) => {
    if (idsPaquetsSelectionnes.has(paquet.id)) return;
    onChangePaquets([...selectionPaquets, paquet]);
    onChangeExamens(
      selectionExamens.filter((e) => !paquet.examens.some((x) => x.id === e.id))
    );
    setListePaquetsOuverte(false);
  };

  const retirerPaquet = (id: string) => {
    onChangePaquets(selectionPaquets.filter((p) => p.id !== id));
  };

  const resultatsFiltres = resultats.filter(
    (e) => !idsExamensSelectionnes.has(e.id) && !idsDansPaquets.has(e.id)
  );
  const paquetsFiltres = resultatsPaquets.filter((p) => !idsPaquetsSelectionnes.has(p.id));

  const examensIndividuelsAffichables = selectionExamens.filter(
    (e) => !idsDansPaquets.has(e.id)
  );

  return (
    <div className="space-y-5">
      {!lectureSeule && (
        <>
          <div ref={conteneurPaquetsRef} className="relative">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
              {t("reception.paquets.titre")}
            </p>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire"
                aria-hidden
              />
              <input
                type="search"
                value={recherchePaquet}
                onChange={(e) => {
                  setRecherchePaquet(e.target.value);
                  setListePaquetsOuverte(true);
                }}
                onFocus={() => setListePaquetsOuverte(true)}
                placeholder={t("reception.paquets.recherchePlaceholder")}
                className={cn(
                  CLASSE_CHAMP_RECEPTION,
                  "pl-10 pr-10 shadow-sm transition-shadow focus:shadow-md"
                )}
                autoComplete="off"
              />
              {recherchePaquet && (
                <button
                  type="button"
                  onClick={() => {
                    setRecherchePaquet("");
                    setListePaquetsOuverte(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
                  aria-label={t("reception.examens.effacerRecherche")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {listePaquetsOuverte && (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-lg ring-1 ring-black/5">
                {chargementPaquets ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-texte-secondaire">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("reception.paquets.rechercheEnCours")}
                  </div>
                ) : erreurPaquets ? (
                  <p className="px-4 py-6 text-center text-sm text-red-600">{erreurPaquets}</p>
                ) : paquetsFiltres.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-texte-secondaire">
                    {recherchePaquet.trim()
                      ? t("reception.paquets.aucunResultat")
                      : t("reception.paquets.catalogueVide")}
                  </p>
                ) : (
                  <ul className="max-h-72 divide-y divide-gris-bordure/60 overflow-y-auto">
                    {paquetsFiltres.map((paquet) => (
                      <li key={paquet.id}>
                        <button
                          type="button"
                          onClick={() => ajouterPaquet(paquet)}
                          className="flex w-full items-center gap-3 px-2 py-2 text-left transition-colors hover:bg-violet-50/60"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                            <Layers className="h-4 w-4" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-violet-700">
                                {paquet.code}
                              </span>
                              <span className="rounded-full bg-gris-tres-clair px-2 py-0.5 text-[10px] font-medium text-texte-secondaire">
                                {t("reception.paquets.forfait")}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-sm font-medium text-texte-principal">
                              {paquet.libelle}
                            </p>
                            <p className="mt-0.5 text-[11px] text-texte-secondaire">
                              {t("reception.paquets.countExamens", {
                                count: paquet.examens.length,
                              })}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold tabular-nums text-texte-principal">
                              {formaterPrix(paquet.prix)}
                            </p>
                            <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-violet-700">
                              <Plus className="h-3.5 w-3.5" />
                              {t("reception.examens.ajouter")}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div ref={conteneurRef} className="relative">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
              {t("reception.paquets.examensUnitaires")}
            </p>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire"
                aria-hidden
              />
              <input
                type="search"
                value={recherche}
                onChange={(e) => {
                  setRecherche(e.target.value);
                  setListeOuverte(true);
                }}
                onFocus={() => setListeOuverte(true)}
                placeholder={t("reception.examens.recherchePlaceholder")}
                className={cn(
                  CLASSE_CHAMP_RECEPTION,
                  "pl-10 pr-10 shadow-sm transition-shadow focus:shadow-md"
                )}
                autoComplete="off"
              />
              {recherche && (
                <button
                  type="button"
                  onClick={() => {
                    setRecherche("");
                    setListeOuverte(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
                  aria-label={t("reception.examens.effacerRecherche")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {listeOuverte && (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-lg ring-1 ring-black/5">
                {chargement ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-texte-secondaire">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("reception.examens.rechercheEnCours")}
                  </div>
                ) : erreur ? (
                  <p className="px-4 py-6 text-center text-sm text-red-600">{erreur}</p>
                ) : resultatsFiltres.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-texte-secondaire">
                    {recherche.trim()
                      ? t("reception.examens.aucunResultat")
                      : t("reception.examens.catalogueVide")}
                  </p>
                ) : (
                  <ul className="max-h-72 divide-y divide-gris-bordure/60 overflow-y-auto">
                    {resultatsFiltres.map((examen) => (
                      <li key={examen.id}>
                        <button
                          type="button"
                          onClick={() => ajouterExamen(examen)}
                          className="flex w-full items-center gap-3 px-2 py-1.5 text-left transition-colors hover:bg-bleu-medical-clair/40"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bleu-medical-clair text-bleu-medical">
                            <FlaskConical className="h-4 w-4" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-bleu-medical">
                                {examen.code}
                              </span>
                              <span className="rounded-full bg-gris-tres-clair px-2 py-0.5 text-[10px] font-medium text-texte-secondaire">
                                {examen.categorie}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-sm font-medium text-texte-principal">
                              {examen.libelle}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-texte-secondaire">
                              <Clock className="h-3 w-3" aria-hidden />
                              {t("reception.examens.resultatDelai", { h: examen.delaiHeures })}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold tabular-nums text-texte-principal">
                              {formaterPrix(examen.prix)}
                            </p>
                            <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-bleu-medical">
                              <Plus className="h-3.5 w-3.5" />
                              {t("reception.examens.ajouter")}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gris-bordure bg-gris-tres-clair/50 px-2 py-1.5 sm:px-5">
          <div>
            <h4 className="text-sm font-bold text-texte-principal">
              {t("reception.examens.selectionnes")}
            </h4>
            <p className="text-xs text-texte-secondaire">
              {nombreElements === 0
                ? t("reception.examens.aucunAjoute")
                : t("reception.paquets.selectionResume", { count: nombreElements })}
            </p>
          </div>
          {nombreElements > 0 && (
            <span className="rounded-full bg-bleu-medical px-2.5 py-0.5 text-xs font-bold text-white">
              {nombreElements}
            </span>
          )}
        </div>

        {nombreElements === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gris-tres-clair text-texte-secondaire">
              <FlaskConical className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-texte-principal">
              {t("reception.examens.rechercherAjouter")}
            </p>
            <p className="mt-1 max-w-sm text-xs text-texte-secondaire">
              {t("reception.paquets.catalogueHint")}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden sm:block">
              <table className="tableau-sigh">
                <thead>
                  <tr className="border-b border-gris-bordure bg-white text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                    <th className="px-5 py-3">{t("reception.examens.colonnes.code")}</th>
                    <th className="px-5 py-3">{t("reception.examens.colonnes.nom")}</th>
                    <th className="px-5 py-3">{t("reception.examens.colonnes.categorie")}</th>
                    <th className="px-5 py-3 text-right">{t("reception.examens.colonnes.prix")}</th>
                    <th className="px-5 py-3 text-center">{t("reception.examens.colonnes.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectionPaquets.map((paquet) => (
                    <tr
                      key={paquet.id}
                      className="border-b border-gris-bordure/50 bg-violet-50/30 hover:bg-violet-50/50"
                    >
                      <td className="px-2 py-1.5 font-mono text-xs font-bold text-violet-700">
                        {paquet.code}
                      </td>
                      <td className="px-2 py-1.5">
                        <p className="font-medium text-texte-principal">{paquet.libelle}</p>
                        <p className="text-xs text-texte-secondaire">
                          {t("reception.paquets.countExamens", { count: paquet.examens.length })}
                        </p>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                          {t("reception.paquets.forfait")}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums font-semibold text-texte-principal">
                        {formaterPrix(paquet.prix)}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {!lectureSeule && (
                          <button
                            type="button"
                            onClick={() => retirerPaquet(paquet.id)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                            aria-label={t("reception.examens.retirer")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t("reception.examens.retirer")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {examensIndividuelsAffichables.map((examen) => (
                    <tr
                      key={examen.id}
                      className="border-b border-gris-bordure/50 last:border-b-0 hover:bg-gris-tres-clair/30"
                    >
                      <td className="px-2 py-1.5 font-mono text-xs font-bold text-bleu-medical">
                        {examen.code}
                      </td>
                      <td className="px-2 py-1.5 font-medium text-texte-principal">
                        {examen.libelle}
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="rounded-full bg-gris-tres-clair px-2.5 py-0.5 text-xs font-medium text-texte-secondaire">
                          {examen.categorie}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums font-semibold text-texte-principal">
                        {formaterPrix(examen.prix)}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {!lectureSeule && (
                          <button
                            type="button"
                            onClick={() => retirerExamen(examen.id)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                            aria-label={t("reception.examens.retirer")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t("reception.examens.retirer")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 p-3 sm:hidden">
              {selectionPaquets.map((paquet) => (
                <article
                  key={paquet.id}
                  className="rounded-lg border border-violet-200 bg-violet-50/40 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-violet-700">
                        {paquet.code}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-texte-principal">
                        {paquet.libelle}
                      </p>
                      <p className="mt-1 text-xs text-texte-secondaire">
                        {t("reception.paquets.forfait")} ·{" "}
                        {t("reception.paquets.countExamens", { count: paquet.examens.length })} ·{" "}
                        {formaterPrix(paquet.prix)}
                      </p>
                    </div>
                    {!lectureSeule && (
                      <button
                        type="button"
                        onClick={() => retirerPaquet(paquet.id)}
                        className="shrink-0 rounded-lg p-2 text-red-600 hover:bg-red-50"
                        aria-label={t("reception.examens.retirer")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </article>
              ))}
              {examensIndividuelsAffichables.map((examen) => (
                <article
                  key={examen.id}
                  className="rounded-lg border border-gris-bordure bg-gris-tres-clair/20 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-bleu-medical">
                        {examen.code}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-texte-principal">
                        {examen.libelle}
                      </p>
                      <p className="mt-1 text-xs text-texte-secondaire">
                        {examen.categorie} · {formaterPrix(examen.prix)}
                      </p>
                    </div>
                    {!lectureSeule && (
                      <button
                        type="button"
                        onClick={() => retirerExamen(examen.id)}
                        className="shrink-0 rounded-lg p-2 text-red-600 hover:bg-red-50"
                        aria-label={t("reception.examens.retirer")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-gris-bordure bg-gradient-to-r from-bleu-medical-clair/30 to-white px-2 py-1.5 sm:px-5">
              <span className="text-sm font-medium text-texte-secondaire">
                {t("reception.examens.montantTotal")}
              </span>
              <span className="text-lg font-bold tabular-nums text-bleu-medical">
                {formaterPrix(montantTotal)}
              </span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
