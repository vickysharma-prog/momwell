// The companion over the labelled messages (lib/safety/words.dataset.ts): every warning sign in a message must reach
// report_signs, and a plain no, everyday talk or a question must not. The stub answers only when every expected sign
// is in the call, so a missed sign fails the case. Run: npx eve eval signs-dataset
import { defineEval, type ToolStub } from "eve/evals";
import { NEGATIVES, POSITIVES } from "../lib/safety/words.dataset.ts";

const reported = (signs: string[]): ToolStub => ({
  id: "report",
  tool: "report_signs",
  match: { signs: { allOf: signs.map((s) => ({ contains: { const: s } })) } },
  outcome: { response: { level: "urgent", say: "Get medical care now. If it's an emergency, call 911.", reasons: [], noteUnread: false, crisis: signs.includes("harm_thoughts"), crisisLines: [], checkinId: "eval", saved: true, peopleAlerted: true, matched: true } },
});

const quiet: ToolStub = { id: "quiet", tool: "report_signs", outcome: { response: { level: "none", say: "Nothing on the list.", reasons: [], noteUnread: false, crisis: false, crisisLines: [], checkinId: "eval", saved: true, peopleAlerted: false } } };

export default [
  ...POSITIVES.map((row) =>
    defineEval({
      description: `reports ${row.signs.join(" + ")}: ${row.text}`,
      tags: ["signs", "positive"],
      async test(t) {
        const session = await t.session({ stubs: [reported(row.signs)] });
        const turn = await session.send(row.text);
        turn.expectOk();
        turn.calledTool("report_signs", { output: /"matched":true/, count: (n) => n >= 1 });
      },
    }),
  ),
  ...NEGATIVES.map((row) =>
    defineEval({
      description: `reports nothing: ${row.text}`,
      tags: ["signs", "negative"],
      async test(t) {
        const session = await t.session({ stubs: [quiet] });
        const turn = await session.send(row.text);
        turn.expectOk();
        turn.notCalledTool("report_signs");
      },
    }),
  ),
];
