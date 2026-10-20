# Momwell: submission text

Draft for Devpost. Sections follow the form; numbers come from README's Measured table.

## Tagline

From first heartbeat to first birthday, Momwell keeps watch.

## Inspiration

It is 2:15 am and Maya is 33 weeks pregnant. Her head has hurt since lunch and the light from her phone feels too
bright. She wonders whether it is worth waking her husband, whether the doctor will think she is overreacting, and
whether it will be better by morning.

A headache that won't go away is one of the CDC's urgent maternal warning signs. Four in five pregnancy-related deaths
in the US were judged preventable by the committees that review them (CDC, 2020), and again and again the missed step
is the same: a warning sign that nobody acted on in time. One in four of those deaths had a mental health condition
among the circumstances, and Black mothers die at about three times the rate of White mothers (NCHS, 2024).

Pregnancy apps track weeks and fruit sizes. Mothers stop opening them. We wanted something she opens every day because
it is made for her, so that on the night it matters, it is already in her hand.

## What it does

Momwell is a care companion for pregnancy and the whole year after birth.

- **A daily check-in** against the CDC's 15 urgent maternal warning signs, plus blood pressure and temperature. Plain,
  tested rules decide what to do: 911 for the signs AWHONN says call 911 for (chest pain, trouble breathing, thoughts of
  hurting yourself) and for 160/110 or higher (NIH); for every other sign, call her doctor now. Her doctor and her
  partner are one tap away, with the words to say and CDC's steps for getting care, and Momwell breathes along with her
  while she waits for a call back.
- **Talk to Momwell**, typed or spoken. It answers at once: a warning sign is asked about before anything is recorded,
  thoughts of harm bring 988 and the maternal mental health hotline straight away, and how she feels gets a kind answer
  with a next step.
- **A mood check** every two weeks (PHQ-2, then PHQ-9 when it points that way, per ACOG's guideline), and **her baby's
  check-in** through the first year (AAP and Children's Hospital Colorado).
- **Her people, as one team.** Her partner gets an alert the moment she needs him. Her care team sees a triage queue
  with the reason each patient needs a look, blood pressure against the 140/90 and 160/110 lines, and a visit summary.
  She asks for a meal or the night feeds and her family takes it with one tap. She decides who sees what, enforced by
  row-level security.
- **Made for her, through Qloo.** Shows like the ones she loves with grief and pregnancy scares left out, places to eat
  near her that fit her diet with the FDA's advice for each, a calm birth playlist, and dinner ideas her family can
  bring.

## How we used Qloo

Qloo is the reason she comes back, and coming back is how a sign gets caught. Momwell's agent has three Qloo tools,
`find_shows`, `find_food` and `find_music`, built on Qloo's Insights API with her liked shows, films and artists as
signals, her city as the location, and her diet as tag filters. Talk's rules call the same tools straight away for the
requests they recognise.

Every Qloo answer passes through tested rules before she sees it. Safe Watch filters out loss, grief, pregnancy scares
and horror by tag and checks again on the results. Food must be a real meal: no bars or distilleries, no mall, event
hall or club that merely has a café, and no steakhouse for a vegetarian, with vegetarian restaurants first. Each place
carries what to ask for in pregnancy, from the FDA. Qloo answers are cached in Postgres, so the live app and repeat
questions spend no quota.

Without Qloo, Momwell is one more symptom tracker that mothers stop opening.

## How we built it

- **Next.js 16** (App Router, React 19 server actions) on **Vercel**, running in Sydney next to the database.
- **Supabase**: Postgres with row-level security for every scope she controls, realtime alerts, and the Qloo cache.
- **The safety core is plain TypeScript**: the CDC signs, AWHONN's 911 tier, ACOG and NIH blood pressure lines, AAP
  baby signs and PHQ scoring, each rule with its source and a versioned engine. Every check-in has a *How this was
  decided* view: her words or her taps, each rule with its source, which call it showed, who was told and whether her
  care team has seen it.
- **eve** for the agent (Gemini), with tools for reporting signs and for Qloo. The model can only add a sign, never
  remove one, and the rules decide.
- **Voice**: fixed lines recorded once with Gemini TTS, so Momwell greets her by name and reads her results aloud with
  no model call at the moment it matters.

## Challenges

- Making Talk instant and safe at once. We put plain rules in front of the model: they catch every warning sign in our
  labelled set and flag no everyday message, and the model handles only what is left.
- Deciding when to say 911. CDC says every warning sign needs care right away; we used AWHONN's POST-BIRTH handout to
  separate the 911 signs from the call-your-doctor-now signs, so the screen is right instead of loud.
- Qloo's place results include event halls, malls and bike shops with a café inside. We wrote rules from real results
  and tested each one.

## Accomplishments

- 40 of 40 warning signs found in labelled messages, 0 of 20 everyday messages flagged, and the companion 60 of 60 on
  the same set.
- 170 unit tests, 38 row-level security and Qloo integration tests, 25 browser tests across mother, partner and care
  team, and 12 agent eval suites (crisis, no diagnosis, no medicine advice, prompt injection, Spanish, baby signs).
- A one-click demo family that opens at once and moves through the story from pregnancy to six weeks after birth.

## What we learned

The most useful thing an app can do in an emergency is be specific: who to call, what to say, and what to do while
waiting. And the way to be there in an emergency is to be worth opening on an ordinary day.

## What's next

Clinics and health plans offering Momwell to their patients (remote blood pressure programs already pay for this kind
of follow-up), Spanish across every screen, text-message check-ins, and appointment reminders tied to the
postpartum visits ACOG recommends.

## Why Momwell deserves first prize

- **Impact:** it aims at the US's most preventable deaths, through the step that is missed most often.
- **Qloo is load-bearing:** taste is what makes her open it daily, and every Qloo answer is shaped by rules for
  pregnancy.
- **Technology you can audit:** rules from official sources decide, the model only notices, and every decision shows
  its work.
- **Design for the moment:** at 2:15 am she gets one clear action, a calm voice, her people one tap away, and the words
  to say.
