import { headers } from "next/headers";
import { CopyLink } from "@/components/CopyLink";
import { signOut } from "@/lib/auth/actions";
import { SCOPE_LABEL, SCOPES, type Scope } from "@/lib/people/access";
import { cancelInvite, createInvite, removeLink, setSees } from "@/lib/people/actions";
import { requireMe } from "@/lib/people/me";

type Linked = { mother_id: string; person_id: string; kind: string; relation: string; partner: boolean; sees: Scope[]; other: { name: string } };

export default async function Home() {
  const { db, me } = await requireMe();
  const mine = me.role === "mother";
  const [{ data: links }, { data: invites }] = await Promise.all([
    mine
      ? db.from("links").select("*, other:profiles!links_person_id_fkey(name)").eq("mother_id", me.id).order("created_at")
      : db.from("links").select("*, other:profiles!links_mother_id_fkey(name)").eq("person_id", me.id).order("created_at"),
    db.from("invites").select("token, kind, relation, partner").is("accepted_by", null).gt("expires_at", new Date().toISOString()).order("created_at"),
  ]);
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const people = (links ?? []) as Linked[];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Hi, {me.name}</h1>
        <form action={signOut}>
          <button className="muted underline">Sign out</button>
        </form>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{mine ? "Your people" : me.role === "care_team" ? "Your patients" : "Moms you're helping"}</h2>
        {people.length === 0 && <p className="muted">{mine ? "Invite your partner, family, friends and care team." : "Nobody yet. Accept an invite link to start."}</p>}
        {people.map((p) => (
          <article key={p.mother_id + p.person_id} className="card flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-lg font-medium">
                {p.other.name} <span className="muted font-normal">{p.partner ? "partner" : p.relation || (p.kind === "care_team" ? "care team" : "circle")}</span>
              </p>
              <form action={removeLink.bind(null, p.mother_id, p.person_id)}>
                <button className="muted text-sm underline">{mine ? "Remove" : "Leave"}</button>
              </form>
            </div>
            {mine ? (
              <form action={setSees.bind(null, p.person_id)} className="flex flex-col gap-2">
                <p className="muted text-sm">What {p.other.name} sees</p>
                <div className="flex flex-wrap gap-2">
                  {SCOPES.map((s) => (
                    <label key={s} className="btn-quiet min-h-10 cursor-pointer gap-2 text-sm has-[:checked]:border-[var(--accent)]">
                      <input type="checkbox" name={s} defaultChecked={p.sees.includes(s)} className="accent-[var(--accent)]" />
                      {SCOPE_LABEL[s]}
                    </label>
                  ))}
                </div>
                <button className="btn-quiet self-start">Save</button>
              </form>
            ) : (
              <p className="muted text-sm">Sharing with you: {p.sees.map((s) => SCOPE_LABEL[s]).join(", ") || "nothing yet"}</p>
            )}
          </article>
        ))}
      </section>

      {me.role !== "circle" && (
        <section className="card flex flex-col gap-4">
          <h2 className="text-xl font-semibold">{mine ? "Invite someone" : "Invite a patient"}</h2>
          <form action={createInvite} className="flex flex-col gap-3">
            {mine && (
              <select name="kind" className="field" defaultValue="circle">
                <option value="circle">Partner, family or friend</option>
                <option value="care_team">Someone on my care team</option>
              </select>
            )}
            <input name="relation" className="field" placeholder={mine ? "Who they are (sister, OB-GYN…)" : "Your role (OB-GYN, midwife…)"} maxLength={40} />
            {mine && (
              <label className="flex items-center gap-3 text-lg">
                <input type="checkbox" name="partner" className="size-5 accent-[var(--accent)]" /> This is my partner
              </label>
            )}
            <button className="btn">Make an invite link</button>
          </form>
          {(invites ?? []).map((i) => (
            <div key={i.token} className="flex flex-wrap items-center justify-between gap-2 border-t pt-3" style={{ borderColor: "var(--line)" }}>
              <span>{i.partner ? "Partner" : i.relation || (i.kind === "care_team" ? "Care team" : "Circle")} · waiting</span>
              <span className="flex gap-2">
                <CopyLink url={`${origin}/join/${i.token}`} />
                <form action={cancelInvite.bind(null, i.token)}>
                  <button className="btn-quiet">Cancel</button>
                </form>
              </span>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
