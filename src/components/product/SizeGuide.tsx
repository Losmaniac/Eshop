import { formatNumber } from "@/lib/format";

/** Panel next to a 180 cm person, to scale. */
export function SizeGuide({ widthMm, heightMm, round }: { widthMm: number; heightMm: number; round?: boolean }) {
  const H = 2200; // drawing height in mm (floor to top)
  const W = Math.max(2600, widthMm + 1400);
  const panelBottom = 900;
  const panelX = 1100;
  const scale = 220 / H;
  const h = heightMm;
  return (
    <figure className="card p-4">
      <svg viewBox={`0 0 ${W * scale} ${H * scale}`} className="mx-auto h-auto max-h-56 w-full" role="img" aria-label={`Dekorace ${formatNumber(widthMm)} mm vedle postavy vysoké 180 cm`}>
        <line x1="0" y1={H * scale} x2={W * scale} y2={H * scale} stroke="#c9c4bd" strokeWidth="1" />
        {/* person, 180 cm */}
        <g fill="#c9c4bd" transform={`translate(${350 * scale} ${(H - 1800) * scale}) scale(${scale})`}>
          <circle cx="0" cy="120" r="115" />
          <rect x="-190" y="260" width="380" height="720" rx="120" />
          <rect x="-170" y="900" width="150" height="900" rx="70" />
          <rect x="20" y="900" width="150" height="900" rx="70" />
        </g>
        {round ? (
          <circle
            cx={(panelX + widthMm / 2) * scale}
            cy={(H - panelBottom - h / 2) * scale}
            r={(h / 2) * scale}
            fill="none"
            stroke="#b4532a"
            strokeWidth="3"
          />
        ) : (
          <rect
            x={panelX * scale}
            y={(H - panelBottom - h) * scale}
            width={widthMm * scale}
            height={h * scale}
            fill="rgb(180 83 42 / 0.12)"
            stroke="#b4532a"
            strokeWidth="2"
          />
        )}
        <text x={(panelX + widthMm / 2) * scale} y={(H - panelBottom + 130) * scale} textAnchor="middle" fontSize="10" fill="#5c5a57">
          {formatNumber(round ? h : widthMm)} mm
        </text>
        <text x={350 * scale} y={(H - 1800 - 40) * scale} textAnchor="middle" fontSize="10" fill="#5c5a57">
          180 cm
        </text>
      </svg>
      <figcaption className="mt-2 text-sm text-muted">Velikost v poměru k postavě vysoké 180 cm.</figcaption>
    </figure>
  );
}
