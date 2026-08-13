"use client";

export interface PieceJointeUploadLaboratoire {
  nom: string;
  url: string;
  mimeType: string;
  taille?: number;
}

export async function televerserPieceJointeLaboratoire(
  examenId: string,
  fichier: File
): Promise<PieceJointeUploadLaboratoire> {
  const form = new FormData();
  form.append("fichier", fichier);
  const res = await fetch(
    `/api/laboratoire/examens/${encodeURIComponent(examenId)}/pieces-jointes`,
    { method: "POST", body: form }
  );
  const data = (await res.json()) as PieceJointeUploadLaboratoire & { erreur?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.erreur ?? "Erreur upload pièce jointe.");
  }
  return {
    nom: data.nom ?? fichier.name,
    url: data.url,
    mimeType: data.mimeType ?? fichier.type,
    taille: data.taille ?? fichier.size,
  };
}
