import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const racineProjet = path.dirname(fileURLToPath(import.meta.url));

const configurationSuivante: NextConfig = {
  /** Permet un build parallèle (.next-new) sans casser le site en production. */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: racineProjet,
  /** pdfjs-dist / pdf-to-img : évite l'échec de conversion PDF en annexe (worker + cmaps). */
  serverExternalPackages: ["pdf-to-img", "pdfjs-dist", "pdf-lib"],
  outputFileTracingIncludes: {
    "/**/*": [
      "./node_modules/pdfjs-dist/cmaps/**/*",
      "./node_modules/pdfjs-dist/standard_fonts/**/*",
    ],
  },
  images: {
    /** Évite les timeouts 504 sur images distantes (réseau local instable) */
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
      {
        protocol: "https",
        hostname: "hamlab5.duckdns.org",
      },
      {
        protocol: "https",
        hostname: "**.duckdns.org",
      },
      {
        protocol: "https",
        hostname: "**.minio.**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "185.202.236.210",
      },
      {
        protocol: "https",
        hostname: "185.202.236.210",
      },
    ],
  },
};

export default configurationSuivante;
