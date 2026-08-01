import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "locales", "reception");

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".ts") || f === "fr.ts" || f === "en.ts") continue;
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, "utf8");

  c = c.replace(
    /(    selectionRequise: "[^"]+",)\n    salles:[\s\S]*?    pieceJointe: "[^"]+",\n(  \},)/,
    "$1\n$2"
  );

  const messagerieStart = c.indexOf("  messagerie: {");
  const messagerieChunk = c.slice(messagerieStart, messagerieStart + 4000);
  if (!messagerieChunk.includes("DIFFUSION:")) {
    c = c.replace(
      /(      CANAL_SALLE: "[^"]+",\n)(    \},)/,
      '$1      DIFFUSION: "Annonce institutionnelle",\n$2'
    );
  }

  fs.writeFileSync(p, c);
  console.log("OK", f);
}
