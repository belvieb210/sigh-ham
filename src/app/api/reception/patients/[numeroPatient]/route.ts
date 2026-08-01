import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiReception } from "@/lib/auth/garde-api-reception";
import {
  parserFormDataEnregistrement,
  validerDonneesEnregistrement,
} from "@/lib/reception/enregistrer-patient";
import { mettreAJourPatient } from "@/lib/reception/mettre-a-jour-patient";
import { obtenirPatientPourFormulaire } from "@/lib/reception/obtenir-patient-formulaire";
import { validerPhotoPatient } from "@/lib/reception/photo-patient";
import { supprimerPatientDefinitivement } from "@/lib/reception/supprimer-patient";
import type { DonneesEnregistrementPatient } from "@/lib/reception/types";

interface ParamsRoute {
  params: Promise<{ numeroPatient: string }>;
}

export async function GET(_request: NextRequest, { params }: ParamsRoute) {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { numeroPatient } = await params;
    const decode = decodeURIComponent(numeroPatient);
    const patient = await obtenirPatientPourFormulaire(decode);

    if (!patient) {
      return NextResponse.json({ message: "Patient introuvable." }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("[GET /api/reception/patients/[numeroPatient]]", error);
    return NextResponse.json(
      { message: "Impossible de charger le patient." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: ParamsRoute) {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { numeroPatient } = await params;
    const decode = decodeURIComponent(numeroPatient);

    const formData = await request.formData();
    const parse = parserFormDataEnregistrement(formData);
    const photo = parse.photo;

    if (photo) {
      const erreurPhoto = validerPhotoPatient(photo);
      if (erreurPhoto) {
        return NextResponse.json({ message: erreurPhoto }, { status: 400 });
      }
    }

    const erreur = validerDonneesEnregistrement(parse.donnees);
    if (erreur) {
      return NextResponse.json({ message: erreur }, { status: 400 });
    }

    const resultat = await mettreAJourPatient(
      decode,
      session.utilisateur.id,
      parse.donnees as DonneesEnregistrementPatient,
      photo
    );

    return NextResponse.json({
      message: "Patient mis à jour avec succès.",
      ...resultat,
    });
  } catch (error) {
    console.error("[PUT /api/reception/patients/[numeroPatient]]", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la modification.";
    const status = message === "Patient introuvable." ? 404 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: NextRequest, { params }: ParamsRoute) {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { numeroPatient } = await params;
    const decode = decodeURIComponent(numeroPatient);
    await supprimerPatientDefinitivement(decode);

    return NextResponse.json({
      message: "Patient supprimé définitivement.",
      numeroPatient: decode,
    });
  } catch (error) {
    console.error("[DELETE /api/reception/patients/[numeroPatient]]", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la suppression.";
    const status = message === "Patient introuvable." ? 404 : 500;
    return NextResponse.json({ message }, { status });
  }
}
