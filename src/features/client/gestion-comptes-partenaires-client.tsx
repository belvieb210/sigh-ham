"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, SquarePen, X } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

type CompteMedecinExterneClient = {
  id: string;
  identifiant: string;
  email: string | null;
  prenom: string;
  nom: string;
  telephone: string | null;
  statut: string;
  medecinExterne: {
    id: string;
    specialite: string | null;
    numeroOrdre: string | null;
    telephone: string | null;
    email: string | null;
    actif: boolean;
  } | null;
};

type FormExterne = {
  id?: string;
  identifiant: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  specialite: string;
  telephone: string;
  email: string;
  numeroOrdre: string;
  statut: "ACTIF" | "INACTIF";
  afficherVitrine: boolean;
};

function formExterneVide(): FormExterne {
  return {
    identifiant: "",
    motDePasse: "",
    prenom: "",
    nom: "",
    specialite: "Médecine générale",
    telephone: "",
    email: "",
    numeroOrdre: "",
    statut: "ACTIF",
    afficherVitrine: true,
  };
}

type ModePanneau = "creation" | "edition";

function BadgeStatut({ statut }: { statut: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        statut === "ACTIF" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      )}
    >
      {statut === "ACTIF" ? "Actif" : "Inactif"}
    </span>
  );
}

