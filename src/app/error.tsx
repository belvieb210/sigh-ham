"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";

export default function PageErreur({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </div>
      <h1 className="text-xl font-bold text-texte-principal">Une erreur est survenue</h1>
      <p className="mt-2 max-w-md text-sm text-texte-secondaire">
        Le chargement de la page a échoué. Vous pouvez réessayer ou revenir à l&apos;accueil.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Bouton type="button" variante="primaire" onClick={reset}>
          Réessayer
        </Bouton>
        <Link href="/">
          <Bouton type="button" variante="contour">
            Accueil
          </Bouton>
        </Link>
      </div>
    </div>
  );
}
