"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useEveAgent } from "eve/react";
import type { Contact } from "@/lib/people/contacts";
import type { Reading, Reason } from "@/lib/safety/engine";
import { SIGN_PHRASE, type SignId } from "@/lib/safety/signs";
import { confirmTalk } from "@/lib/talk/actions";
import { askAbout, NOT_NOW, REPLIES, type Chip } from "@/lib/talk/replies";
import { route } from "@/lib/talk/router";
import type { LineId } from "@/lib/voice/lines";
import { ResultView } from "./ResultView";
import { Speak } from "./Speak";

type Pick = { name: string; image: string | null; address?: string | null; askFor?: string[] };
type SignsOut = { level: "urgent" | "call_doctor" | "check" | "none"; reasons: Reason[]; crisis: boolean; noteUnread: boolean };
type Part = { type: string; text?: string; id?: string; toolName?: string; state?: string; output?: unknown; toolCallId?: string };

const SUGGESTIONS = ["I have a headache that won't go away", "I feel anxious and alone", "Find me a calm show for tonight", "Where can I eat near me?"];

// The browser's speech-to-text where it exists (Chrome, Safari); typing always works.
type Recognition = { lang: string; interimResults: boolean; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null };
const speechApi = () => (typeof window === "undefined" ? null : ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => Recognition) | null);

const noop = () => () => {};

