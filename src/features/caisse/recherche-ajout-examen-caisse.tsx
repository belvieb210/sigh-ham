"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Clock,
  FlaskConical,
  Layers,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { PaquetBilanReception, TypeExamenReception } from "@/lib/reception/types";
import { cn } from "@/lib/utils";

interface PropsRechercheAjoutExamenCaisse {
  ouverte: boolean;
  onFermer: () => void;
  idsDejaPresents: Set<string>;
  idsPaquetsDejaPresents: Set<string>;
  libellesDejaPresents: Set<string>;
  onAjouter: (examen: TypeExamenReception) => Promise<void>;
  onAjouterPaquet: (paquet: PaquetBilanReception) => Promise<void>;
  enCours?: boolean;
}

export function RechercheAjoutExamenCaisse({
  ouverte,
  onFermer,
  idsDejaPresents,
  idsPaquetsDejaPresents,
  libellesDejaPresents,
  onAjouter,
  onAjouterPaquet,
  enCours = false,
}: PropsRechercheAjoutExamenCaisse) {
  const { t } = useTranslation();
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<TypeExamenReception[]>([]);
  const [resultatsPaquets, setResultatsPaquets] = useState<PaquetBilanReception[]>([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ajoutId, setAjoutId] = useState<string | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const idsDansPaquetsPresents = useMemo(() => {
    const ids = new Set(idsDejaPresents);
    for (const id of idsPaquetsDejaPresents) ids.add(id);
    return ids;
  }, [idsDejaPresents, idsPaquetsDejaPresents]);

  const chargerCatalogue = useCallback(
    async (terme: string) => {
      setChargement(true);
      setErreur(null);
      try {
        const paramsExamen = new URLSearchParams();
        if (terme.trim()) paramsExamen.set("q", terme.trim());
        paramsExamen.set("limite", "12");

        const paramsPaquet = new URLSearchParams();
        if (terme.trim()) paramsPaquet.set("q", terme.trim());

        const [resExamens, resPaquets] = await Promise.all([
          fetch(`/api/caisse/examens?${paramsExamen.toString()}`),
          fetch(`/api/caisse/paquets-bilans?${paramsPaquet.toString()}`),
        ]);

        if (!resExamens.ok) throw new Error(t("caisse.facturation.examensIndisponibles"));
        if (!resPaquets.ok) throw new Error(t("reception.paquets.indisponible"));

        const dataExamens = (await resExamens.json()) as { examens?: TypeExamenReception[] };
        const dataPaquets = (await resPaquets.json()) as { paquets?: PaquetBilanReception[] };

        setResultats(dataExamens.examens ?? []);
        setResultatsPaquets(dataPaquets.paquets ?? []);
      } catch {
        setErreur(t("caisse.facturation.examensChargement"));
        setResultats([]);
        setResultatsPaquets([]);
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
      void chargerCatalogue(recherche);
    }, 280);
    return () => window.clearTimeout(delai);
  }, [ouverte, recherche, chargerCatalogue]);

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

  const paquetsFiltres = useMemo(
    () => resultatsPaquets.filter((p) => !idsPaquetsDejaPresents.has(p.id)),
    [resultatsPaquets, idsPaquetsDejaPresents]
  );

  const resultatsFiltres = useMemo(
    () =>
      resultats.filter(
        (e) =>
          !idsDansPaquetsPresents.has(e.id) &&
          !libellesDejaPresents.has(e.libelle.trim().toLowerCase())
      ),
    [resultats, idsDansPaquetsPresents, libellesDejaPresents]
  );

  const aucunResultat = paquetsFiltres.length === 0 && resultatsFiltres.length === 0;

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
          placeholder={t("reception.examens.recherchePlaceholder")}
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
        ) : aucunResultat ? (
          <p className="px-4 py-5 text-center text-sm text-texte-secondaire">
            {recherche.trim()
              ? t("caisse.facturation.aucunExamenResultat")
              : t("caisse.facturation.catalogueVide")}
          </p>
        ) : (
          <ul className="max-h-64 divide-y divide-gris-bordure/60 overflow-y-auto bg-white">
            {paquetsFiltres.map((paquet) => {
              const ajoutEnCours = ajoutId === `paquet-${paquet.id}`;
              return (
                <li key={`paquet-${paquet.id}`}>
                  <button
                    type="button"
                    disabled={enCours || ajoutEnCours}
                    onClick={() => {
                      setAjoutId(`paquet-${paquet.id}`);
                      void onAjouterPaquet(paquet).finally(() => setAjoutId(null));
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-violet-50/60 disabled:opacity-60 sm:px-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                      <Layers className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-violet-700">
                          {paquet.code}
                        </span>
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
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
                        {formaterMontantCaisse(paquet.prix)}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-violet-700">
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
