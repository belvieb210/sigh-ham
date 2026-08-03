"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, FlaskConical, Loader2, Plus, Search, X } from "lucide-react";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { TypeExamenReception } from "@/lib/reception/types";
import { cn } from "@/lib/utils";

interface PropsRechercheAjoutExamenCaisse {
  ouverte: boolean;
  onFermer: () => void;
  idsDejaPresents: Set<string>;
  libellesDejaPresents: Set<string>;
  onAjouter: (examen: TypeExamenReception) => Promise<void>;
  enCours?: boolean;
}

export function RechercheAjoutExamenCaisse({
  ouverte,
  onFermer,
  idsDejaPresents,
  libellesDejaPresents,
  onAjouter,
  enCours = false,
}: PropsRechercheAjoutExamenCaisse) {
  const { t } = useTranslation();
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<TypeExamenReception[]>([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ajoutId, setAjoutId] = useState<string | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chargerExamens = useCallback(
    async (terme: string) => {
      setChargement(true);
      setErreur(null);
      try {
        const params = new URLSearchParams();
        if (terme.trim()) params.set("q", terme.trim());
        params.set("limite", "12");
        const res = await fetch(`/api/caisse/examens?${params.toString()}`);
        if (!res.ok) throw new Error(t("caisse.facturation.examensIndisponibles"));
        const data = (await res.json()) as { examens?: TypeExamenReception[] };
        setResultats(data.examens ?? []);
      } catch {
        setErreur(t("caisse.facturation.examensChargement"));
        setResultats([]);
      } finally {
        setChargement(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (!ouverte) {
      setRecherche("");
      setErreur(null);
      setAjoutId(null);
      return;
    }
    const delai = window.setTimeout(() => {
      void chargerExamens(recherche);
    }, 280);
    return () => window.clearTimeout(delai);
  }, [ouverte, recherche, chargerExamens]);

  useEffect(() => {
    if (ouverte) {
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [ouverte]);

  useEffect(() => {
    if (!ouverte) return;
    const fermerSiClicExterieur = (event: MouseEvent) => {
      if (!conteneurRef.current?.contains(event.target as Node)) {
        onFermer();
      }
    };
    document.addEventListener("mousedown", fermerSiClicExterieur);
    return () => document.removeEventListener("mousedown", fermerSiClicExterieur);
  }, [ouverte, onFermer]);

  const resultatsFiltres = useMemo(
    () =>
      resultats.filter(
        (e) =>
          !idsDejaPresents.has(e.id) &&
          !libellesDejaPresents.has(e.libelle.trim().toLowerCase())
      ),
    [resultats, idsDejaPresents, libellesDejaPresents]
  );

  if (!ouverte) return null;

  return (
    <div ref={conteneurRef} className="space-y-2 px-4 pb-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder={t("caisse.facturation.rechercheExamenPlaceholder")}
          className="w-full rounded-lg border border-gris-bordure py-2.5 pl-10 pr-10 text-sm shadow-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15"
          autoComplete="off"
          disabled={enCours}
        />
        {recherche && (
          <button
            type="button"
            onClick={() => setRecherche("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-texte-secondaire hover:bg-gris-tres-clair"
            aria-label={t("caisse.facturation.effacerRecherche")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gris-bordure bg-gris-tres-clair/40">
        {chargement ? (
          <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("caisse.facturation.rechercheEnCours")}
          </div>
        ) : erreur ? (
          <p className="px-4 py-5 text-center text-sm text-red-600">{erreur}</p>
        ) : resultatsFiltres.length === 0 ? (
          <p className="px-4 py-5 text-center text-sm text-texte-secondaire">
            {recherche.trim()
              ? t("caisse.facturation.aucunExamenResultat")
              : t("caisse.facturation.catalogueVide")}
          </p>
        ) : (
          <ul className="max-h-64 divide-y divide-gris-bordure/60 overflow-y-auto bg-white">
            {resultatsFiltres.map((examen) => {
              const ajoutEnCours = ajoutId === examen.id;
              return (
                <li key={examen.id}>
                  <button
                    type="button"
                    disabled={enCours || ajoutEnCours}
                    onClick={() => {
                      setAjoutId(examen.id);
                      void onAjouter(examen).finally(() => setAjoutId(null));
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-bleu-medical-clair/40 disabled:opacity-60 sm:px-4"
                    )}
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
                        {t("caisse.facturation.resultatDelai", { h: examen.delaiHeures })}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold tabular-nums text-texte-principal">
                        {formaterMontantCaisse(examen.prix)}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-bleu-medical">
                        {ajoutEnCours ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        {t("caisse.facturation.ajouter")}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
