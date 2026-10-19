import { defineEval } from "eve/evals";
import { headacheReport } from "./fixtures.ts";

export default defineEval({
  description: "A headache that won't stop and a high reading are reported at once, with the numbers, and she is told to get care now.",
  async test(t) {
    const session = await t.session({ stubs: [headacheReport] });
    const turn = await session.send("my head has been pounding since this morning and it won't stop. my BP is 152 over 96");
    turn.expectOk();
    turn.calledTool("report_signs", { input: { systolic: 152, diastolic: 96 }, output: /urgent/, count: 1 });
    turn.messageIncludes(/911|care now|right away/i);
  },
});
