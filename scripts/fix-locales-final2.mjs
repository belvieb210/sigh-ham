import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "locales", "reception");

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".ts") || f === "fr.ts" || f === "en.ts") continue;
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, "utf8");

  const pagesIdx = c.indexOf("  pages:");
  const actionsIdx = c.indexOf("  actions:");
  if (pagesIdx > actionsIdx) {
    const chunk = c.slice(actionsIdx, pagesIdx);
    if (chunk.includes("    salles:")) {
      const fixed = chunk.replace(/\n    salles:[\s\S]*?\n    pieceJointe: "[^"]+",/, "");
      c = c.slice(0, actionsIdx) + fixed + c.slice(pagesIdx);
    }
  }

  const mStart = c.indexOf("  messagerie:");
  const mEnd = c.indexOf("  notificationsCentre:");
  if (mStart >= 0 && mEnd > mStart) {
    let mChunk = c.slice(mStart, mEnd);
    if (!mChunk.includes("      DIFFUSION:")) {
      mChunk = mChunk.replace(
        /(      CANAL_SALLE: "[^"]+",\n)(    \},)/,
        '$1      DIFFUSION: "Annonce institutionnelle",\n$2'
      );
      c = c.slice(0, mStart) + mChunk + c.slice(mEnd);
    }
  }

  fs.writeFileSync(p, c);
  console.log("OK", f);
}
