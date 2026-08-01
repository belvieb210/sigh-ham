"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  X,
  ArrowRight,
  FileText,
  Stethoscope,
  Megaphone,
  Zap,
  HelpCircle,
  Calendar,
  SearchX,
} from "lucide-react";
import {
  construireIndexRecherche,
  grouperParCategorie,
  obtenirSuggestionsPopulaires,
  ORDRE_CATEGORIES,
  rechercherDansIndex,
  type CategorieRecherche,
  type ResultatRecherche,
} from "@/lib/recherche";
import type { TraductionsSite } from "@/locales/types";
import { cn } from "@/lib/utils";
import { useRecherche } from "@/components/recherche/fournisseur-recherche";

const ICONES_CATEGORIE: Record<
  CategorieRecherche,
  React.ComponentType<{ className?: string }>
> = {
  page: FileText,
  service: Stethoscope,
  campagne: Megaphone,
  acces: Zap,
  faq: HelpCircle,
  prestation: Calendar,
};

interface PropsModaleRecherche {
  ouverte: boolean;
  onFermer: () => void;
}

function SurlignerTexte({ texte, requete }: { texte: string; requete: string }) {
  if (!requete.trim()) return <>{texte}</>;

  const mots = requete
    .trim()
    .split(/\s+/)
    .filter((m) => m.length >= 2);
  if (mots.length === 0) return <>{texte}</>;

  const pattern = new RegExp(
    `(${mots.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );
  const parties = texte.split(pattern);

  return (
    <>
      {parties.map((partie, i) =>
        mots.some(
          (m) => partie.toLowerCase() === m.toLowerCase()
        ) ? (
          <mark
            key={i}
            className="rounded bg-bleu-medical/15 px-0.5 font-semibold text-bleu-medical"
          >
            {partie}
          </mark>
        ) : (
          <span key={i}>{partie}</span>
        )
      )}
    </>
  );
}

function LigneResultat({
  resultat,
  requete,
  actif,
  onSurvol,
  onFermer,
}: {
  resultat: ResultatRecherche;
  requete: string;
  actif: boolean;
  onSurvol: () => void;
  onFermer: () => void;
}) {
  const { t } = useTranslation();
  const Icone = ICONES_CATEGORIE[resultat.categorie];

  return (
    <Link
      href={resultat.href}
      onClick={onFermer}
      onMouseEnter={onSurvol}
      className={cn(
        "group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors",
        actif ? "bg-bleu-medical-clair" : "hover:bg-gris-tres-clair"
      )}
      role="option"
      aria-selected={actif}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          actif
            ? "bg-bleu-medical text-white"
            : "bg-bleu-medical-clair text-bleu-medical"
        )}
      >
        <Icone className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold",
            actif
              ? "text-bleu-medical"
              : "text-texte-principal group-hover:text-bleu-medical"
          )}
        >
          <SurlignerTexte texte={resultat.titre} requete={requete} />
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-texte-secondaire">
          <SurlignerTexte texte={resultat.description} requete={requete} />
        </p>
        <span className="mt-1 inline-block text-[10px] font-medium uppercase tracking-wide text-bleu-medical/70">
          {t(`recherche.categories.${resultat.categorie}`)}
        </span>
      </div>
      <ArrowRight
        className={cn(
          "mt-2 h-4 w-4 shrink-0 text-bleu-medical transition-opacity",
          actif ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      />
    </Link>
  );
}

export function ModaleRecherche({ ouverte, onFermer }: PropsModaleRecherche) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [requete, setRequete] = useState("");
  const [indexActif, setIndexActif] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => {
    const traductions = i18n.getResourceBundle(
      i18n.language,
      "translation"
    ) as TraductionsSite | undefined;
    if (!traductions) return [];
    return construireIndexRecherche(traductions);
  }, [i18n.language, i18n]);

  const resultats = useMemo(
    () => rechercherDansIndex(index, requete),
    [index, requete]
  );

  const suggestions = useMemo(
    () => obtenirSuggestionsPopulaires(index),
    [index]
  );

  const afficherSuggestions = requete.length < 2;
  const aucunResultat = requete.length >= 2 && resultats.length === 0;

  const resultatsPlats = useMemo(() => {
    if (afficherSuggestions) return suggestions;
    const groupes = grouperParCategorie(resultats);
    return ORDRE_CATEGORIES.flatMap((cat) => groupes[cat] ?? []);
  }, [afficherSuggestions, suggestions, resultats]);

  const reinitialiser = useCallback(() => {
    setRequete("");
    setIndexActif(0);
  }, []);

  useEffect(() => {
    if (!ouverte) reinitialiser();
  }, [ouverte, reinitialiser]);

  useEffect(() => {
    setIndexActif(0);
  }, [requete]);

  useEffect(() => {
    if (ouverte) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [ouverte]);

  const naviguerVersActif = useCallback(() => {
    const cible = resultatsPlats[indexActif];
    if (cible) {
      onFermer();
      router.push(cible.href);
    }
  }, [resultatsPlats, indexActif, onFermer, router]);

  const onKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndexActif((i) => Math.min(i + 1, resultatsPlats.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndexActif((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && resultatsPlats.length > 0) {
      e.preventDefault();
      naviguerVersActif();
    }
  };

  useEffect(() => {
    const el = listeRef.current?.querySelector('[aria-selected="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [indexActif]);

  const libelleCategorie = (cat: CategorieRecherche) =>
    t(`recherche.categories.${cat}`);

  const liensRapidesAucunResultat = [
    { href: "/services", label: t("recherche.pages./services") },
    { href: "/rendez-vous", label: t("recherche.pages./rendez-vous") },
    { href: "/contact", label: t("recherche.pages./contact") },
  ];

  const renduGroupes = () => {
    if (afficherSuggestions) {
      return (
        <ul className="space-y-0.5" role="listbox">
          {suggestions.map((resultat, i) => (
            <li key={resultat.id}>
              <LigneResultat
                resultat={resultat}
                requete=""
                actif={indexActif === i}
                onSurvol={() => setIndexActif(i)}
                onFermer={onFermer}
              />
            </li>
          ))}
        </ul>
      );
    }

    const groupes = grouperParCategorie(resultats);
    let offset = 0;

    return (
      <div className="space-y-3">
        {ORDRE_CATEGORIES.map((cat) => {
          const items = groupes[cat];
          if (!items?.length) return null;

          const debut = offset;
          offset += items.length;

          return (
            <div key={cat}>
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
                {libelleCategorie(cat)}
              </p>
              <ul className="space-y-0.5" role="listbox">
                {items.map((resultat, i) => (
                  <li key={resultat.id}>
                    <LigneResultat
                      resultat={resultat}
                      requete={requete}
                      actif={indexActif === debut + i}
                      onSurvol={() => setIndexActif(debut + i)}
                      onFermer={onFermer}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog.Root open={ouverte} onOpenChange={(open) => !open && onFermer()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-[10%] z-[101] w-[min(600px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-gris-bordure bg-white shadow-2xl focus:outline-none"
          aria-describedby={undefined}
          onKeyDown={onKeyDownInput}
        >
          <Dialog.Title className="sr-only">{t("recherche.titre")}</Dialog.Title>

          <div className="flex items-center gap-3 border-b border-gris-bordure px-4 py-3.5">
            <Search className="h-5 w-5 shrink-0 text-bleu-medical" />
            <input
              ref={inputRef}
              type="search"
              value={requete}
              onChange={(e) => setRequete(e.target.value)}
              placeholder={t("recherche.placeholder")}
              className="flex-1 bg-transparent text-sm text-texte-principal outline-none placeholder:text-texte-secondaire"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-autocomplete="list"
              aria-controls="liste-resultats-recherche"
            />
            <kbd className="hidden rounded-md border border-gris-bordure bg-gris-tres-clair px-1.5 py-0.5 text-[10px] font-medium text-texte-secondaire sm:inline">
              Esc
            </kbd>
            <button
              type="button"
              onClick={onFermer}
              className="rounded-lg p-1.5 text-texte-secondaire hover:bg-gris-tres-clair"
              aria-label={t("common.fermer")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            id="liste-resultats-recherche"
            ref={listeRef}
            className="max-h-[min(420px,55vh)] overflow-y-auto p-2"
          >
            {afficherSuggestions && (
              <p className="px-3 pb-2 pt-1 text-xs font-semibold text-texte-secondaire">
                {t("recherche.suggestions")}
              </p>
            )}

            {requete.length === 1 && (
              <p className="px-3 py-8 text-center text-sm text-texte-secondaire">
                {t("recherche.hint")}
              </p>
            )}

            {aucunResultat && (
              <div className="px-4 py-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gris-tres-clair">
                  <SearchX className="h-7 w-7 text-texte-secondaire" />
                </div>
                <p className="text-sm font-semibold text-texte-principal">
                  {t("recherche.aucunResultatTitre")}
                </p>
                <p className="mt-2 text-sm text-texte-secondaire">
                  {t("recherche.aucunResultatPour", { query: requete })}
                </p>
                <p className="mt-1 text-xs text-texte-secondaire">
                  {t("recherche.aucunResultatConseil")}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {liensRapidesAucunResultat.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={onFermer}
                      className="rounded-full border border-gris-bordure px-3 py-1.5 text-xs font-medium text-bleu-medical transition-colors hover:bg-bleu-medical-clair"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!aucunResultat &&
              requete.length !== 1 &&
              (afficherSuggestions ? suggestions.length > 0 : resultats.length > 0) && (
                <>
                  {!afficherSuggestions && (
                    <p className="px-3 pb-2 text-xs text-texte-secondaire">
                      {t("recherche.compteur", { count: resultats.length })}
                    </p>
                  )}
                  {renduGroupes()}
                </>
              )}
          </div>

          <div className="flex items-center justify-between border-t border-gris-bordure bg-gris-tres-clair/60 px-4 py-2 text-[10px] text-texte-secondaire">
            <span className="hidden sm:inline">{t("recherche.navigation")}</span>
            <span>{t("recherche.raccourci")}</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Bouton loupe — ouvre la modale unique via FournisseurRecherche */
export function BoutonRecherche({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { ouvrir } = useRecherche();

  return (
    <button
      type="button"
      onClick={ouvrir}
      className={cn(
        "rounded-lg p-2 text-texte-secondaire transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical",
        className
      )}
      aria-label={t("common.rechercher")}
      aria-keyshortcuts="Control+K Meta+K"
    >
      <Search className="h-[18px] w-[18px]" />
    </button>
  );
}
