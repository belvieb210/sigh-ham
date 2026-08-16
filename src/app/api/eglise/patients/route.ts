import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import {
  listerPatientsEnregistresEglise,
  listerPatientsRecentsEglise,
} from "@/lib/eglise/lister-patients";
import { assurerDossierPrenuptial } from "@/lib/eglise/pack-prenuptial";
import {
  parserDonneesEnregistrement,
  parserFormDataEnregistrement,
  validerDonneesEnregistrement,
  enregistrerNouveauPatient,
} from "@/lib/reception/enregistrer-patient";
import { validerPhotoPatient } from "@/lib/reception/photo-patient";
import { rechercherPatientsReception } from "@/lib/reception/rechercher-patients-reception";
import { prisma } from "@/lib/prisma";
import type { DonneesEnregistrementPatient } from "@/lib/reception/types";

async function enregistrerPatientEglise(
  agentId: string,
  donnees: DonneesEnregistrementPatient,
  photo: File | null,
  prenuptial: { paroisse?: string; dateMariage?: string; conjointNom?: string }
) {
  /** Réutilise l'enregistrement réception puis rattache file EGLISE + pack. */
  const resultat = await enregistrerNouveauPatient(agentId, donnees, photo, {
    salleEnregistrement: "EGLISE",
  });

  const salle = await prisma.salle.findUnique({ where: { code: "EGLISE" } });
  if (!salle) throw new Error("Salle Église introuvable.");

  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: resultat.dossierId },
    include: { passages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!dossier) throw new Error("Dossier introuvable.");

  let passageId = dossier.passages[0]?.id;
  if (!passageId) {
    const passage = await prisma.passage.create({
      data: {
        dossierId: dossier.id,
        statut: "EN_ATTENTE",
        motif: "Enregistrement service conventionné",
      },
    });
    passageId = passage.id;
  }

  const maxOrdre = await prisma.fileAttente.aggregate({
    where: { salleId: salle.id, serviLe: null },
    _max: { numeroOrdre: true },
  });

  const fileExistante = await prisma.fileAttente.findFirst({
    where: { passageId, serviLe: null },
  });
  if (!fileExistante) {
    await prisma.fileAttente.create({
      data: {
        passageId,
        salleId: salle.id,
        numeroOrdre: (maxOrdre._max.numeroOrdre ?? 0) + 1,
      },
    });
  }

  await assurerDossierPrenuptial(dossier.id, agentId, prenuptial);

  return resultat;
}

function extrairePrenuptial(
  source: FormData | Record<string, unknown>
): { paroisse?: string; dateMariage?: string; conjointNom?: string } {
  if (source instanceof FormData) {
    return {
      paroisse: String(source.get("paroisse") ?? "").trim() || undefined,
      dateMariage: String(source.get("dateMariage") ?? "").trim() || undefined,
      conjointNom: String(source.get("conjointNom") ?? "").trim() || undefined,
    };
  }
  return {
    paroisse: String(source.paroisse ?? "").trim() || undefined,
    dateMariage: String(source.dateMariage ?? "").trim() || undefined,
    conjointNom: String(source.conjointNom ?? "").trim() || undefined,
  };
}

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const q = request.nextUrl.searchParams.get("q");
    const limiteParam = request.nextUrl.searchParams.get("limite");
    const limite = limiteParam ? parseInt(limiteParam, 10) : undefined;

    if (q !== null) {
      /** Recherche limitée aux patients enregistrés au service Église. */
      const patients = await rechercherPatientsReception(
        q,
        limite && limite > 0 ? limite : 8,
        { salleEnregistrement: "EGLISE" }
      );
      return NextResponse.json({ patients });
    }

    if (limite && limite > 0) {
      const patients = await listerPatientsRecentsEglise(limite);
      return NextResponse.json({ patients });
    }

    return NextResponse.json(await listerPatientsEnregistresEglise());
  } catch (error) {
    console.error("[GET /api/eglise/patients]", error);
    return NextResponse.json(
      { message: "Impossible de charger les patients." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const typeContenu = request.headers.get("content-type") ?? "";
    let donnees: Partial<DonneesEnregistrementPatient>;
    let photo: File | null = null;
    let prenuptial = {};

    if (typeContenu.includes("multipart/form-data")) {
      const formData = await request.formData();
      const parse = parserFormDataEnregistrement(formData);
      donnees = parse.donnees;
      photo = parse.photo;
      prenuptial = extrairePrenuptial(formData);
      if (photo) {
        const erreurPhoto = validerPhotoPatient(photo);
        if (erreurPhoto) {
          return NextResponse.json({ message: erreurPhoto }, { status: 400 });
        }
      }
    } else {
      const body = (await request.json()) as Record<string, unknown>;
      donnees = parserDonneesEnregistrement(body);
      prenuptial = extrairePrenuptial(body);
    }

    const erreur = validerDonneesEnregistrement(donnees);
    if (erreur) {
      return NextResponse.json({ message: erreur }, { status: 400 });
    }

    const resultat = await enregistrerPatientEglise(
      session.utilisateur.id,
      donnees as DonneesEnregistrementPatient,
      photo,
      prenuptial
    );

    return NextResponse.json(
      { message: "Patient enregistré (pack prénuptial associé).", ...resultat },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/eglise/patients]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Impossible d'enregistrer le patient.",
      },
      { status: 400 }
    );
  }
}
