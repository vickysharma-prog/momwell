import { defineAgent } from "eve";
import { chatModel } from "../lib/models.ts";

export default defineAgent({
  // It works through tool calls, so a full model leads and a lite one stands in only when the others are out of quota.
  model: chatModel(process.env, { tools: true }),
  // Momwell only talks and calls its own tools: no shell, files, web or sandbox.
  defaultTools: false,
});
