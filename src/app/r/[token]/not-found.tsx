import Link from "next/link";

export default function RecuIntrouvable() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-100 px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        HAM Laboratoire
      </p>
      <h1 className="mt-3 text-xl font-bold text-slate-900">Reçu introuvable</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Ce lien QR n’est plus valide ou ne correspond à aucune facture.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-[#0f2744] px-4 py-2.5 text-sm font-semibold text-white"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
