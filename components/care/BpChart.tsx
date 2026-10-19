// Her blood pressure over time, with the two lines that matter: 140/90 (call her doctor) and 160/110 (care now).
// Plain SVG, drawn on the server.
type Point = { at: string; systolic: number; diastolic: number };

const W = 720;
const H = 260;
const PAD = { l: 44, r: 16, t: 16, b: 32 };
const MIN = 50;
const MAX = 190;

export function BpChart({ points }: { points: Point[] }) {
  if (points.length === 0) return <p className="rounded-2xl border border-dashed border-line p-6 text-ink-soft">No blood pressure readings yet.</p>;
  const sorted = [...points].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const t0 = Date.parse(sorted[0].at);
  const t1 = Math.max(Date.parse(sorted[sorted.length - 1].at), t0 + 86_400_000);
  const x = (at: string) => PAD.l + ((Date.parse(at) - t0) / (t1 - t0)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - (Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN)) * (H - PAD.t - PAD.b);
  const line = (k: "systolic" | "diastolic") => sorted.map((p, i) => `${i ? "L" : "M"}${x(p.at).toFixed(1)} ${y(p[k]).toFixed(1)}`).join(" ");
  const day = (at: string) => new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <figure className="flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Blood pressure, ${sorted.length} readings, latest ${sorted[sorted.length - 1].systolic}/${sorted[sorted.length - 1].diastolic}`}>
        {[60, 90, 110, 140, 160, 180].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--ink-soft)">
              {v}
            </text>
          </g>
        ))}
        <rect x={PAD.l} y={y(MAX)} width={W - PAD.l - PAD.r} height={y(160) - y(MAX)} fill="var(--alarm)" opacity="0.07" />
        <line x1={PAD.l} x2={W - PAD.r} y1={y(160)} y2={y(160)} stroke="var(--alarm)" strokeDasharray="5 4" strokeWidth="1.5" />
        <line x1={PAD.l} x2={W - PAD.r} y1={y(140)} y2={y(140)} stroke="var(--honey)" strokeDasharray="5 4" strokeWidth="1.5" />
        <line x1={PAD.l} x2={W - PAD.r} y1={y(110)} y2={y(110)} stroke="var(--alarm)" strokeDasharray="2 4" strokeWidth="1" />
        <line x1={PAD.l} x2={W - PAD.r} y1={y(90)} y2={y(90)} stroke="var(--honey)" strokeDasharray="2 4" strokeWidth="1" />
        <path d={line("systolic")} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={line("diastolic")} fill="none" stroke="var(--brand)" strokeOpacity="0.45" strokeWidth="2.5" strokeLinejoin="round" />
        {sorted.map((p) => (
          <g key={p.at}>
            <circle cx={x(p.at)} cy={y(p.systolic)} r="4" fill={p.systolic >= 160 ? "var(--alarm)" : p.systolic >= 140 ? "var(--honey)" : "var(--brand)"} />
            <circle cx={x(p.at)} cy={y(p.diastolic)} r="3.5" fill={p.diastolic >= 110 ? "var(--alarm)" : p.diastolic >= 90 ? "var(--honey)" : "var(--brand)"} opacity="0.8" />
          </g>
        ))}
        <text x={PAD.l} y={H - 8} fontSize="11" fill="var(--ink-soft)">
          {day(sorted[0].at)}
        </text>
        <text x={W - PAD.r} y={H - 8} fontSize="11" fill="var(--ink-soft)" textAnchor="end">
          {day(sorted[sorted.length - 1].at)}
        </text>
      </svg>
      <figcaption className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
        <span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-brand" /> Systolic</span>
        <span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-brand/45" /> Diastolic</span>
        <span className="flex items-center gap-2"><span className="h-0.5 w-5 border-t-2 border-dashed border-honey" /> 140/90: call her doctor (ACOG)</span>
        <span className="flex items-center gap-2"><span className="h-0.5 w-5 border-t-2 border-dashed border-alarm" /> 160/110: care now (NIH)</span>
      </figcaption>
    </figure>
  );
}
