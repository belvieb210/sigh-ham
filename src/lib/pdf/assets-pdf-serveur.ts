import "server-only";
import { join } from "path";
import { Font } from "@react-pdf/renderer";

let policesEnregistrees = false;

/** Polices Roboto pour @react-pdf/renderer côté serveur. */
export function enregistrerPolicesPdfServeur() {
  if (policesEnregistrees) return;
  const base = join(process.cwd(), "public", "fonts");
  Font.register({
    family: "Roboto",
    fonts: [
      { src: join(base, "Roboto-Regular.ttf"), fontWeight: "normal" },
      { src: join(base, "Roboto-Bold.ttf"), fontWeight: "bold" },
    ],
  });
  policesEnregistrees = true;
}

export function cheminsAssetsPdfServeur() {
  const pub = join(process.cwd(), "public");
  return {
    logo: join(pub, "images", "logo-ham-laboratoire.png"),
    signature: join(pub, "images", "signature-ham.png"),
    avatarHomme: join(pub, "images", "avatar-patient-homme.png"),
    avatarFemme: join(pub, "images", "avatar-patient-femme.png"),
  };
}
