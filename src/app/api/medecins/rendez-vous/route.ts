import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import {
  creerDemandeRdvManuelle,
  compterDemandesRdvParStatut,
  listerDemandesRdv,
  mettreAJourDemandeRdv,
} from "@/lib/rdv/gestion-demandes";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const statut = request.nextUrl.searchParams.get("statut") ?? undefined;
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const [rendezVous, compteurs] = await Promise.all([
      listerDemandesRdv({ statut, q }),
      compterDemandesRdvParStatut(),
    ]);
    return NextResponse.json({ rendezVous, demandes: rendezVous, compteurs });
  } catch (e) {
    console.error("[api/medecins/rendez-vous GET]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les rendez-vous." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      prenom?: string;
      nom?: string;
      telephone?: string;
      email?: string | null;
      motif?: string | null;
      dateSouhaitee?: string;
      notes?: string | null;
      id?: string;
      statut?: string;
      action?: string;
    };

    if (body.action === "statut" || (body.id && body.statut)) {
      if (!body.id?.trim() || !body.statut?.trim()) {
        return NextResponse.json(
          { erreur: "id et statut requis." },
          { status: 400 }
        );
      }
      const rendezVous = await mettreAJourDemandeRdv(body.id.trim(), {
        statut: body.statut.trim(),
        notes: body.notes,
      });
      return NextResponse.json({ rendezVous, demande: rendezVous });
    }

    if (
      !body.prenom?.trim() ||
      !body.nom?.trim() ||
      !body.telephone?.trim() ||
      !body.dateSouhaitee
    ) {
      return NextResponse.json(
        { erreur: "prenom, nom, telephone et dateSouhaitee requis." },
        { status: 400 }
      );
    }

    const rendezVous = await creerDemandeRdvManuelle({
      prenom: body.prenom,
      nom: body.nom,
      telephone: body.telephone,
      email: body.email,
      motif: body.motif,
      dateSouhaitee: body.dateSouhaitee,
      notes: body.notes,
      typePrestation: "consultation",
      service: "Consultation médicale",
    });

    return NextResponse.json(
      { rendezVous, demande: rendezVous },
      { status: 201 }
    );
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "CHAMPS_REQUIS" || code === "DATE_INVALIDE") {
      return NextResponse.json({ erreur: "Données invalides." }, { status: 400 });
    }
    if (code === "STATUT_INVALIDE") {
      return NextResponse.json({ erreur: "Statut invalide." }, { status: 400 });
    }
    if (code === "RDV_INTROUVABLE") {
      return NextResponse.json(
        { erreur: "Rendez-vous introuvable." },
        { status: 404 }
      );
    }
    console.error("[api/medecins/rendez-vous POST]", e);
    return NextResponse.json(
      { erreur: "Impossible d'enregistrer le rendez-vous." },
      { status: 500 }
    );
  }
}
