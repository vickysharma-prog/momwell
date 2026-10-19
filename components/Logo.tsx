// The Momwell signature: the name in Fraunces soft italic, signed with a small honey heart. Under 24px the heart
// drops away, it only blurs that small.
const HEART = "M12 21C5 15 2 11.5 2 8c0-3 2.5-5 5-5 2 0 4 1.2 5 3 1-1.8 3-3 5-3 2.5 0 5 2 5 5 0 3.5-3 7-10 13z";

export function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-start text-[var(--brand)] ${className}`} style={{ fontSize: size }} aria-label="Momwell" role="img">
      <span className="font-signature leading-none" aria-hidden="true">
        momwell
      </span>
      {size >= 24 && (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="shrink-0" style={{ width: "0.27em", height: "0.27em", margin: "-0.05em 0 0 0.02em" }}>
          <path d={HEART} fill="var(--honey)" />
        </svg>
      )}
    </span>
  );
}
