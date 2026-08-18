"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BarreOutilsListeAdmin } from "@/features/admin/barre-outils-liste-admin";
import {
  compterFiltresVisitesAdmin,
  FILTRES_VISITES_ADMIN_VIDES,
  FormulaireFiltresVisitesAdmin,
  visiteCorrespondFiltresAdmin,
  type FiltresVisitesAdmin,
} from "@/features/admin/formulaire-filtres-patients-admin";
import {
  formaterJourLong,
  grouperParJour,
} from "@/features/admin/cadre-action-patient-admin";
import {
  PaginationListe,
  paginerListe,
} from "@/components/ui/pagination-liste";
import { telechargerCsv } from "@/components/ui/boutons-outils-liste";

const PAR_PAGE = 5;

export function ListeOutilsVisitesAdmin<
  T extends {
    dossierId: string;
    numeroDossier: string;
    statut: string;
    ouvertLe: string;
    salleEnregistrement?: string;
    texte?: string;
    salles?: string[];
  },
>({
  visites,
  salles,
  vide,
  nomExport,
  colonnesExport,
  ligneExport,
  renderVisite,
}: {
  visites: T[];
  salles: { code: string; nom: string }[];
  vide: string;
  nomExport: string;
  colonnesExport: string[];
  ligneExport: (v: T) => string[];
  renderVisite: (v: T, coche: boolean, onCoche: () => void) => ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const [recherche, setRecherche] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresVisitesAdmin>(
    FILTRES_VISITES_ADMIN_VIDES
  );
  const [appliques, setAppliques] = useState<FiltresVisitesAdmin>(
    FILTRES_VISITES_ADMIN_VIDES
  );
  const [idsCoches, setIdsCoches] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const filtres = useMemo(
    () =>
      visites.filter((v) =>
        visiteCorrespondFiltresAdmin(
          {
            numeroDossier: v.numeroDossier,
            statut: v.statut,
            salleEnregistrement: v.salleEnregistrement,
            salles: v.salles,
            texte: v.texte,
          },
          appliques,
          recherche
        )
      ),
    [visites, appliques, recherche]
  );

  const pageData = useMemo(
    () => paginerListe(filtres, page, PAR_PAGE),
    [filtres, page]
  );
  const groupes = grouperParJour(pageData.itemsPage);

  useEffect(() => {
    setPage(1);
  }, [recherche, appliques]);

  const toutSelectionne =
    filtres.length > 0 && filtres.every((v) => idsCoches.includes(v.dossierId));

  const exporter = () => {
    const coches = new Set(idsCoches);
    const cibles =
      coches.size > 0 ? filtres.filter((v) => coches.has(v.dossierId)) : filtres;
    if (cibles.length === 0) return;
    telechargerCsv(nomExport, colonnesExport, cibles.map(ligneExport));
  };

  return (
    <div className="space-y-4">
      <BarreOutilsListeAdmin
        recherche={recherche}
        onRecherche={setRecherche}
        placeholder={t("admin.patients.actions.rechercheVisite")}
        filtresOuverts={filtresOuverts}
        onFiltres={() => setFiltresOuverts((o) => !o)}
        nbFiltres={compterFiltresVisitesAdmin(appliques)}
        toutSelectionne={toutSelectionne}
        onSelectionnerTout={() =>
          setIdsCoches(toutSelectionne ? [] : filtres.map((v) => v.dossierId))
        }
        onExporter={exporter}
      />
      {filtresOuverts ? (
        <FormulaireFiltresVisitesAdmin
          valeurs={brouillon}
          onChange={setBrouillon}
          onRechercher={() => {
            setAppliques(brouillon);
            setPage(1);
          }}
          onReinitialiser={() => {
            setBrouillon(FILTRES_VISITES_ADMIN_VIDES);
            setAppliques(FILTRES_VISITES_ADMIN_VIDES);
            setPage(1);
          }}
          salles={salles}
        />
      ) : null}

      {filtres.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gris-bordure bg-white px-4 py-10 text-center text-sm text-texte-secondaire">
          {vide}
        </p>
      ) : (
        <>
          <div className="space-y-8">
            {groupes.map((g) => (
              <section key={g.jour}>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                  {formaterJourLong(g.jour, i18n.language)}
                </h2>
                <div className="space-y-3">
                  {g.items.map((v) =>
                    renderVisite(v, idsCoches.includes(v.dossierId), () =>
                      setIdsCoches((ids) =>
                        ids.includes(v.dossierId)
                          ? ids.filter((id) => id !== v.dossierId)
                          : [...ids, v.dossierId]
                      )
                    )
                  )}
                </div>
              </section>
            ))}
          </div>
          <PaginationListe
            page={pageData.pageCourante}
            totalPages={pageData.totalPages}
            totalItems={filtres.length}
            parPage={PAR_PAGE}
            onChange={setPage}
            labelPrec={t("reception.liste.prec")}
            labelSuiv={t("reception.liste.suiv")}
          />
        </>
      )}
    </div>
  );
}
