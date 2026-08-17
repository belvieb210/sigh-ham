"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Save, Search, X } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { cn } from "@/lib/utils";

export interface PermissionItemAdmin {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  module: string | null;
}

export interface RoleSelectionneAdmin {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  systeme: boolean;
  salle: { code: string; nom: string } | null;
  _count: { utilisateurs: number; permissions: number };
}

interface Props {
  role: RoleSelectionneAdmin | null;
  catalogue: PermissionItemAdmin[];
  selectionIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleModule: (ids: string[], tous: boolean) => void;
  lectureSeule: boolean;
  enCours: boolean;
  onEnregistrer: () => void;
  onAnnuler: () => void;
}

export function FormulairePermissionsRoleAdmin({
  role,
  catalogue,
  selectionIds,
  onToggle,
  onToggleModule,
  lectureSeule,
  enCours,
  onEnregistrer,
  onAnnuler,
}: Props) {
  const { t } = useTranslation();
  const [recherchePerm, setRecherchePerm] = useState("");

  const parModule = useMemo(() => {
    const q = recherchePerm.trim().toLowerCase();
    const map = new Map<string, PermissionItemAdmin[]>();
    for (const p of catalogue) {
      if (
        q &&
        !`${p.nom} ${p.code} ${p.description ?? ""}`.toLowerCase().includes(q)
      ) {
        continue;
      }
      const cle = p.module ?? "GENERAL";
      if (!map.has(cle)) map.set(cle, []);
      map.get(cle)!.push(p);
    }
    return [...map.entries()];
  }, [catalogue, recherchePerm]);

  if (!role) {
    return (
      <div className="flex max-h-[calc(100vh-8rem)] flex-col rounded-xl border border-gris-bordure bg-white shadow-sm">
        <div className="border-b border-gris-bordure px-4 py-3">
          <h3 className="text-base font-bold text-bleu-medical">
            {t("admin.roles.formTitre")}
          </h3>
          <p className="mt-0.5 text-xs text-texte-secondaire">
            {t("admin.roles.aideSelection")}
          </p>
        </div>
        <p className="px-4 py-10 text-center text-sm text-texte-secondaire">
          {t("admin.roles.aideSelection")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex max-h-[calc(100vh-8rem)] flex-col rounded-xl border border-gris-bordure bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-gris-bordure px-4 py-3">
        <div>
          <h3 className="text-base font-bold text-bleu-medical">{role.nom}</h3>
          <p className="mt-0.5 text-xs text-texte-secondaire">
            {role.code}
            {role.salle ? ` · ${role.salle.nom}` : ""}
            {` · ${selectionIds.size} ${t("admin.roles.permissions")}`}
          </p>
          <p className="mt-1 text-sm text-texte-secondaire">
            {role.description || t("admin.roles.sansDescription")}
          </p>
        </div>
        <button
          type="button"
          onClick={onAnnuler}
          aria-label={t("admin.roles.fermerFormulaire")}
          className="rounded-lg p-1 text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-gris-bordure px-4 py-3">
        <label className="flex h-10 items-center gap-2 rounded-lg border border-gris-bordure bg-white px-3 text-sm">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            type="search"
            value={recherchePerm}
            onChange={(e) => setRecherchePerm(e.target.value)}
            placeholder={t("admin.roles.recherchePermissions")}
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {parModule.length === 0 ? (
          <p className="text-sm text-texte-secondaire">
            {t("admin.roles.aucunePermission")}
          </p>
        ) : (
          parModule.map(([module, perms]) => {
            const toutes = perms.every((p) => selectionIds.has(p.id));
            return (
              <section key={module}>
                <div className="mb-2 flex items-center justify-between gap-2 border-b border-gris-bordure pb-2">
                  <h4 className="text-sm font-bold text-bleu-medical">{module}</h4>
                  {!lectureSeule ? (
                    <button
                      type="button"
                      onClick={() =>
                        onToggleModule(
                          perms.map((p) => p.id),
                          !toutes
                        )
                      }
                      className="text-[11px] font-semibold text-bleu-medical hover:underline"
                    >
                      {toutes
                        ? t("admin.roles.toutDecocher")
                        : t("admin.roles.toutCocher")}
                    </button>
                  ) : null}
                </div>
                <ul className="space-y-2">
                  {perms.map((p) => (
                    <li key={p.id}>
                      <label
                        className={cn(
                          "flex items-start gap-3 rounded-lg border border-gris-bordure px-3 py-2",
                          lectureSeule
                            ? "cursor-default bg-slate-50"
                            : "cursor-pointer hover:bg-gris-tres-clair/60"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 accent-bleu-medical"
                          checked={selectionIds.has(p.id)}
                          disabled={lectureSeule}
                          onChange={() => onToggle(p.id)}
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
              </section>
            );
          })
        )}
      </div>

      {!lectureSeule ? (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gris-bordure px-4 py-3">
          <Bouton
            type="button"
            variante="contour"
            taille="moyen"
            onClick={onAnnuler}
            disabled={enCours}
          >
            {t("admin.roles.annuler")}
          </Bouton>
          <Bouton type="button" onClick={onEnregistrer} disabled={enCours}>
            {enCours ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("admin.roles.enregistrerPermissions")}
          </Bouton>
        </div>
      ) : null}
    </div>
  );
}
