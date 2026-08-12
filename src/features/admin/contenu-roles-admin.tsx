"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Save, Shield } from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";

interface PermissionItem {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  module: string | null;
}

interface RoleItem {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  systeme: boolean;
  salle: { code: string; nom: string } | null;
  _count: { utilisateurs: number; permissions: number };
}

export function ContenuRolesAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [catalogue, setCatalogue] = useState<PermissionItem[]>([]);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [selectionCodes, setSelectionCodes] = useState<Set<string>>(new Set());
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetch("/api/admin/roles").then((r) => r.json()),
      fetch("/api/admin/permissions").then((r) => r.json()),
    ])
      .then(([rData, pData]) => {
        if (rData.message && !rData.roles) throw new Error(rData.message);
        if (pData.message && !pData.permissions) throw new Error(pData.message);
        setRoles(rData.roles ?? []);
        setCatalogue(pData.permissions ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("admin.roles.erreur"))
      );
  }, [t]);

  const roleSelectionne = useMemo(
    () => roles.find((r) => r.id === selectionId) ?? null,
    [roles, selectionId]
  );

  const ouvrirRole = async (role: RoleItem) => {
    setSelectionId(role.id);
    setMessage(null);
    setErreur(null);
    try {
      const res = await fetch(`/api/admin/roles/${role.id}/permissions`);
      const data = (await res.json()) as {
        permissions?: PermissionItem[];
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.roles.erreur"));
      setSelectionCodes(new Set((data.permissions ?? []).map((p) => p.id)));
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.roles.erreur"));
    }
  };

  const togglePerm = (id: string) => {
    setSelectionCodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enregistrer = async () => {
    if (!selectionId) return;
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/roles/${selectionId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds: [...selectionCodes] }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? t("admin.roles.permissionsSauvees"));
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectionId
            ? {
                ...r,
                _count: { ...r._count, permissions: selectionCodes.size },
              }
            : r
        )
      );
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const parModule = useMemo(() => {
    const map = new Map<string, PermissionItem[]>();
    for (const p of catalogue) {
      const cle = p.module ?? "GENERAL";
      if (!map.has(cle)) map.set(cle, []);
      map.get(cle)!.push(p);
    }
    return [...map.entries()];
  }, [catalogue]);

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.roles.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={Shield}
          titre={t("admin.roles.titre")}
          description={t("admin.roles.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.roles.fil") },
          ]}
        />

        {erreur ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}
        {message ? (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {message}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-[340px_1fr]">
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <table className="tableau-sigh">
              <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                <tr>
                  <th className="px-3 py-2">{t("admin.roles.colonnes.role")}</th>
                  <th className="px-3 py-2">{t("admin.roles.colonnes.type")}</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr
                    key={r.id}
                    className={`cursor-pointer border-t border-gris-bordure ${
                      selectionId === r.id ? "bg-bleu-medical-clair/40" : ""
                    }`}
                    onClick={() => void ouvrirRole(r)}
                  >
                    <td className="px-3 py-2">
                      <p className="font-medium">{r.nom}</p>
                      <p className="text-xs text-texte-secondaire">
                        {r.code} · {r._count.permissions} perm. ·{" "}
                        {r._count.utilisateurs} user(s)
                      </p>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {r.systeme
                        ? t("admin.roles.systeme")
                        : t("admin.roles.metier")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            {!roleSelectionne ? (
              <p className="text-sm text-texte-secondaire">
                {t("admin.roles.aideSelection")}
              </p>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-texte-principal">
                      {roleSelectionne.nom}
                    </h3>
                    <p className="text-xs text-texte-secondaire">
                      {roleSelectionne.code}
                      {roleSelectionne.salle
                        ? ` · ${roleSelectionne.salle.nom}`
                        : ""}
                    </p>
                    <p className="mt-1 text-sm text-texte-secondaire">
                      {roleSelectionne.description ||
                        t("admin.roles.sansDescription")}
                    </p>
                  </div>
                  <Bouton
                    type="button"
                    taille="petit"
                    disabled={enCours}
                    onClick={() => void enregistrer()}
                  >
                    {enCours ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {t("admin.common.enregistrer")}
                  </Bouton>
                </div>

                <div className="space-y-4">
                  {parModule.map(([module, perms]) => (
                    <div key={module}>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-texte-secondaire">
                        {module}
                      </p>
                      <ul className="space-y-2">
                        {perms.map((p) => (
                          <li key={p.id}>
                            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gris-bordure px-3 py-2 hover:bg-gris-tres-clair/60">
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={selectionCodes.has(p.id)}
                                onChange={() => togglePerm(p.id)}
                              />
                              <span>
                                <span className="block text-sm font-medium text-texte-principal">
                                  {p.nom}
                                </span>
                                <span className="block text-xs text-texte-secondaire">
                                  {p.code}
                                  {p.description ? ` — ${p.description}` : ""}
                                </span>
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
