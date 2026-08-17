"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Eye,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  SquarePen,
  Users,
  X,
} from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";
import { AvatarUtilisateur } from "@/components/ui/avatar-utilisateur";
import {
  BoutonsOutilsListe,
  telechargerCsv,
} from "@/components/ui/boutons-outils-liste";
import { EVENEMENT_ADMIN_UTILISATEURS_MODIFIES } from "@/constants/admin";
import { estRoleGereParServiceClient } from "@/constants/admin-utilisateurs";
import {
  compterFiltresUtilisateursAdmin,
  FILTRES_UTILISATEURS_ADMIN_VIDES,
  FormulaireFiltresUtilisateursAdmin,
  utilisateurCorrespondFiltresAdmin,
  type FiltresUtilisateursAdmin,
} from "@/features/admin/formulaire-filtres-utilisateurs-admin";
import {
  FORM_UTILISATEUR_ADMIN_VIDE,
  FormulaireUtilisateurAdmin,
  type FormUtilisateurAdmin,
} from "@/features/admin/formulaire-utilisateur-admin";
import { cn } from "@/lib/utils";

interface RoleOption {
  id: string;
  code: string;
  nom: string;
  systeme: boolean;
  salle: { code: string; nom: string } | null;
}

interface SalleOption {
  code: string;
  nom: string;
}

interface UtilisateurItem {
  id: string;
  identifiant: string;
  email: string | null;
  prenom: string;
  nom: string;
  telephone: string | null;
  photoUrl?: string | null;
  statut: "ACTIF" | "INACTIF" | "SUSPENDU";
  messagerieBloquee?: boolean;
  notesAdmin?: string | null;
  derniereConnexion: string | null;
  role: RoleOption;
}

type ModePanneau = "creation" | "consultation" | "edition";

const STATUTS = ["ACTIF", "INACTIF", "SUSPENDU"] as const;

const CLASSE_BOUTON_ACTION =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-slate-500 transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical";

function classeBadgeRole(code: string) {
  if (code.includes("ADMIN")) return "bg-violet-100 text-violet-800";
  if (code.includes("MEDECIN")) return "bg-sky-100 text-sky-800";
  if (code.includes("LABO")) return "bg-emerald-100 text-emerald-800";
  if (code.includes("CAISSE")) return "bg-orange-100 text-orange-800";
  if (code.includes("PHARMA")) return "bg-teal-100 text-teal-800";
  if (code.includes("INFIRM")) return "bg-pink-100 text-pink-800";
  if (code.includes("RECEPT")) return "bg-indigo-100 text-indigo-800";
  return "bg-slate-100 text-slate-700";
}

function classeBadgeStatut(statut: UtilisateurItem["statut"]) {
  if (statut === "ACTIF") return "bg-emerald-50 text-emerald-700";
  if (statut === "INACTIF") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-800";
}

function formaterDerniereConnexion(
  iso: string | null,
  locale: string,
  t: (cle: string) => string
) {
  if (!iso) return t("admin.utilisateurs.jamaisConnecte");
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return t("admin.utilisateurs.jamaisConnecte");

  const maintenant = new Date();
  const debutAujourdhui = new Date(
    maintenant.getFullYear(),
    maintenant.getMonth(),
    maintenant.getDate()
  );
  const debutHier = new Date(debutAujourdhui);
  debutHier.setDate(debutHier.getDate() - 1);
  const heure = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (date >= debutAujourdhui) {
    return `${t("admin.utilisateurs.aujourdhui")} ${heure}`;
  }
  if (date >= debutHier) {
    return `${t("admin.utilisateurs.hier")} ${heure}`;
  }
  return `${date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} ${heure}`;
}