function Picks({ picks, from }: { picks: Pick[]; from?: string }) {
  if (!picks.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 [scrollbar-color:var(--line)_transparent] [scrollbar-width:thin]">
        {picks.map((p) => (
          <article key={p.name} className="w-44 shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-paper-raised">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- Qloo's image hosts vary
              <img src={p.image} alt="" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-brand-soft to-honey/30" aria-hidden="true">
                <span className="font-signature text-4xl text-brand">{p.name.slice(0, 1)}</span>
              </div>
            )}
            <div className="flex flex-col gap-1 p-3">
              <p className="text-sm leading-snug font-semibold">{p.name}</p>
              {p.address && <p className="text-xs text-ink-soft">{p.address}</p>}
              {p.askFor?.map((a) => (
                <p key={a} className="rounded-lg bg-honey/20 px-2 py-1 text-xs">
                  {a}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
      {from && <p className="text-xs font-semibold tracking-wider text-ink-soft uppercase">From {from}</p>}
    </div>
  );
}

function ToolResult({ part, contacts }: { part: Part; contacts: Contact[] }) {
  if (part.state !== "output-available") {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <span className="size-3 animate-spin rounded-full border-2 border-line border-t-brand" aria-hidden="true" />
        {part.toolName === "report_signs" ? "Checking with the warning-sign rules…" : "Looking in Qloo…"}
      </p>
    );
  }
  const out = part.output as Record<string, unknown>;
  if (part.toolName === "report_signs") return <ResultView result={out as unknown as SignsOut} contacts={contacts} />;
  if (Array.isArray(out?.picks)) return <Picks picks={out.picks as Pick[]} from={out.from as string | undefined} />;
  return null;
}

type Turn =
  | { id: number; kind: "me"; text: string }
  | { id: number; kind: "say"; text: string; chips: Chip[]; line?: LineId }
  | { id: number; kind: "ask"; signs: SignId[]; reading: Reading; text: string; state: "open" | "saving" | "done" }
  | { id: number; kind: "crisis"; signs: SignId[] }
  | { id: number; kind: "result"; result: SignsOut }
  | { id: number; kind: "agent"; from: number };
// A turn before it has an id, kept per kind.
type NewTurn = { [K in Turn["kind"]]: Omit<Extract<Turn, { kind: K }>, "id"> }[Turn["kind"]];

// "It sounds like a headache that won't go away": her words back to her, so "my" becomes "your".
const label = (id: SignId) => SIGN_PHRASE[id].replace(/\bmy\b/g, "your").replace(/\bmyself\b/g, "yourself");
const readingWords = (r: Reading) => [r.bp && `a blood pressure of ${r.bp.systolic}/${r.bp.diastolic}`, r.temp && `a temperature of ${r.temp.value}°${r.temp.unit}`].filter(Boolean) as string[];

// Talk to Momwell: type or speak. Plain rules answer first, at once: a warning sign is asked about and, once she says
// yes, decided by the rules engine; thoughts of harm bring the crisis lines straight away; how she feels gets a kind
// answer with a next step. Only the rest (shows, food and music through Qloo, anything else) waits for the model.
export function Companion({ name, contacts = [] }: { name: string; contacts?: Contact[] }) {
  const agent = useEveAgent();
  const [text, setText] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [listening, setListening] = useState(false);
  const [slow, setSlow] = useState(false);
  const rec = useRef<Recognition | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const busy = agent.status === "submitted" || agent.status === "streaming";
  // False on the server and in the first render, then what the browser supports: no hydration mismatch.
  const canSpeak = useSyncExternalStore(noop, () => Boolean(speechApi()), () => false);
  const messages = agent.data.messages as unknown as { id: string; role: string; parts: Part[] }[];

  // Braces matter: newer browsers return a promise from scrollIntoView, and an effect may only return a cleanup.
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, messages.length, agent.status]);

  const add = (...t: NewTurn[]) => setTurns((all) => [...all, ...t.map((x) => ({ ...x, id: nextId.current++ }) as Turn)]);
  const settle = (id: number, state: "saving" | "done") => setTurns((all) => all.map((t) => (t.id === id && t.kind === "ask" ? { ...t, state } : t)));

  function send(message: string) {
    const m = message.trim();
    if (!m || agent.status === "resuming") return;
    setText("");
    setSlow(false);
    const r = route(m);
    const me = { kind: "me" as const, text: m };
    if (r.kind === "crisis") return add(me, { kind: "crisis", signs: r.signs });
    if (r.kind === "confirm") return add(me, { kind: "ask", signs: r.signs, reading: r.reading, text: askAbout([...r.signs.map(label), ...readingWords(r.reading)]), state: "open" });
    if (r.kind === "feeling") return add(me, { kind: "say", ...REPLIES[r.feeling] });
    add(me, { kind: "agent", from: messages.length });
    void agent.send(m, busy ? { turnPolicy: "steer" } : undefined);
  }

  async function answer(turn: Extract<Turn, { kind: "ask" }>, yes: boolean) {
    if (!yes) {
      settle(turn.id, "done");
      return add({ kind: "say", ...NOT_NOW });
    }
    settle(turn.id, "saving");
    const saved = await confirmTalk(turn.signs, turn.reading);
    settle(turn.id, "done");
    if ("error" in saved) return add({ kind: "say", text: saved.error, chips: [{ label: "Check in", href: "/check-in" }] });
    add({ kind: "result", result: saved.result });
  }

  function listen() {
    const Api = speechApi();
    if (!Api) return;
    if (listening) return rec.current?.stop();
    const r = new Api();
    r.lang = navigator.language || "en-US";
    r.interimResults = false;
    r.onresult = (e) => send(e.results[0][0].transcript);
    r.onend = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
  }

  // The companion's messages that answer one handoff: from where it started up to the next handoff.
  const handoffs = turns.filter((t): t is Extract<Turn, { kind: "agent" }> => t.kind === "agent");
  const answerTo = (t: Extract<Turn, { kind: "agent" }>) => {
    const next = handoffs[handoffs.indexOf(t) + 1];
    return messages.slice(t.from, next?.from ?? messages.length).filter((m) => m.role === "assistant");
  };
  const lastHandoff = handoffs.at(-1);
  const answered = lastHandoff ? answerTo(lastHandoff).some((m) => m.parts.some((p) => (p.type === "text" && p.text?.trim()) || p.type === "dynamic-tool")) : true;
  const thinking = busy && !answered;

  // After 25 seconds of thinking, a quiet note, so she's never left wondering.
  useEffect(() => {
    if (!thinking) return;
    const t = setTimeout(() => setSlow(true), 25_000);
    return () => clearTimeout(t);
  }, [thinking]);

  const bubble = "max-w-[85%] rounded-3xl px-5 py-3 text-lg leading-relaxed whitespace-pre-wrap";

  return (
    <div className="flex min-h-[calc(100dvh-14rem)] flex-col gap-4">
      <div className="flex flex-1 flex-col gap-5" aria-live="polite">
        {turns.length === 0 && (
          <div className="flex flex-col gap-5 rounded-[32px] bg-brand-soft p-7">
            <p className="font-display text-3xl leading-tight">Hi {name}. How are you feeling today?</p>
            <p className="text-ink-soft">Tell me in your own words, out loud or typed. I can also find you a gentle show, food near you, or music for the hospital bag.</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} className="btn-quiet min-h-11 bg-paper-raised text-sm">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence initial={false}>
          {turns.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col gap-3 ${t.kind === "me" ? "items-end" : "items-start"}`}>
              {t.kind === "me" && <p className={`${bubble} bg-brand text-on-brand`}>{t.text}</p>}
              {t.kind === "say" && (
                <>
                  <p className={`${bubble} border border-line bg-paper-raised`}>{t.text}</p>
                  {t.line && <Speak line={t.line} />}
                  {t.chips.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {t.chips.map((c) =>
                        c.href ? (
                          <Link key={c.label} href={c.href} className={`btn-quiet min-h-11 bg-paper-raised text-sm ${c.tone === "alarm" ? "border-[var(--alarm)] text-[var(--alarm)]" : ""}`}>
                            {c.label}
                          </Link>
                        ) : (
                          <button key={c.label} type="button" onClick={() => send(c.send!)} className="btn-quiet min-h-11 bg-paper-raised text-sm">
                            {c.label}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </>
              )}
              {t.kind === "ask" && (
                <div className="flex w-full flex-col gap-3 rounded-3xl bg-alarm-soft p-5">
                  <p className="text-lg font-medium">{t.text}</p>
                  {t.state !== "done" && (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => answer(t, true)} disabled={t.state === "saving"} aria-busy={t.state === "saving"} className="btn w-auto bg-[var(--alarm)] px-6">
                        {t.state === "saving" ? "Checking…" : "Yes, it’s happening"}
                      </button>
                      <button type="button" onClick={() => answer(t, false)} disabled={t.state === "saving"} className="btn-quiet bg-paper-raised">
                        No, not now
                      </button>
                    </div>
                  )}
                </div>
              )}
              {t.kind === "crisis" && (
                <div className="w-full">
                  <ResultView result={{ level: "urgent", reasons: [], crisis: true, noteUnread: false }} contacts={contacts} />
                </div>
              )}
              {t.kind === "result" && (
                <div className="w-full">
                  <ResultView result={t.result} contacts={contacts} />
                </div>
              )}
              {t.kind === "agent" &&
                answerTo(t).flatMap((m) =>
                  m.parts.map((part, i) =>
                    part.type === "text" && part.text?.trim() ? (
                      <p key={`${m.id}-${part.id ?? i}`} className={`${bubble} border border-line bg-paper-raised`}>
                        {part.text}
                      </p>
                    ) : part.type === "dynamic-tool" ? (
                      <div key={`${m.id}-${part.toolCallId ?? i}`} className="w-full">
                        <ToolResult part={part} contacts={contacts} />
                      </div>
                    ) : null,
                  ),
                )}
            </motion.div>
          ))}
        </AnimatePresence>
        {thinking && slow && (
          <p role="status" className="rounded-2xl bg-paper-raised px-4 py-3 text-ink-soft">
            This is taking longer than usual. If something feels wrong, don’t wait:{" "}
            <Link href="/check-in" className="font-semibold text-brand underline underline-offset-4">
              check the warning signs
            </Link>
            .
          </p>
        )}
        {thinking && (
          <p className="flex gap-1.5 px-2" aria-label="Momwell is thinking">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </p>
        )}
        {agent.error && <p role="alert" className="error">Something went wrong. Please try again, or use the check-in list.</p>}
        <div ref={end} />
      </div>

      <form
        className="sticky bottom-[6.5rem] flex items-end gap-2 rounded-[28px] border border-line bg-paper-raised p-2 shadow-[0_16px_40px_-24px_rgba(31,26,46,0.4)] md:bottom-6"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(text);
            }
          }}
          rows={1}
          placeholder="Tell Momwell how you are…"
          aria-label="Message"
          className="max-h-40 min-h-12 flex-1 resize-none bg-transparent px-4 py-3 text-lg outline-none"
        />
        {canSpeak && (
          <button type="button" onClick={listen} aria-label={listening ? "Stop listening" : "Speak"} className={`flex size-12 shrink-0 items-center justify-center rounded-full transition ${listening ? "animate-pulse bg-alarm text-white" : "bg-brand-soft text-brand"}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </button>
        )}
        <button aria-label="Send" disabled={!text.trim()} className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand transition active:scale-95 disabled:opacity-40">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  );
}
