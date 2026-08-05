import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { assertPermissionAdmin } from "@/lib/admin/permissions";
import {
  obtenirStatistiquesPeriode,
  statsVersCsv,
  type PeriodeStats,
} from "@/lib/admin/stats-rapports";
import { enregistrerAudit } from "@/lib/admin/audit";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    await assertPermissionAdmin(session.utilisateur.id, "admin.stats.read");
    const periode = (request.nextUrl.searchParams.get("periode") ??
      "jour") as PeriodeStats;
    const format = request.nextUrl.searchParams.get("format");
    const data = await obtenirStatistiquesPeriode(
      ["jour", "7j", "30j"].includes(periode) ? periode : "jour"
    );

    if (format === "csv") {
      await enregistrerAudit({
        utilisateurId: session.utilisateur.id,
        type: "EXPORT",
        entite: "Statistiques",
        action: `Export CSV statistiques ${data.periode}`,
      });
      return new NextResponse(statsVersCsv(data), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="stats-${data.periode}.csv"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/admin/rapports]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Impossible de charger les statistiques.",
      },
      { status: 400 }
    );
  }
}
