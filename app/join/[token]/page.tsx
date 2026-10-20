import { Screen } from "@/components/Screen";
import Link from "next/link";
import { SCOPE_LABEL, shownOnly } from "@/lib/people/access";
import { acceptInvite } from "@/lib/people/actions";
import { previewInvite } from "@/lib/people/invite";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Join({ params, searchParams }: PageProps<"/join/[token]">) {
  const { token } = await params;
  const { error } = await searchParams;
  const invite = await previewInvite(token);
  const { data } = await (await supabaseServer()).auth.getClaims();
  const signedIn = Boolean(data?.claims.sub);

  return (
    <Screen className="justify-center settle">
      {!invite || !invite.usable ? (
        <>
          <h1 className="text-3xl font-semibold">This invite has expired or was already used</h1>
          <p className="muted text-lg">Ask the person who sent it for a new link.</p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold">
            {invite.from_role === "care_team"
              ? `${invite.from_name} invited you to Momwell as their patient`
              : `${invite.from_name} invited you to ${invite.kind === "circle" ? "her circle" : "her care team"}`}
          </h1>
          {invite.from_role === "care_team" && (
            <div className="card">
              <p className="mb-2 font-medium">{invite.from_name} will see</p>
              <ul className="muted list-disc pl-5">
                {shownOnly(invite.sees).map((s) => (
                  <li key={s}>{SCOPE_LABEL[s]}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="muted text-lg">
            {invite.from_role === "care_team"
              ? "You can change this or remove them at any time."
              : invite.kind === "circle"
                ? `You'll see how to help ${invite.partner ? "as her partner" : ""}, and only what she chooses to share.`
                : "You'll see the check-ins and alerts she chooses to share with her care team."}
          </p>
          {typeof error === "string" && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {signedIn ? (
            <form action={acceptInvite.bind(null, token)}>
              <button className="btn">Accept</button>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              <Link className="btn" href={`/signup?invite=${token}`}>
                Create my account
              </Link>
              <Link className="btn-quiet" href={`/login?next=/join/${token}`}>
                I have an account
              </Link>
            </div>
          )}
        </>
      )}
    </Screen>
  );
}
