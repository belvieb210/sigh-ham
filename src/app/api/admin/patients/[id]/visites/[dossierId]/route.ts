import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { reinitialiserVisitePatientAdmin } from "@/lib/admin/reinitialiser-visite";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; dossierId: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  const { id, dossierId } = await context.params;
  try {
    const body = (await request.json().catch(() => ({}))) as {
      confirmation?: string;
    };
    const result = await reinitialiserVisitePatientAdmin({
      acteurId: session.utilisateur.id,
      patientId: id,
      dossierId,
      confirmation: String(body.confirmation ?? ""),
    });
    return NextResponse.json({
      message: `La visite ${result.numeroDossier} a été réinitialisée.`,
      ...result,
    });
  } catch (error) {
    console.error("[DELETE /api/admin/patients/:id/visites/:dossierId]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Réinitialisation impossible.",
      },
      { status: 400 }
    );
  }
}
