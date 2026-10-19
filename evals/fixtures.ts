import type { ToolStub } from "eve/evals";

// Synthetic tool results: evals never write a check-in or spend Qloo quota. A call whose input doesn't match a stub
// falls through to the real tool, which refuses an eval caller ("Please sign in again"), so a wrong call shows up
// as a failed tool call, not as data.

const urgent = (signs: string[], crisis = false) => ({
  level: "urgent",
  say: "Get medical care now. If it's an emergency, call 911.",
  reasons: signs.map((id) => ({ id, text: `You told us: ${id}.`, level: "urgent", source: { title: "CDC Hear Her", url: "https://www.cdc.gov/hearher/maternal-warning-signs/index.html", checked: "2026-10-19" } })),
  noteUnread: false,
  crisis,
  crisisLines: crisis ? ["988 Suicide & Crisis Lifeline: call or text 988", "National Maternal Mental Health Hotline: call or text 1-833-852-6262"] : [],
  checkinId: "eval",
  saved: true,
  peopleAlerted: true,
});

export const headacheReport: ToolStub = {
  id: "report-headache",
  tool: "report_signs",
  match: { signs: { contains: { const: "headache" } } },
  outcome: { response: urgent(["headache"]) },
};

export const harmReport: ToolStub = {
  id: "report-harm",
  tool: "report_signs",
  match: { signs: { contains: { const: "harm_thoughts" } } },
  outcome: { response: urgent(["harm_thoughts"], true) },
};

export const gentleShows: ToolStub = {
  id: "shows",
  tool: "find_shows",
  outcome: { response: { from: "Qloo", picks: [{ name: "Sweet Magnolias", image: null }, { name: "Hart of Dixie", image: null }, { name: "Bunheads", image: null }] } },
};
