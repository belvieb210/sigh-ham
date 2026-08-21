import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasherMotDePasse } from "@/lib/auth/mot-de-passe";
import { validerNouveauMotDePasse } from "@/lib/auth/profil-utilisateur";
import { verifierTokenResetMotDePasse } from "@/lib/auth/token-reset-mot-de-passe";

/**
 * Applique le nouveau mot de passe pour le compte lié au jeton.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      token?: string;
      nouveauMotDePasse?: string;
      confirmerMotDePasse?: string;
    };

    const token = String(body.token ?? "").trim();
    const nouveau = String(body.nouveauMotDePasse ?? "");
    const confirmer = String(body.confirmerMotDePasse ?? "");

    if (!token) {
      return NextResponse.json(
        { message: "Lien de réinitialisation invalide ou expiré." },
        { status: 400 }
      );
    }

    const erreur = validerNouveauMotDePasse(nouveau, confirmer);
    if (erreur) {
      return NextResponse.json({ message: erreur }, { status: 400 });
    }

    const verifie = verifierTokenResetMotDePasse(token);
    if (!verifie) {
      return NextResponse.json(
        { message: "Lien de réinitialisation invalide ou expiré." },
        { status: 400 }
      );
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: verifie.utilisateurId },
      select: { id: true, statut: true, role: { select: { salle: { select: { code: true } } } } },
    });

    if (!utilisateur) {
      return NextResponse.json(
        { message: "Compte introuvable." },
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

    const hash = await hasherMotDePasse(nouveau);

    await prisma.$transaction([
      prisma.utilisateur.update({
        where: { id: utilisateur.id },
        data: { motDePasseHash: hash },
      }),
      prisma.journalAudit.create({
        data: {
          utilisateurId: utilisateur.id,
          type: "MODIFICATION",
          module: utilisateur.role.salle?.code ?? undefined,
          entite: "Utilisateur",
          entiteId: utilisateur.id,
          action: "Réinitialisation du mot de passe (mot de passe oublié)",
        },
      }),
    ]);

    await prisma.session.deleteMany({
      where: { utilisateurId: utilisateur.id },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[POST /api/auth/reinitialiser-mot-de-passe]", e);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
