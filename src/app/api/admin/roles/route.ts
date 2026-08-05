import { NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { listerRolesAdmin } from "@/lib/admin/roles";

export async function GET() {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const roles = await listerRolesAdmin();
    return NextResponse.json({ roles });
  } catch (error) {
    console.error("[GET /api/admin/roles]", error);
    return NextResponse.json(
      { message: "Impossible de charger les roles." },
      { status: 500 }
    );
  }
}
