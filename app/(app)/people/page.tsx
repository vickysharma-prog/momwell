import { headers } from "next/headers";
import { AppPage } from "@/components/AppPage";
import { CopyLink } from "@/components/CopyLink";
import { PhoneForm } from "@/components/people/PhoneForm";
import { SCOPE_LABEL, SCOPES, type Scope } from "@/lib/people/access";
import { cancelInvite, createInvite, removeLink, setSees } from "@/lib/people/actions";
import { requireMe } from "@/lib/people/me";

type Linked = { mother_id: string; person_id: string; kind: string; relation: string; partner: boolean; sees: Scope[]; other: { name: string } };

// Her people and what each one sees; for her circle, the moms they help; for clinicians, their patients and invites.
export default async function People() {
  const { db, me } = await requireMe();
  const mine = me.role === "mother";
  const [{ data: links }, { data: invites }, { data: own }] = await Promise.all([
    mine
      ? db.from("links").select("*, other:profiles!links_person_id_fkey(name)").eq("mother_id", me.id).order("created_at")
      : db.from("links").select("*, other:profiles!links_mother_id_fkey(name)").eq("person_id", me.id).order("created_at"),
    db.from("invites").select("token, kind, relation, partner").is("accepted_by", null).gt("expires_at", new Date().toISOString()).order("created_at"),
    db.from("profiles").select("phone").eq("id", me.id).single(),
  ]);
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const people = (links ?? []) as Linked[];

  return (
    <AppPage>
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl">{mine ? "Your people" : me.role === "care_team" ? "Your patients" : "Moms you’re helping"}</h1>
        <p className="text-lg text-ink-soft">{mine ? "Everyone sees only what you choose. Change it, or remove someone, any time." : "You see only what each mom chooses to share."}</p>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4" aria-label="People">
          {people.length === 0 && (
            <div className="rounded-3xl border border-dashed border-line p-8 text-center text-ink-soft">{mine ? "No one yet. Invite your partner, family, friends and care team." : "Nobody yet. Accept an invite link to start."}</div>
          )}
          {people.map((p) => (
            <article key={p.mother_id + p.person_id} className="card flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand">{p.other.name.slice(0, 1).toUpperCase()}</span>
                <p className="text-lg font-medium">
                  {p.other.name} <span className="font-normal text-ink-soft">{p.partner ? "partner" : p.relation || (p.kind === "care_team" ? "care team" : "circle")}</span>
                </p>
                <form action={removeLink.bind(null, p.mother_id, p.person_id)} className="ml-auto">
                  <button className="text-sm text-ink-soft underline underline-offset-4">{mine ? "Remove" : "Leave"}</button>
                </form>
              </div>
              {mine ? (
                <form action={setSees.bind(null, p.person_id)} className="flex flex-col gap-3">
                  <p className="text-sm text-ink-soft">What {p.other.name} sees</p>
                  <div className="flex flex-wrap gap-2">
                    {SCOPES.map((s) => (
                      <label key={s} className="btn-quiet min-h-10 cursor-pointer gap-2 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                        <input type="checkbox" name={s} defaultChecked={p.sees.includes(s)} className="accent-[var(--brand)]" />
                        {SCOPE_LABEL[s]}
                      </label>
                    ))}
                  </div>
                  <button className="btn-quiet self-start">Save</button>
                </form>
              ) : (
                <p className="text-sm text-ink-soft">Sharing with you: {p.sees.map((s) => SCOPE_LABEL[s]).join(", ") || "nothing yet"}</p>
              )}
            </article>
          ))}
        </section>

        <div className="flex flex-col gap-6 lg:sticky lg:top-8">
        <PhoneForm phone={own?.phone ?? null} mother={mine} />
        {me.role !== "circle" && (
          <section className="card flex flex-col gap-4">
            <h2 className="text-2xl">{mine ? "Invite someone" : "Invite a patient"}</h2>
            <form action={createInvite} className="flex flex-col gap-3">
              {mine && (
                <select name="kind" className="field" defaultValue="circle" aria-label="Who you are inviting">
                  <option value="circle">Partner, family or friend</option>
                  <option value="care_team">Someone on my care team</option>
                </select>
              )}
              <input name="relation" className="field" placeholder={mine ? "Who they are (sister, OB-GYN…)" : "Your role (OB-GYN, midwife…)"} maxLength={40} aria-label="Who they are" />
              {mine && (
                <label className="flex items-center gap-3 text-lg">
                  <input type="checkbox" name="partner" className="size-5 accent-[var(--brand)]" /> This is my partner
                </label>
              )}
              <button className="btn">Make an invite link</button>
            </form>
            {(invites ?? []).map((i) => (
              <div key={i.token} className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
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
        </div>
      </div>
    </AppPage>
  );
}
