"use client";

const COULEURS = {
  termines: "#22c55e",
  enCours: "#3b82f6",
  enAttente: "#f97316",
  nonRealises: "#94a3b8",
} as const;

export type RepartitionExamens = {
  termines: number;
  enCours: number;
  enAttente: number;
  nonRealises: number;
};

export function GraphiqueExamensAdmin({
  data,
  labels,
  totalLabel,
}: {
  data: RepartitionExamens;
  labels: Record<keyof RepartitionExamens, string>;
  totalLabel: string;
}) {
  const segments: { cle: keyof RepartitionExamens; valeur: number; couleur: string }[] =
    [
      { cle: "termines", valeur: data.termines, couleur: COULEURS.termines },
      { cle: "enCours", valeur: data.enCours, couleur: COULEURS.enCours },
      { cle: "enAttente", valeur: data.enAttente, couleur: COULEURS.enAttente },
      { cle: "nonRealises", valeur: data.nonRealises, couleur: COULEURS.nonRealises },
    ];
  const total = segments.reduce((s, x) => s + x.valeur, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  const cx = 80;
  const cy = 80;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
      <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0" role="img" aria-label={totalLabel}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="18" />
        {total === 0 ? null : (
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            {segments.map((seg) => {
              if (seg.valeur <= 0) return null;
              const longueur = (seg.valeur / total) * c;
              const dash = `${longueur} ${c - longueur}`;
              const el = (
                <circle
                  key={seg.cle}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={seg.couleur}
                  strokeWidth="18"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += longueur;
              return el;
            })}
          </g>
        )}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="fill-slate-800"
          fontSize="22"
          fontWeight="700"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          className="fill-slate-400"
          fontSize="9"
        >
          {totalLabel}
        </text>
      </svg>
      <ul className="w-full space-y-2 text-sm">
        {segments.map((seg) => {
          const pct = total === 0 ? 0 : Math.round((seg.valeur / total) * 100);
          return (
            <li key={seg.cle} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-texte-principal">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: seg.couleur }}
                />
                {labels[seg.cle]}
              </span>
              <span className="tabular-nums text-texte-secondaire">
                <span className="font-semibold text-texte-principal">{seg.valeur}</span>
                {" · "}
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
