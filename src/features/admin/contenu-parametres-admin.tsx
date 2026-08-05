"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Save, Settings } from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";

interface ParametreItem {
  cle: string;
  valeur: string;
  categorie: string;
  description: string | null;
}

export function ContenuParametresAdmin({
  utilisateur,
  categorie = "branding",
}: {
  utilisateur: UtilisateurAdmin;
  categorie?: "branding" | "securite";
}) {
  const { t } = useTranslation();
  const [items, setItems] = useState<ParametreItem[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const titre =
    categorie === "securite"
      ? t("admin.securite.titre")
      : t("admin.parametres.titre");
  const description =
    categorie === "securite"
      ? t("admin.securite.description")
      : t("admin.parametres.description");

  const charger = useCallback(() => {
    fetch(`/api/admin/parametres?categorie=${categorie}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          parametres?: ParametreItem[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        setItems(data.parametres ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("admin.common.erreur"))
      );
  }, [categorie, t]);

  useEffect(() => {
    charger();
  }, [charger]);

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

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={titre}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[800px]">
        <EnTetePageReception
          icone={Settings}
          titre={titre}
          description={description}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: titre },
          ]}
        />

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

        <div className="mt-4 space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          {items.length === 0 ? (
            <p className="text-sm text-texte-secondaire">
              {t("admin.common.chargement")}
            </p>
          ) : (
            items.map((p, idx) => (
              <div key={p.cle}>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {p.description || p.cle}
                </label>
                <p className="mb-1 text-[10px] text-texte-secondaire">{p.cle}</p>
                {p.valeur.length > 80 ? (
                  <textarea
                    rows={3}
                    className={CLASSE_CHAMP_RECEPTION}
                    value={p.valeur}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...p, valeur: e.target.value };
                      setItems(next);
                    }}
                  />
                ) : (
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={p.valeur}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...p, valeur: e.target.value };
                      setItems(next);
                    }}
                  />
                )}
              </div>
            ))
          )}
          <Bouton type="button" onClick={() => void enregistrer()} disabled={enCours}>
            {enCours ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("admin.common.enregistrer")}
          </Bouton>
        </div>

        {categorie === "securite" ? <SectionSessionsActives /> : null}
      </div>
    </MiseEnPageAdmin>
  );
}

function SectionSessionsActives() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<
    {
      id: string;
      utilisateurId: string;
      ipAddress: string | null;
      createdAt: string;
      expireLe: string;
      utilisateur: {
        identifiant: string;
        prenom: string;
        nom: string;
        role: { code: string; nom: string };
      };
    }[]
  >([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  const charger = () => {
    fetch("/api/admin/sessions")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        setSessions(data.sessions ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("admin.common.erreur"))
      );
  };

  useEffect(() => {
    charger();
  }, []);

  const revoquer = async (sessionId: string) => {
    setEnCours(sessionId);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(null);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-texte-principal">
        {t("admin.securite.sessionsTitre")}
      </h3>
      <p className="mt-1 text-xs text-texte-secondaire">
        {t("admin.securite.sessionsDesc")}
      </p>
      {erreur ? <p className="mt-2 text-sm text-red-700">{erreur}</p> : null}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-texte-secondaire">
            <tr>
              <th className="py-2">{t("admin.securite.colonneUser")}</th>
              <th className="py-2">IP</th>
              <th className="py-2">{t("admin.securite.colonneExpire")}</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-t border-gris-bordure">
                <td className="py-2">
                  {s.utilisateur.prenom} {s.utilisateur.nom}
                  <span className="block text-xs text-texte-secondaire">
                    {s.utilisateur.identifiant} · {s.utilisateur.role.code}
                  </span>
                </td>
                <td className="py-2 text-xs">{s.ipAddress || "—"}</td>
                <td className="py-2 text-xs">
                  {new Date(s.expireLe).toLocaleString()}
                </td>
                <td className="py-2 text-right">
                  <Bouton
                    type="button"
                    variante="danger"
                    taille="petit"
                    disabled={enCours === s.id}
                    onClick={() => void revoquer(s.id)}
                  >
                    {t("admin.securite.revoquer")}
                  </Bouton>
                </td>
              </tr>
            ))}
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-texte-secondaire">
                  {t("admin.securite.sessionsVide")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
