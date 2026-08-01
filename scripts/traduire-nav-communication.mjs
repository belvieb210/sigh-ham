/**
 * Traduit nav.messagerie / nav.notifications / layout.communication dans toutes les langues.
 * Usage: node scripts/traduire-nav-communication.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const receptionDir = path.join(__dirname, "..", "src", "locales", "reception");

const TRADUCTIONS = {
  fr: { communication: "Communication", messagerie: "Messagerie", notifications: "Notifications" },
  en: { communication: "Communication", messagerie: "Messaging", notifications: "Notifications" },
  zh: { communication: "沟通", messagerie: "消息", notifications: "通知" },
  ln: { communication: "Bokabwani", messagerie: "Mesaje", notifications: "Ba sango" },
  sw: { communication: "Mawasiliano", messagerie: "Ujumbe", notifications: "Arifa" },
  kg: { communication: "Kuyitukila", messagerie: "Bansangu", notifications: "Bansangu ya kebula" },
  lua: { communication: "Kuyitukila", messagerie: "Mensaje", notifications: "Bansangu" },
  es: { communication: "Comunicación", messagerie: "Mensajería", notifications: "Notificaciones" },
  de: { communication: "Kommunikation", messagerie: "Nachrichten", notifications: "Benachrichtigungen" },
  hi: { communication: "संचार", messagerie: "संदेश", notifications: "सूचनाएं" },
  pt: { communication: "Comunicação", messagerie: "Mensagens", notifications: "Notificações" },
  he: { communication: "תקשורת", messagerie: "הודעות", notifications: "התראות" },
  ar: { communication: "التواصل", messagerie: "الرسائل", notifications: "الإشعارات" },
};

for (const [lang, vals] of Object.entries(TRADUCTIONS)) {
  const filePath = path.join(receptionDir, `${lang}.ts`);
  if (!fs.existsSync(filePath)) continue;
  let contenu = fs.readFileSync(filePath, "utf8");
  contenu = contenu.replace(
    /communication: "[^"]*"/,
    `communication: "${vals.communication}"`
  );
  contenu = contenu.replace(
    /(\n    messagerie: )"[^"]*"/,
    `$1"${vals.messagerie}"`
  );
  contenu = contenu.replace(
    /(\n    notifications: )"[^"]*"/,
    `$1"${vals.notifications}"`
  );
  fs.writeFileSync(filePath, contenu, "utf8");
  console.log(`✓ ${lang}.ts nav communication`);
}

console.log("Navigation communication traduite.");
