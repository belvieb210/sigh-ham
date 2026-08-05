import { NextRequest, NextResponse } from "next/server";
import type { CodeSalle, TypeAudit } from "@/generated/prisma/client";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { assertPermissionAdmin } from "@/lib/admin/permissions";
import { journalVersCsv, listerJournalAudit } from "@/lib/admin/journal";
import { enregistrerAudit } from "@/lib/admin/audit";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    await assertPermissionAdmin(session.utilisateur.id, "admin.audit.read");
    const sp = request.nextUrl.searchParams;
    const depuisParam = sp.get("depuis");
    const jusquaParam = sp.get("jusqua");
    const format = sp.get("format");
    const result = await listerJournalAudit({
      q: sp.get("q") ?? undefined,
      type: (sp.get("type") as TypeAudit | null) ?? undefined,
      module: (sp.get("module") as CodeSalle | null) ?? undefined,
      utilisateurId: sp.get("utilisateurId") ?? undefined,
      depuis: depuisParam ? new Date(depuisParam) : undefined,
      jusqua: jusquaParam ? new Date(jusquaParam) : undefined,
      limite: sp.get("limite") ? parseInt(sp.get("limite")!, 10) : 80,
      offset: sp.get("offset") ? parseInt(sp.get("offset")!, 10) : 0,
    });

    if (format === "csv") {
      await assertPermissionAdmin(session.utilisateur.id, "admin.audit.export");
      await enregistrerAudit({
        utilisateurId: session.utilisateur.id,
        type: "EXPORT",
        entite: "JournalAudit",
        action: `Export CSV audit (${result.entrees.length} lignes)`,
      });
      return new NextResponse(journalVersCsv(result.entrees), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="audit.csv"',
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/admin/audit]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Impossible de charger le journal.",
      },
      { status: 400 }
    );
  }
}
