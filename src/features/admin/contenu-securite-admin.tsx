"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyRound,
  Loader2,
  LogOut,
  Save,
  Search,
  Shield,
  SlidersHorizontal,
  Timer,
  X,
} from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";
import {
  BoutonsOutilsListe,
  telechargerCsv,
} from "@/components/ui/boutons-outils-liste";
import {
  PaginationListe,
  paginerListe,
} from "@/components/ui/pagination-liste";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

interface ParametreItem {
  cle: string;
  valeur: string;
  categorie: string;
  description: string | null;
}

interface SessionItem {
  id: string;
  utilisateurId: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expireLe: string;
  utilisateur: {
    identifiant: string;
    prenom: string;
    nom: string;
    role: { code: string; nom: string };
  };
}

const SESSIONS_PAR_PAGE = 16;
const CLASSE_BOUTON_ACTION =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-slate-500 transition-colors hover:bg-gris-tres-clair hover:text-red-600";

export function ContenuSecuriteAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<ParametreItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [rechercheRapide, setRechercheRapide] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [roleFiltre, setRoleFiltre] = useState("");
  const [roleApplique, setRoleApplique] = useState("");
  const [idsCoches, setIdsCoches] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [revoqueId, setRevoqueId] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      const [pRes, sRes] = await Promise.all([
        fetch("/api/admin/parametres?categorie=securite"),
        fetch("/api/admin/sessions"),
      ]);
      const pData = (await pRes.json()) as {
        parametres?: ParametreItem[];
        message?: string;
      };
      const sData = (await sRes.json()) as {
        sessions?: SessionItem[];
        message?: string;
      };
      if (!pRes.ok) throw new Error(pData.message ?? t("admin.common.erreur"));
      if (!sRes.ok) throw new Error(sData.message ?? t("admin.common.erreur"));
      setItems(pData.parametres ?? []);
      setSessions(sData.sessions ?? []);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const lire = (predicat: (cle: string) => boolean) =>
    items.find((p) => predicat(p.cle));

  const paramSession = lire((c) => c.toLowerCase().includes("session"));
  const paramMdp = lire(
    (c) =>
      c.toLowerCase().includes("motdepasse") ||
      c.toLowerCase().includes("mdp") ||
      c.toLowerCase().includes("password")
  );

  const maj = (cle: string, valeur: string) => {
    setItems((liste) =>
      liste.map((p) => (p.cle === cle ? { ...p, valeur } : p))
    );
  };

  const enregistrer = async () => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/parametres", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parametres: items.map((p) => ({
            cle: p.cle,
            valeur: p.valeur,
            categorie: p.categorie,
            description: p.description ?? undefined,
          })),
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? t("admin.parametres.succes"));
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const roles = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sessions) map.set(s.utilisateur.role.code, s.utilisateur.role.nom);
    return [...map.entries()].map(([code, nom]) => ({ code, nom }));
  }, [sessions]);

  const listeFiltree = useMemo(() => {
    const q = rechercheRapide.trim().toLowerCase();
    return sessions.filter((s) => {
      if (roleApplique && s.utilisateur.role.code !== roleApplique) return false;
      if (!q) return true;
      const haystack =
        `${s.utilisateur.prenom} ${s.utilisateur.nom} ${s.utilisateur.identifiant} ${s.ipAddress ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [sessions, rechercheRapide, roleApplique]);

  const pageData = useMemo(
    () => paginerListe(listeFiltree, page, SESSIONS_PAR_PAGE),
    [listeFiltree, page]
  );

  useEffect(() => {
    setPage(1);
  }, [rechercheRapide, roleApplique]);

  const nbFiltres = roleApplique ? 1 : 0;
  const toutSelectionne =
    listeFiltree.length > 0 &&
    listeFiltree.every((s) => idsCoches.includes(s.id));

  const revoquer = async (sessionId: string) => {
    setRevoqueId(sessionId);
    setErreur(null);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(t("admin.securite.sessionRevoquee"));
      setIdsCoches((ids) => ids.filter((id) => id !== sessionId));
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setRevoqueId(null);
    }
  };

  const exporterSelection = () => {
    const coches = new Set(idsCoches);
    const cibles =
      coches.size > 0 ? listeFiltree.filter((s) => coches.has(s.id)) : listeFiltree;
    if (cibles.length === 0) return;
    telechargerCsv(
      `admin-sessions-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        t("admin.securite.colonneUser"),
        t("admin.securite.colonneRole"),
        "IP",
        t("admin.securite.colonneExpire"),
      ],
      cibles.map((s) => [
        `${s.utilisateur.prenom} ${s.utilisateur.nom}`,
        s.utilisateur.role.nom,
        s.ipAddress ?? "",
        new Date(s.expireLe).toLocaleString(i18n.language),
      ])
    );
  };

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.securite.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={Shield}
          titre={t("admin.securite.titre")}
          description={t("admin.securite.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.securite.fil") },
          ]}
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gris-bordure bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
              {t("admin.securite.sessionsTitre")}
            </p>
            <p className="mt-1 text-2xl font-bold text-texte-principal">
              {sessions.length}
            </p>
          </div>
          <div className="rounded-xl border border-gris-bordure bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
              {t("admin.parametres.champs.sessionDuree")}
            </p>
            <p className="mt-1 text-2xl font-bold text-texte-principal">
              {paramSession?.valeur || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-gris-bordure bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
              {t("admin.parametres.champs.mdpFort")}
            </p>
            <p className="mt-1 text-sm font-semibold text-texte-principal">
              {paramMdp?.valeur === "true"
                ? t("admin.securite.politiqueActive")
                : t("admin.securite.politiqueInactive")}
            </p>
          </div>
        </div>

        {message ? (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {message}
          </p>
        ) : null}
        {erreur ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-gris-bordure bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bleu-medical-clair text-bleu-medical">
                <Timer className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-texte-principal">
                  {t("admin.parametres.politique")}
                </h3>
                <p className="text-xs text-texte-secondaire">
                  {t("admin.parametres.politiqueAide")}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {paramSession ? (
                <div>
                  <label className={CLASSE_LABEL_RECEPTION} htmlFor="sec-session">
                    {t("admin.parametres.champs.sessionDuree")}
                  </label>
                  <input
                    id="sec-session"
                    type="number"
                    min={1}
                    className={CLASSE_CHAMP_RECEPTION}
                    value={paramSession.valeur}
                    onChange={(e) => maj(paramSession.cle, e.target.value)}
                  />
                  <p className="mt-1 text-[11px] text-texte-secondaire">
                    {t("admin.parametres.champs.sessionDureeAide")}
                  </p>
                </div>
              ) : null}
              {paramMdp ? (
                <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-gris-bordure px-4 py-3">
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-texte-principal">
                      <KeyRound className="h-4 w-4 text-bleu-medical" />
                      {t("admin.parametres.champs.mdpFort")}
                    </span>
                    <span className="mt-0.5 block text-xs text-texte-secondaire">
                      {t("admin.parametres.champs.mdpFortAide")}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-bleu-medical"
                    checked={paramMdp.valeur === "true"}
                    onChange={(e) =>
                      maj(paramMdp.cle, e.target.checked ? "true" : "false")
                    }
                  />
                </label>
              ) : null}
              <Bouton
                type="button"
                onClick={() => void enregistrer()}
                disabled={enCours || items.length === 0}
              >
                {enCours ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t("admin.parametres.enregistrer")}
              </Bouton>
            </div>
          </section>

          <section className="rounded-xl border border-gris-bordure bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-texte-principal">
              {t("admin.securite.sessionsTitre")}
            </h3>
            <p className="mt-0.5 text-xs text-texte-secondaire">
              {t("admin.securite.sessionsDesc")}
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex h-11 min-w-[160px] flex-1 items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-3 text-sm">
                  <Search className="h-4 w-4 shrink-0 text-slate-600" />
                  <input
                    type="search"
                    value={rechercheRapide}
                    onChange={(e) => setRechercheRapide(e.target.value)}
                    placeholder={t("admin.securite.recherche")}
                    className="min-w-0 flex-1 bg-transparent outline-none"
                  />
                  {rechercheRapide ? (
                    <button type="button" onClick={() => setRechercheRapide("")}>
                      <X className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  ) : null}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFiltresOuverts((o) => !o)}
                    className={cn(
                      "relative inline-flex h-11 w-11 items-center justify-center rounded-lg border",
                      filtresOuverts
                        ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                        : "border-gris-bordure bg-white"
                    )}
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                    <span
                      className={cn(
                        "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                        nbFiltres > 0 ? "bg-red-500" : "bg-slate-400"
                      )}
                    >
                      {nbFiltres}
                    </span>
                  </button>
                  <BoutonsOutilsListe
                    toutSelectionne={toutSelectionne}
                    onSelectionnerTout={() =>
                      setIdsCoches(
                        toutSelectionne ? [] : listeFiltree.map((s) => s.id)
                      )
                    }
                    onExporter={exporterSelection}
                    labelSelectionnerTout={t("reception.liste.selectionnerTout")}
                    labelExporter={t("reception.liste.exporterSelection")}
                  />
                </div>
              </div>
              {filtresOuverts ? (
                <div className="rounded-lg border border-gris-bordure p-3">
                  <label className={CLASSE_LABEL_RECEPTION} htmlFor="sec-role">
                    {t("admin.securite.colonneRole")}
                  </label>
                  <select
                    id="sec-role"
                    className={CLASSE_CHAMP_RECEPTION}
                    value={roleFiltre}
                    onChange={(e) => setRoleFiltre(e.target.value)}
                  >
                    <option value="">{t("admin.securite.tousRoles")}</option>
                    {roles.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.nom}
                      </option>
                    ))}
                  </select>
                  <div className="mt-3 flex justify-end gap-2">
                    <Bouton
                      type="button"
                      variante="contour"
                      taille="petit"
                      onClick={() => {
                        setRoleFiltre("");
                        setRoleApplique("");
                      }}
                    >
                      {t("reception.tableau.filtres.reinitialiser")}
                    </Bouton>
                    <Bouton
                      type="button"
                      taille="petit"
                      onClick={() => setRoleApplique(roleFiltre)}
                    >
                      {t("reception.tableau.filtres.rechercher")}
                    </Bouton>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
          {listeFiltree.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
              {t("admin.securite.sessionsVide")}
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
                      <th className="px-3 py-2">{t("admin.securite.colonneUser")}</th>
                      <th className="hidden px-3 py-2 md:table-cell">
                        {t("admin.securite.colonneRole")}
                      </th>
                      <th className="hidden px-3 py-2 lg:table-cell">IP</th>
                      <th className="px-3 py-2">{t("admin.securite.colonneExpire")}</th>
                      <th className="px-3 py-2 text-center">
                        {t("admin.securite.colonneActions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.itemsPage.map((s) => (
                      <tr key={s.id} className="border-t border-gris-bordure">
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={idsCoches.includes(s.id)}
                            onChange={() =>
                              setIdsCoches((ids) =>
                                ids.includes(s.id)
                                  ? ids.filter((id) => id !== s.id)
                                  : [...ids, s.id]
                              )
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-medium">
                            {s.utilisateur.prenom} {s.utilisateur.nom}
                          </p>
                          <p className="text-xs text-texte-secondaire">
                            {s.utilisateur.identifiant}
                          </p>
                        </td>
                        <td className="hidden px-3 py-2.5 text-sm md:table-cell">
                          {s.utilisateur.role.nom}
                        </td>
                        <td className="hidden px-3 py-2.5 font-mono text-xs lg:table-cell">
                          {s.ipAddress ?? "—"}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {new Date(s.expireLe).toLocaleString(i18n.language)}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              disabled={revoqueId === s.id}
                              onClick={() => void revoquer(s.id)}
                              className={CLASSE_BOUTON_ACTION}
                              title={t("admin.securite.revoquer")}
                            >
                              {revoqueId === s.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <LogOut className="h-4 w-4" />
                              )}
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
                parPage={SESSIONS_PAR_PAGE}
                onChange={setPage}
                labelPrec={t("reception.liste.prec")}
                labelSuiv={t("reception.liste.suiv")}
              />
            </>
          )}
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