export function ContenuUtilisateursAdmin({
  utilisateur,
  utilisateurId,
}: {
  utilisateur: UtilisateurAdmin;
  utilisateurId: string;
}) {
  const { t, i18n } = useTranslation();
  const [liste, setListe] = useState<UtilisateurItem[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [salles, setSalles] = useState<SalleOption[]>([]);
  const [rechercheRapide, setRechercheRapide] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresUtilisateursAdmin>(
    FILTRES_UTILISATEURS_ADMIN_VIDES
  );
  const [appliques, setAppliques] = useState<FiltresUtilisateursAdmin>(
    FILTRES_UTILISATEURS_ADMIN_VIDES
  );
  const [idsCoches, setIdsCoches] = useState<string[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [form, setForm] = useState<FormUtilisateurAdmin>({ ...FORM_UTILISATEUR_ADMIN_VIDE });
  const [photo, setPhoto] = useState<File | null>(null);
  const [modePanneau, setModePanneau] = useState<ModePanneau>("creation");
  const [menuOuvertId, setMenuOuvertId] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const modeCreation = modePanneau === "creation";
  const lectureSeule = modePanneau === "consultation";

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const [uRes, rRes, sRes] = await Promise.all([
        fetch("/api/admin/utilisateurs"),
        fetch("/api/admin/roles"),
        fetch("/api/admin/salles"),
      ]);
      const uData = (await uRes.json()) as {
        utilisateurs?: UtilisateurItem[];
        message?: string;
      };
      const rData = (await rRes.json()) as {
        roles?: RoleOption[];
        message?: string;
      };
      const sData = (await sRes.json()) as {
        salles?: SalleOption[];
        message?: string;
      };
      if (!uRes.ok) throw new Error(uData.message ?? t("admin.utilisateurs.erreur"));
      if (!rRes.ok) throw new Error(rData.message ?? t("admin.roles.erreur"));
      if (!sRes.ok) throw new Error(sData.message ?? t("admin.services.erreur"));
      const rolesListe = rData.roles ?? [];
      setListe(uData.utilisateurs ?? []);
      setRoles(rolesListe);
      setSalles(sData.salles ?? []);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.utilisateurs.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const listeFiltree = useMemo(
    () =>
      liste.filter((u) =>
        utilisateurCorrespondFiltresAdmin(u, appliques, rechercheRapide)
      ),
    [liste, appliques, rechercheRapide]
  );

  const nbFiltres = compterFiltresUtilisateursAdmin(appliques);
  const toutSelectionne =
    listeFiltree.length > 0 && listeFiltree.every((u) => idsCoches.includes(u.id));

  useEffect(() => {
    if (!menuOuvertId) return;
    const fermer = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOuvertId(null);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, [menuOuvertId]);

  const ouvrirCreation = () => {
    setModePanneau("creation");
    setSelectionId(null);
    setMenuOuvertId(null);
    setForm({ ...FORM_UTILISATEUR_ADMIN_VIDE });
    setPhoto(null);
    setMessage(null);
    setErreur(null);
  };

  const remplirFormulaire = (u: UtilisateurItem) => {
    setSelectionId(u.id);
    setForm({
      identifiant: u.identifiant,
      email: u.email ?? "",
      prenom: u.prenom,
      nom: u.nom,
      telephone: u.telephone ?? "",
      roleId: u.role.id,
      salleCode: u.role.salle?.code ?? "",
      motDePasse: "",
      confirmationMotDePasse: "",
      statut: u.statut,
      messagerieBloquee: u.messagerieBloquee ?? false,
      notesAdmin: u.notesAdmin ?? "",
    });
    setPhoto(null);
    setMessage(null);
    setErreur(null);
  };

  const consulter = (u: UtilisateurItem) => {
    setModePanneau("consultation");
    setMenuOuvertId(null);
    remplirFormulaire(u);
  };

  const editer = (u: UtilisateurItem) => {
    setModePanneau("edition");
    setMenuOuvertId(null);
    remplirFormulaire(u);
  };

  const changerStatut = async (
    u: UtilisateurItem,
    statut: "ACTIF" | "INACTIF"
  ) => {
    setMenuOuvertId(null);
    if (statut === "INACTIF" && u.id === utilisateurId) {
      setErreur(t("admin.utilisateurs.impossibleSeDesactiver"));
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/utilisateurs/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(
        statut === "ACTIF"
          ? t("admin.utilisateurs.active")
          : t("admin.utilisateurs.desactive")
      );
      if (selectionId === u.id) {
        setForm((f) => ({ ...f, statut }));
      }
      window.dispatchEvent(new Event(EVENEMENT_ADMIN_UTILISATEURS_MODIFIES));
      await charger();
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
    setIdsCoches(toutSelectionne ? [] : listeFiltree.map((u) => u.id));
  };

  const exporterSelection = () => {
    const coches = new Set(idsCoches);
    const cibles =
      coches.size > 0 ? listeFiltree.filter((u) => coches.has(u.id)) : listeFiltree;
    if (cibles.length === 0) return;
    telechargerCsv(
      `admin-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        t("admin.utilisateurs.colonnes.utilisateur"),
        t("admin.utilisateurs.champs.identifiant"),
        t("admin.utilisateurs.champs.email"),
        t("admin.utilisateurs.colonnes.role"),
        t("admin.utilisateurs.colonnes.salle"),
        t("admin.utilisateurs.colonnes.statut"),
        t("admin.utilisateurs.colonnes.derniereConnexion"),
      ],
      cibles.map((u) => [
        `${u.prenom} ${u.nom}`,
        u.identifiant,
        u.email ?? "",
        u.role.nom,
        u.role.salle?.nom ?? "",
        t(`admin.utilisateurs.statuts.${u.statut}`),
        formaterDerniereConnexion(u.derniereConnexion, i18n.language, t),
      ])
    );
  };

  const soumettre = async () => {
    if (
      !form.prenom.trim() ||
      !form.nom.trim() ||
      !form.email.trim() ||
      !form.roleId ||
      !form.salleCode ||
      (modeCreation && !form.identifiant.trim())
    ) {
      setErreur(t("admin.utilisateurs.champsRequis"));
      return;
    }
    if (modeCreation && !form.motDePasse) {
      setErreur(t("admin.utilisateurs.champsRequis"));
      return;
    }
    if (form.motDePasse && form.motDePasse !== form.confirmationMotDePasse) {
      setErreur(t("admin.utilisateurs.mdpDifferents"));
      return;
    }

    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      let utilisateurIdCible = selectionId;
      if (modeCreation) {
        const res = await fetch("/api/admin/utilisateurs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifiant: form.identifiant,
            email: form.email,
            prenom: form.prenom,
            nom: form.nom,
            telephone: form.telephone || null,
            roleId: form.roleId,
            motDePasse: form.motDePasse,
            statut: form.statut,
            notesAdmin: form.notesAdmin || null,
          }),
        });
        const data = (await res.json()) as {
          message?: string;
          utilisateur?: { id: string };
        };
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        utilisateurIdCible = data.utilisateur?.id ?? null;
        setMessage(data.message ?? t("admin.utilisateurs.cree"));
        setForm({ ...FORM_UTILISATEUR_ADMIN_VIDE });
      } else if (selectionId) {
        const res = await fetch(`/api/admin/utilisateurs/${selectionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email || null,
            prenom: form.prenom,
            nom: form.nom,
            telephone: form.telephone || null,
            roleId: form.roleId,
            statut: form.statut,
            messagerieBloquee: form.messagerieBloquee,
            notesAdmin: form.notesAdmin || null,
            motDePasse: form.motDePasse || undefined,
          }),
        });
        const data = (await res.json()) as { message?: string };
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        setMessage(data.message ?? t("admin.utilisateurs.maj"));
      }

      if (photo && utilisateurIdCible) {
        const fd = new FormData();
        fd.append("photo", photo);
        const photoRes = await fetch(
          `/api/admin/utilisateurs/${utilisateurIdCible}/photo`,
          { method: "POST", body: fd }
        );
        const photoData = (await photoRes.json()) as { message?: string };
        if (!photoRes.ok) {
          throw new Error(photoData.message ?? t("admin.common.erreur"));
        }
      }

      setPhoto(null);
      window.dispatchEvent(new Event(EVENEMENT_ADMIN_UTILISATEURS_MODIFIES));
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.utilisateurs.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={Users}
          titre={t("admin.utilisateurs.titre")}
          description={t("admin.utilisateurs.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.utilisateurs.fil") },
          ]}
        />

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex h-11 min-w-[180px] w-full max-w-md flex-1 items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-3 text-sm text-texte-principal shadow-sm transition-colors focus-within:border-bleu-medical focus-within:ring-2 focus-within:ring-bleu-medical/25">
              <Search className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
              <input
                type="search"
                value={rechercheRapide}
                onChange={(e) => setRechercheRapide(e.target.value)}
                placeholder={t("admin.utilisateurs.recherche")}
                aria-label={t("admin.utilisateurs.recherche")}
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-600"
              />
              {rechercheRapide ? (
                <button
                  type="button"
                  onClick={() => setRechercheRapide("")}
                  aria-label={t("admin.utilisateurs.effacerRecherche")}
                  className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </label>

            <div className="flex shrink-0 items-center justify-end gap-2">
              <Bouton type="button" taille="petit" onClick={ouvrirCreation}>
                <Plus className="h-4 w-4" />
                {t("admin.utilisateurs.creer")}
              </Bouton>
              <button
                type="button"
                onClick={() => setFiltresOuverts((o) => !o)}
                aria-expanded={filtresOuverts}
                aria-label={
                  filtresOuverts
                    ? t("reception.tableau.fermerFiltres")
                    : t("reception.tableau.ouvrirFiltres")
                }
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
            <FormulaireFiltresUtilisateursAdmin
              valeurs={brouillon}
              onChange={setBrouillon}
              onRechercher={() => setAppliques(brouillon)}
              onReinitialiser={() => {
                setBrouillon(FILTRES_UTILISATEURS_ADMIN_VIDES);
                setAppliques(FILTRES_UTILISATEURS_ADMIN_VIDES);
              }}
              roles={roles.map((r) => ({ id: r.id, nom: r.nom }))}
              salles={salles.map((s) => ({ code: s.code, nom: s.nom }))}
              statuts={STATUTS}
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
                {t("admin.utilisateurs.aucunResultat")}
              </p>
            ) : (
              <div className="conteneur-tableau-sigh">
                <table className="tableau-sigh min-w-[640px]">
                  <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                    <tr>
                      <th className="w-10 px-3 py-2">
                        <span className="sr-only">
                          {t("reception.liste.selectionnerTout")}
                        </span>
                      </th>
                      <th className="px-3 py-2">
                        {t("admin.utilisateurs.colonnes.utilisateur")}
                      </th>
                      <th className="px-3 py-2">{t("admin.utilisateurs.colonnes.role")}</th>
                      <th className="hidden px-3 py-2 md:table-cell">
                        {t("admin.utilisateurs.colonnes.salle")}
                      </th>
                      <th className="px-3 py-2">{t("admin.utilisateurs.colonnes.statut")}</th>
                      <th className="hidden px-3 py-2 lg:table-cell">
                        {t("admin.utilisateurs.colonnes.derniereConnexion")}
                      </th>
                      <th className="px-3 py-2 text-center">
                        {t("admin.utilisateurs.colonnes.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listeFiltree.map((u) => (
                      <tr
                        key={u.id}
                        className={cn(
                          "cursor-pointer border-t border-gris-bordure hover:bg-bleu-medical-clair/20",
                          selectionId === u.id && "bg-bleu-medical-clair/30"
                        )}
                        onClick={() => consulter(u)}
                      >
                        <td
                          className="px-3 py-2.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={idsCoches.includes(u.id)}
                            onChange={() => basculerCoche(u.id)}
                            aria-label={`${u.prenom} ${u.nom}`}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <AvatarUtilisateur
                              prenom={u.prenom}
                              nom={u.nom}
                              photoUrl={u.photoUrl}
                              taille="sm"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-texte-principal">
                                {u.prenom} {u.nom}
                              </p>
                              <p className="truncate text-xs text-texte-secondaire">
                                {u.email || u.identifiant}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                              classeBadgeRole(u.role.code)
                            )}
                          >
                            {u.role.nom}
                          </span>
                          {estRoleGereParServiceClient(u.role.code) ? (
                            <span className="mt-1 block text-[10px] font-semibold text-violet-800">
                              {t("admin.utilisateurs.serviceClient")}
                            </span>
                          ) : null}
                        </td>
                        <td className="hidden px-3 py-2.5 text-sm md:table-cell">
                          {u.role.salle?.nom ?? "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                              classeBadgeStatut(u.statut)
                            )}
                          >
                            {t(`admin.utilisateurs.statuts.${u.statut}`)}
                          </span>
                          {u.messagerieBloquee ? (
                            <span className="ml-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                              {t("admin.utilisateurs.messagerieBloquee")}
                            </span>
                          ) : null}
                        </td>
                        <td className="hidden px-3 py-2.5 text-xs text-texte-secondaire lg:table-cell">
                          {formaterDerniereConnexion(
                            u.derniereConnexion,
                            i18n.language,
                            t
                          )}
                        </td>
                        <td
                          className="px-3 py-2.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => consulter(u)}
                              className={CLASSE_BOUTON_ACTION}
                              aria-label={t("admin.utilisateurs.voir")}
                              title={t("admin.utilisateurs.voir")}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => editer(u)}
                              className={CLASSE_BOUTON_ACTION}
                              aria-label={t("admin.utilisateurs.editer")}
                              title={t("admin.utilisateurs.editer")}
                            >
                              <SquarePen className="h-4 w-4" />
                            </button>
                            <div
                              className="relative"
                              ref={menuOuvertId === u.id ? menuRef : undefined}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setMenuOuvertId((id) => (id === u.id ? null : u.id))
                                }
                                className={CLASSE_BOUTON_ACTION}
                                aria-label={t("admin.utilisateurs.plusActions")}
                                title={t("admin.utilisateurs.plusActions")}
                                aria-expanded={menuOuvertId === u.id}
                                aria-haspopup="menu"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {menuOuvertId === u.id ? (
                                <div
                                  role="menu"
                                  className="absolute right-0 top-10 z-20 min-w-[220px] overflow-hidden rounded-lg border border-gris-bordure bg-white py-1 shadow-lg"
                                >
                                  {u.statut === "ACTIF" ? (
                                    <button
                                      type="button"
                                      role="menuitem"
                                      disabled={enCours || u.id === utilisateurId}
                                      onClick={() => void changerStatut(u, "INACTIF")}
                                      title={
                                        u.id === utilisateurId
                                          ? t("admin.utilisateurs.impossibleSeDesactiver")
                                          : undefined
                                      }
                                      className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {t("admin.utilisateurs.desactiverCompte")}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      role="menuitem"
                                      disabled={enCours}
                                      onClick={() => void changerStatut(u, "ACTIF")}
                                      className="block w-full px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                    >
                                      {t("admin.utilisateurs.activerCompte")}
                                    </button>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <FormulaireUtilisateurAdmin
            form={form}
            onChange={setForm}
            roles={roles}
            salles={salles}
            modePanneau={modePanneau}
            lectureSeule={lectureSeule}
            enCours={enCours}
            photo={photo}
            photoUrlExistante={liste.find((u) => u.id === selectionId)?.photoUrl}
            onPhoto={setPhoto}
            onSoumettre={() => void soumettre()}
            onAnnuler={ouvrirCreation}
          />
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
