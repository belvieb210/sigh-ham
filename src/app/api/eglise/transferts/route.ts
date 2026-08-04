import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import { listerPatientsTransferesEglise } from "@/lib/eglise/lister-patients";
import { assurerDossierPrenuptial } from "@/lib/eglise/pack-prenuptial";
import { reorienterPatientDepuisEglise } from "@/lib/eglise/reorienter-patient";
import { nettoyerFilesAttenteNonConfirmees } from "@/lib/transferts/visibilite-salle";
import {
  parserDonneesTransfert,
  parserDonneesTransfertManuel,
  transfererPatientAccueil,
  transfererPatientManuel,
  validerDonneesTransfert,
  validerDonneesTransfertManuel,
} from "@/lib/reception/transferer-patient-accueil";
import type { DonneesTransfertAccueil } from "@/lib/reception/types";

const OPTIONS_EGLISE = {
  salleOrigine: "EGLISE" as const,
};

function extrairePrenuptial(body: Record<string, unknown>) {
  return {
    paroisse: String(body.paroisse ?? "").trim() || undefined,
    dateMariage: String(body.dateMariage ?? "").trim() || undefined,
    conjointNom: String(body.conjointNom ?? "").trim() || undefined,
  };
}

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    await nettoyerFilesAttenteNonConfirmees();
    const limiteParam = request.nextUrl.searchParams.get("limite");
    const limite = limiteParam ? parseInt(limiteParam, 10) : undefined;
    return NextResponse.json(
      await listerPatientsTransferesEglise(
        limite && limite > 0 ? limite : undefined
      )
    );
  } catch (error) {
    console.error("[GET /api/eglise/transferts]", error);
    return NextResponse.json(
      { message: "Impossible de charger les patients transférés." },
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
    const body = (await request.json()) as Record<string, unknown>;
    const prenuptial = extrairePrenuptial(body);

    if (body.transfertManuel) {
      const corps = body as {
        numeroPatient?: string;
        dossierId?: string;
        orientation?: string;
        orientations?: string[];
      };
      const orientations = [
        ...new Set(
          (corps.orientations?.filter(Boolean) ??
            (corps.orientation?.trim() ? [corps.orientation.trim()] : [])) as string[]
        ),
      ];

      if (orientations.length === 0) {
        const donnees = parserDonneesTransfertManuel(body);
        const erreur = validerDonneesTransfertManuel(donnees);
        if (erreur) {
          return NextResponse.json({ message: erreur }, { status: 400 });
        }
        orientations.push(donnees.orientation!);
      }

      let dossierId = corps.dossierId?.trim() || "";

      if (!dossierId) {
        const donnees = parserDonneesTransfertManuel({
          ...body,
          orientation: orientations[0],
        });
        const erreur = validerDonneesTransfertManuel(donnees);
        if (erreur) {
          return NextResponse.json({ message: erreur }, { status: 400 });
        }

        const cree = await transfererPatientManuel(
          session.utilisateur.id,
          {
            numeroPatient: donnees.numeroPatient!,
            dossierId: donnees.dossierId,
            orientation: orientations[0]!,
          },
          OPTIONS_EGLISE
        );
        dossierId = cree.dossierId;
        await assurerDossierPrenuptial(
          dossierId,
          session.utilisateur.id,
          prenuptial
        );

        if (orientations.length === 1) {
          return NextResponse.json({
            message: cree.transfertMisAJour
              ? `Destination mise à jour vers ${cree.salleDestination}.`
              : `Transfert vers ${cree.salleDestination}. Confirmez dans la liste.`,
            ...cree,
          });
        }
      }

      const resultat = await reorienterPatientDepuisEglise(
        session.utilisateur.id,
        dossierId,
        orientations
      );
      await assurerDossierPrenuptial(
        dossierId,
        session.utilisateur.id,
        prenuptial
      );

      return NextResponse.json({
        message: `Transfert(s) vers ${resultat.salleDestination}. Confirmez via ⋮.`,
        ...resultat,
      });
    }

    const donnees = parserDonneesTransfert(body);
    const erreur = validerDonneesTransfert(donnees);
    if (erreur) {
      return NextResponse.json({ message: erreur }, { status: 400 });
    }

    /** Pack prénuptial remplace / complète les examens choisis à la main. */
    const pack = await import("@/lib/eglise/pack-prenuptial").then((m) =>
      m.listerTypesExamenPackPrenuptial()
    );
    const examensIds = [
      ...new Set([
        ...(donnees.examensIds ?? []),
        ...pack.map((t) => t.id),
      ]),
    ];

    const resultat = await transfererPatientAccueil(
      session.utilisateur.id,
      {
        ...(donnees as DonneesTransfertAccueil),
        examensIds,
        orientation: (donnees.orientation || "CAISSE") as string,
      },
      OPTIONS_EGLISE
    );

    await assurerDossierPrenuptial(
      resultat.dossierId,
      session.utilisateur.id,
      prenuptial
    );

    return NextResponse.json({
      message: `Patient transféré vers ${resultat.salleDestination} (examens prénuptiaux associés).`,
      ...resultat,
    });
  } catch (error) {
    console.error("[POST /api/eglise/transferts]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Transfert impossible.",
      },
      { status: 500 }
    );
  }
}
