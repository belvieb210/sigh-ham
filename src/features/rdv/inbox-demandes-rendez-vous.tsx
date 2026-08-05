"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Loader2,
  Mail,
  Phone,
  Search,
  User,
} from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { cn } from "@/lib/utils";

export type DemandeRdvUi = {
  id: string;
  reference: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string | null;
  service: string;
  typePrestation: string | null;
  creneau: string | null;
  motif: string | null;
  dateNaissance: string | null;
  premiereVisite: boolean | null;
  dateSouhaitee: string;
  statut: string;
  notes: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type CompteursRdv = {
  nouvelles: number;
  confirmees: number;
  aujourdhui: number;
};

const STATUTS = ["DEMANDE", "CONFIRME", "ANNULE", "TERMINE", "ABSENT"] as const;

const COULEUR_STATUT: Record<string, string> = {
  DEMANDE: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRME: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ANNULE: "bg-red-100 text-red-800 border-red-200",
  TERMINE: "bg-slate-100 text-slate-700 border-slate-200",
  ABSENT: "bg-orange-100 text-orange-800 border-orange-200",
};

function formaterDateHeure(iso: string, locale = "fr-FR") {
  try {
    return new Date(iso).toLocaleString(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

interface PropsInboxRdv {
  apiBase: string;
  modeSauvegarde?: "patch-id" | "post-action";
  libelles: {
    recherche: string;
    tousStatuts: string;
    vide: string;
    charger: string;
    erreur: string;
    notes: string;
    enregistrer: string;
    statut: string;
    nouvelle: string;
    aujourdhui: string;
    premiereVisite: string;
    oui: string;
    non: string;
    source: string;
    reference: string;
    motif: string;
    type: string;
    identite: string;
    contact: string;
    planning: string;
    libelleStatut: (s: string) => string;
  };
  /** Création manuelle (médecins) */
  formulaireCreation?: React.ReactNode;
  onLoaded?: (demandes: DemandeRdvUi[], compteurs?: CompteursRdv) => void;
}

export function InboxDemandesRendezVous({
  apiBase,
  modeSauvegarde = "patch-id",
  libelles,
  formulaireCreation,
  onLoaded,
}: PropsInboxRdv) {
  const [demandes, setDemandes] = useState<DemandeRdvUi[]>([]);
  const [compteurs, setCompteurs] = useState<CompteursRdv | null>(null);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [filtreStatut, setFiltreStatut] = useState<string>("");
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [statutDraft, setStatutDraft] = useState("DEMANDE");

  useEffect(() => {
    const id = window.setTimeout(() => setQDebounced(q.trim()), 300);
    return () => window.clearTimeout(id);
  }, [q]);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      const params = new URLSearchParams();
      if (filtreStatut) params.set("statut", filtreStatut);
      if (qDebounced) params.set("q", qDebounced);
      const res = await fetch(
        `${apiBase}${params.toString() ? `?${params}` : ""}`
      );
      const data = (await res.json()) as {
        demandes?: DemandeRdvUi[];
        rendezVous?: DemandeRdvUi[];
        compteurs?: CompteursRdv;
        message?: string;
        erreur?: string;
      };
      if (!res.ok) {
        throw new Error(data.message ?? data.erreur ?? libelles.erreur);
      }
      const liste = data.demandes ?? data.rendezVous ?? [];
      setDemandes(liste);
      if (data.compteurs) setCompteurs(data.compteurs);
      onLoaded?.(liste, data.compteurs);
      if (liste.length && !selectionId) {
        setSelectionId(liste[0].id);
      }
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : libelles.erreur);
    } finally {
      setChargement(false);
    }
  }, [apiBase, filtreStatut, qDebounced, libelles.erreur, onLoaded, selectionId]);

  useEffect(() => {
    setChargement(true);
    void charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, filtreStatut, qDebounced]);

  const selection = useMemo(
    () => demandes.find((d) => d.id === selectionId) ?? null,
    [demandes, selectionId]
  );

  useEffect(() => {
    if (!selection) return;
    setNotesDraft(selection.notes ?? "");
    setStatutDraft(selection.statut);
  }, [selection]);

  const sauvegarder = async () => {
    if (!selection) return;
    setEnCours(true);
    setErreur(null);
    try {
      if (modeSauvegarde === "post-action") {
        const res = await fetch(apiBase, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "statut",
            id: selection.id,
            statut: statutDraft,
            notes: notesDraft,
          }),
        });
        const data = (await res.json()) as {
          message?: string;
          erreur?: string;
        };
        if (!res.ok) {
          throw new Error(data.message ?? data.erreur ?? libelles.erreur);
        }
      } else {
        const res = await fetch(`${apiBase}/${selection.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statut: statutDraft, notes: notesDraft }),
        });
        const data = (await res.json()) as {
          message?: string;
          erreur?: string;
        };
        if (!res.ok) {
          throw new Error(data.message ?? data.erreur ?? libelles.erreur);
        }
      }
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : libelles.erreur);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="space-y-4">
      {compteurs ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: libelles.libelleStatut("DEMANDE"), valeur: compteurs.nouvelles },
            {
              label: libelles.libelleStatut("CONFIRME"),
              valeur: compteurs.confirmees,
            },
            { label: libelles.aujourdhui, valeur: compteurs.aujourdhui },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-texte-secondaire">
                {k.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-texte-principal">
                {k.valeur}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {formulaireCreation}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={libelles.recherche}
            className="w-full rounded-xl border border-gris-bordure bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-bleu-medical focus:ring-2 focus:ring-bleu-medical/20"
          />
        </div>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="rounded-xl border border-gris-bordure bg-white px-3 py-2.5 text-sm"
        >
          <option value="">{libelles.tousStatuts}</option>
          {STATUTS.map((s) => (
            <option key={s} value={s}>
              {libelles.libelleStatut(s)}
            </option>
          ))}
        </select>
      </div>

      {erreur ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erreur}
        </p>
      ) : null}

      {chargement ? (
        <div className="flex h-40 items-center justify-center text-texte-secondaire">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {libelles.charger}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="max-h-[70vh] space-y-2 overflow-y-auto rounded-xl border border-gris-bordure bg-white p-2 shadow-sm">
            {demandes.length === 0 ? (
              <p className="p-6 text-center text-sm text-texte-secondaire">
                {libelles.vide}
              </p>
            ) : (
              demandes.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectionId(d.id)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-3 text-left transition-colors",
                    selectionId === d.id
                      ? "border-bleu-medical bg-bleu-medical-clair/40"
                      : "border-transparent hover:bg-gris-tres-clair"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-texte-principal">
                        {d.prenom} {d.nom}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-texte-secondaire">
                        {d.reference} · {d.service}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                        COULEUR_STATUT[d.statut] ?? COULEUR_STATUT.DEMANDE
                      )}
                    >
                      {libelles.libelleStatut(d.statut)}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-texte-secondaire">
                    <Calendar className="h-3.5 w-3.5" />
                    {formaterDateHeure(d.dateSouhaitee)}
                    {d.creneau ? ` · ${d.creneau}` : null}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="rounded-xl border border-gris-bordure bg-white p-5 shadow-sm">
            {!selection ? (
              <p className="text-sm text-texte-secondaire">{libelles.vide}</p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-bleu-medical">
                      {libelles.reference}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-texte-principal">
                      {selection.prenom} {selection.nom}
                    </h3>
                    <p className="mt-1 font-mono text-sm text-texte-secondaire">
                      {selection.reference}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-bold uppercase",
                      COULEUR_STATUT[selection.statut]
                    )}
                  >
                    {libelles.libelleStatut(selection.statut)}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <section className="rounded-lg bg-gris-tres-clair/80 p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-texte-secondaire">
                      <User className="h-3.5 w-3.5" />
                      {libelles.identite}
                    </p>
                    <p className="text-sm">
                      {selection.prenom} {selection.nom}
                    </p>
                    {selection.dateNaissance ? (
                      <p className="mt-1 text-xs text-texte-secondaire">
                        {selection.dateNaissance}
                      </p>
                    ) : null}
                    {selection.premiereVisite != null ? (
                      <p className="mt-1 text-xs text-texte-secondaire">
                        {libelles.premiereVisite} :{" "}
                        {selection.premiereVisite
                          ? libelles.oui
                          : libelles.non}
                      </p>
                    ) : null}
                  </section>

                  <section className="rounded-lg bg-gris-tres-clair/80 p-3">
                    <p className="mb-2 text-xs font-bold uppercase text-texte-secondaire">
                      {libelles.contact}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm">
                      <Phone className="h-3.5 w-3.5 text-bleu-medical" />
                      {selection.telephone}
                    </p>
                    {selection.email ? (
                      <p className="mt-1 flex items-center gap-1.5 text-sm">
                        <Mail className="h-3.5 w-3.5 text-bleu-medical" />
                        {selection.email}
                      </p>
                    ) : null}
                  </section>

                  <section className="rounded-lg bg-gris-tres-clair/80 p-3 sm:col-span-2">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-texte-secondaire">
                      <Clock className="h-3.5 w-3.5" />
                      {libelles.planning}
                    </p>
                    <p className="text-sm font-medium">
                      {formaterDateHeure(selection.dateSouhaitee)}
                      {selection.creneau ? ` · ${selection.creneau}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-texte-secondaire">
                      {libelles.type} :{" "}
                      {selection.typePrestation ?? selection.service}
                    </p>
                    <p className="mt-1 text-xs text-texte-secondaire">
                      {libelles.source} : {selection.source}
                    </p>
                  </section>
                </div>

                {selection.motif ? (
                  <div>
                    <p className="text-xs font-bold uppercase text-texte-secondaire">
                      {libelles.motif}
                    </p>
                    <p className="mt-1 rounded-lg border border-gris-bordure bg-white p-3 text-sm leading-relaxed">
                      {selection.motif}
                    </p>
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">
                      {libelles.statut}
                    </span>
                    <select
                      value={statutDraft}
                      onChange={(e) => setStatutDraft(e.target.value)}
                      className="w-full rounded-lg border border-gris-bordure px-3 py-2"
                    >
                      {STATUTS.map((s) => (
                        <option key={s} value={s}>
                          {libelles.libelleStatut(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="sm:col-span-2">
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium">
                        {libelles.notes}
                      </span>
                      <textarea
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-gris-bordure px-3 py-2"
                      />
                    </label>
                  </div>
                </div>

                <Bouton
                  type="button"
                  onClick={() => void sauvegarder()}
                  disabled={enCours}
                  className="w-full sm:w-auto"
                >
                  {enCours ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {libelles.enregistrer}
                </Bouton>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
