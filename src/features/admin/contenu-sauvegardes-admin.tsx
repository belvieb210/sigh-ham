"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DatabaseBackup, Download, Loader2 } from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";

interface SauvegardeItem {
  nom: string;
  taille: number;
  creeLe: string;
}

export function ContenuSauvegardesAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<SauvegardeItem[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const estSuper = true; // UI shows button; API enforces SUPER_ADMIN

  const charger = useCallback(() => {
    fetch("/api/admin/sauvegardes")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        setListe(data.sauvegardes ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("admin.common.erreur"))
      );
  }, [t]);

  useEffect(() => {
    charger();
  }, [charger]);

  const lancer = async () => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/sauvegardes", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? t("admin.sauvegardes.succes"));
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.sauvegardes.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[900px]">
        <EnTetePageReception
          icone={DatabaseBackup}
          titre={t("admin.sauvegardes.titre")}
          description={t("admin.sauvegardes.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.sauvegardes.fil") },
          ]}
        />

        <div className="mt-4 space-y-3 rounded-xl border border-gris-bordure bg-white p-5 shadow-sm text-sm">
          <p>{t("admin.sauvegardes.intro")}</p>
          {estSuper ? (
            <Bouton type="button" disabled={enCours} onClick={() => void lancer()}>
              {enCours ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <DatabaseBackup className="h-4 w-4" />
              )}
              {t("admin.sauvegardes.lancer")}
            </Bouton>
          ) : null}
          {message ? (
            <p className="text-green-800">{message}</p>
          ) : null}
          {erreur ? <p className="text-red-700">{erreur}</p> : null}

          <div className="mt-4 overflow-hidden rounded-lg border border-gris-bordure">
            <table className="tableau-sigh">
              <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                <tr>
                  <th className="px-3 py-2">{t("admin.sauvegardes.fichier")}</th>
                  <th className="px-3 py-2">{t("admin.sauvegardes.taille")}</th>
                  <th className="px-3 py-2">{t("admin.sauvegardes.date")}</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {liste.map((s) => (
                  <tr key={s.nom} className="border-t border-gris-bordure">
                    <td className="px-3 py-2 font-mono text-xs">{s.nom}</td>
                    <td className="px-3 py-2 text-xs">
                      {(s.taille / 1024).toFixed(1)} Ko
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {new Date(s.creeLe).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <a
                        href={`/api/admin/sauvegardes?fichier=${encodeURIComponent(s.nom)}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-bleu-medical"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t("admin.sauvegardes.telecharger")}
                      </a>
                    </td>
                  </tr>
                ))}
                {liste.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-texte-secondaire">
                      {t("admin.sauvegardes.vide")}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-texte-secondaire">
            {t("admin.sauvegardes.noteCli")}{" "}
            <code className="rounded bg-gris-tres-clair px-1">
              npm run db:export
            </code>
          </p>
          <p className="text-xs text-texte-secondaire">
            {t("admin.sauvegardes.note")}
          </p>
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
