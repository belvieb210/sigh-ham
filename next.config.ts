import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const racineProjet = path.dirname(fileURLToPath(import.meta.url));

const configurationSuivante: NextConfig = {
  /** Permet un build parallèle (.next-new) sans casser le site en production. */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: racineProjet,
  images: {
    /** Évite les timeouts 504 sur images distantes (réseau local instable) */
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
    ],
  },
};

export default configurationSuivante;
