"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Flag,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { useDemanderConfirmation } from "@/components/ui/fournisseur-modale-confirmation";
import {
  BoutonsOutilsListe,
  telechargerCsv,
} from "@/components/ui/boutons-outils-liste";
import {
  compterFiltresModerationAdmin,
  FILTRES_MODERATION_ADMIN_VIDES,
  FormulaireFiltresModerationAdmin,
  type FiltresModerationAdmin,
} from "@/features/admin/formulaire-filtres-moderation-admin";
import { nomAffichageGouvernance } from "@/lib/admin/nom-affichage-gouvernance";
import type {
  CategorieFeedModeration,
  ElementFeedModeration,
  StatutElementModeration,
  StatsModeration,
} from "@/lib/admin/moderation-messagerie-types";
import { cn } from "@/lib/utils";

type OngletModeration = CategorieFeedModeration;

function afficherNomComplet(nomComplet: string) {
  const idx = nomComplet.lastIndexOf(" ");
  if (idx <= 0) return nomComplet;
  return nomAffichageGouvernance(
    nomComplet.slice(0, idx),
    nomComplet.slice(idx + 1)
  );
}

function extraireIdElement(item: ElementFeedModeration) {
  if (item.kind === "message") return item.messageId!;
  if (item.kind === "fichier") return item.id.replace(/^file-/, "");
  if (item.kind === "suspension") return item.auteurId!;
  return item.conversationId!;
}

function couleurAvatar(kind: ElementFeedModeration["kind"]) {
  switch (kind) {
    case "message":
      return "bg-sky-100 text-sky-700";
    case "conversation":
      return "bg-emerald-100 text-emerald-700";
    case "groupe":
      return "bg-violet-100 text-violet-700";
    case "fichier":
      return "bg-amber-100 text-amber-800";
    case "suspension":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function badgeType(kind: ElementFeedModeration["kind"], t: (k: string) => string) {
  const styles: Record<ElementFeedModeration["kind"], string> = {
    message: "bg-sky-50 text-sky-700 ring-sky-200",
    conversation: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    groupe: "bg-violet-50 text-violet-700 ring-violet-200",
    fichier: "bg-amber-50 text-amber-800 ring-amber-200",
    suspension: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  const labels: Record<ElementFeedModeration["kind"], string> = {
    message: t("admin.moderation.typeMessage"),
    conversation: t("admin.moderation.typeConversation"),
    groupe: t("admin.moderation.typeGroupe"),
    fichier: t("admin.moderation.typeFichier"),
    suspension: t("admin.moderation.typeSuspension"),
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        styles[kind]
      )}
    >
      {labels[kind]}
    </span>
  );
}

function badgeStatut(statut: StatutElementModeration, t: (k: string) => string) {
  const map: Record<StatutElementModeration, string> = {
    nouveau: "bg-orange-50 text-orange-700 ring-orange-200",
    en_cours: "bg-blue-50 text-blue-700 ring-blue-200",
    resolu: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bloque: "bg-red-50 text-red-700 ring-red-200",
    supprime: "bg-slate-100 text-slate-600 ring-slate-200",
    suspendu: "bg-purple-50 text-purple-700 ring-purple-200",
  };
  const labels: Record<StatutElementModeration, string> = {
    nouveau: t("admin.moderation.statutNouveau"),
    en_cours: t("admin.moderation.statutEnCours"),
    resolu: t("admin.moderation.statutResolu"),
    bloque: t("admin.moderation.statutBloque"),
    supprime: t("admin.moderation.statutSupprime"),
    suspendu: t("admin.moderation.statutSuspendu"),
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        map[statut]
      )}
    >
      {labels[statut]}
    </span>
  );
}

function badgeRaison(raison: string | null) {
  if (!raison) {
    return (
      <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
        Aucun
      </span>
    );
  }
  const lower = raison.toLowerCase();
  const danger =
    lower.includes("harc") ||
    lower.includes("inappropri") ||
    lower.includes("spam");
  return (
    <span
      className={cn(
        "inline-flex max-w-[140px] truncate rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        danger
          ? "bg-red-50 text-red-700 ring-red-200"
          : "bg-amber-50 text-amber-800 ring-amber-200"
      )}
      title={raison}
    >
      {raison}
    </span>
  );
}

