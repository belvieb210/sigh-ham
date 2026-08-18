import "server-only";
import type { ParametreTypeExamenInput } from "@/lib/admin/catalogues";

export function lireParametresBody(brut: unknown): ParametreTypeExamenInput[] {
  if (!Array.isArray(brut)) return [];
  return brut.map((p) => {
    const row = (p ?? {}) as Record<string, unknown>;
    return {
      id: row.id != null && String(row.id).trim() ? String(row.id) : null,
      nom: String(row.nom ?? ""),
      unite: row.unite != null ? String(row.unite) : null,
      rangeUsuelle: row.rangeUsuelle != null ? String(row.rangeUsuelle) : null,
      obligatoire: row.obligatoire != null ? Boolean(row.obligatoire) : true,
    };
  });
}
