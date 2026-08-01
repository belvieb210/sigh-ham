import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "locales", "reception");

const BLOC = `  notificationsCentre: {
    titre: "Centre de notifications",
    sousTitre: "{{count}} notification(s) non lue(s)",
    toutLu: "Tout marquer lu",
    rechercher: "Rechercher une notification…",
    aucune: "Aucune notification.",
    voir: "Voir",
    marquerLu: "Marquer lu",
    archiver: "Archiver",
    filtres: { tous: "Toutes", non_lus: "Non lues", archives: "Archivées" },
    types: {
      NOUVEAU_PATIENT: "Nouveau patient",
      PATIENT_TRANSFERE: "Transfert",
      PATIENT_EN_ATTENTE: "En attente",
      NOUVEAU_MESSAGE: "Message",
      MENTION: "Mention",
      DIFFUSION: "Annonce",
      RESULTATS_LABO: "Laboratoire",
      PATIENT_A_FACTURER: "Caisse",
      PAIEMENT_VALIDE: "Paiement",
    },
  },
`;

for (const fichier of fs.readdirSync(dir)) {
  if (!fichier.endsWith(".ts") || fichier === "fr.ts" || fichier === "en.ts") continue;

  const chemin = path.join(dir, fichier);
  let contenu = fs.readFileSync(chemin, "utf8");

  if (contenu.includes("notificationsCentre:")) continue;

  const avant = contenu;
  if (contenu.includes("  messagerie:")) {
    contenu = contenu.replace(
      /(\s+erreurCreation: "[^"]+",\r?\n\s+\},\r?\n)/,
      `$1${BLOC}\n`
    );
  } else {
    contenu = contenu.replace(
      /  tableau: \{\r?\n    recents:/,
      `${BLOC}  tableau: {\n    recents:`
    );
  }

  if (contenu === avant) {
    console.warn(`⚠ pas de remplacement : ${fichier}`);
    continue;
  }

  fs.writeFileSync(chemin, contenu);
  console.log(`✓ ${fichier}`);
}

console.log("Patch notificationsCentre terminé");