export function ContenuModerationAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const demanderConfirmation = useDemanderConfirmation();
  const [stats, setStats] = useState<StatsModeration | null>(null);
  const [onglet, setOnglet] = useState<OngletModeration>("tous");
  const [elements, setElements] = useState<ElementFeedModeration[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [recherche, setRecherche] = useState("");
  const [rechercheAppliquee, setRechercheAppliquee] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState<FiltresModerationAdmin>(
    FILTRES_MODERATION_ADMIN_VIDES
  );
  const [filtresAppliques, setFiltresAppliques] = useState<FiltresModerationAdmin>(
    FILTRES_MODERATION_ADMIN_VIDES
  );
  const [idsSelectionnes, setIdsSelectionnes] = useState<Set<string>>(new Set());
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [selection, setSelection] = useState<ElementFeedModeration | null>(null);
  const [texteAvert, setTexteAvert] = useState("");
  const [notesModeration, setNotesModeration] = useState("");
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const categorieEffective =
        (filtresAppliques.categorie || onglet) as CategorieFeedModeration;
      const params = new URLSearchParams({
        vue: "feed",
        categorie: categorieEffective,
        page: String(page),
        pageSize: String(pageSize),
      });
      if (rechercheAppliquee) params.set("q", rechercheAppliquee);
      if (filtresAppliques.statut) params.set("statut", filtresAppliques.statut);

      const [sRes, fRes] = await Promise.all([
        fetch("/api/admin/moderation?vue=stats"),
        fetch(`/api/admin/moderation?${params.toString()}`),
      ]);
      const sData = (await sRes.json()) as { stats?: StatsModeration };
      const fData = (await fRes.json()) as {
        elements?: ElementFeedModeration[];
        total?: number;
        message?: string;
      };

      if (sRes.ok) setStats(sData.stats ?? null);
      if (!fRes.ok) throw new Error(fData.message ?? t("admin.common.erreur"));

      setElements(fData.elements ?? []);
      setTotal(fData.total ?? 0);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setChargement(false);
    }
  }, [filtresAppliques, onglet, page, pageSize, rechercheAppliquee, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    setPage(1);
    setSelection(null);
    setIdsSelectionnes(new Set());
  }, [onglet, rechercheAppliquee, filtresAppliques, pageSize]);

  const action = async (payload: Record<string, string | undefined>) => {
    setEnCours(true);
    setMessage(null);
    setErreur(null);
    try {
      const corps = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v != null && v !== "")
      ) as Record<string, string>;
      const res = await fetch("/api/admin/moderation/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? "OK");
      setSelection(null);
      setTexteAvert("");
      setNotesModeration("");
      await charger();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("admin.common.erreur");
      setErreur(msg);
      throw e instanceof Error ? e : new Error(msg);
    } finally {
      setEnCours(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const debut = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const fin = Math.min(page * pageSize, total);

  const onglets: { id: OngletModeration; label: string; count?: number }[] = [
    {
      id: "tous",
      label: t("admin.moderation.ongletTous"),
      count:
        (stats?.messagesSignales ?? 0) +
        (stats?.conversationsBloquees ?? 0) +
        (stats?.fichiersSignales ?? 0) +
        (stats?.utilisateursMessagerieBloquee ?? 0),
    },
    {
      id: "messages",
      label: t("admin.moderation.ongletMessagesSignales"),
      count: stats?.messagesSignales,
    },
    {
      id: "conversations",
      label: t("admin.moderation.ongletConversations"),
      count: stats?.conversationsBloquees,
    },
    {
      id: "groupes",
      label: t("admin.moderation.ongletGroupes"),
      count: stats?.groupesSupprimes,
    },
    {
      id: "fichiers",
      label: t("admin.moderation.ongletFichiers"),
      count: stats?.fichiersSignales,
    },
    {
      id: "suspensions",
      label: t("admin.moderation.ongletSuspensions"),
      count: stats?.utilisateursMessagerieBloquee,
    },
  ];

  const kpis = stats
    ? [
        {
          label: t("admin.moderation.kpiSignales"),
          val: stats.messagesSignales,
          icone: Flag,
          couleur: "text-red-500 bg-red-50",
        },
        {
          label: t("admin.moderation.kpiBloques"),
          val: stats.conversationsBloquees,
          icone: Ban,
          couleur: "text-rose-500 bg-rose-50",
        },
        {
          label: t("admin.moderation.kpiUtilisateurs"),
          val: stats.utilisateursMessagerieBloquee,
          icone: UserMinus,
          couleur: "text-violet-500 bg-violet-50",
        },
        {
          label: t("admin.moderation.kpiFichiers"),
          val: stats.fichiersSignales,
          icone: FileText,
          couleur: "text-blue-500 bg-blue-50",
        },
      ]
    : [];

  const appliquerRecherche = () => setRechercheAppliquee(recherche.trim());
  const nbFiltres = compterFiltresModerationAdmin(filtresAppliques);
  const toutSelectionne =
    elements.length > 0 && elements.every((e) => idsSelectionnes.has(e.id));

  const basculerSelectionTout = () => {
    if (toutSelectionne) {
      setIdsSelectionnes(new Set());
      return;
    }
    setIdsSelectionnes(new Set(elements.map((e) => e.id)));
  };

  const exporterSelection = () => {
    const lignes = elements
      .filter((e) => idsSelectionnes.has(e.id) || idsSelectionnes.size === 0)
      .map((e) => [
        e.kind,
        afficherNomComplet(e.titre),
        afficherNomComplet(e.auteur),
        e.contenu,
        e.raison ?? "",
        e.statut,
        e.dateIso,
      ]);
    telechargerCsv(
      `moderation-${new Date().toISOString().slice(0, 10)}.csv`,
      ["type", "element", "auteur", "contenu", "raison", "statut", "date"],
      lignes
    );
  };

  const confirmerSuppression = (item: ElementFeedModeration) => {
    demanderConfirmation({
      titre: t("admin.moderation.titreConfirmationSuppression"),
      description: t("admin.moderation.confirmerSuppression"),
      libelleConfirmer: t("admin.moderation.supprimerPourTous"),
      variante: "danger",
      onConfirmer: async () => {
        await action(
          item.kind === "message"
            ? {
                action: "supprimer-message-pour-tous",
                messageId: item.messageId!,
              }
            : {
                action: "supprimer-fichier",
                fichierId: extraireIdElement(item),
              }
        );
      },
    });
  };

  const actionsRapides = useMemo(
    () => ({
      voir: (item: ElementFeedModeration) => setSelection(item),
    }),
    []
  );

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.moderation.titre")}
      sousTitre={t("admin.moderation.description")}
    >
      <div className="mx-auto max-w-[1600px] space-y-5 pb-10">
        <EnTetePageReception
          icone={ShieldAlert}
          titre={t("admin.moderation.titre")}
          description={t("admin.moderation.description")}
          fil={[
            { label: t("admin.layout.titre"), href: "/sigh/admin" },
            { label: t("admin.moderation.titre") },
          ]}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void charger()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gris-bordure bg-white px-4 text-sm font-medium shadow-sm hover:bg-gris-tres-clair"
          >
            <RefreshCw className={cn("h-4 w-4", chargement && "animate-spin")} />
            {t("admin.moderation.actualiser")}
          </button>
        </div>

        {kpis.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="rounded-xl border border-gris-bordure bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                      {k.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-texte-principal">{k.val}</p>
                  </div>
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      k.couleur
                    )}
                  >
                    <k.icone className="h-5 w-5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
          <div className="flex flex-wrap gap-1 border-b border-gris-bordure bg-gris-tres-clair/40 px-2 pt-2">
            {onglets.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setOnglet(o.id)}
                className={cn(
                  "rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  onglet === o.id
                    ? "border border-b-white border-gris-bordure bg-white text-bleu-medical shadow-sm"
                    : "text-texte-secondaire hover:text-texte-principal"
                )}
              >
                {o.label}
                {o.count != null && o.count > 0 ? (
                  <span className="ml-1.5 rounded-full bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                    {o.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="space-y-3 border-b border-gris-bordure px-4 py-3">
            <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-3 text-sm shadow-sm focus-within:border-bleu-medical focus-within:ring-2 focus-within:ring-bleu-medical/25">
                <Search className="h-4 w-4 shrink-0 text-slate-600" />
                <input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && appliquerRecherche()}
                  placeholder={t("admin.moderation.recherchePlaceholder")}
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-600"
                />
                {recherche ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRecherche("");
                      setRechercheAppliquee("");
                    }}
                    className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    aria-label={t("admin.examens.effacerRecherche")}
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
              <FormulaireFiltresModerationAdmin
                valeurs={brouillonFiltres}
                onChange={setBrouillonFiltres}
                onRechercher={() => {
                  setFiltresAppliques(brouillonFiltres);
                  if (brouillonFiltres.categorie) {
                    setOnglet(brouillonFiltres.categorie);
                  }
                  setPage(1);
                }}
                onReinitialiser={() => {
                  setBrouillonFiltres(FILTRES_MODERATION_ADMIN_VIDES);
                  setFiltresAppliques(FILTRES_MODERATION_ADMIN_VIDES);
                  setPage(1);
                }}
              />
            ) : null}
          </div>

          {message && (
            <p className="mx-4 mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
              {message}
            </p>
          )}
          {erreur && (
            <p className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {erreur}
            </p>
          )}

          <div className="grid xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 overflow-x-auto">
              {chargement ? (
                <div className="flex items-center justify-center gap-2 py-20 text-sm text-texte-secondaire">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("admin.common.chargement")}
                </div>
              ) : elements.length === 0 ? (
                <div className="px-6 py-20 text-center text-sm text-texte-secondaire">
                  {t("admin.moderation.vide")}
                </div>
              ) : (
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gris-bordure bg-gris-tres-clair/50 text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
                      <th className="px-4 py-3">{t("admin.moderation.colElement")}</th>
                      <th className="px-3 py-3">{t("admin.moderation.colType")}</th>
                      <th className="px-3 py-3">{t("admin.moderation.colAuteur")}</th>
                      <th className="px-3 py-3">{t("admin.moderation.colContenu")}</th>
                      <th className="px-3 py-3">{t("admin.moderation.colRaison")}</th>
                      <th className="px-3 py-3">{t("admin.moderation.colStatut")}</th>
                      <th className="px-4 py-3 text-right">{t("admin.moderation.colActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gris-bordure">
                    {elements.map((item) => (
                      <tr
                        key={item.id}
                        className={cn(
                          "transition-colors hover:bg-gris-tres-clair/40",
                          selection?.id === item.id && "bg-bleu-medical-clair/20"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              className="accent-bleu-medical"
                              checked={idsSelectionnes.has(item.id)}
                              onChange={(e) => {
                                setIdsSelectionnes((prev) => {
                                  const next = new Set(prev);
                                  if (e.target.checked) next.add(item.id);
                                  else next.delete(item.id);
                                  return next;
                                });
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                couleurAvatar(item.kind)
                              )}
                            >
                              {item.initiales}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-texte-principal">
                                {afficherNomComplet(item.titre)}
                              </p>
                              {item.auteurIdentifiant ? (
                                <p className="truncate text-[11px] text-texte-secondaire">
                                  @{item.auteurIdentifiant}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">{badgeType(item.kind, t)}</td>
                        <td className="px-3 py-3 text-texte-secondaire">
                          {afficherNomComplet(item.auteur)}
                        </td>
                        <td className="max-w-[200px] truncate px-3 py-3 text-texte-principal">
                          {item.contenu}
                        </td>
                        <td className="px-3 py-3">{badgeRaison(item.raison)}</td>
                        <td className="px-3 py-3">
                          <div className="space-y-1">
                            {badgeStatut(item.statut, t)}
                            <p className="text-[10px] text-texte-secondaire">
                              {new Date(item.dateIso).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              title={t("admin.moderation.voirDetail")}
                              onClick={() => actionsRapides.voir(item)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gris-bordure text-texte-secondaire hover:bg-white hover:text-bleu-medical"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {item.kind === "message" && item.signale && (
                              <button
                                type="button"
                                disabled={enCours}
                                title={t("admin.moderation.approuverMessage")}
                                onClick={() =>
                                  void action({
                                    action: "approuver-message",
                                    messageId: item.messageId!,
                                  })
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            {item.kind === "message" && item.supprime && (
                              <button
                                type="button"
                                disabled={enCours}
                                title={t("admin.moderation.restaurerMessage")}
                                onClick={() =>
                                  void action({
                                    action: "restaurer-message",
                                    messageId: item.messageId!,
                                  })
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 text-sky-700 hover:bg-sky-50"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            )}
                            {(item.kind === "message" || item.kind === "fichier") &&
                              !item.supprime && (
                              <button
                                type="button"
                                disabled={enCours}
                                title={t("admin.moderation.supprimerPourTous")}
                                onClick={() => confirmerSuppression(item)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {!chargement && total > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gris-bordure px-4 py-3 text-sm text-texte-secondaire">
                  <p>
                    {t("admin.moderation.paginationAffichage", {
                      debut,
                      fin,
                      total,
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="h-9 rounded-lg border border-gris-bordure px-2 text-sm"
                    >
                      {[10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                          {n} / page
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center font-medium text-texte-principal">
                      {page}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <aside className="border-t border-gris-bordure bg-slate-50/60 p-4 xl:border-l xl:border-t-0">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-texte-principal">
                  {t("admin.moderation.detailTitre")}
                </h3>
                {selection ? (
                  <button
                    type="button"
                    onClick={() => setSelection(null)}
                    className="rounded-lg p-1 text-texte-secondaire hover:bg-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {!selection ? (
                <p className="text-sm text-texte-secondaire">
                  {t("admin.moderation.selectionnerElement")}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {badgeType(selection.kind, t)}
                    {badgeStatut(selection.statut, t)}
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-gris-bordure bg-white p-3">
                    <span
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold",
                        couleurAvatar(selection.kind)
                      )}
                    >
                      {selection.initiales}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-texte-principal">
                        {afficherNomComplet(selection.titre)}
                      </p>
                      {selection.auteurIdentifiant ? (
                        <p className="text-xs text-texte-secondaire">
                          @{selection.auteurIdentifiant}
                        </p>
                      ) : null}
                      <p className="mt-0.5 text-xs text-texte-secondaire">
                        {t("admin.moderation.envoyeLe", {
                          date: new Date(selection.dateIso).toLocaleString("fr-FR"),
                        })}
                      </p>
                    </div>
                  </div>

                  {selection.conversationSujet ? (
                    <p className="text-xs text-bleu-medical">
                      {t("admin.moderation.contexteConversation")}{" "}
                      <span className="font-medium">{selection.conversationSujet}</span>
                    </p>
                  ) : null}

                  {selection.estImage && selection.fichierUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selection.fichierUrl}
                      alt={selection.titre}
                      className="max-h-40 w-full rounded-xl border object-cover"
                    />
                  ) : (
                    <div className="rounded-xl border border-gris-bordure bg-white p-3 text-sm text-texte-principal">
                      {selection.contenu}
                    </div>
                  )}

                  {selection.raison ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
                      <p className="text-xs font-semibold uppercase text-amber-800">
                        {t("admin.moderation.signalement")}
                      </p>
                      <p className="mt-1 text-amber-900">{selection.raison}</p>
                    </div>
                  ) : null}

                  <div className="grid gap-2 sm:grid-cols-2">
                    {selection.kind === "message" && selection.signale && (
                      <button
                        type="button"
                        disabled={enCours}
                        onClick={() =>
                          void action({
                            action: "approuver-message",
                            messageId: selection.messageId!,
                          })
                        }
                        className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-left text-sm font-medium text-emerald-800 hover:bg-emerald-100"
                      >
                        <Check className="mb-1 h-4 w-4" />
                        {t("admin.moderation.approuverMessage")}
                      </button>
                    )}
                    {selection.kind === "fichier" && selection.signale && (
                      <button
                        type="button"
                        disabled={enCours}
                        onClick={() =>
                          void action({
                            action: "approuver-fichier",
                            fichierId: extraireIdElement(selection),
                          })
                        }
                        className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-left text-sm font-medium text-emerald-800 hover:bg-emerald-100"
                      >
                        <Check className="mb-1 h-4 w-4" />
                        {t("admin.moderation.approuverFichier")}
                      </button>
                    )}
                    {(selection.kind === "message" || selection.kind === "fichier") &&
                      !selection.supprime && (
                      <button
                        type="button"
                        disabled={enCours}
                        onClick={() => confirmerSuppression(selection)}
                        className="rounded-xl bg-red-600 px-3 py-2.5 text-left text-sm font-medium text-white hover:bg-red-700"
                      >
                        <Trash2 className="mb-1 h-4 w-4" />
                        {t("admin.moderation.supprimerPourTous")}
                      </button>
                    )}
                    {selection.kind === "message" && selection.supprime && (
                      <button
                        type="button"
                        disabled={enCours}
                        onClick={() =>
                          void action({
                            action: "restaurer-message",
                            messageId: selection.messageId!,
                          })
                        }
                        className="rounded-xl border border-sky-300 bg-sky-50 px-3 py-2.5 text-left text-sm font-medium text-sky-800 hover:bg-sky-100"
                      >
                        <RotateCcw className="mb-1 h-4 w-4" />
                        {t("admin.moderation.restaurerMessage")}
                      </button>
                    )}
                  </div>

                  {selection.auteurId && selection.kind !== "suspension" ? (
                    <>
                      <textarea
                        value={texteAvert}
                        onChange={(e) => setTexteAvert(e.target.value)}
                        rows={3}
                        placeholder={t("admin.moderation.placeholderAvertissement")}
                        className="w-full rounded-xl border border-gris-bordure bg-white px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        disabled={enCours || !texteAvert.trim()}
                        onClick={() =>
                          void action({
                            action: "avertissement",
                            destinataireId: selection.auteurId!,
                            messageId: selection.messageId ?? "",
                            conversationId: selection.conversationId ?? "",
                            contenu: texteAvert,
                          })
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        {t("admin.moderation.avertirUtilisateur")}
                      </button>
                    </>
                  ) : null}

                  {selection.kind === "message" && !selection.bloque && (
                    <button
                      type="button"
                      disabled={enCours}
                      onClick={() =>
                        void action({
                          action: "bloquer-message",
                          messageId: selection.messageId!,
                          raison: selection.raison ?? "Contenu inapproprié",
                        })
                      }
                      className="w-full rounded-xl border border-gris-bordure bg-white px-3 py-2.5 text-sm font-medium hover:bg-gris-tres-clair"
                    >
                      {t("admin.moderation.bloquerMessage")}
                    </button>
                  )}

                  {(selection.kind === "conversation" || selection.kind === "groupe") && (
                    <button
                      type="button"
                      disabled={enCours}
                      onClick={() =>
                        void action(
                          selection.bloque
                            ? {
                                action: "debloquer-conversation",
                                conversationId: selection.conversationId!,
                              }
                            : {
                                action: "bloquer-conversation",
                                conversationId: selection.conversationId!,
                                raison: "Modération admin",
                              }
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      <Ban className="h-4 w-4" />
                      {selection.bloque
                        ? t("admin.moderation.reactiverConversation")
                        : t("admin.moderation.bloquerConversation")}
                    </button>
                  )}

                  {selection.kind === "groupe" && (
                    <button
                      type="button"
                      disabled={enCours}
                      onClick={() =>
                        void action(
                          selection.supprime
                            ? {
                                action: "restaurer-groupe",
                                conversationId: selection.conversationId!,
                              }
                            : {
                                action: "supprimer-groupe",
                                conversationId: selection.conversationId!,
                              }
                        )
                      }
                      className="w-full rounded-xl border border-gris-bordure bg-white px-3 py-2.5 text-sm font-medium hover:bg-gris-tres-clair"
                    >
                      {selection.supprime
                        ? t("admin.moderation.restaurerGroupe")
                        : t("admin.moderation.supprimerGroupe")}
                    </button>
                  )}

                  {selection.auteurId && (
                    <button
                      type="button"
                      disabled={enCours}
                      onClick={() =>
                        void action(
                          selection.kind === "suspension"
                            ? {
                                action: "debloquer-messagerie-utilisateur",
                                utilisateurId: selection.auteurId!,
                              }
                            : {
                                action: "bloquer-messagerie-utilisateur",
                                utilisateurId: selection.auteurId!,
                                notes: notesModeration || undefined,
                              }
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2.5 text-sm font-medium text-purple-800 hover:bg-purple-100"
                    >
                      <Users className="h-4 w-4" />
                      {selection.kind === "suspension"
                        ? t("admin.moderation.retablirMessagerie")
                        : t("admin.moderation.bloquerMessagerieUser")}
                    </button>
                  )}

                  <textarea
                    value={notesModeration}
                    onChange={(e) => setNotesModeration(e.target.value)}
                    rows={2}
                    placeholder={t("admin.moderation.notesOptionnelles")}
                    className="w-full rounded-xl border border-gris-bordure bg-white px-3 py-2 text-sm"
                  />
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
