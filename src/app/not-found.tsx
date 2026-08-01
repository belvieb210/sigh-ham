import Link from "next/link";
import { Bouton } from "@/components/ui/bouton";

export default function PageIntrouvable() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-5xl font-bold text-bleu-medical">404</p>
      <h1 className="mt-2 text-xl font-bold text-texte-principal">Page introuvable</h1>
      <p className="mt-2 max-w-md text-sm text-texte-secondaire">
        La page demandée n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/" className="mt-6">
        <Bouton type="button" variante="primaire">
          Retour à l&apos;accueil
        </Bouton>
      </Link>
    </div>
  );
}
