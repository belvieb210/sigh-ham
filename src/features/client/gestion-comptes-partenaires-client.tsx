"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, UserCog } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";

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

export function GestionComptesMedecinsExternesClient() {
  const [liste, setListe] = useState<CompteMedecinExterneClient[]>([]);
  const [form, setForm] = useState<FormExterne>(formExterneVide());
  const [modeForm, setModeForm] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(() => {
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
      );
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const maj = <K extends keyof FormExterne>(cle: K, val: FormExterne[K]) =>
    setForm((prev) => ({ ...prev, [cle]: val }));

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
      setModeForm(false);
      setForm(formExterneVide());
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

      <div className="flex justify-end">
        <Bouton variante="primaire" taille="petit" onClick={() => { setForm(formExterneVide()); setModeForm(true); }}>
          <Plus className="h-4 w-4" />
          Nouveau compte médecin externe
        </Bouton>
      </div>

      {modeForm ? (
        <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#2d2a6e]">
            <UserCog className="h-4 w-4" />
            {form.id ? "Modifier le compte" : "Nouveau médecin externe"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Identifiant de connexion *</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={form.identifiant} disabled={Boolean(form.id)} onChange={(e) => maj("identifiant", e.target.value)} placeholder="email@exemple.com" />
            </div>
            <div>
              <ChampMotDePasse
                id="mdp-externe"
                variant="reception"
                label={form.id ? "Nouveau mot de passe (optionnel)" : "Mot de passe *"}
                value={form.motDePasse}
                onChange={(e) => maj("motDePasse", e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Prénom *</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={form.prenom} onChange={(e) => maj("prenom", e.target.value)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Nom *</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={form.nom} onChange={(e) => maj("nom", e.target.value)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Spécialité</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={form.specialite} onChange={(e) => maj("specialite", e.target.value)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>N° ordre (CNOM)</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={form.numeroOrdre} onChange={(e) => maj("numeroOrdre", e.target.value)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Téléphone</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={form.telephone} onChange={(e) => maj("telephone", e.target.value)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>E-mail</label>
              <input type="email" className={CLASSE_CHAMP_RECEPTION} value={form.email} onChange={(e) => maj("email", e.target.value)} />
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
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.afficherVitrine} onChange={(e) => maj("afficherVitrine", e.target.checked)} />
                Afficher aussi sur la page À propos (vitrine)
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Bouton variante="primaire" taille="petit" onClick={() => void enregistrer()} disabled={enCours}>
              {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Bouton>
            <Bouton variante="contour" taille="petit" onClick={() => setModeForm(false)}>Annuler</Bouton>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3">
        {liste.map((c) => (
          <div key={c.id} className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <p className="font-semibold">{c.prenom} {c.nom}</p>
            <p className="text-sm text-texte-secondaire">{c.medecinExterne?.specialite ?? "—"}</p>
            <p className="mt-1 text-xs text-texte-secondaire">Connexion : {c.identifiant} · {c.statut}</p>
            <Bouton variante="contour" taille="petit" className="mt-2" onClick={() => {
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
              setModeForm(true);
            }}>
              Modifier
            </Bouton>
          </div>
        ))}
        {liste.length === 0 ? (
          <p className="text-sm text-texte-secondaire">Aucun compte médecin externe.</p>
        ) : null}
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
  const [modeForm, setModeForm] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(() => {
    fetch("/api/client/comptes-eglise")
      .then(async (res) => {
        const data = (await res.json()) as { comptes?: typeof liste; message?: string };
        if (!res.ok) throw new Error(data.message ?? "Erreur");
        setListe(data.comptes ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : "Erreur")
      );
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const maj = <K extends keyof FormEglise>(cle: K, val: FormEglise[K]) =>
    setForm((prev) => ({ ...prev, [cle]: val }));

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
      setModeForm(false);
      setForm(formEgliseVide());
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

      <div className="flex justify-end">
        <Bouton variante="primaire" taille="petit" onClick={() => { setForm(formEgliseVide()); setModeForm(true); }}>
          <Plus className="h-4 w-4" />
          Nouveau compte conventionné
        </Bouton>
      </div>

      {modeForm ? (
        <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#2d2a6e]">
            <UserCog className="h-4 w-4" />
            {form.id ? "Modifier le compte" : "Nouveau conventionné (Église)"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Identifiant de connexion *</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={form.identifiant} disabled={Boolean(form.id)} onChange={(e) => maj("identifiant", e.target.value)} placeholder="email@exemple.com" />
            </div>
            <div>
              <ChampMotDePasse
                id="mdp-eglise"
                variant="reception"
                label={form.id ? "Nouveau mot de passe (optionnel)" : "Mot de passe *"}
                value={form.motDePasse}
                onChange={(e) => maj("motDePasse", e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Prénom *</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={form.prenom} onChange={(e) => maj("prenom", e.target.value)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Nom *</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={form.nom} onChange={(e) => maj("nom", e.target.value)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Téléphone</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={form.telephone} onChange={(e) => maj("telephone", e.target.value)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>Spécialité / libellé public</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={form.specialite} onChange={(e) => maj("specialite", e.target.value)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>E-mail</label>
              <input type="email" className={CLASSE_CHAMP_RECEPTION} value={form.email} onChange={(e) => maj("email", e.target.value)} />
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
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.afficherVitrine} onChange={(e) => maj("afficherVitrine", e.target.checked)} />
                Afficher aussi sur la page À propos (vitrine)
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Bouton variante="primaire" taille="petit" onClick={() => void enregistrer()} disabled={enCours}>
              {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Bouton>
            <Bouton variante="contour" taille="petit" onClick={() => setModeForm(false)}>Annuler</Bouton>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3">
        {liste.map((c) => (
          <div key={c.id} className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <p className="font-semibold">{c.prenom} {c.nom}</p>
            <p className="text-sm text-texte-secondaire">{c.specialite ?? "—"}</p>
            <p className="mt-1 text-xs text-texte-secondaire">Connexion : {c.identifiant} · {c.statut}</p>
            <Bouton variante="contour" taille="petit" className="mt-2" onClick={() => {
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
              setModeForm(true);
            }}>
              Modifier
            </Bouton>
          </div>
        ))}
        {liste.length === 0 ? (
          <p className="text-sm text-texte-secondaire">Aucun compte conventionné.</p>
        ) : null}
      </div>
    </div>
  );
}
