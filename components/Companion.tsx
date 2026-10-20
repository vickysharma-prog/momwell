"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useEveAgent } from "eve/react";
import type { Contact } from "@/lib/people/contacts";
import type { Reason } from "@/lib/safety/engine";
import { SIGNS } from "@/lib/safety/signs";
import { signsInWords } from "@/lib/safety/words";
import { hush, say } from "@/lib/voice/say";
import { ResultView } from "./ResultView";

type Pick = { name: string; image: string | null; address?: string | null; askFor?: string[] };
type SignsOut = { level: "urgent" | "call_doctor" | "check" | "none"; reasons: Reason[]; crisis: boolean; noteUnread: boolean };
type Part = { type: string; text?: string; id?: string; toolName?: string; state?: string; output?: unknown; toolCallId?: string };

const SUGGESTIONS = ["Find me a calm show for tonight", "Where can I eat near me?", "Music for my hospital bag", "I have a headache that won't go away"];

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

// Talk to Momwell: type or speak. Her words are also scanned in the browser for warning signs, so the list is one
// tap away even before the model answers.
export function Companion({ name, contacts = [] }: { name: string; contacts?: Contact[] }) {
  const agent = useEveAgent();
  const [text, setText] = useState("");
  const [flagged, setFlagged] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const rec = useRef<Recognition | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const busy = agent.status === "submitted" || agent.status === "streaming";
  // False on the server and in the first render, then what the browser supports: no hydration mismatch.
  const canSpeak = useSyncExternalStore(noop, () => Boolean(speechApi()), () => false);

  // Braces matter: newer browsers return a promise from scrollIntoView, and an effect may only return a cleanup.
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [agent.data.messages.length, agent.status]);

  function send(message: string) {
    const m = message.trim();
    if (!m || agent.status === "resuming") return;
    const hits = signsInWords(m);
    if (hits.length) setFlagged(hits.map((id) => SIGNS.find((s) => s.id === id)!.label));
    setSlow(false);
    void agent.send(m, busy ? { turnPolicy: "steer" } : undefined);
    setText("");
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

  const messages = agent.data.messages as unknown as { id: string; role: string; parts: Part[] }[];
  const last = messages.at(-1);
  // Thinking until the answer shows something: a streaming turn with nothing in it yet still looks alive.
  const answered = last?.role === "assistant" && last.parts.some((p) => (p.type === "text" && p.text?.trim()) || p.type === "dynamic-tool");
  const thinking = busy && !answered;

  // After 25 seconds of thinking, a quiet note, so she's never left wondering.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!thinking) return;
    const t = setTimeout(() => setSlow(true), 25_000);
    return () => clearTimeout(t);
  }, [thinking]);

  // Momwell's replies are spoken as they finish, never the history a page reloads with. A warning-sign result speaks
  // its own recorded line instead.
  const spoken = useRef<string | null>(null);
  useEffect(() => {
    if (spoken.current === null || agent.status === "resuming") {
      spoken.current = last?.id ?? "";
      if (!last) say(`Hi ${name}. How are you feeling today?`);
      return;
    }
    if (busy || !last || last.role !== "assistant" || last.id === spoken.current) return;
    spoken.current = last.id;
    if (last.parts.some((p) => p.type === "dynamic-tool" && p.toolName === "report_signs")) return;
    const reply = last.parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join(" ").trim();
    if (reply) say(reply);
  }, [busy, last, agent.status, name]);
  useEffect(() => hush, []);

  return (
    <div className="flex min-h-[calc(100dvh-14rem)] flex-col gap-4">
      <div className="flex flex-1 flex-col gap-5" aria-live="polite">
        {messages.length === 0 && (
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
          {messages.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col gap-3 ${m.role === "user" ? "items-end" : "items-start"}`}>
              {m.parts.map((part, i) =>
                part.type === "text" && part.text?.trim() ? (
                  <p key={part.id ?? i} className={`max-w-[85%] rounded-3xl px-5 py-3 text-lg leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-brand text-on-brand" : "border border-line bg-paper-raised"}`}>
                    {part.text}
                  </p>
                ) : part.type === "dynamic-tool" ? (
                  <div key={part.toolCallId ?? i} className="w-full">
                    <ToolResult part={part} contacts={contacts} />
                  </div>
                ) : null,
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

      {flagged.length > 0 && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-alarm-soft p-4">
          <p className="font-medium">Is this happening now? {flagged.join(", ")}.</p>
          <Link href="/check-in" className="btn w-auto bg-alarm px-6 text-sm">
            Check the warning signs
          </Link>
        </div>
      )}

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
