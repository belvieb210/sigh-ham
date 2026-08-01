import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "locales", "reception");

const extra = `      personnel: "Personnel",
      retourConversations: "Retour aux conversations",
      rechercherPersonnel: "Rechercher un collègue…",
      demarrerAvec: "Message à {{nom}}",`;

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".ts") || f === "fr.ts" || f === "en.ts") continue;
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, "utf8");
  if (c.includes("personnel:")) {
    console.log("skip", f);
    continue;
  }
  c = c.replace(
    /detailsConversation: "[^"]+",\n(\s*\},)/,
    `detailsConversation: "Détails de la conversation",\n${extra}\n$1`
  );
  fs.writeFileSync(p, c);
  console.log("patched", f);
}
