"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, ScrollText } from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { CLASSE_CHAMP_RECEPTION } from "@/constants/reception";

interface EntreeAudit {
  id: string;
  type: string;
  module: string | null;
  entite: string;
  action: string;
  createdAt: string;
  utilisateur: {
    prenom: string;
    nom: string;
    identifiant: string;
  } | null;
}

const TYPES = [
  "",
  "CONNEXION",
  "DECONNEXION",
  "CREATION",
  "MODIFICATION",
  "SUPPRESSION",
  "EXPORT",
  "CONSULTATION",
  "TRANSFERT",
];

export function ContenuAuditAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [entrees, setEntrees] = useState<EntreeAudit[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (type) params.set("type", type);
      params.set("limite", "100");
      fetch(`/api/admin/audit?${params}`)
        .then(async (res) => {
          const data = (await res.json()) as {
            entrees?: EntreeAudit[];
            total?: number;
            message?: string;
          };
          if (!res.ok) throw new Error(data.message ?? t("admin.audit.erreur"));
          setEntrees(data.entrees ?? []);
          setTotal(data.total ?? 0);
        })
        .catch((e: unknown) =>
          setErreur(e instanceof Error ? e.message : t("admin.audit.erreur"))
        );
    }, 250);
    return () => window.clearTimeout(timer);
  }, [q, type, t]);

  const exportUrl = (() => {
    const params = new URLSearchParams({ format: "csv", limite: "500" });
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    return `/api/admin/audit?${params}`;
  })();

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.audit.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={ScrollText}
          titre={t("admin.audit.titre")}
          description={t("admin.audit.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.audit.fil") },
          ]}
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            className={`${CLASSE_CHAMP_RECEPTION} max-w-md`}
            placeholder={t("admin.audit.recherche")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className={`${CLASSE_CHAMP_RECEPTION} max-w-[180px]`}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">{t("admin.audit.tousTypes")}</option>
            {TYPES.filter(Boolean).map((ty) => (
              <option key={ty} value={ty}>
                {ty}
              </option>
            ))}
          </select>
          <a
            href={exportUrl}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure px-3 py-2 text-xs font-medium hover:bg-gris-tres-clair"
          >
            <Download className="h-4 w-4" />
            {t("admin.audit.exporter")} ({total})
          </a>
        </div>
        {erreur ? (
          <p className="mt-3 text-sm text-red-700">{erreur}</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <table className="tableau-sigh">
              <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                <tr>
                  <th className="px-3 py-2">{t("admin.audit.colonnes.date")}</th>
                  <th className="px-3 py-2">{t("admin.audit.colonnes.acteur")}</th>
                  <th className="px-3 py-2">{t("admin.audit.colonnes.type")}</th>
                  <th className="px-3 py-2">{t("admin.audit.colonnes.action")}</th>
                </tr>
              </thead>
              <tbody>
                {entrees.map((e) => (
                  <tr key={e.id} className="border-t border-gris-bordure">
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      {e.utilisateur
                        ? `${e.utilisateur.prenom} ${e.utilisateur.nom}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-gris-tres-clair px-1.5 py-0.5 text-xs">
                        {e.type}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <p>{e.action}</p>
                      <p className="text-[10px] text-texte-secondaire">
                        {e.entite}
                        {e.module ? ` · ${e.module}` : ""}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MiseEnPageAdmin>
  );
}
