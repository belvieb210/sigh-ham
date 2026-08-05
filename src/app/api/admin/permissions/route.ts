import { NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { listerPermissionsCatalogue } from "@/lib/admin/permissions";

export async function GET() {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const permissions = await listerPermissionsCatalogue();
    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("[GET /api/admin/permissions]", error);
    return NextResponse.json(
      { message: "Impossible de charger les permissions." },
      { status: 500 }
    );
  }
}
