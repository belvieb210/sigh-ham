import "server-only";
import { NextResponse } from "next/server";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import { utilisateurPeutAccederSalle } from "@/lib/auth/redirections";

export async function obtenirSessionApiClient() {
  const session = await lireSessionDepuisCookie();
  if (!session) return null;
  if (!utilisateurPeutAccederSalle("CLIENT", session.utilisateur.role)) {
    return null;
  }
  return session;
}

export function reponseNonAutoriseClient() {
  return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
}
