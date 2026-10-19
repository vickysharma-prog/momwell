// Every rule and every number the app shows points to one of these. Checked is when we last read the page.
export type Source = { title: string; url: string; checked: string };

export const SOURCES = {
  cdcHearHer: {
    title: "CDC Hear Her: Urgent maternal warning signs (15 May 2024)",
    url: "https://www.cdc.gov/hearher/maternal-warning-signs/index.html",
    checked: "2026-10-19",
  },
  acogBloodPressure: {
    title: "ACOG: 3 conditions to watch for after childbirth",
    url: "https://www.acog.org/womens-health/experts-and-stories/the-latest/3-conditions-to-watch-for-after-childbirth",
    checked: "2026-10-19",
  },
  nihSevereBloodPressure: {
    title: "NIH: Preeclampsia and eclampsia, emergency information",
    url: "https://health.nih.gov/health-topics-a-z/preeclampsia-eclampsia",
    checked: "2026-10-19",
  },
  lifeline988: { title: "988 Suicide & Crisis Lifeline", url: "https://988lifeline.org/", checked: "2026-10-19" },
  maternalHotline: {
    title: "HRSA National Maternal Mental Health Hotline",
    url: "https://mchb.hrsa.gov/programs-impact/national-maternal-mental-health-hotline",
    checked: "2026-10-19",
  },
} satisfies Record<string, Source>;

// Shown with any thought of harm. 988 is the crisis line; the maternal hotline says it is not one, so it comes second.
export const CRISIS_LINES = [
  { name: "988 Suicide & Crisis Lifeline", call: "988", text: "988", note: "Call or text, 24/7. Chat in English or Spanish at 988lifeline.org.", source: SOURCES.lifeline988 },
  { name: "National Maternal Mental Health Hotline", call: "1-833-852-6262", text: "1-833-852-6262", note: "1-833-TLC-MAMA. Call or text, 24/7, English and Spanish.", source: SOURCES.maternalHotline },
] as const;
