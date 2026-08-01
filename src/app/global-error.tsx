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
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#f1f5f9] px-4 font-sans text-center">
        <h1 className="text-xl font-bold text-slate-900">Erreur critique</h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          L&apos;application n&apos;a pas pu s&apos;afficher correctement.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-[#1e6fd9] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
