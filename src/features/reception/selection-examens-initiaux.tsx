"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
import {
  Clock,
  FlaskConical,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { CLASSE_CHAMP_RECEPTION } from "@/constants/reception";
import type { TypeExamenReception } from "@/lib/reception/types";
import { cn } from "@/lib/utils";

function formaterPrix(prix: number): string {
  return `$ ${prix.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

interface PropsSelectionExamensInitiaux {
  selection: TypeExamenReception[];
  onChange: (examens: TypeExamenReception[]) => void;
  lectureSeule?: boolean;
}

export function SelectionExamensInitiaux({
  selection,
  onChange,
  lectureSeule = false,
}: PropsSelectionExamensInitiaux) {
  const espace = useEspaceApi();
  const { t } = useTranslation();
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<TypeExamenReception[]>([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [listeOuverte, setListeOuverte] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);

  const idsSelectionnes = useMemo(
    () => new Set(selection.map((e) => e.id)),
    [selection]
  );

  const montantTotal = useMemo(
    () => selection.reduce((total, examen) => total + examen.prix, 0),
    [selection]
  );

  const chargerExamens = useCallback(async (terme: string) => {
    setChargement(true);
    setErreur(null);

    try {
      const params = new URLSearchParams();
      if (terme.trim()) params.set("q", terme.trim());
      params.set("limite", "12");

      const res = await fetch(`${espace.prefixeApi}/examens?${params.toString()}`);
      if (!res.ok) throw new Error(t("reception.examens.indisponible"));

      const data = (await res.json()) as { examens?: TypeExamenReception[] };
      setResultats(data.examens ?? []);
    } catch {
      setErreur(t("reception.examens.chargement"));
      setResultats([]);
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    const delai = window.setTimeout(() => {
      chargerExamens(recherche);
    }, 280);

    return () => window.clearTimeout(delai);
  }, [recherche, chargerExamens]);

  useEffect(() => {
    const fermerSiClicExterieur = (event: MouseEvent) => {
      if (!conteneurRef.current?.contains(event.target as Node)) {
        setListeOuverte(false);
      }
    };

    document.addEventListener("mousedown", fermerSiClicExterieur);
    return () => document.removeEventListener("mousedown", fermerSiClicExterieur);
  }, []);

  const ajouter = (examen: TypeExamenReception) => {
    if (idsSelectionnes.has(examen.id)) return;
    onChange([...selection, examen]);
    setListeOuverte(false);
  };

  const retirer = (id: string) => {
    onChange(selection.filter((e) => e.id !== id));
  };

  const resultatsFiltres = resultats.filter((e) => !idsSelectionnes.has(e.id));

  return (
    <div className="space-y-5">
      {!lectureSeule && (
      <div ref={conteneurRef} className="relative">
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
                      onClick={() => ajouter(examen)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bleu-medical-clair/40"
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
      )}

      <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gris-bordure bg-gris-tres-clair/50 px-4 py-3 sm:px-5">
          <div>
            <h4 className="text-sm font-bold text-texte-principal">
              {t("reception.examens.selectionnes")}
            </h4>
            <p className="text-xs text-texte-secondaire">
              {selection.length === 0
                ? t("reception.examens.aucunAjoute")
                : t("reception.examens.count", { count: selection.length })}
            </p>
          </div>
          {selection.length > 0 && (
            <span className="rounded-full bg-bleu-medical px-2.5 py-0.5 text-xs font-bold text-white">
              {selection.length}
            </span>
          )}
        </div>

        {selection.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gris-tres-clair text-texte-secondaire">
              <FlaskConical className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-texte-principal">
              {t("reception.examens.rechercherAjouter")}
            </p>
            <p className="mt-1 max-w-sm text-xs text-texte-secondaire">
              {t("reception.examens.catalogueHint")}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[520px] text-left text-sm">
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
                  {selection.map((examen) => (
                    <tr
                      key={examen.id}
                      className="border-b border-gris-bordure/50 last:border-b-0 hover:bg-gris-tres-clair/30"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-bleu-medical">
                        {examen.code}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-texte-principal">
                        {examen.libelle}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-gris-tres-clair px-2.5 py-0.5 text-xs font-medium text-texte-secondaire">
                          {examen.categorie}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-texte-principal">
                        {formaterPrix(examen.prix)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {!lectureSeule && (
                        <button
                          type="button"
                          onClick={() => retirer(examen.id)}
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
              {selection.map((examen) => (
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
                      onClick={() => retirer(examen.id)}
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

            <div className="flex items-center justify-between border-t border-gris-bordure bg-gradient-to-r from-bleu-medical-clair/30 to-white px-4 py-3.5 sm:px-5">
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
