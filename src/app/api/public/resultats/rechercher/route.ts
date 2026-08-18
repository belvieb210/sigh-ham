import { NextRequest, NextResponse } from "next/server";
import { rechercherResultatsPatientPublic } from "@/lib/resultats-public/rechercher-resultats-patient";

const MSG_EN_ATTENTE =
  "Vos résultats ne sont pas encore disponibles en ligne. Ils seront accessibles sous 24 heures après validation par notre équipe médicale.";

const MSG_INTROUVABLE =
  "Informations incorrectes. Vérifiez vos données ou contactez l'accueil.";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      nom?: string;
      prenom?: string;
      numeroPatient?: string;
      numeroFacture?: string;
      telephone?: string;
    };

    const reponse = await rechercherResultatsPatientPublic({
      nom: body.nom?.trim() ?? "",
      prenom: body.prenom?.trim() ?? "",
      numeroPatient: body.numeroPatient?.trim() ?? "",
      numeroFacture: body.numeroFacture?.trim() ?? "",
      telephone: body.telephone?.trim() ?? "",
    });

    if (reponse.type === "introuvable") {
      return NextResponse.json({ erreur: MSG_INTROUVABLE }, { status: 404 });
    }

    const identite = `${body.prenom?.trim() ?? ""} ${body.nom?.trim() ?? ""}`.trim();
    const { enregistrerAudit } = await import("@/lib/admin/audit");
    await enregistrerAudit({
      type: "CONSULTATION",
      module: "CLIENT",
      entite: "ResultatPublic",
      action:
        reponse.type === "en_attente"
          ? `Consultation résultats (en attente) — ${identite || "visiteur"}`
          : `Consultation résultats — ${identite || "visiteur"}`,
      details: {
        numeroPatient: body.numeroPatient?.trim() || null,
        numeroFacture: body.numeroFacture?.trim() || null,
      },
    });

    if (reponse.type === "en_attente") {
      return NextResponse.json(
        {
          statut: "en_attente",
          message: MSG_EN_ATTENTE,
          attente: reponse.attente,
        },
        { status: 202 }
      );
    }

    return NextResponse.json({ resultat: reponse.resultat });
  } catch (e) {
    console.error("[POST /api/public/resultats/rechercher]", e);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
