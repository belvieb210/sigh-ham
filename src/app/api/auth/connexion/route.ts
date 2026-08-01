import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierMotDePasse } from "@/lib/auth/mot-de-passe";
import {
  creerSession,
  definirCookieSession,
} from "@/lib/auth/session";
import { obtenirRouteApresConnexion } from "@/lib/auth/redirections";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifiant = String(body.identifiant ?? "").trim();
    const motDePasse = String(body.motDePasse ?? "");

    if (!identifiant || !motDePasse) {
      return NextResponse.json(
        { message: "Identifiant et mot de passe requis." },
        { status: 400 }
      );
    }

    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { identifiant: { equals: identifiant, mode: "insensitive" } },
          { email: { equals: identifiant, mode: "insensitive" } },
        ],
      },
      include: {
        role: { include: { salle: true } },
      },
    });

    if (!utilisateur) {
      return NextResponse.json(
        { message: "Identifiant ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    if (utilisateur.statut !== "ACTIF") {
      return NextResponse.json(
        { message: "Compte suspendu ou inactif. Contactez l'administration." },
        { status: 403 }
      );
    }

    const valide = await verifierMotDePasse(
      motDePasse,
      utilisateur.motDePasseHash
    );

    if (!valide) {
      return NextResponse.json(
        { message: "Identifiant ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const token = await creerSession(utilisateur.id, {
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { derniereConnexion: new Date() },
    });

    await prisma.journalAudit.create({
      data: {
        utilisateurId: utilisateur.id,
        type: "CONNEXION",
        module: utilisateur.role.salle?.code,
        entite: "Utilisateur",
        entiteId: utilisateur.id,
        action: "Connexion réussie",
      },
    });

    await definirCookieSession(token);

    const redirect = obtenirRouteApresConnexion(utilisateur.role);

    return NextResponse.json({
      redirect,
      utilisateur: {
        id: utilisateur.id,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role.nom,
        salle: utilisateur.role.salle?.nom,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Erreur serveur lors de la connexion." },
      { status: 500 }
    );
  }
}
