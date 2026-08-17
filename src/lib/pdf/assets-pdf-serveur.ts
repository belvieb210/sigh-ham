import "server-only";
import { existsSync } from "fs";
import { join } from "path";
import { Font } from "@react-pdf/renderer";

let policesEnregistrees = false;

/** Chemin local → URL lisible par @react-pdf (Windows inclus). */
export function urlFichierLocalPdf(cheminAbsolu: string): string {
  const brut = cheminAbsolu.trim();
  if (!brut) return "";
  if (/^https?:\/\//i.test(brut) || brut.startsWith("data:") || brut.startsWith("file:")) {
    return brut;
  }
  const normalise = brut.replace(/\\/g, "/");
  if (/^[A-Za-z]:\//.test(normalise)) {
    return `file:///${encodeURI(normalise)}`;
  }
  return normalise;
}

function assetPublic(...segments: string[]): string {
  const abs = join(process.cwd(), "public", ...segments);
  if (!existsSync(abs)) return "";
  return urlFichierLocalPdf(abs);
}

/** Polices Roboto pour @react-pdf/renderer côté serveur. */
export function enregistrerPolicesPdfServeur() {
  if (policesEnregistrees) return;
  const regular = join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");
  const bold = join(process.cwd(), "public", "fonts", "Roboto-Bold.ttf");
  if (!existsSync(regular) || !existsSync(bold)) {
    console.error("[pdf] Polices Roboto introuvables dans public/fonts.");
    return;
  }

  Font.register({
    family: "Roboto",
    fonts: [
      { src: regular, fontWeight: "normal", fontStyle: "normal" },
      { src: bold, fontWeight: "bold", fontStyle: "normal" },
      // Pas de fichier italic : même TTF pour éviter « Could not resolve font ».
      { src: regular, fontWeight: "normal", fontStyle: "italic" },
      { src: bold, fontWeight: "bold", fontStyle: "italic" },
    ],
  });
  policesEnregistrees = true;
}

export function cheminsAssetsPdfServeur() {
  return {
    logo: assetPublic("images", "logo-ham-laboratoire.png"),
    signature: assetPublic("images", "signature-ham.png"),
    avatarHomme: assetPublic("images", "avatar-patient-homme.png"),
    avatarFemme: assetPublic("images", "avatar-patient-femme.png"),
  };
}
