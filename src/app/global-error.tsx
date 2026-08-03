"use client";

import { useEffect } from "react";

export default function ErreurGlobale({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            background: #f1f5f9;
            color: #0f172a;
            text-align: center;
          }
          h1 { margin: 0; font-size: 1.25rem; }
          p { margin: 12px 0 0; max-width: 28rem; color: #64748b; font-size: 0.95rem; }
          button {
            margin-top: 24px;
            border: 0;
            border-radius: 10px;
            padding: 12px 20px;
            background: #1e6fd9;
            color: #fff;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
          }
        `}</style>
      </head>
      <body>
        <h1>Erreur critique</h1>
        <p>L&apos;application n&apos;a pas pu s&apos;afficher correctement.</p>
        <p style={{ marginTop: 8, fontSize: "0.85rem" }}>
          Sur téléphone : fermez l&apos;onglet, videz le cache du site, puis rouvrez.
        </p>
        <button type="button" onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </body>
    </html>
  );
}
