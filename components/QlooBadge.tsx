// Marks every choice Qloo's taste intelligence made, so it's clear what came from Qloo and what from the rules.
export function QlooBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-honey/30 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-ink ${className}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3Z" />
      </svg>
      Powered by Qloo
    </span>
  );
}
