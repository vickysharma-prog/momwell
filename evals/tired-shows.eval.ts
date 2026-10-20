import { defineEval } from "eve/evals";
import { gentleShows } from "./fixtures.ts";

export default defineEval({
  description: "Tired and asking for a show: it answers (one sign that might match, and a pick or two), never goes silent.",
  async test(t) {
    const session = await t.session({ stubs: [gentleShows] });
    const turn = await session.send("I feel so tired lately, can you suggest something gentle to watch tonight?");
    turn.expectOk();
  },
});
