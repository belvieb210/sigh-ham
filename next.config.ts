import type { NextConfig } from "next";

const configurationSuivante: NextConfig = {
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
