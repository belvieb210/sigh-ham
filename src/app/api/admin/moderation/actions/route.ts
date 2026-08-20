import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  approuverSignalementFichierAdmin,
  approuverSignalementMessageAdmin,
  bloquerConversationAdmin,
  bloquerMessageAdmin,
  bloquerMessagerieUtilisateur,
  debloquerConversationAdmin,
  debloquerMessageAdmin,
  debloquerMessagerieUtilisateur,
  envoyerAvertissementAdmin,
  messageErreurModeration,
  restaurerGroupeAdmin,
  supprimerFichierAdmin,
  supprimerGroupeAdmin,
  supprimerMessagePourTousAdmin,
} from "@/lib/admin/moderation-messagerie";
import { mettreAJourUtilisateurAdmin } from "@/lib/admin/utilisateurs";
import type { StatutUtilisateur } from "@/generated/prisma/client";

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");
    const acteurId = session.utilisateur.id;

    switch (action) {
      case "bloquer-conversation":
        await bloquerConversationAdmin(
          acteurId,
          String(body.conversationId ?? ""),
          body.raison != null ? String(body.raison) : undefined
        );
        return NextResponse.json({ message: "Conversation bloquée." });

      case "debloquer-conversation":
        await debloquerConversationAdmin(acteurId, String(body.conversationId ?? ""));
        return NextResponse.json({ message: "Conversation réactivée." });

      case "supprimer-groupe":
        await supprimerGroupeAdmin(acteurId, String(body.conversationId ?? ""));
        return NextResponse.json({ message: "Groupe archivé (suppression admin)." });

      case "restaurer-groupe":
        await restaurerGroupeAdmin(acteurId, String(body.conversationId ?? ""));
        return NextResponse.json({ message: "Groupe restauré." });

      case "bloquer-message":
        await bloquerMessageAdmin(
          acteurId,
          String(body.messageId ?? ""),
          body.raison != null ? String(body.raison) : undefined
        );
        return NextResponse.json({ message: "Message bloqué." });

      case "debloquer-message":
        await debloquerMessageAdmin(acteurId, String(body.messageId ?? ""));
        return NextResponse.json({ message: "Message débloqué." });

      case "approuver-message":
        await approuverSignalementMessageAdmin(acteurId, String(body.messageId ?? ""));
        return NextResponse.json({ message: "Signalement classé — message légitime." });

      case "supprimer-message-pour-tous":
        await supprimerMessagePourTousAdmin(acteurId, String(body.messageId ?? ""));
        return NextResponse.json({ message: "Message supprimé pour tous." });

      case "approuver-fichier":
        await approuverSignalementFichierAdmin(acteurId, String(body.fichierId ?? ""));
        return NextResponse.json({ message: "Fichier approuvé." });

      case "supprimer-fichier":
        await supprimerFichierAdmin(acteurId, String(body.fichierId ?? ""));
        return NextResponse.json({ message: "Fichier supprimé." });

      case "avertissement":
        await envoyerAvertissementAdmin(acteurId, {
          destinataireId: String(body.destinataireId ?? ""),
          contenu: String(body.contenu ?? ""),
          messageId: body.messageId != null ? String(body.messageId) : undefined,
          conversationId:
            body.conversationId != null ? String(body.conversationId) : undefined,
        });
        return NextResponse.json({ message: "Avertissement envoyé à l'utilisateur." });

      case "bloquer-messagerie-utilisateur":
        await bloquerMessagerieUtilisateur(
          acteurId,
          String(body.utilisateurId ?? ""),
          body.notes != null ? String(body.notes) : undefined
        );
        return NextResponse.json({ message: "Accès messagerie suspendu." });

      case "debloquer-messagerie-utilisateur":
        await debloquerMessagerieUtilisateur(
          acteurId,
          String(body.utilisateurId ?? "")
        );
        return NextResponse.json({ message: "Accès messagerie rétabli." });

      case "bloquer-acces-utilisateur": {
        const utilisateur = await mettreAJourUtilisateurAdmin(
          { id: acteurId, role: session.utilisateur.role },
          String(body.utilisateurId ?? ""),
          { statut: "SUSPENDU" as StatutUtilisateur }
        );
        return NextResponse.json({
          message: "Accès au système bloqué.",
          utilisateur,
        });
      }

      case "autoriser-acces-utilisateur": {
        const utilisateur = await mettreAJourUtilisateurAdmin(
          { id: acteurId, role: session.utilisateur.role },
          String(body.utilisateurId ?? ""),
          { statut: "ACTIF" as StatutUtilisateur }
        );
        return NextResponse.json({
          message: "Accès au système autorisé.",
          utilisateur,
        });
      }

      default:
        return NextResponse.json({ message: "Action inconnue." }, { status: 400 });
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const msg = messageErreurModeration(code);
    console.error("[POST /api/admin/moderation/actions]", error);
    return NextResponse.json(
      {
        message:
          msg ??
          (error instanceof Error ? error.message : "Action impossible."),
      },
      { status: 400 }
    );
  }
}
