"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, Save, Users } from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { EVENEMENT_ADMIN_UTILISATEURS_MODIFIES } from "@/constants/admin";
import { estRoleGereParServiceClient } from "@/constants/admin-utilisateurs";

interface RoleOption {
  id: string;
  code: string;
  nom: string;
  systeme: boolean;
  salle: { code: string; nom: string } | null;
}

interface UtilisateurItem {
  id: string;
  identifiant: string;
  email: string | null;
  prenom: string;
  nom: string;
  telephone: string | null;
  statut: "ACTIF" | "INACTIF" | "SUSPENDU";
  messagerieBloquee?: boolean;
  notesAdmin?: string | null;
  derniereConnexion: string | null;
  role: RoleOption;
}

const STATUTS = ["ACTIF", "INACTIF", "SUSPENDU"] as const;

const FORM_VIDE: {
  identifiant: string;
  email: string;
  prenom: string;
  nom: string;
  telephone: string;
  roleId: string;
  motDePasse: string;
  statut: "ACTIF" | "INACTIF" | "SUSPENDU";
  messagerieBloquee: boolean;
  notesAdmin: string;
} = {
  identifiant: "",
  email: "",
  prenom: "",
  nom: "",
  telephone: "",
  roleId: "",
  motDePasse: "",
  statut: "ACTIF",
  messagerieBloquee: false,
  notesAdmin: "",
};

