"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
import { Loader2, Search, UserRound, X } from "lucide-react";
import type { PatientEnregistre } from "@/constants/reception";
import { CLASSE_CHAMP_RECEPTION } from "@/constants/reception";
import { resultatRechercheVersPatientEnregistre } from "@/lib/reception/resultat-recherche-vers-patient-enregistre";
import type { ResultatRecherchePatientReception } from "@/lib/reception/types";
import { cn } from "@/lib/utils";

interface PropsRecherchePatientExistantRecents {
  onPatientAjoute: (patient: PatientEnregistre) => void;
  className?: string;
}

export function RecherchePatientExistantRecents({
  onPatientAjoute,
  className,
}: PropsRecherchePatientExistantRecents) {
  const espace = useEspaceApi();
  const { t } = useTranslation();
  const listboxId = useId();
  const conteneurRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [terme, setTerme] = useState("");
  const [resultats, setResultats] = useState<ResultatRecherchePatientReception[]>([]);
  const [listeOuverte, setListeOuverte] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [indexActif, setIndexActif] = useState(-1);
  const [erreur, setErreur] = useState<string | null>(null);

  const libellesPatient = {
    motif: t("reception.tableau.recherchePatient.motif"),
    orientation: t("reception.tableau.recherchePatient.orientation"),
    statut: t("reception.tableau.recherchePatient.statut"),
  };

  const rechercher = useCallback(
    async (valeur: string) => {
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
        const res = await fetch(`${espace.prefixeApi}/patients?${params.toString()}`);
        const data = (await res.json()) as {
          patients?: ResultatRecherchePatientReception[];
          message?: string;
        };

        if (!res.ok) {
          throw new Error(data.message ?? t("reception.recherche.indisponible"));
        }

        setResultats(data.patients ?? []);
        setIndexActif(data.patients?.length ? 0 : -1);
      } catch (error) {
        setResultats([]);
        setErreur(
          error instanceof Error ? error.message : t("reception.recherche.impossible")
        );
        setIndexActif(-1);
      } finally {
        setChargement(false);
      }
    },
    [espace.prefixeApi, t]
  );

  useEffect(() => {
    if (!listeOuverte) return;

    const timer = window.setTimeout(() => {
      void rechercher(terme);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [terme, listeOuverte, rechercher]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!conteneurRef.current?.contains(event.target as Node)) {
        setListeOuverte(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const selectionnerResultat = (resultat: ResultatRecherchePatientReception) => {
    const patient = resultatRechercheVersPatientEnregistre(resultat, libellesPatient);
    onPatientAjoute(patient);
    setTerme("");
    setResultats([]);
    setListeOuverte(false);
    setIndexActif(-1);
    inputRef.current?.blur();
  };

  const afficherListe =
    listeOuverte && (terme.trim().length >= 2 || chargement || !!erreur);

  return (
    <div ref={conteneurRef} className={cn("relative w-full min-w-[220px] max-w-sm", className)}>
      <label htmlFor={`${listboxId}-input`} className="sr-only">
        {t("reception.tableau.recherchePatient.label")}
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire"
        aria-hidden
      />
      <input
        ref={inputRef}
        id={`${listboxId}-input`}
        type="search"
        value={terme}
        role="combobox"
        aria-expanded={afficherListe}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={t("reception.tableau.recherchePatient.placeholder")}
        onFocus={() => setListeOuverte(true)}
        onChange={(event) => {
          setTerme(event.target.value);
          setListeOuverte(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setListeOuverte(false);
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
            selectionnerResultat(resultats[indexActif]);
          }
        }}
        className={cn(
          CLASSE_CHAMP_RECEPTION,
          "h-11 py-2 pl-9 pr-9 text-sm shadow-sm transition-shadow focus:shadow-md"
        )}
      />
      {terme && (
        <button
          type="button"
          onClick={() => {
            setTerme("");
            setListeOuverte(true);
            inputRef.current?.focus();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
          aria-label={t("reception.examens.effacerRecherche")}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {afficherListe && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-lg ring-1 ring-black/5"
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
                    onClick={() => selectionnerResultat(patient)}
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
