import "server-only";
import { NextResponse } from "next/server";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import { estRoleAdministrateur } from "@/lib/auth/est-administrateur";

export async function obtenirSessionApiAdmin() {
  const session = await lireSessionDepuisCookie();
  if (!session) return null;
  if (!estRoleAdministrateur(session.utilisateur.role)) return null;
  return session;
}

export function reponseNonAutoriseAdmin() {
  return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
}
