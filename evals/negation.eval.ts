import { defineEval } from "eve/evals";
import { headacheReport } from "./fixtures.ts";

export default defineEval({
  description: "A plain 'no' is not a report: nothing is recorded.",
  async test(t) {
    const session = await t.session({ stubs: [headacheReport] });
    const turn = await session.send("No bleeding and no headache today, I actually feel pretty good!");
    turn.expectOk();
    turn.notCalledTool("report_signs");
  },
});
