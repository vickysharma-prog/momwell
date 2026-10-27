# Momwell build log

Momwell was built from scratch during the Qloo Agentic Hackathon, from 19 to 30 October 2026, by one person. This is
the log of that build, one entry per day, newest first: what was built, how Qloo drives it, and how each piece was
checked. Every day ends with the unit tests passing, a clean type check, and a deploy to
[momwell-one.vercel.app](https://momwell-one.vercel.app).

**Qloo through the build:** about 70 live Qloo calls on day one to learn what it knows about shows, food, music and
places for a pregnant mother, then Safe Watch, food by taste and diet with the FDA's notes, the birth playlist and
Qloo as the companion's own tools (19 Oct); Safe Watch reading a theme in any of Qloo's tag namespaces, Today's plan,
where a planner agent chooses an evening from Qloo's picks, and one Powered by Qloo mark wherever Qloo made the choice
(20 Oct); the food rules checked against every real place Qloo returned (27 Oct).

---

## 27 October: food on real data, Talk speaks, the submission

- **Food, checked against every place Qloo returned:** the rules now keep a restaurant that also has a bar or hosts
  events when Qloo names its kitchen (a sushi bar, a vegan gastropub, a Tex-Mex landmark), and leave out cake shops,
  bubble tea and a bar & grill without one. Wine bars, pubs, breweries and clubs stay out.
- **Every fixed answer in Talk speaks** in Momwell's recorded voice, word for word what's on screen, held by a test.
- **A check that listens:** each recording is transcribed and compared with its line, so a voice that says the name
  wrong is caught before a mother hears it.
- **The submission:** the story, the problem with every number checked against its source, and a walk through the
  six-step story as each role.

## 20 October: her people, her mood, her baby, the right call, Today's plan

- **Today's plan:** a planner agent asks Qloo for a show, a place for dinner and an artist, chooses one evening, and
  writes a note to her and one to her family. Rules keep only what Qloo returned and drop any note about her health;
  when the model can't answer, the rules put the plan together from Qloo's first picks and say so. The rules' first
  step (an open warning, her check-in, her mood check) sits on top.
- **Powered by Qloo** on For you, Talk's picks, Help's dinner ideas, the Qloo tiles on Today and the plan.
- **Her own time zone** for every time and for what counts as today.
- **Her baby's doctor** on her People page, called first for a warning about the baby.
- Safe Watch also leaves out a marriage ending in the year after birth.

- **The right call, not always 911:** AWHONN's POST-BIRTH guidance names the signs that mean 911 (chest pain, trouble
  breathing, thoughts of harm) and NIH sets 160/110 as the blood pressure emergency line. Every other warning says
  call your doctor now, with her doctor and partner as one-tap call buttons and the words to say.
- **While she gets care:** the CDC's steps for talking with a provider, and breathing along with her for a
  call-your-doctor sign (NHS).
- **Talk, rules first:** crisis words bring the crisis lines at once, a warning sign is asked about and recorded only
  when she says yes, and how she feels gets a kind answer with a next step. Qloo's picks come straight from the
  companion's own tools.
- **Momwell speaks:** a short spoken guide on each main screen for each role, a greeting when the app opens, soft
  sounds for taps, and one switch for all of it.
- **The demo:** two families wait ready, so "Try it as Maya" opens in a moment; a bar switches between Maya, Sam and
  Dr Lee, and a six-step story walks a visitor through.
- **Every role's Today:** Sam can call Maya in one tap, take something on, plan a night in through Qloo and read her
  warning signs; Dr Lee can call a patient from the queue and reads which call she was told to make.
- **Checked as a judge would,** in the browser: the landing names its sources, a warning says who was told, Safe
  Watch catches a theme in any of Qloo's tag namespaces, and Talk keeps the conversation after she confirms a sign.
- Functions run in Sydney next to the database, which made every screen much faster.

- **Help from her people:** she asks for a meal, the night feeds, groceries, company or a ride; her circle takes it
  with one tap, under database rules that only let them say who took it.
- **The mood check:** the PHQ-2, then the PHQ-9 when it points that way, scored by tested rules at every band boundary
  (ACOG's guideline). A thought of harm goes through the check-in path, so it alerts and opens the crisis screen. A
  positive screen puts her on her care team's call-her list.
- **Her baby's check-in** for the first year, from the AAP and Children's Hospital Colorado, every rule and threshold
  tested. Her partner sees the baby's check-ins without seeing hers.
- **Food through rules:** a real meal, no bars, malls or event halls, and for a vegetarian no steakhouse. The FDA's
  notes follow her diet.
- **Measured:** the companion scores 60 of 60 on the labelled set of messages.
- A browser test for every journey across the three roles.

## 19 October: the idea, the people, the warning signs, Qloo

- **The idea:** tested Qloo for pregnancy and family; gathered the sources (CDC Hear Her, ACOG, NIH, AAP, the PHQ
  screeners, the FDA's food guidance, the NPI Registry).
- **The people:** sign-up with a role, invites from either side, and her control over what each person sees, enforced
  by row-level security in the database and tested as each role.
- **The warning-signs engine** on official sources: the CDC's 15 urgent maternal warning signs, ACOG's 140/90 and NIH's
  160/110. Readings that can't be real are asked again, never read as fine. No output names a condition.
- **Check-ins and alerts** with "Seen", and a *How this was decided* view on every check-in.
- **Brand:** the Signature logo in Fraunces with a honey heart, lavender, one calm light look.
- **Qloo:** Safe Watch leaves out shows Qloo tags with a mother's death or cancer; food near her with the FDA's notes;
  a birth playlist. Every Qloo answer is cached, so a repeat question is instant.
- The landing page, the app shell and Momwell's first recorded lines.
