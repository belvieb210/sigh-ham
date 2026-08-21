import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creerTokenResetMotDePasse } from "@/lib/auth/token-reset-mot-de-passe";

/**
 * Demande de réinitialisation : uniquement si le compte existe et est actif.
 * Sans envoi email (infra absente) : renvoie un jeton pour l'étape suivante.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; identifiant?: string };
    const saisie = String(body.email ?? body.identifiant ?? "").trim();

    if (!saisie) {
      return NextResponse.json(
        { message: "Email ou identifiant requis." },
        { status: 400 }
      );
    }

    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { identifiant: { equals: saisie, mode: "insensitive" } },
          { email: { equals: saisie, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        email: true,
        identifiant: true,
        statut: true,
      },
    });

    if (!utilisateur) {
      return NextResponse.json(
        { message: "Aucun compte trouvé pour cet email ou identifiant." },
        { status: 404 }
      );
    }

    if (utilisateur.statut !== "ACTIF") {
      return NextResponse.json(
        {
          message:
            "Ce compte est suspendu ou inactif. Contactez l'administration.",
        },
        { status: 403 }
      );
    }

    const token = creerTokenResetMotDePasse(utilisateur.id);

    await prisma.journalAudit.create({
      data: {
        utilisateurId: utilisateur.id,
        type: "MODIFICATION",
        entite: "Utilisateur",
        entiteId: utilisateur.id,
        action: "Demande de réinitialisation du mot de passe",
      },
    }).catch(() => {
      /* journal optionnel */
    });

    return NextResponse.json({
      ok: true,
      token,
      compte: utilisateur.email || utilisateur.identifiant,
    });
  } catch (e) {
    console.error("[POST /api/auth/mot-de-passe-oublie]", e);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
