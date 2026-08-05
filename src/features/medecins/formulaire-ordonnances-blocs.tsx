"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Plus, Search, Trash2, X } from "lucide-react";
import {
  CLASSE_CHAMP_RECEPTION,
  CLASSE_LABEL_RECEPTION,
} from "@/constants/reception";
import type { MedicamentMedecins, TypeExamenMedecins } from "@/lib/medecins/types";
import { cn } from "@/lib/utils";

const labelCls = CLASSE_LABEL_RECEPTION;
const inputSousLigne =
  "w-full border-0 border-b border-dotted border-gris-bordure bg-transparent px-1 py-1 text-sm text-texte-principal outline-none focus:border-bleu-medical";
const areaCls = `${CLASSE_CHAMP_RECEPTION} min-h-[4.5rem] resize-y`;

export type LigneMedicamentDraft = {
  key: string;
  medicamentId: string;
  nom: string;
  dosage: string;
  frequence: string;
  duree: string;
  quantite: string;
  prixUnitaire: number;
  code: string;
};

export type DetailsImagerie = {
  categories: string[];
  autres: string[];
  typeExamen: string;
  but: string;
  conduiteATenir: string;
};

export const IMAGERIE_CATEGORIES = [
  "Abdominale",
  "Pelvienne",
  "Obstétricale",
  "Cardiaque",
  "Thyroïdienne",
  "Mammaire",
  "Musculo-squelettique",
  "Vasculaire",
  "Radiologie",
  "Scanner",
  "Ophtalmologie",
  "IRM",
  "ECG",
] as const;

export function nouvelleLigneMed(): LigneMedicamentDraft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    medicamentId: "",
    nom: "",
    dosage: "",
    frequence: "",
    duree: "",
    quantite: "1",
    prixUnitaire: 0,
    code: "",
  };
}

