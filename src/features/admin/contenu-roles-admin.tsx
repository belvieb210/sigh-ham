"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Eye,
  Loader2,
  Search,
  Shield,
  SlidersHorizontal,
  SquarePen,
  X,
} from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import {
  BoutonsOutilsListe,
  telechargerCsv,
} from "@/components/ui/boutons-outils-liste";
import {
  PaginationListe,
  paginerListe,
} from "@/components/ui/pagination-liste";
import {
  compterFiltresRolesAdmin,
  FILTRES_ROLES_ADMIN_VIDES,
  FormulaireFiltresRolesAdmin,
  roleCorrespondFiltresAdmin,
  type FiltresRolesAdmin,
} from "@/features/admin/formulaire-filtres-roles-admin";
import {
  FormulairePermissionsRoleAdmin,
  type PermissionItemAdmin,
  type RoleSelectionneAdmin,
} from "@/features/admin/formulaire-permissions-role-admin";
import { cn } from "@/lib/utils";

type RoleItem = RoleSelectionneAdmin;
type ModePanneau = "vide" | "consultation" | "edition";

const ROLES_PAR_PAGE = 16;
const CLASSE_BOUTON_ACTION =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-slate-500 transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical";

export function ContenuRolesAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [catalogue, setCatalogue] = useState<PermissionItemAdmin[]>([]);
  const [rechercheRapide, setRechercheRapide] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresRolesAdmin>(FILTRES_ROLES_ADMIN_VIDES);
  const [appliques, setAppliques] = useState<FiltresRolesAdmin>(FILTRES_ROLES_ADMIN_VIDES);
  const [idsCoches, setIdsCoches] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [selectionCodes, setSelectionCodes] = useState<Set<string>>(new Set());
  const [modePanneau, setModePanneau] = useState<ModePanneau>("vide");
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [chargement, setChargement] = useState(true);
  const chargeRef = useRef(false);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const [rRes, pRes] = await Promise.all([
        fetch("/api/admin/roles"),
        fetch("/api/admin/permissions"),
      ]);
      const rData = (await rRes.json()) as { roles?: RoleItem[]; message?: string };
      const pData = (await pRes.json()) as {
        permissions?: PermissionItemAdmin[];
        message?: string;
      };
      if (!rRes.ok) throw new Error(rData.message ?? t("admin.roles.erreur"));
      if (!pRes.ok) throw new Error(pData.message ?? t("admin.roles.erreur"));
      setRoles(rData.roles ?? []);
      setCatalogue(pData.permissions ?? []);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.roles.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    if (chargeRef.current) return;
    chargeRef.current = true;
    void charger();
  }, [charger]);

  const salles = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of roles) {
      if (r.salle) map.set(r.salle.code, r.salle.nom);
    }
    return [...map.entries()]
      .map(([code, nom]) => ({ code, nom }))
      .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }, [roles]);

  const listeFiltree = useMemo(
    () =>
      roles.filter((r) => roleCorrespondFiltresAdmin(r, appliques, rechercheRapide)),
    [roles, appliques, rechercheRapide]
  );

  const pageData = useMemo(
    () => paginerListe(listeFiltree, page, ROLES_PAR_PAGE),
    [listeFiltree, page]
  );

  useEffect(() => {
    setPage(1);
  }, [rechercheRapide, appliques]);

  const nbFiltres = compterFiltresRolesAdmin(appliques);
  const toutSelectionne =
    listeFiltree.length > 0 && listeFiltree.every((r) => idsCoches.includes(r.id));
  const roleSelectionne = roles.find((r) => r.id === selectionId) ?? null;
  const lectureSeule = modePanneau !== "edition";

  const chargerPermissions = async (role: RoleItem, mode: ModePanneau) => {
    setSelectionId(role.id);
    setModePanneau(mode);
    setMessage(null);
    setErreur(null);
    try {
      const res = await fetch(`/api/admin/roles/${role.id}/permissions`);
      const data = (await res.json()) as {
        permissions?: PermissionItemAdmin[];
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.roles.erreur"));
      setSelectionCodes(new Set((data.permissions ?? []).map((p) => p.id)));
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.roles.erreur"));
    }
  };

  const fermerPanneau = () => {
    setModePanneau("vide");
    setSelectionId(null);
    setSelectionCodes(new Set());
  };

  const togglePerm = (id: string) => {
    setSelectionCodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleModule = (ids: string[], tous: boolean) => {
    setSelectionCodes((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (tous) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const enregistrer = async () => {
    if (!selectionId) return;
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/roles/${selectionId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds: [...selectionCodes] }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? t("admin.roles.permissionsSauvees"));
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectionId
            ? { ...r, _count: { ...r._count, permissions: selectionCodes.size } }
            : r
        )
      );
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const basculerCoche = (id: string) => {
    setIdsCoches((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  };

  const basculerSelectionTout = () => {
    setIdsCoches(toutSelectionne ? [] : listeFiltree.map((r) => r.id));
  };

  const exporterSelection = () => {
    const coches = new Set(idsCoches);
    const cibles =
      coches.size > 0 ? listeFiltree.filter((r) => coches.has(r.id)) : listeFiltree;
    if (cibles.length === 0) return;
    telechargerCsv(
      `admin-roles-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        t("admin.roles.colonnes.role"),
        t("admin.roles.champs.code"),
        t("admin.roles.colonnes.service"),
        t("admin.roles.colonnes.type"),
        t("admin.roles.colonnes.utilisateurs"),
        t("admin.roles.permissions"),
      ],
      cibles.map((r) => [
        r.nom,
        r.code,
        r.salle?.nom ?? "",
        r.systeme ? t("admin.roles.systeme") : t("admin.roles.metier"),
        String(r._count.utilisateurs),
        String(r._count.permissions),
      ])
    );
  };

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.roles.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={Shield}
          titre={t("admin.roles.titre")}
          description={t("admin.roles.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.roles.fil") },
          ]}
        />

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex h-11 min-w-[180px] w-full max-w-md flex-1 items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-3 text-sm text-texte-principal shadow-sm transition-colors focus-within:border-bleu-medical focus-within:ring-2 focus-within:ring-bleu-medical/25">
              <Search className="h-4 w-4 shrink-0 text-slate-600" />
              <input
                type="search"
                value={rechercheRapide}
                onChange={(e) => setRechercheRapide(e.target.value)}
                placeholder={t("admin.roles.recherche")}
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-600"
              />
              {rechercheRapide ? (
                <button
                  type="button"
                  onClick={() => setRechercheRapide("")}
                  aria-label={t("admin.roles.effacerRecherche")}
                  className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </label>
            <div className="flex shrink-0 items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setFiltresOuverts((o) => !o)}
                aria-expanded={filtresOuverts}
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
                    nbFiltres > 0 ? "bg-red-500" : "bg-slate-400"
                  )}
                >
                  {nbFiltres}
                </span>
              </button>
              <BoutonsOutilsListe
                toutSelectionne={toutSelectionne}
                onSelectionnerTout={basculerSelectionTout}
                onExporter={exporterSelection}
                labelSelectionnerTout={t("reception.liste.selectionnerTout")}
                labelExporter={t("reception.liste.exporterSelection")}
              />
            </div>
          </div>
          {filtresOuverts ? (
            <FormulaireFiltresRolesAdmin
              valeurs={brouillon}
              onChange={setBrouillon}
              onRechercher={() => {
                setAppliques(brouillon);
                setPage(1);
              }}
              onReinitialiser={() => {
                setBrouillon(FILTRES_ROLES_ADMIN_VIDES);
                setAppliques(FILTRES_ROLES_ADMIN_VIDES);
                setPage(1);
              }}
              salles={salles}
            />
          ) : null}
        </div>

        {message ? (
          <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {message}
          </p>
        ) : null}
        {erreur ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            {chargement ? (
              <p className="flex items-center gap-2 p-6 text-sm text-texte-secondaire">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("admin.common.chargement")}
              </p>
            ) : listeFiltree.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                {t("admin.roles.aucunResultat")}
              </p>
            ) : (
              <>
                <div className="conteneur-tableau-sigh">
                  <table className="tableau-sigh min-w-[640px]">
                    <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                      <tr>
                        <th className="w-10 px-3 py-2">
                          <span className="sr-only">
                            {t("reception.liste.selectionnerTout")}
                          </span>
                        </th>
                        <th className="px-3 py-2">{t("admin.roles.colonnes.role")}</th>
                        <th className="hidden px-3 py-2 md:table-cell">
                          {t("admin.roles.colonnes.service")}
                        </th>
                        <th className="px-3 py-2">{t("admin.roles.colonnes.type")}</th>
                        <th className="px-3 py-2 text-center">
                          {t("admin.roles.colonnes.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.itemsPage.map((r) => (
                        <tr
                          key={r.id}
                          className={cn(
                            "cursor-pointer border-t border-gris-bordure hover:bg-bleu-medical-clair/20",
                            selectionId === r.id && "bg-bleu-medical-clair/30"
                          )}
                          onClick={() => void chargerPermissions(r, "consultation")}
                        >
                          <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={idsCoches.includes(r.id)}
                              onChange={() => basculerCoche(r.id)}
                              aria-label={r.nom}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-texte-principal">{r.nom}</p>
                            <p className="text-xs text-texte-secondaire">
                              {r.code} · {r._count.permissions} perm. ·{" "}
                              {r._count.utilisateurs}{" "}
                              {t("admin.roles.colonnes.utilisateurs").toLowerCase()}
                            </p>
                          </td>
                          <td className="hidden px-3 py-2.5 text-sm md:table-cell">
                            {r.salle?.nom ?? "—"}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                                r.systeme
                                  ? "bg-violet-50 text-violet-800"
                                  : "bg-sky-50 text-sky-800"
                              )}
                            >
                              {r.systeme
                                ? t("admin.roles.systeme")
                                : t("admin.roles.metier")}
                            </span>
                          </td>
                          <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => void chargerPermissions(r, "consultation")}
                                className={CLASSE_BOUTON_ACTION}
                                title={t("admin.roles.voir")}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void chargerPermissions(r, "edition")}
                                className={CLASSE_BOUTON_ACTION}
                                title={t("admin.roles.editer")}
                              >
                                <SquarePen className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationListe
                  page={pageData.pageCourante}
                  totalPages={pageData.totalPages}
                  totalItems={listeFiltree.length}
                  parPage={ROLES_PAR_PAGE}
                  onChange={setPage}
                  labelPrec={t("reception.liste.prec")}
                  labelSuiv={t("reception.liste.suiv")}
                />
              </>
            )}
          </div>

          <FormulairePermissionsRoleAdmin
            role={roleSelectionne}
            catalogue={catalogue}
            selectionIds={selectionCodes}
            onToggle={togglePerm}
            onToggleModule={toggleModule}
            lectureSeule={lectureSeule}
            enCours={enCours}
            onEnregistrer={() => void enregistrer()}
            onAnnuler={fermerPanneau}
          />
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
