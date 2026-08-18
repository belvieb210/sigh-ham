import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { restaurerTransfertsPatientAdmin } from "@/lib/admin/transferts-patient";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  const { id } = await context.params;
  try {
    const body = (await request.json()) as {
      dossierId?: string;
      transfertIds?: string[];
    };
    const result = await restaurerTransfertsPatientAdmin({
      acteurId: session.utilisateur.id,
      patientId: id,
      dossierId: String(body.dossierId ?? ""),
      transfertIds: Array.isArray(body.transfertIds) ? body.transfertIds : [],
    });
    return NextResponse.json({
      message: "Transfert(s) restauré(s).",
      ...result,
    });
  } catch (error) {
    console.error("[POST /api/admin/patients/:id/transferts/restaurer]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Restauration impossible.",
      },
      { status: 400 }
    );
  }
}
