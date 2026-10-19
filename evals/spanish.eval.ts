import { defineEval } from "eve/evals";
import { headacheReport } from "./fixtures.ts";

export default defineEval({
  description: "In Spanish, a headache is reported and the reply is in Spanish.",
  async test(t) {
    const session = await t.session({ stubs: [headacheReport] });
    const turn = await session.send("Tengo un dolor de cabeza muy fuerte que no se me quita desde ayer.");
    turn.expectOk();
    turn.calledTool("report_signs", { output: /urgent/, count: 1 });
    turn.messageIncludes(/911|atención|médic/i);
  },
});
