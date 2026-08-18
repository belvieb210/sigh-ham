import { NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { listerVisitesPatientAdmin } from "@/lib/admin/reinitialiser-visite";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  const { id } = await context.params;
  try {
    const data = await listerVisitesPatientAdmin(id);
    if (!data) {
      return NextResponse.json({ message: "Introuvable." }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/admin/patients/:id/visites]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Impossible de charger les visites.",
      },
      { status: 400 }
    );
  }
}
