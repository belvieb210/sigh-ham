import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { apercuNumerosPatient } from "@/lib/reception/numeros";

export async function GET() {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const numeros = await apercuNumerosPatient();
    return NextResponse.json(numeros);
  } catch (error) {
    console.error("[GET /api/medecins-externes/numeros]", error);
    return NextResponse.json(
      { message: "Impossible de générer les numéros." },
      { status: 500 }
    );
  }
}
