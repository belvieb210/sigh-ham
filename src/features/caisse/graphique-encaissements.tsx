"use client";

import type { PointEvolutionEncaissement } from "@/lib/caisse/types";

interface PropsGraphiqueEncaissements {
  points: PointEvolutionEncaissement[];
  labelAxeY: string;
  labelSerie: string;
}

function formaterAxe(montant: number) {
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(1)}M`;
  if (montant >= 1_000) return `${Math.round(montant / 1_000)}k`;
  return String(Math.round(montant));
}

export function GraphiqueEncaissements({
  points,
  labelAxeY,
  labelSerie,
}: PropsGraphiqueEncaissements) {
  const largeur = 420;
  const hauteur = 200;
  const margeGauche = 36;
  const margeDroite = 8;
  const margeHaut = 12;
  const margeBas = 28;
  const zoneW = largeur - margeGauche - margeDroite;
  const zoneH = hauteur - margeHaut - margeBas;

  const maxMontant = Math.max(...points.map((p) => p.montant), 1);
  const maxAxe = maxMontant * 1.15;
  const ticks = [0, 0.5, 1].map((t) => t * maxAxe);

  const coords = points.map((p, i) => {
    const x =
      points.length === 1
        ? margeGauche + zoneW / 2
        : margeGauche + (i / (points.length - 1)) * zoneW;
    const y = margeHaut + zoneH - (p.montant / maxAxe) * zoneH;
    return { x, y, ...p };
  });

  const ligne = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const aire =
    coords.length > 0
      ? `${ligne} L ${coords[coords.length - 1]!.x} ${margeHaut + zoneH} L ${coords[0]!.x} ${margeHaut + zoneH} Z`
      : "";

  const afficherLabelX = (index: number) => {
    if (points.length <= 5) return true;
    return index === 0 || index === points.length - 1 || index % 2 === 0;
  };

  return (
    <div className="w-full">
      <p className="mb-1 px-1 text-[10px] font-medium text-texte-secondaire sm:hidden">
        {labelAxeY}
      </p>
      <svg
        viewBox={`0 0 ${largeur} ${hauteur}`}
        className="h-44 w-full sm:h-52"
        role="img"
        aria-label={labelSerie}
      >
        <defs>
          <linearGradient id="fillEncaissements" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => {
          const y = margeHaut + zoneH - (tick / maxAxe) * zoneH;
          return (
            <g key={tick}>
              <line
                x1={margeGauche}
                y1={y}
                x2={largeur - margeDroite}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={margeGauche - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-400"
                fontSize="9"
              >
                {formaterAxe(tick)}
              </text>
            </g>
          );
        })}

        {aire ? <path d={aire} fill="url(#fillEncaissements)" /> : null}
        {ligne ? <path d={ligne} fill="none" stroke="#2563eb" strokeWidth="2.5" /> : null}

        {coords.map((c, i) => (
          <g key={c.date}>
            <circle cx={c.x} cy={c.y} r="3.5" fill="#2563eb" stroke="#fff" strokeWidth="2" />
            {afficherLabelX(i) ? (
              <text
                x={c.x}
                y={hauteur - 8}
                textAnchor="middle"
                className="fill-slate-500"
                fontSize="9"
              >
                {c.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>

      <div className="mt-1 flex items-center justify-center gap-2 text-xs text-texte-secondaire">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />
        {labelSerie}
      </div>
    </div>
  );
}
