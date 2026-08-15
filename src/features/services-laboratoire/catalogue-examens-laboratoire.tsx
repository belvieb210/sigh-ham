"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Loader2,
  Phone,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { Bouton } from "@/components/ui/bouton";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { useContenuServicesLaboratoire } from "@/hooks/use-contenu-page";
import { useExamensPublic } from "@/hooks/use-examens-public";
import {
  useColonnesGrilleExamens,
  useTaillePageExamens,
} from "@/hooks/use-pagination-examens";
import {
  formaterDelaiExamenPublic,
  formaterPrixExamenPublic,
} from "@/lib/client/formater-examen-public";
import type { ExamenPublic } from "@/lib/client/charger-examens-public";
import { styleCategorieExamen } from "@/lib/client/style-categorie-examen";
import { cn } from "@/lib/utils";

type TriExamen = "libelle-asc" | "prix-asc" | "prix-desc";

function normaliser(texte: string) {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function filtrerExamens(
  examens: ExamenPublic[],
  options: {
    recherche: string;
    categorie: string;
    service: string;
    tri: TriExamen;
  }
) {
  const terme = normaliser(options.recherche.trim());
  let resultat = examens.filter((ex) => {
    if (options.categorie !== "tous" && ex.categorie !== options.categorie) {
      return false;
    }
    if (
      options.service !== "tous" &&
      (ex.serviceLabo ?? "Non classé") !== options.service
    ) {
      return false;
    }
    if (!terme) return true;
    return (
      normaliser(ex.libelle).includes(terme) ||
      normaliser(ex.code).includes(terme) ||
      normaliser(ex.categorie).includes(terme)
    );
  });

  resultat = [...resultat].sort((a, b) => {
    if (options.tri === "prix-asc") return a.prix - b.prix;
    if (options.tri === "prix-desc") return b.prix - a.prix;
    return a.libelle.localeCompare(b.libelle, "fr");
  });

  return resultat;
}

function CarteExamen({
  examen,
  onDetails,
}: {
  examen: ExamenPublic;
  onDetails: (examen: ExamenPublic) => void;
}) {
  const style = styleCategorieExamen(examen.categorie);
  const Icone = style.icone;
  const description =
    examen.description?.trim() ||
    `Analyse ${examen.categorie.toLowerCase()} — code ${examen.code}.`;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gris-bordure/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-bleu-medical/25 hover:shadow-md sm:p-5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            style.fondIcone,
            style.couleurIcone
          )}
        >
          <Icone className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold leading-snug text-texte-principal sm:text-base">
            {examen.libelle}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-texte-secondaire sm:text-sm">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gris-bordure/70 pt-3">
        <div className="flex items-center gap-3 text-xs text-texte-secondaire">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formaterDelaiExamenPublic(examen.delaiHeures)}
          </span>
          <span className="font-bold text-texte-principal">
            {formaterPrixExamenPublic(examen.prix)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onDetails(examen)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-bleu-medical transition-colors hover:text-bleu-medical/80"
        >
          Détails
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

function ModaleDetailExamen({
  examen,
  onFermer,
}: {
  examen: ExamenPublic | null;
  onFermer: () => void;
}) {
  if (!examen) return null;
  const style = styleCategorieExamen(examen.categorie);
  const Icone = style.icone;

  return (
    <Dialog.Root open={Boolean(examen)} onOpenChange={(open) => !open && onFermer()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[120] bg-black/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[121] w-[min(calc(100vw-2rem),480px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gris-bordure bg-white shadow-xl focus:outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-gris-bordure px-5 py-4">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  style.fondIcone,
                  style.couleurIcone
                )}
              >
                <Icone className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <Dialog.Title className="text-base font-bold text-texte-principal">
                  {examen.libelle}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-texte-secondaire">
                  {examen.categorie} · {examen.code}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-3 px-5 py-4 text-sm">
            {examen.description ? (
              <p className="leading-relaxed text-texte-secondaire">
                {examen.description}
              </p>
            ) : null}
            <dl className="grid gap-2 rounded-xl bg-gris-tres-clair p-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-texte-secondaire">Tarif</dt>
                <dd className="font-bold text-texte-principal">
                  {formaterPrixExamenPublic(examen.prix)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-texte-secondaire">Délai estimé</dt>
                <dd className="font-medium text-texte-principal">
                  {formaterDelaiExamenPublic(examen.delaiHeures)}
                </dd>
              </div>
              {examen.serviceLabo ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-texte-secondaire">Service</dt>
                  <dd className="text-right font-medium text-texte-principal">
                    {examen.serviceLabo}
                  </dd>
                </div>
              ) : null}
              {examen.specimen ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-texte-secondaire">Prélèvement</dt>
                  <dd className="text-right font-medium text-texte-principal">
                    {examen.specimen}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gris-bordure px-5 py-4 sm:flex-row sm:justify-end">
            <Bouton variante="contour" taille="petit" onClick={onFermer}>
              Fermer
            </Bouton>
            <Link href="/rendez-vous">
              <Bouton variante="primaire" taille="petit" enTantQueEnfant>
                Prendre rendez-vous
              </Bouton>
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function CatalogueExamensLaboratoire() {
  const { catalogue } = useContenuServicesLaboratoire();
  const { data: examens = [], isLoading, isError } = useExamensPublic();
  const [recherche, setRecherche] = useState("");
  const [categorieActive, setCategorieActive] = useState("tous");
  const [serviceActif, setServiceActif] = useState("tous");
  const [tri, setTri] = useState<TriExamen>("libelle-asc");
  const [examenSelectionne, setExamenSelectionne] = useState<ExamenPublic | null>(
    null
  );
  const [pageCourante, setPageCourante] = useState(1);
  const colonnes = useColonnesGrilleExamens();
  const taillePage = useTaillePageExamens(colonnes);

  useEffect(() => {
    setPageCourante(1);
  }, [recherche, categorieActive, serviceActif, tri, taillePage]);

  const categories = useMemo(() => {
    const comptes = new Map<string, number>();
    for (const ex of examens) {
      comptes.set(ex.categorie, (comptes.get(ex.categorie) ?? 0) + 1);
    }
    return Array.from(comptes.entries())
      .sort(([a], [b]) => a.localeCompare(b, "fr"))
      .map(([nom, count]) => ({ nom, count }));
  }, [examens]);

  const services = useMemo(() => {
    const comptes = new Map<string, number>();
    for (const ex of examens) {
      const svc = ex.serviceLabo ?? "Non classé";
      comptes.set(svc, (comptes.get(svc) ?? 0) + 1);
    }
    return Array.from(comptes.entries())
      .sort(([a], [b]) => a.localeCompare(b, "fr"))
      .map(([nom, count]) => ({ nom, count }));
  }, [examens]);

  const examensFiltres = useMemo(
    () =>
      filtrerExamens(examens, {
        recherche,
        categorie: categorieActive,
        service: serviceActif,
        tri,
      }),
    [examens, recherche, categorieActive, serviceActif, tri]
  );

  const nombrePages = Math.max(1, Math.ceil(examensFiltres.length / taillePage));
  const pageEffective = Math.min(pageCourante, nombrePages);
  const examensPage = examensFiltres.slice(
    (pageEffective - 1) * taillePage,
    pageEffective * taillePage
  );

  const titreListe =
    categorieActive === "tous"
      ? `${catalogue.titreTous} (${examensFiltres.length})`
      : `${categorieActive} (${examensFiltres.length})`;

  return (
    <section
      id="catalogue-examens"
      className="bg-gris-tres-clair py-10 sm:py-12 lg:py-14"
      aria-labelledby="titre-catalogue-examens"
    >
      <div className="conteneur-principal">
        <div className="rounded-2xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
            <label className="relative block">
              <span className="sr-only">{catalogue.rechercheLabel}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
              <input
                type="search"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder={catalogue.recherchePlaceholder}
                className="w-full rounded-xl border border-gris-bordure py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-bleu-medical focus:ring-2 focus:ring-bleu-medical/20"
              />
            </label>

            <select
              value={categorieActive}
              onChange={(e) => setCategorieActive(e.target.value)}
              className="rounded-xl border border-gris-bordure bg-white px-3 py-2.5 text-sm outline-none focus:border-bleu-medical"
              aria-label={catalogue.filtreCategorie}
            >
              <option value="tous">{catalogue.toutesCategories}</option>
              {categories.map((cat) => (
                <option key={cat.nom} value={cat.nom}>
                  {cat.nom} ({cat.count})
                </option>
              ))}
            </select>

            <select
              value={serviceActif}
              onChange={(e) => setServiceActif(e.target.value)}
              className="rounded-xl border border-gris-bordure bg-white px-3 py-2.5 text-sm outline-none focus:border-bleu-medical"
              aria-label={catalogue.filtreService}
            >
              <option value="tous">{catalogue.tousServices}</option>
              {services.map((svc) => (
                <option key={svc.nom} value={svc.nom}>
                  {svc.nom} ({svc.count})
                </option>
              ))}
            </select>

            <select
              value={tri}
              onChange={(e) => setTri(e.target.value as TriExamen)}
              className="rounded-xl border border-gris-bordure bg-white px-3 py-2.5 text-sm outline-none focus:border-bleu-medical"
              aria-label={catalogue.trierPar}
            >
              <option value="libelle-asc">{catalogue.triNom}</option>
              <option value="prix-asc">{catalogue.triPrixAsc}</option>
              <option value="prix-desc">{catalogue.triPrixDesc}</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-gris-bordure bg-white p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-texte-principal">
                <Filter className="h-4 w-4 text-bleu-medical" />
                {catalogue.categoriesTitre}
              </h2>
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setCategorieActive("tous")}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      categorieActive === "tous"
                        ? "bg-bleu-medical-clair font-semibold text-bleu-medical"
                        : "text-texte-principal hover:bg-gris-tres-clair"
                    )}
                  >
                    <span>{catalogue.tousExamens}</span>
                    <span className="text-xs opacity-70">{examens.length}</span>
                  </button>
                </li>
                {categories.map((cat) => {
                  const style = styleCategorieExamen(cat.nom);
                  const Icone = style.icone;
                  return (
                    <li key={cat.nom}>
                      <button
                        type="button"
                        onClick={() => setCategorieActive(cat.nom)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          categorieActive === cat.nom
                            ? "bg-bleu-medical-clair font-semibold text-bleu-medical"
                            : "text-texte-principal hover:bg-gris-tres-clair"
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Icone className="h-4 w-4 shrink-0 opacity-70" />
                          <span className="truncate">{cat.nom}</span>
                        </span>
                        <span className="shrink-0 text-xs opacity-70">
                          {cat.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-bleu-medical/20 bg-bleu-medical-clair/40 p-4">
              <p className="text-sm font-bold text-texte-principal">
                {catalogue.aideTitre}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-texte-secondaire">
                {catalogue.aideTexte}
              </p>
              <a
                href={`tel:${INFORMATIONS_HOPITAL.telephone.replace(/\s/g, "")}`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-bleu-medical"
              >
                <Phone className="h-4 w-4" />
                {INFORMATIONS_HOPITAL.telephone}
              </a>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="titre-catalogue-examens"
                className="text-lg font-bold text-texte-principal sm:text-xl"
              >
                {titreListe}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-texte-secondaire shadow-sm">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {examensFiltres.length} résultat
                {examensFiltres.length > 1 ? "s" : ""}
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-gris-bordure bg-white py-16 text-sm text-texte-secondaire">
                <Loader2 className="h-5 w-5 animate-spin text-bleu-medical" />
                Chargement des examens…
              </div>
            ) : isError ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-700">
                Impossible de charger le catalogue. Réessayez plus tard.
              </p>
            ) : examensFiltres.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gris-bordure bg-white px-4 py-10 text-center text-sm text-texte-secondaire">
                {catalogue.aucunResultat}
              </p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {examensPage.map((examen) => (
                    <CarteExamen
                      key={examen.id}
                      examen={examen}
                      onDetails={setExamenSelectionne}
                    />
                  ))}
                </div>

                {nombrePages > 1 ? (
                  <nav
                    className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl border border-gris-bordure bg-white px-4 py-3 sm:flex-row"
                    aria-label="Pagination du catalogue"
                  >
                    <p className="text-xs text-texte-secondaire">
                      Page {pageEffective} sur {nombrePages} ·{" "}
                      {examensFiltres.length} examen
                      {examensFiltres.length > 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={pageEffective <= 1}
                        onClick={() => setPageCourante((p) => Math.max(1, p - 1))}
                        className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 text-sm font-semibold text-texte-principal transition-colors hover:bg-gris-tres-clair disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                      </button>
                      <button
                        type="button"
                        disabled={pageEffective >= nombrePages}
                        onClick={() =>
                          setPageCourante((p) => Math.min(nombrePages, p + 1))
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 text-sm font-semibold text-texte-principal transition-colors hover:bg-gris-tres-clair disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </nav>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      <ModaleDetailExamen
        examen={examenSelectionne}
        onFermer={() => setExamenSelectionne(null)}
      />
    </section>
  );
}
