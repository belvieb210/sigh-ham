"use client";

async function televerserFichierClient(
  fichier: File,
  dossier: "campagnes" | "hero" | "galerie" | "services" | "medecins" = "campagnes"
): Promise<string> {
  const form = new FormData();
  form.append("fichier", fichier);
  form.append("dossier", dossier);
  const res = await fetch("/api/client/upload", { method: "POST", body: form });
  const data = (await res.json()) as { url?: string; message?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.message ?? "Erreur upload");
  }
  return data.url;
}

export { televerserFichierClient };