function BarreRecherche({
  valeur,
  onChange,
  placeholder,
}: {
  valeur: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex h-11 w-full items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-3 text-sm text-texte-principal shadow-sm transition-colors focus-within:border-bleu-medical focus-within:ring-2 focus-within:ring-bleu-medical/25">
      <Search className="h-4 w-4 shrink-0 text-slate-600" />
      <input
        type="search"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-600"
      />
      {valeur ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          aria-label="Effacer la recherche"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </label>
  );
}

export function GestionComptesMedecinsExternesClient() {
  const [liste, setListe] = useState<CompteMedecinExterneClient[]>([]);
  const [form, setForm] = useState<FormExterne>(formExterneVide());
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [modePanneau, setModePanneau] = useState<ModePanneau>("creation");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(() => {
    setChargement(true);
    fetch("/api/client/comptes-medecins-externes")
      .then(async (res) => {
        const data = (await res.json()) as {
          comptes?: CompteMedecinExterneClient[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? "Erreur");
        setListe(data.comptes ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : "Erreur")
      )
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const maj = <K extends keyof FormExterne>(cle: K, val: FormExterne[K]) =>
    setForm((prev) => ({ ...prev, [cle]: val }));

  const listeFiltree = useMemo(() => {
    const needle = recherche.trim().toLowerCase();
    if (!needle) return liste;
    return liste.filter((item) =>
      [
        item.prenom,
        item.nom,
        item.identifiant,
        item.email ?? "",
        item.medecinExterne?.specialite ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [liste, recherche]);

  const ouvrirCreation = () => {
    setSelectionId(null);
    setModePanneau("creation");
    setForm(formExterneVide());
    setErreur(null);
  };

  const editer = (c: CompteMedecinExterneClient) => {
    setSelectionId(c.id);
    setModePanneau("edition");
    setForm({
      id: c.id,
      identifiant: c.identifiant,
      motDePasse: "",
      prenom: c.prenom,
      nom: c.nom,
      specialite: c.medecinExterne?.specialite ?? "",
      telephone: c.telephone ?? c.medecinExterne?.telephone ?? "",
      email: c.email ?? c.medecinExterne?.email ?? "",
      numeroOrdre: c.medecinExterne?.numeroOrdre ?? "",
      statut: c.statut as "ACTIF" | "INACTIF",
      afficherVitrine: true,
    });
    setErreur(null);
  };

  const enregistrer = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      const url = form.id
        ? `/api/client/comptes-medecins-externes/${form.id}`
        : "/api/client/comptes-medecins-externes";
      const res = await fetch(url, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Erreur");
      ouvrirCreation();
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Crée un compte de connexion (<strong>/sigh/medecins-externes</strong>) avec
        fiche <code>medecins_externes</code> + utilisateur rôle{" "}
        <strong>MEDECIN_EXTERNE</strong>.
      </p>

      {erreur ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erreur}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BarreRecherche
          valeur={recherche}
          onChange={setRecherche}
          placeholder="Rechercher un compte medecin externe"
        />
        <Bouton variante="primaire" taille="petit" onClick={ouvrirCreation}>
          <Plus className="h-4 w-4" />
          Nouveau compte médecin externe
        </Bouton>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gris-bordure px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-[#2d2a6e]">Comptes médecins externes</h2>
              <p className="text-xs text-texte-secondaire">
                Connexion vers la salle medecins externes et fiche medicale associee.
              </p>
            </div>
            <span className="rounded-full bg-bleu-medical/10 px-2.5 py-1 text-xs font-semibold text-bleu-medical">
              {listeFiltree.length} compte(s)
            </span>
          </div>

          {chargement ? (
            <p className="flex items-center gap-2 p-6 text-sm text-texte-secondaire">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </p>
          ) : listeFiltree.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
              Aucun compte médecin externe.
            </p>
          ) : (
            <div className="conteneur-tableau-sigh">
              <table className="tableau-sigh min-w-[620px]">
                <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                  <tr>
                    <th className="px-3 py-2">Utilisateur</th>
                    <th className="px-3 py-2">Specialite</th>
                    <th className="px-3 py-2">Connexion</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listeFiltree.map((c) => (
                    <tr
                      key={c.id}
                      className={cn(
                        "cursor-pointer border-t border-gris-bordure hover:bg-bleu-medical-clair/20",
                        selectionId === c.id && "bg-bleu-medical-clair/30"
                      )}
                      onClick={() => editer(c)}
                    >
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-texte-principal">
                          {c.prenom} {c.nom}
                        </p>
                        <p className="text-xs text-texte-secondaire">{c.email ?? c.identifiant}</p>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-texte-principal">
                        {c.medecinExterne?.specialite ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-texte-secondaire">
                        {c.identifiant}
                      </td>
                      <td className="px-3 py-2.5">
                        <BadgeStatut statut={c.statut} />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-slate-500 transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical"
                            onClick={(e) => {
                              e.stopPropagation();
                              editer(c);
                            }}
                            aria-label="Modifier"
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
          )}
        </div>

        <div className="flex max-h-[calc(100vh-8rem)] flex-col rounded-xl border border-gris-bordure bg-white shadow-sm">
          <div className="flex items-start justify-between gap-3 border-b border-gris-bordure px-4 py-3">
            <div>
              <h3 className="text-base font-bold text-bleu-medical">
                {modePanneau === "creation" ? "Nouveau medecin externe" : "Modifier le compte"}
              </h3>
              <p className="mt-0.5 text-xs text-texte-secondaire">
                Meme logique de gestion que l&apos;administration, adaptee aux comptes partenaires.
              </p>
            </div>
            <button
              type="button"
              onClick={ouvrirCreation}
              className="rounded-lg p-1 text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
              aria-label="Fermer le formulaire"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Identifiant de connexion *</label>
              <input
                className={CLASSE_CHAMP_RECEPTION}
                value={form.identifiant}
                disabled={Boolean(form.id)}
                onChange={(e) => maj("identifiant", e.target.value)}
                placeholder="email@exemple.com"
              />
            </div>
            <ChampMotDePasse
              id="mdp-externe"
              variant="reception"
              label={form.id ? "Nouveau mot de passe (optionnel)" : "Mot de passe *"}
              value={form.motDePasse}
              onChange={(e) => maj("motDePasse", e.target.value)}
              autoComplete="new-password"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Prenom *</label>
                <input className={CLASSE_CHAMP_RECEPTION} value={form.prenom} onChange={(e) => maj("prenom", e.target.value)} />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Nom *</label>
                <input className={CLASSE_CHAMP_RECEPTION} value={form.nom} onChange={(e) => maj("nom", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Specialite</label>
                <input className={CLASSE_CHAMP_RECEPTION} value={form.specialite} onChange={(e) => maj("specialite", e.target.value)} />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>N degre ordre (CNOM)</label>
                <input className={CLASSE_CHAMP_RECEPTION} value={form.numeroOrdre} onChange={(e) => maj("numeroOrdre", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Telephone</label>
                <input className={CLASSE_CHAMP_RECEPTION} value={form.telephone} onChange={(e) => maj("telephone", e.target.value)} />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>E-mail</label>
                <input type="email" className={CLASSE_CHAMP_RECEPTION} value={form.email} onChange={(e) => maj("email", e.target.value)} />
              </div>
            </div>
            {form.id ? (
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Statut</label>
                <select className={CLASSE_CHAMP_RECEPTION} value={form.statut} onChange={(e) => maj("statut", e.target.value as "ACTIF" | "INACTIF")}>
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>
            ) : null}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.afficherVitrine} onChange={(e) => maj("afficherVitrine", e.target.checked)} />
              Afficher aussi sur la page A propos
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gris-bordure px-4 py-3">
            <Bouton variante="contour" taille="moyen" onClick={ouvrirCreation} disabled={enCours}>
              Annuler
            </Bouton>
            <Bouton variante="primaire" taille="moyen" onClick={() => void enregistrer()} disabled={enCours}>
              {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Bouton>
          </div>
        </div>
      </div>
    </div>
  );
}

type FormEglise = {
  id?: string;
  identifiant: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  specialite: string;
  telephone: string;
  email: string;
  statut: "ACTIF" | "INACTIF";
  afficherVitrine: boolean;
};

function formEgliseVide(): FormEglise {
  return {
    identifiant: "",
    motDePasse: "",
    prenom: "",
    nom: "",
    specialite: "Service conventionné — Église",
    telephone: "",
    email: "",
    statut: "ACTIF",
    afficherVitrine: true,
  };
}

export function GestionComptesEgliseClient() {
  const [liste, setListe] = useState<
    { id: string; identifiant: string; prenom: string; nom: string; specialite: string | null; telephone: string | null; email: string | null; statut: string }[]
  >([]);
  const [form, setForm] = useState<FormEglise>(formEgliseVide());
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [modePanneau, setModePanneau] = useState<ModePanneau>("creation");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(() => {
    setChargement(true);
    fetch("/api/client/comptes-eglise")
      .then(async (res) => {
        const data = (await res.json()) as { comptes?: typeof liste; message?: string };
        if (!res.ok) throw new Error(data.message ?? "Erreur");
        setListe(data.comptes ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : "Erreur")
      )
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const maj = <K extends keyof FormEglise>(cle: K, val: FormEglise[K]) =>
    setForm((prev) => ({ ...prev, [cle]: val }));

  const listeFiltree = useMemo(() => {
    const needle = recherche.trim().toLowerCase();
    if (!needle) return liste;
    return liste.filter((item) =>
      [item.prenom, item.nom, item.identifiant, item.email ?? "", item.specialite ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [liste, recherche]);

  const ouvrirCreation = () => {
    setSelectionId(null);
    setModePanneau("creation");
    setForm(formEgliseVide());
    setErreur(null);
  };

  const editer = (c: (typeof liste)[number]) => {
    setSelectionId(c.id);
    setModePanneau("edition");
    setForm({
      id: c.id,
      identifiant: c.identifiant,
      motDePasse: "",
      prenom: c.prenom,
      nom: c.nom,
      specialite: c.specialite ?? "Service conventionné — Église",
      telephone: c.telephone ?? "",
      email: c.email ?? "",
      statut: c.statut as "ACTIF" | "INACTIF",
      afficherVitrine: true,
    });
    setErreur(null);
  };

  const enregistrer = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      const url = form.id ? `/api/client/comptes-eglise/${form.id}` : "/api/client/comptes-eglise";
      const res = await fetch(url, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Erreur");
      ouvrirCreation();
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-900">
        Crée un compte conventionné / service Église (<strong>/sigh/eglise</strong>)
        avec utilisateur rôle <strong>AGENT_EGLISE</strong>.
      </p>

      {erreur ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erreur}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BarreRecherche
          valeur={recherche}
          onChange={setRecherche}
          placeholder="Rechercher un compte conventionne"
        />
        <Bouton variante="primaire" taille="petit" onClick={ouvrirCreation}>
          <Plus className="h-4 w-4" />
          Nouveau compte conventionné
        </Bouton>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gris-bordure px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-[#2d2a6e]">Comptes conventionnés (Église)</h2>
              <p className="text-xs text-texte-secondaire">
                Connexion vers la salle Église avec libellé public maîtrisé.
              </p>
            </div>
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">
              {listeFiltree.length} compte(s)
            </span>
          </div>

          {chargement ? (
            <p className="flex items-center gap-2 p-6 text-sm text-texte-secondaire">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </p>
          ) : listeFiltree.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
              Aucun compte conventionné.
            </p>
          ) : (
            <div className="conteneur-tableau-sigh">
              <table className="tableau-sigh min-w-[620px]">
                <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                  <tr>
                    <th className="px-3 py-2">Utilisateur</th>
                    <th className="px-3 py-2">Libellé public</th>
                    <th className="px-3 py-2">Connexion</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listeFiltree.map((c) => (
                    <tr
                      key={c.id}
                      className={cn(
                        "cursor-pointer border-t border-gris-bordure hover:bg-bleu-medical-clair/20",
                        selectionId === c.id && "bg-bleu-medical-clair/30"
                      )}
                      onClick={() => editer(c)}
                    >
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-texte-principal">
                          {c.prenom} {c.nom}
                        </p>
                        <p className="text-xs text-texte-secondaire">{c.email ?? c.identifiant}</p>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-texte-principal">
                        {c.specialite ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-texte-secondaire">
                        {c.identifiant}
                      </td>
                      <td className="px-3 py-2.5">
                        <BadgeStatut statut={c.statut} />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-slate-500 transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical"
                            onClick={(e) => {
                              e.stopPropagation();
                              editer(c);
                            }}
                            aria-label="Modifier"
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
          )}
        </div>

        <div className="flex max-h-[calc(100vh-8rem)] flex-col rounded-xl border border-gris-bordure bg-white shadow-sm">
          <div className="flex items-start justify-between gap-3 border-b border-gris-bordure px-4 py-3">
            <div>
              <h3 className="text-base font-bold text-bleu-medical">
                {modePanneau === "creation" ? "Nouveau compte conventionné" : "Modifier le compte"}
              </h3>
              <p className="mt-0.5 text-xs text-texte-secondaire">
                Meme ergonomie que l&apos;administration pour les comptes de la salle Église.
              </p>
            </div>
            <button
              type="button"
              onClick={ouvrirCreation}
              className="rounded-lg p-1 text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
              aria-label="Fermer le formulaire"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Identifiant de connexion *</label>
              <input
                className={CLASSE_CHAMP_RECEPTION}
                value={form.identifiant}
                disabled={Boolean(form.id)}
                onChange={(e) => maj("identifiant", e.target.value)}
                placeholder="email@exemple.com"
              />
            </div>
            <ChampMotDePasse
              id="mdp-eglise"
              variant="reception"
              label={form.id ? "Nouveau mot de passe (optionnel)" : "Mot de passe *"}
              value={form.motDePasse}
              onChange={(e) => maj("motDePasse", e.target.value)}
              autoComplete="new-password"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Prenom *</label>
                <input className={CLASSE_CHAMP_RECEPTION} value={form.prenom} onChange={(e) => maj("prenom", e.target.value)} />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Nom *</label>
                <input className={CLASSE_CHAMP_RECEPTION} value={form.nom} onChange={(e) => maj("nom", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Telephone</label>
                <input className={CLASSE_CHAMP_RECEPTION} value={form.telephone} onChange={(e) => maj("telephone", e.target.value)} />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>E-mail</label>
                <input type="email" className={CLASSE_CHAMP_RECEPTION} value={form.email} onChange={(e) => maj("email", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Spécialité / libellé public</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={form.specialite} onChange={(e) => maj("specialite", e.target.value)} />
            </div>
            {form.id ? (
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Statut</label>
                <select className={CLASSE_CHAMP_RECEPTION} value={form.statut} onChange={(e) => maj("statut", e.target.value as "ACTIF" | "INACTIF")}>
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>
            ) : null}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.afficherVitrine} onChange={(e) => maj("afficherVitrine", e.target.checked)} />
              Afficher aussi sur la page A propos
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gris-bordure px-4 py-3">
            <Bouton variante="contour" taille="moyen" onClick={ouvrirCreation} disabled={enCours}>
              Annuler
            </Bouton>
            <Bouton variante="primaire" taille="moyen" onClick={() => void enregistrer()} disabled={enCours}>
              {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Bouton>
          </div>
        </div>
      </div>
    </div>
  );
}
