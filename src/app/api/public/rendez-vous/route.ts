import { NextRequest, NextResponse } from "next/server";
import { creerDemandeRdvDepuisFormulaire } from "@/lib/rdv/gestion-demandes";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      typePrestation?: string;
      date?: string;
      creneau?: string;
      nomComplet?: string;
      email?: string;
      telephone?: string;
      dateNaissance?: string;
      motif?: string;
      premiereVisite?: boolean;
      medecinId?: string;
      medecinNom?: string;
      consentement?: boolean;
    };

    if (
      !body.typePrestation?.trim() ||
      !body.date?.trim() ||
      !body.creneau?.trim() ||
      !body.nomComplet?.trim() ||
      !body.email?.trim() ||
      !body.telephone?.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "typePrestation, date, creneau, nomComplet, email et telephone sont requis.",
        },
        { status: 400 }
      );
    }

    if (body.consentement !== true) {
      return NextResponse.json(
        { message: "Le consentement est requis." },
        { status: 400 }
      );
    }

    const { reference } = await creerDemandeRdvDepuisFormulaire({
      typePrestation: body.typePrestation.trim(),
      date: body.date.trim(),
      creneau: body.creneau.trim(),
      nomComplet: body.nomComplet.trim(),
      email: body.email.trim(),
      telephone: body.telephone.trim(),
      dateNaissance: body.dateNaissance,
      motif: body.motif,
      premiereVisite: body.premiereVisite,
      medecinId: body.medecinId,
      medecinNom: body.medecinNom,
    });

    return NextResponse.json({ succes: true, reference }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/public/rendez-vous]", error);
    return NextResponse.json(
      { message: "Impossible d'enregistrer la demande de rendez-vous." },
      { status: 500 }
    );
  }
}