export function ContenuUtilisateursAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<UtilisateurItem[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [q, setQ] = useState("");
  const [filtreRoleId, setFiltreRoleId] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...FORM_VIDE });
  const [modeCreation, setModeCreation] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch(
          `/api/admin/utilisateurs?q=${encodeURIComponent(q)}${
            filtreRoleId ? `&roleId=${encodeURIComponent(filtreRoleId)}` : ""
          }${filtreStatut ? `&statut=${encodeURIComponent(filtreStatut)}` : ""}`
        ),
        fetch("/api/admin/roles"),
      ]);
      const uData = (await uRes.json()) as {
        utilisateurs?: UtilisateurItem[];
        message?: string;
      };
      const rData = (await rRes.json()) as {
        roles?: RoleOption[];
        message?: string;
      };
      if (!uRes.ok) throw new Error(uData.message ?? t("admin.utilisateurs.erreur"));
      if (!rRes.ok) throw new Error(rData.message ?? t("admin.roles.erreur"));
      setListe(uData.utilisateurs ?? []);
      setRoles(rData.roles ?? []);
    } catch (e: unknown) {
      setErreur(
        e instanceof Error ? e.message : t("admin.utilisateurs.erreur")
      );
    } finally {
      setChargement(false);
    }
  }, [q, filtreRoleId, filtreStatut, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const ouvrirCreation = () => {
    setModeCreation(true);
    setSelectionId(null);
    setForm({
      ...FORM_VIDE,
      roleId: roles.find((r) => r.code === "RECEPTIONNISTE")?.id ?? roles[0]?.id ?? "",
    });
    setMessage(null);
    setErreur(null);
  };

  const selectionner = (u: UtilisateurItem) => {
    setModeCreation(false);
    setSelectionId(u.id);
    setForm({
      identifiant: u.identifiant,
      email: u.email ?? "",
      prenom: u.prenom,
      nom: u.nom,
      telephone: u.telephone ?? "",
      roleId: u.role.id,
      motDePasse: "",
      statut: u.statut,
      messagerieBloquee: u.messagerieBloquee ?? false,
      notesAdmin: u.notesAdmin ?? "",
    });
    setMessage(null);
    setErreur(null);
  };

  const soumettre = async () => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      if (modeCreation) {
        const res = await fetch("/api/admin/utilisateurs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = (await res.json()) as { message?: string };
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        setMessage(data.message ?? t("admin.utilisateurs.cree"));
        setModeCreation(false);
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
      window.dispatchEvent(new Event(EVENEMENT_ADMIN_UTILISATEURS_MODIFIES));
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const formulaireVisible = modeCreation || Boolean(selectionId);

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

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            className={CLASSE_CHAMP_RECEPTION}
            style={{ maxWidth: 280 }}
            placeholder={t("admin.utilisateurs.recherche")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className={CLASSE_CHAMP_RECEPTION}
            style={{ maxWidth: 200 }}
            value={filtreRoleId}
            onChange={(e) => setFiltreRoleId(e.target.value)}
          >
            <option value="">{t("admin.utilisateurs.tousRoles")}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nom}
              </option>
            ))}
          </select>
          <select
            className={CLASSE_CHAMP_RECEPTION}
            style={{ maxWidth: 160 }}
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
          >
            <option value="">{t("admin.utilisateurs.tousStatuts")}</option>
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Bouton type="button" taille="petit" onClick={ouvrirCreation}>
            <Plus className="h-4 w-4" />
            {t("admin.utilisateurs.creer")}
          </Bouton>
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
              <p className="p-6 text-sm text-texte-secondaire">
                {t("admin.common.chargement")}
              </p>
            ) : (
              <table className="tableau-sigh">
                <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                  <tr>
                    <th className="px-3 py-2">{t("admin.utilisateurs.colonnes.nom")}</th>
                    <th className="px-3 py-2">{t("admin.utilisateurs.colonnes.role")}</th>
                    <th className="px-3 py-2">{t("admin.utilisateurs.colonnes.statut")}</th>
                  </tr>
                </thead>
                <tbody>
                  {liste.map((u) => (
                    <tr
                      key={u.id}
                      className={`cursor-pointer border-t border-gris-bordure hover:bg-bleu-medical-clair/20 ${
                        selectionId === u.id ? "bg-bleu-medical-clair/30" : ""
                      }`}
                      onClick={() => selectionner(u)}
                    >
                      <td className="px-3 py-2.5">
                        <p className="font-medium">
                          {u.prenom} {u.nom}
                        </p>
                        <p className="text-xs text-texte-secondaire">
                          {u.identifiant}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p>{u.role.nom}</p>
                        <p className="text-[10px] text-texte-secondaire">
                          {u.role.salle?.nom ?? u.role.code}
                        </p>
                        {estRoleGereParServiceClient(u.role.code) && (
                          <span className="mt-1 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
                            {t("admin.utilisateurs.serviceClient")}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-full bg-gris-tres-clair px-2 py-0.5 text-xs font-medium">
                          {u.statut}
                        </span>
                        {u.messagerieBloquee && (
                          <span className="ml-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                            {t("admin.utilisateurs.messagerieBloquee")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            {!formulaireVisible ? (
              <p className="text-sm text-texte-secondaire">
                {t("admin.utilisateurs.aideSelection")}
              </p>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-texte-principal">
                  {modeCreation
                    ? t("admin.utilisateurs.formCreation")
                    : t("admin.utilisateurs.formEdition")}
                </h3>
                {modeCreation ? (
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("admin.utilisateurs.champs.identifiant")}
                    </label>
                    <input
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form.identifiant}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, identifiant: e.target.value }))
                      }
                    />
                  </div>
                ) : (
                  <p className="text-xs text-texte-secondaire">
                    {form.identifiant}
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("admin.utilisateurs.champs.prenom")}
                    </label>
                    <input
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form.prenom}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, prenom: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("admin.utilisateurs.champs.nom")}
                    </label>
                    <input
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form.nom}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nom: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("admin.utilisateurs.champs.email")}
                  </label>
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("admin.utilisateurs.champs.telephone")}
                  </label>
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.telephone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, telephone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("admin.utilisateurs.champs.role")}
                  </label>
                  <select
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.roleId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, roleId: e.target.value }))
                    }
                  >
                    {roles
                      .filter(
                        (r) =>
                          !modeCreation ||
                          (!estRoleGereParServiceClient(r.code) &&
                            r.code !== "SUPER_ADMIN")
                      )
                      .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nom}
                        {r.salle ? ` (${r.salle.nom})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("admin.utilisateurs.champs.statut")}
                  </label>
                  <select
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.statut}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        statut: e.target.value as (typeof STATUTS)[number],
                      }))
                    }
                  >
                    {STATUTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.messagerieBloquee}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, messagerieBloquee: e.target.checked }))
                    }
                  />
                  {t("admin.utilisateurs.champs.messagerieBloquee")}
                </label>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("admin.utilisateurs.champs.notesAdmin")}
                  </label>
                  <textarea
                    className={CLASSE_CHAMP_RECEPTION}
                    rows={2}
                    value={form.notesAdmin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notesAdmin: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {modeCreation
                      ? t("admin.utilisateurs.champs.motDePasse")
                      : t("admin.utilisateurs.champs.nouveauMotDePasse")}
                  </label>
                  <input
                    type="password"
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.motDePasse}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, motDePasse: e.target.value }))
                    }
                    placeholder={
                      modeCreation ? undefined : t("admin.utilisateurs.mdpOptionnel")
                    }
                  />
                </div>
                <Bouton
                  type="button"
                  onClick={() => void soumettre()}
                  disabled={enCours}
                >
                  {enCours ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t("admin.common.enregistrer")}
                </Bouton>
              </div>
            )}
          </div>
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
