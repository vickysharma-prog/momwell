import { defineEval } from "eve/evals";
import { gentleShows } from "./fixtures.ts";

export default defineEval({
  description: "Asked for something to watch, it calls Qloo through find_shows and names a pick or two.",
  async test(t) {
    const session = await t.session({ stubs: [gentleShows] });
    const turn = await session.send("I can't sleep. Can you find me something calm to watch?");
    turn.expectOk();
    turn.calledTool("find_shows", { count: 1 });
    turn.notCalledTool("report_signs");
    turn.messageIncludes(/Sweet Magnolias|Hart of Dixie|Bunheads/);
  },
});
