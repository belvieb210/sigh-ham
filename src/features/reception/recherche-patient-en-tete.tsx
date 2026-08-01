"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Search, UserRound } from "lucide-react";
import {
  EVENEMENT_RECEPTION_PATIENT_RECHERCHE,
  EVENEMENT_RECEPTION_FOCUS_RECHERCHE,
  type DetailPatientRechercheSelectionne,
} from "@/constants/reception";
import { useResumePatient } from "@/features/reception/contexte-resume-patient";
import type { DonneesFormulairePatient, ResultatRecherchePatientReception } from "@/lib/reception/types";
import { cn } from "@/lib/utils";

export function RecherchePatientEnTete({ className }: { className?: string }) {
  const { t } = useTranslation();
  const listboxId = useId();
  const conteneurRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { definirDepuisDonneesCompletes } = useResumePatient();

  const [terme, setTerme] = useState("");
  const [resultats, setResultats] = useState<ResultatRecherchePatientReception[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [selectionEnCours, setSelectionEnCours] = useState(false);
  const [indexActif, setIndexActif] = useState(-1);
  const [erreur, setErreur] = useState<string | null>(null);

  const rechercher = useCallback(async (valeur: string) => {
    const q = valeur.trim();
    if (q.length < 2) {
      setResultats([]);
      setErreur(null);
      setChargement(false);
      return;
    }

    setChargement(true);
    setErreur(null);

    try {
      const params = new URLSearchParams({ q, limite: "8" });
      const res = await fetch(`/api/reception/patients?${params.toString()}`);
      const data = (await res.json()) as {
        patients?: ResultatRecherchePatientReception[];
        message?: string;
      };

      if (!res.ok) throw new Error(data.message ?? t("reception.recherche.indisponible"));

      setResultats(data.patients ?? []);
      setIndexActif(data.patients?.length ? 0 : -1);
    } catch (error) {
      setResultats([]);
      setErreur(error instanceof Error ? error.message : t("reception.recherche.impossible"));
      setIndexActif(-1);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    if (!ouvert) return;

    const timer = window.setTimeout(() => {
      void rechercher(terme);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [terme, ouvert, rechercher]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        const cible = event.target;
        if (
          cible instanceof HTMLElement &&
          (cible.isContentEditable ||
            cible.tagName === "INPUT" ||
            cible.tagName === "TEXTAREA" ||
            cible.tagName === "SELECT")
        ) {
          return;
        }

        event.preventDefault();
        inputRef.current?.focus();
        setOuvert(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onFocusRecherche = () => {
      inputRef.current?.focus();
      setOuvert(true);
    };

    window.addEventListener(EVENEMENT_RECEPTION_FOCUS_RECHERCHE, onFocusRecherche);
    return () =>
      window.removeEventListener(EVENEMENT_RECEPTION_FOCUS_RECHERCHE, onFocusRecherche);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!conteneurRef.current?.contains(event.target as Node)) {
        setOuvert(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const selectionnerPatient = async (patient: ResultatRecherchePatientReception) => {
    if (selectionEnCours) return;

    setSelectionEnCours(true);
    setErreur(null);

    try {
      const res = await fetch(
        `/api/reception/patients/${encodeURIComponent(patient.numeroPatient)}`
      );

      if (!res.ok) throw new Error(t("reception.recherche.selectionImpossible"));

      const donnees = (await res.json()) as DonneesFormulairePatient;
      const dossierId = patient.dossierId ?? donnees.dossierId;

      definirDepuisDonneesCompletes({
        ...donnees,
        dossierId,
      });

      const detail: DetailPatientRechercheSelectionne = {
        numeroPatient: patient.numeroPatient,
        dossierId,
      };

      window.dispatchEvent(
        new CustomEvent(EVENEMENT_RECEPTION_PATIENT_RECHERCHE, { detail })
      );

      setTerme("");
      setResultats([]);
      setOuvert(false);
      setIndexActif(-1);
      inputRef.current?.blur();
    } catch (error) {
      setErreur(error instanceof Error ? error.message : t("reception.recherche.selectionImpossible"));
    } finally {
      setSelectionEnCours(false);
    }
  };

  const afficherListe = ouvert && (terme.trim().length >= 2 || chargement || !!erreur);

  return (
    <div ref={conteneurRef} className={cn("relative max-w-sm flex-1", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
      <input
        ref={inputRef}
        type="search"
        value={terme}
        role="combobox"
        aria-expanded={afficherListe}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={t("reception.recherche.placeholder")}
        disabled={selectionEnCours}
        onFocus={() => setOuvert(true)}
        onChange={(event) => {
          setTerme(event.target.value);
          setOuvert(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOuvert(false);
            setIndexActif(-1);
            return;
          }

          if (!resultats.length) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setIndexActif((courant) => (courant + 1) % resultats.length);
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setIndexActif((courant) =>
              courant <= 0 ? resultats.length - 1 : courant - 1
            );
          }

          if (event.key === "Enter" && indexActif >= 0 && resultats[indexActif]) {
            event.preventDefault();
            void selectionnerPatient(resultats[indexActif]);
          }
        }}
        className="w-full rounded-lg border border-gris-bordure bg-gris-tres-clair py-2 pl-9 pr-16 text-sm focus:border-bleu-medical focus:bg-white focus:outline-none focus:ring-2 focus:ring-bleu-medical/15 disabled:opacity-60"
      />
      <button
        type="button"
        tabIndex={-1}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          inputRef.current?.focus();
          setOuvert(true);
        }}
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-gris-bordure bg-white px-1.5 py-0.5 text-[10px] text-texte-secondaire hover:bg-gris-tres-clair sm:inline"
        aria-label={t("reception.recherche.focus")}
      >
        {t("reception.recherche.raccourci")}
      </button>

      {afficherListe && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-lg"
        >
          {chargement ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-texte-secondaire">
              <Loader2 className="h-4 w-4 animate-spin text-bleu-medical" />
              {t("reception.recherche.enCours")}
            </div>
          ) : erreur ? (
            <p className="px-4 py-3 text-sm text-red-600">{erreur}</p>
          ) : resultats.length === 0 ? (
            <p className="px-4 py-3 text-sm text-texte-secondaire">
              {t("reception.recherche.aucunResultat", { terme: terme.trim() })}
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {resultats.map((patient, index) => (
                <li key={patient.numeroPatient} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === indexActif}
                    onMouseEnter={() => setIndexActif(index)}
                    onClick={() => {
                      void selectionnerPatient(patient);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      index === indexActif
                        ? "bg-bleu-medical-clair/50"
                        : "hover:bg-gris-tres-clair"
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gris-tres-clair text-bleu-medical">
                      <UserRound className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-texte-principal">
                        {patient.nomComplet}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-texte-secondaire">
                        {patient.numeroPatient} · {patient.telephone}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
