import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "locales", "reception");

const BLOC_PREFS = `    preferences: {
      titre: "Préférences",
      inApp: "Notifications in-app",
      tableauBord: "Badge tableau de bord",
      push: "Notifications push (bientôt)",
      email: "Notifications e-mail (bientôt)",
      sms: "Notifications SMS (bientôt)",
      silencieux: "Mode silencieux global",
      enregistrer: "Enregistrer",
      enregistre: "Préférences enregistrées.",
    },
`;

for (const fichier of fs.readdirSync(dir)) {
  if (!fichier.endsWith(".ts") || fichier === "fr.ts" || fichier === "en.ts") continue;

  const chemin = path.join(dir, fichier);
  let contenu = fs.readFileSync(chemin, "utf8");
  if (contenu.includes("preferences:")) continue;

  const avant = contenu;
  contenu = contenu.replace(
    /(\s+PAIEMENT_VALIDE: "[^"]+",\r?\n\s+\},\r?\n)(\s+\},\r?\n\r?\n\s+tableau:)/,
    `$1${BLOC_PREFS}$2`
  );

  if (contenu === avant) {
    console.warn(`⚠ pas de remplacement : ${fichier}`);
    continue;
  }

  fs.writeFileSync(chemin, contenu);
  console.log(`✓ ${fichier}`);
}

console.log("Patch preferences terminé");
