import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "locales", "reception");

const block = `    actionsMessage: {
      menu: "Options du message",
      repondre: "Répondre",
      copier: "Copier",
      transferer: "Transférer",
      epingle: "Épingler",
      desepingle: "Désépingler",
      modifier: "Modifier",
      supprimer: "Supprimer",
      supprimerTitre: "Supprimer le message ?",
      supprimerPourMoi: "Supprimer pour moi",
      supprimerPourTous: "Supprimer pour tout le monde",
      modifie: "Modifié",
      copieSucces: "Message copié.",
      transfererTitre: "Transférer vers",
      modifierTitre: "Modifier le message",
      transfererSucces: "Message transféré.",
      modifierSucces: "Message modifié.",
    },`;

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".ts") || f === "fr.ts" || f === "en.ts") continue;
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, "utf8");
  if (c.includes("actionsMessage:")) {
    console.log("skip", f);
    continue;
  }
  c = c.replace(/(\s+pro: \{[\s\S]*?demarrerAvec:[^\n]+\n\s+\},\n)(\s+\},)/, `$1${block}\n$2`);
  fs.writeFileSync(p, c);
  console.log("patched", f);
}
