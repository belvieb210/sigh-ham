import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiReception } from "@/lib/auth/garde-api-reception";
import {
  enregistrerNouveauPatient,
  parserDonneesEnregistrement,
  parserFormDataEnregistrement,
  validerDonneesEnregistrement,
} from "@/lib/reception/enregistrer-patient";
import { validerPhotoPatient } from "@/lib/reception/photo-patient";
import { listerPatientsEnregistres, listerPatientsRecents } from "@/lib/reception/lister-patients-enregistres";
import { rechercherPatientsReception } from "@/lib/reception/rechercher-patients-reception";
import type { DonneesEnregistrementPatient } from "@/lib/reception/types";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const q = request.nextUrl.searchParams.get("q");
    const limiteParam = request.nextUrl.searchParams.get("limite");
    const limite = limiteParam ? parseInt(limiteParam, 10) : undefined;

    if (q !== null) {
      const patients = await rechercherPatientsReception(q, limite && limite > 0 ? limite : 8, {
        salleEnregistrement: "RECEPTION",
      });
      return NextResponse.json({ patients });
    }

    if (limite && limite > 0) {
      const patients = await listerPatientsRecents(limite);
      return NextResponse.json({ patients });
    }

    const resultat = await listerPatientsEnregistres();
    return NextResponse.json(resultat);
  } catch (error) {
    console.error("[GET /api/reception/patients]", error);
    return NextResponse.json(
      { message: "Impossible de charger les patients." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const typeContenu = request.headers.get("content-type") ?? "";
    let donnees: Partial<DonneesEnregistrementPatient>;
    let photo: File | null = null;

    if (typeContenu.includes("multipart/form-data")) {
      const formData = await request.formData();
      const parse = parserFormDataEnregistrement(formData);
      donnees = parse.donnees;
      photo = parse.photo;
      if (photo) {
        const erreurPhoto = validerPhotoPatient(photo);
        if (erreurPhoto) {
          return NextResponse.json({ message: erreurPhoto }, { status: 400 });
        }
      }
    } else {
      const body = await request.json();
      donnees = parserDonneesEnregistrement(body);
    }

    const erreur = validerDonneesEnregistrement(donnees);
    if (erreur) {
      return NextResponse.json({ message: erreur }, { status: 400 });
    }

    const resultat = await enregistrerNouveauPatient(
      session.utilisateur.id,
      donnees as DonneesEnregistrementPatient,
      photo
    );

    return NextResponse.json({
      message: "Patient enregistré avec succès.",
      ...resultat,
    });
  } catch (error) {
    console.error("[POST /api/reception/patients]", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de l'enregistrement.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
