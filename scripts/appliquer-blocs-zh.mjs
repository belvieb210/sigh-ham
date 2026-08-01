/**
 * Remplace messagerie / notificationsCentre dans zh.ts par les blocs chinois.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zhPath = path.join(__dirname, "..", "src", "locales", "reception", "zh.ts");

function remplacerBloc(contenu, cle, remplacement) {
  const motif = new RegExp(`\\n  ${cle}: \\{`);
  const match = motif.exec(contenu);
  if (!match) throw new Error(`Bloc ${cle} introuvable`);
  const debut = match.index + 1;
  let i = contenu.indexOf("{", debut);
  let depth = 0;
  for (; i < contenu.length; i++) {
    if (contenu[i] === "{") depth++;
    else if (contenu[i] === "}") {
      depth--;
      if (depth === 0) {
        return contenu.slice(0, debut) + `  ${cle}: ${remplacement},` + contenu.slice(i + 1);
      }
    }
  }
  throw new Error(`Fin bloc ${cle} introuvable`);
}

let contenu = fs.readFileSync(zhPath, "utf8");

if (!contenu.includes('from "./blocs/messagerie-zh"')) {
  contenu = contenu.replace(
    'import type { ReceptionFr } from "./fr";',
    `import type { ReceptionFr } from "./fr";
import { messagerieZh } from "./blocs/messagerie-zh";
import { notificationsCentreZh } from "./blocs/notifications-zh";`
  );
}

contenu = contenu.replace('communication: "Communication",', 'communication: "沟通",');
contenu = contenu.replace('messagerie: "Messagerie",', 'messagerie: "消息",');
contenu = contenu.replace('notifications: "Notifications",', 'notifications: "通知",');

contenu = remplacerBloc(contenu, "messagerie", "messagerieZh");
contenu = remplacerBloc(contenu, "notificationsCentre", "notificationsCentreZh");

fs.writeFileSync(zhPath, contenu, "utf8");
console.log("zh.ts mis à jour avec blocs chinois.");