function formaterPrixUsd(prix: number): string {
  return `$ ${prix.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formaterPrixFc(prix: number): string {
  return `${prix.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} Fc`;
}

/** Recherche / sélection examens (style caisse-réception) */
export function SelectionExamensOrdonnances({
  selection,
  onChange,
  desactive,
}: {
  selection: TypeExamenMedecins[];
  onChange: (examens: TypeExamenMedecins[]) => void;
  desactive?: boolean;
}) {
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<TypeExamenMedecins[]>([]);
  const [chargement, setChargement] = useState(false);
  const [listeOuverte, setListeOuverte] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const ids = useMemo(() => new Set(selection.map((e) => e.id)), [selection]);
  const total = useMemo(
    () => selection.reduce((t, e) => t + e.prix, 0),
    [selection]
  );

  const charger = useCallback(async (terme: string) => {
    setChargement(true);
    try {
      const params = new URLSearchParams({ q: terme.trim(), limite: "12" });
      const res = await fetch(`/api/medecins/examens?${params}`);
      const data = (await res.json()) as { examens?: TypeExamenMedecins[] };
      setResultats(data.examens ?? []);
    } catch {
      setResultats([]);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void charger(recherche), 280);
    return () => window.clearTimeout(id);
  }, [recherche, charger]);

  useEffect(() => {
    const fermer = (e: MouseEvent) => {
      if (!conteneurRef.current?.contains(e.target as Node)) setListeOuverte(false);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, []);

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-texte-principal">Examens recommandés</h3>
      <p className="text-xs text-texte-secondaire">
        Recherchez et prescrivez les examens de laboratoire (optionnel).
      </p>
      <div ref={conteneurRef} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
        <input
          type="search"
          disabled={desactive}
          value={recherche}
          onChange={(e) => {
            setRecherche(e.target.value);
            setListeOuverte(true);
          }}
          onFocus={() => setListeOuverte(true)}
          placeholder="Rechercher un examen (code ou nom)…"
          className={CLASSE_CHAMP_RECEPTION + " pl-9"}
        />
        {listeOuverte && !desactive ? (
          <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gris-bordure bg-white shadow-lg">
            {chargement ? (
              <li className="flex items-center gap-2 px-3 py-2 text-sm text-texte-secondaire">
                <Loader2 className="h-4 w-4 animate-spin" /> Recherche…
              </li>
            ) : resultats.length === 0 ? (
              <li className="px-3 py-2 text-sm text-texte-secondaire">
                Aucun examen trouvé.
              </li>
            ) : (
              resultats.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    disabled={ids.has(e.id)}
                    onClick={() => {
                      if (ids.has(e.id)) return;
                      onChange([...selection, e]);
                      setListeOuverte(false);
                      setRecherche("");
                    }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-bleu-medical-clair/40 disabled:opacity-40"
                  >
                    <span>
                      <span className="font-semibold text-bleu-medical">{e.code}</span>{" "}
                      — {e.libelle}
                      <span className="ml-1 text-xs text-texte-secondaire">
                        ({e.categorie})
                      </span>
                    </span>
                    <span className="shrink-0 font-medium">{formaterPrixUsd(e.prix)}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-texte-principal">
            Examens sélectionnés
          </p>
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-bleu-medical px-1.5 text-xs font-bold text-white">
            {selection.length}
          </span>
        </div>
        {selection.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gris-bordure px-3 py-4 text-center text-xs text-texte-secondaire">
            Aucun examen sélectionné.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gris-bordure">
            <table className="w-full text-left text-sm">
              <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Nom</th>
                  <th className="hidden px-3 py-2 sm:table-cell">Catégorie</th>
                  <th className="px-3 py-2">Prix</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {selection.map((e) => (
                  <tr key={e.id} className="border-t border-gris-bordure">
                    <td className="px-3 py-2 font-semibold text-bleu-medical">
                      {e.code}
                    </td>
                    <td className="px-3 py-2">{e.libelle}</td>
                    <td className="hidden px-3 py-2 sm:table-cell">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                        {e.categorie}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium">{formaterPrixUsd(e.prix)}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        disabled={desactive}
                        onClick={() =>
                          onChange(selection.filter((x) => x.id !== e.id))
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Retirer
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-gris-bordure bg-gris-tres-clair/50">
                  <td colSpan={3} className="px-3 py-2 text-right text-sm font-medium">
                    Montant total estimé
                  </td>
                  <td className="px-3 py-2 font-bold" colSpan={2}>
                    {formaterPrixUsd(total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/** Lignes médicaments + recherche autocomplete */
export function LignesMedicamentsOrdonnances({
  lignes,
  onChange,
  catalogue,
  desactive,
}: {
  lignes: LigneMedicamentDraft[];
  onChange: (lignes: LigneMedicamentDraft[]) => void;
  catalogue: MedicamentMedecins[];
  desactive?: boolean;
}) {
  const [rechercheOuverte, setRechercheOuverte] = useState<string | null>(null);
  const [terme, setTerme] = useState("");
  const conteneurRef = useRef<HTMLDivElement>(null);

  const filtres = useMemo(() => {
    const q = terme.trim().toLowerCase();
    if (!q) return catalogue.slice(0, 40);
    return catalogue
      .filter((m) =>
        [m.nom, m.code, m.dosage ?? "", m.forme ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 40);
  }, [catalogue, terme]);

  useEffect(() => {
    const fermer = (e: MouseEvent) => {
      if (!conteneurRef.current?.contains(e.target as Node)) {
        setRechercheOuverte(null);
      }
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, []);

  const maj = (key: string, patch: Partial<LigneMedicamentDraft>) => {
    onChange(lignes.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const choisir = (key: string, m: MedicamentMedecins) => {
    maj(key, {
      medicamentId: m.id,
      nom: m.nom,
      dosage: m.dosage ?? "",
      code: m.code,
      prixUnitaire: m.prixUnitaire,
    });
    setRechercheOuverte(null);
    setTerme("");
  };

  return (
    <div className="space-y-3" ref={conteneurRef}>
      <h3 className="text-base font-bold text-texte-principal">Médicaments recommandés</h3>
      <div className="hidden grid-cols-[auto_1.4fr_0.8fr_0.8fr_0.7fr_0.5fr_auto] gap-2 text-xs font-medium text-texte-secondaire sm:grid">
        <span>Recherche</span>
        <span>Médicament (nom)</span>
        <span>Dosage</span>
        <span>Fréquence</span>
        <span>Durée</span>
        <span>Qté</span>
        <span> </span>
      </div>
      <ul className="space-y-3">
        {lignes.map((l) => (
          <li
            key={l.key}
            className="relative grid gap-2 rounded-lg border border-gris-bordure/60 p-2 sm:grid-cols-[auto_1.4fr_0.8fr_0.8fr_0.7fr_0.5fr_auto] sm:items-end sm:border-0 sm:p-0"
          >
            <div className="relative">
              <button
                type="button"
                disabled={desactive}
                onClick={() => {
                  setRechercheOuverte(l.key);
                  setTerme("");
                }}
                className="inline-flex items-center gap-1 rounded-md border border-gris-bordure bg-bleu-medical-clair px-2 py-1.5 text-xs font-medium text-bleu-medical"
              >
                <Search className="h-3.5 w-3.5" />
                Recherche
              </button>
              {rechercheOuverte === l.key && !desactive ? (
                <div className="absolute left-0 z-30 mt-1 w-[min(22rem,90vw)] rounded-lg border border-gris-bordure bg-white p-2 shadow-xl">
                  <div className="relative mb-2">
                    <input
                      autoFocus
                      value={terme}
                      onChange={(e) => setTerme(e.target.value)}
                      placeholder="Nom ou code…"
                      className="w-full rounded border-2 border-texte-principal px-2 py-1.5 text-sm outline-none"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1"
                      onClick={() => setRechercheOuverte(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <ul className="max-h-48 overflow-y-auto text-sm">
                    {filtres.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => choisir(l.key, m)}
                          className="w-full px-2 py-1.5 text-left hover:bg-bleu-medical-clair/40"
                        >
                          <span className="font-semibold uppercase">{m.nom}</span>
                          {m.dosage ? ` ${m.dosage}` : ""}
                          {m.forme ? ` /${m.forme}` : ""}
                          <span className="text-texte-secondaire"> — {m.code}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <input
              className={inputSousLigne}
              placeholder="Médicament (nom)"
              disabled={desactive}
              value={l.nom}
              onChange={(e) => maj(l.key, { nom: e.target.value })}
            />
            <input
              className={inputSousLigne}
              placeholder="Dosage"
              disabled={desactive}
              value={l.dosage}
              onChange={(e) => maj(l.key, { dosage: e.target.value })}
            />
            <input
              className={inputSousLigne}
              placeholder="Fréquence"
              disabled={desactive}
              value={l.frequence}
              onChange={(e) => maj(l.key, { frequence: e.target.value })}
            />
            <input
              className={inputSousLigne}
              placeholder="Durée"
              disabled={desactive}
              value={l.duree}
              onChange={(e) => maj(l.key, { duree: e.target.value })}
            />
            <input
              className={inputSousLigne}
              placeholder="Qté"
              inputMode="numeric"
              disabled={desactive}
              value={l.quantite}
              onChange={(e) => maj(l.key, { quantite: e.target.value })}
            />
            <button
              type="button"
              disabled={desactive || lignes.length <= 1}
              onClick={() => onChange(lignes.filter((x) => x.key !== l.key))}
              className="rounded-md bg-bleu-medical-clair px-2 py-1 text-xs font-medium text-bleu-medical disabled:opacity-40"
            >
              Suppr
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={desactive}
        onClick={() => onChange([...lignes, nouvelleLigneMed()])}
        className="inline-flex items-center gap-1 rounded-lg bg-bleu-medical-clair px-3 py-1.5 text-sm font-medium text-bleu-medical"
      >
        <Plus className="h-4 w-4" />
        Ajouter médicament
      </button>
    </div>
  );
}

export function SectionImagerieOrdonnances({
  value,
  onChange,
  desactive,
}: {
  value: DetailsImagerie;
  onChange: (v: DetailsImagerie) => void;
  desactive?: boolean;
}) {
  const toggle = (cat: string) => {
    const has = value.categories.includes(cat);
    onChange({
      ...value,
      categories: has
        ? value.categories.filter((c) => c !== cat)
        : [...value.categories, cat],
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold uppercase tracking-wide text-texte-principal">
        Imagerie
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {IMAGERIE_CATEGORIES.map((cat) => (
          <label
            key={cat}
            className="flex flex-col items-start gap-1 text-sm text-texte-secondaire"
          >
            <span>{cat}</span>
            <input
              type="checkbox"
              disabled={desactive}
              checked={value.categories.includes(cat)}
              onChange={() => toggle(cat)}
              className="h-4 w-4"
            />
          </label>
        ))}
      </div>

      <div>
        <p className={labelCls}>Autres :</p>
        <ul className="space-y-2">
          {value.autres.map((a, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                className={cn(inputSousLigne, "flex-1")}
                placeholder="Autres précisions"
                disabled={desactive}
                value={a}
                onChange={(e) => {
                  const autres = [...value.autres];
                  autres[i] = e.target.value;
                  onChange({ ...value, autres });
                }}
              />
              <button
                type="button"
                disabled={desactive}
                onClick={() =>
                  onChange({
                    ...value,
                    autres: value.autres.filter((_, j) => j !== i),
                  })
                }
                className="text-xs font-medium text-texte-secondaire"
              >
                Suppr
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={desactive}
          onClick={() => onChange({ ...value, autres: [...value.autres, ""] })}
          className="mt-2 rounded-lg bg-bleu-medical-clair px-3 py-1.5 text-sm font-medium text-bleu-medical"
        >
          Ajouter un champ autres
        </button>
      </div>

      <div>
        <label className={labelCls}>Type de l&apos;examen :</label>
        <textarea
          disabled={desactive}
          className={areaCls}
          placeholder="Écrire le type d'examen (ex: Échographie abdominale, Scanner thoracique)"
          value={value.typeExamen}
          onChange={(e) => onChange({ ...value, typeExamen: e.target.value })}
        />
      </div>
      <div>
        <label className={labelCls}>But de l&apos;imagerie :</label>
        <textarea
          disabled={desactive}
          className={areaCls}
          placeholder="Précisez le but/raison de l'imagerie"
          value={value.but}
          onChange={(e) => onChange({ ...value, but: e.target.value })}
        />
      </div>
      <div>
        <label className={labelCls}>Conduite à tenir :</label>
        <textarea
          disabled={desactive}
          className={`${areaCls} min-h-[5rem]`}
          value={value.conduiteATenir}
          onChange={(e) =>
            onChange({ ...value, conduiteATenir: e.target.value })
          }
        />
      </div>
    </div>
  );
}
