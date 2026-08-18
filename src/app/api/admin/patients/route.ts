import { NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { listerPersonnesAdmin } from "@/lib/admin/patients";

export async function GET() {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const personnes = await listerPersonnesAdmin();
    return NextResponse.json({
      patients: personnes.filter((p) => p.type === "PATIENT"),
      clients: personnes.filter((p) => p.type === "CLIENT"),
    });
  } catch (error) {
    console.error("[GET /api/admin/patients]", error);
    return NextResponse.json(
      { message: "Impossible de charger les patients et clients." },
      { status: 500 }
    );
  }
}
