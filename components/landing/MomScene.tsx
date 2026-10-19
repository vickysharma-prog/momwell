"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// The landing page's living picture: a mother through the journey Momwell covers, pregnant and then holding her
// baby, breathing softly, with little hearts rising. Drawn from simple shapes so it stays sharp at any size.
const SKIN = "#F2CDB9";
const HAIR = "#3B2A44";
const DRESS = "#8C7BC8";
const DRESS_SHADE = "#7565B4";

const STAGES = [
  { key: "bump", label: "28 weeks", note: "Daily check-in done" },
  { key: "baby", label: "3 months old", note: "Sam took the night shift" },
] as const;

const HEART = "M12 21C5 15 2 11.5 2 8c0-3 2.5-5 5-5 2 0 4 1.2 5 3 1-1.8 3-3 5-3 2.5 0 5 2 5 5 0 3.5-3 7-10 13z";

function Mother({ stage }: { stage: "bump" | "baby" }) {
  const pregnant = stage === "bump";
  return (
    <g>
      {/* hair behind */}
      <path d="M156 122 C152 84 196 70 220 92 C232 104 230 124 220 122 C212 106 188 104 178 120 C170 150 176 182 158 214 C142 200 144 152 156 122 Z" fill={HAIR} />
      {/* neck */}
      <rect x="180" y="146" width="18" height="40" rx="9" fill={SKIN} />
      {/* dress */}
      {pregnant ? (
        <path d="M164 184 C186 174 214 178 226 198 C240 222 276 254 278 304 C280 352 254 382 238 394 C250 412 260 430 266 448 L108 448 C120 402 128 342 134 292 C139 246 144 200 164 184 Z" fill={DRESS} />
      ) : (
        <path d="M164 184 C186 174 214 178 226 198 C236 220 240 262 240 300 C240 350 238 384 238 394 C250 412 260 430 266 448 L108 448 C120 402 128 342 134 292 C139 246 144 200 164 184 Z" fill={DRESS} />
      )}
      <path d="M150 300 C146 360 140 410 132 448 L150 448 C156 410 162 360 164 300 Z" fill={DRESS_SHADE} opacity="0.55" />
      {/* head */}
      <circle cx="192" cy="126" r="31" fill={SKIN} />
      {/* fringe */}
      <path d="M163 120 C166 96 190 88 208 96 C218 100 224 110 223 118 C210 106 190 104 175 116 Z" fill={HAIR} />
      {/* face: closed, smiling eye, smile, cheek */}
      <path d="M200 126 q6 5 12 0" stroke={HAIR} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M204 141 q6 5 11 -1" stroke="#B7685C" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="214" cy="134" r="5" fill="#F2A99A" opacity="0.6" />
      {pregnant ? (
        <>
          {/* one arm curving round the top of the bump, hand resting on it */}
          <path d="M198 198 C206 232 226 262 258 286" stroke={SKIN} strokeWidth="15" fill="none" strokeLinecap="round" />
          <ellipse cx="262" cy="290" rx="11" ry="9" transform="rotate(30 262 290)" fill={SKIN} />
          {/* a soft heart glowing on the bump: the baby */}
          <path d={HEART} transform="translate(236 316) scale(0.9)" fill="#F2B84B" opacity="0.9" />
        </>
      ) : (
        <>
          {/* baby, swaddled in honey */}
          <ellipse cx="236" cy="262" rx="42" ry="26" transform="rotate(-24 236 262)" fill="#F2B84B" />
          <path d="M210 270 q22 -16 50 -26" stroke="#E0A030" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
          <circle cx="262" cy="236" r="16" fill={SKIN} />
          <path d="M256 236 q4 3 8 0" stroke={HAIR} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M254 222 q8 -8 16 0" stroke={HAIR} strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* arms cradling */}
          <path d="M196 200 C196 240 210 278 250 284" stroke={SKIN} strokeWidth="15" fill="none" strokeLinecap="round" />
          <path d="M176 214 C178 254 196 282 226 286" stroke={SKIN} strokeWidth="14" fill="none" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

export function MomScene() {
  const still = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (still) return;
    const t = setInterval(() => setI((n) => (n + 1) % STAGES.length), 5200);
    return () => clearInterval(t);
  }, [still]);
  const stage = STAGES[i];

  return (
    <div className="relative mx-auto w-full max-w-[460px]" role="img" aria-label="A mother, pregnant and then holding her baby, through the journey Momwell is with her for">
      <svg viewBox="0 0 400 470" className="w-full" aria-hidden="true">
        <defs>
          <radialGradient id="mw-glow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ECE8F6" />
            <stop offset="100%" stopColor="#F8F6FB" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="250" r="200" fill="url(#mw-glow)" />
        <motion.circle cx="200" cy="262" r="168" fill="#ECE8F6" animate={still ? undefined : { scale: [1, 1.025, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "200px 262px" }} />
        <motion.circle cx="318" cy="112" r="34" fill="#F2B84B" opacity="0.85" animate={still ? undefined : { y: [0, -6, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
        {/* soft leaves */}
        <path d="M58 360 C40 320 62 280 98 276 C100 318 86 346 58 360 Z" fill="#CFC5EC" />
        <path d="M66 352 C76 322 86 300 96 284" stroke="#B3A6E0" strokeWidth="2" fill="none" />
        <path d="M344 372 C370 340 362 300 330 290 C320 330 326 356 344 372 Z" fill="#E6DDF5" />
        <path d="M190 452 h-90 a40 12 0 0 0 180 0 Z" fill="#E3DCF2" />

        <motion.g animate={still ? undefined : { y: [0, -3, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
          <AnimatePresence mode="wait">
            <motion.g key={stage.key} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.7 }} style={{ transformOrigin: "200px 300px" }}>
              <Mother stage={stage.key} />
            </motion.g>
          </AnimatePresence>
        </motion.g>

        {/* hearts rising from mother and baby */}
        {!still &&
          [0, 1, 2].map((n) => (
            <motion.path
              key={n}
              d={HEART}
              fill={n === 1 ? "#F2B84B" : "#B3A6E0"}
              initial={{ opacity: 0, x: 258 + n * 14, y: 268, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], y: [268, 170 - n * 18], scale: [0.6, 0.9 + n * 0.1] }}
              transition={{ duration: 3.6, delay: n * 1.2, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
      </svg>

      <AnimatePresence mode="wait">
        <motion.div
          key={stage.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45 }}
          className="absolute top-6 left-0 flex items-center gap-3 rounded-2xl border border-line bg-paper-raised px-4 py-3 shadow-[0_20px_40px_-24px_rgba(31,26,46,0.35)]"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-brand">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d={HEART} fill="currentColor" />
            </svg>
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold">{stage.label}</span>
            <span className="text-xs text-ink-soft">{stage.note}</span>
          </span>
        </motion.div>
      </AnimatePresence>

      <div className="mt-2 flex items-center justify-center gap-3 text-xs font-medium text-ink-soft" aria-hidden="true">
        {["Pregnancy", "Birth", "First year"].map((s, n) => (
          <span key={s} className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 transition-colors ${(i === 0 && n === 0) || (i === 1 && n === 2) ? "bg-brand text-on-brand" : "bg-brand-soft"}`}>{s}</span>
            {n < 2 && <span className="h-px w-6 bg-line" />}
          </span>
        ))}
      </div>
    </div>
  );
}
