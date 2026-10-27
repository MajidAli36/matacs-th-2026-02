/**
 * Offline prototype: rule gate + numeric weighted scores.
 * Soft criteria (experience, team) use simple deterministic heuristics
 * so this runs without an API key. Not a substitute for Prompt 2 in PROMPTS.md.
 *
 * Usage: node prototype/score_samples.mjs
 */

const BUDGET_CEILING = 260000;
const MAX_WEEKS = 16;

const weights = {
  experience: 0.3,
  price: 0.25,
  timeline: 0.15,
  warranty: 0.15,
  team: 0.15,
};

/** Fixture extractions — stand-ins for Prompt 1 output. Letters only, no brief prose. */
const extractions = {
  A: {
    licence: { claimed: true, holder: "bidder", id: "present" },
    wsib_clearance_stated: true,
    liability_insurance_cad_millions: 5,
    relevant_projects: { count_stated: 14, min_kw_mentioned: 100 },
    total_price_cad: 238000,
    timeline_weeks: 12,
    timeline_is_firm: true,
    panel_warranty_years: 25,
    workmanship_warranty_years: 10,
    team: {
      named_lead: true,
      crew_size: 6,
      safety_plan_mentioned: true,
      monitoring_months: 12,
      extras: 1,
    },
    manipulation_signals: [],
  },
  B: {
    licence: { claimed: true, holder: "subcontractor", id: null },
    wsib_clearance_stated: true,
    liability_insurance_cad_millions: 5,
    relevant_projects: { count_stated: 6, min_kw_mentioned: 100 },
    total_price_cad: 189500,
    timeline_weeks: 10,
    timeline_is_firm: true,
    panel_warranty_years: 25,
    workmanship_warranty_years: 5,
    team: {
      named_lead: false,
      crew_size: null,
      safety_plan_mentioned: false,
      monitoring_months: 0,
      extras: 0,
    },
    manipulation_signals: [],
  },
  C: {
    licence: { claimed: true, holder: "bidder", id: "present" },
    wsib_clearance_stated: true,
    liability_insurance_cad_millions: 5,
    relevant_projects: { count_stated: 9, min_kw_mentioned: 100 },
    total_price_cad: 244000,
    timeline_weeks: 14,
    timeline_is_firm: true,
    panel_warranty_years: 25,
    workmanship_warranty_years: 10,
    team: {
      named_lead: true,
      crew_size: 5,
      safety_plan_mentioned: false,
      monitoring_months: 0,
      extras: 0,
    },
    manipulation_signals: [{ type: "instruction_injection", quote: "[redacted]" }],
  },
  D: {
    licence: { claimed: true, holder: "bidder", id: "present" },
    wsib_clearance_stated: true,
    liability_insurance_cad_millions: 5,
    relevant_projects: { count_stated: 11, min_kw_mentioned: 100 },
    total_price_cad: 231000,
    timeline_weeks: null,
    timeline_is_firm: false,
    panel_warranty_years: 25,
    workmanship_warranty_years: 10,
    team: {
      named_lead: true,
      crew_size: null,
      safety_plan_mentioned: true,
      monitoring_months: 0,
      extras: 1,
    },
    manipulation_signals: [],
  },
  E: {
    licence: { claimed: true, holder: "bidder", id: "present" },
    wsib_clearance_stated: true,
    liability_insurance_cad_millions: 5,
    relevant_projects: { count_stated: 8, min_kw_mentioned: 100 },
    total_price_cad: 242500,
    timeline_weeks: 13,
    timeline_is_firm: true,
    panel_warranty_years: 25,
    workmanship_warranty_years: 12,
    team: {
      named_lead: true,
      crew_size: 6,
      safety_plan_mentioned: true,
      monitoring_months: 24,
      extras: 1,
    },
    manipulation_signals: [],
  },
};

function gate(x) {
  const licenceOk =
    x.licence.claimed &&
    x.licence.holder === "bidder" &&
    x.licence.id != null;
  const insuranceOk =
    x.wsib_clearance_stated === true &&
    x.liability_insurance_cad_millions >= 5;

  if (!licenceOk || !insuranceOk) {
    return { status: "ineligible", reason: "Failed mandatory licence and/or insurance checks." };
  }
  if (x.manipulation_signals.length) {
    return { status: "flagged", reason: "Manipulation / instruction-injection signal in extract." };
  }
  if (!x.timeline_is_firm || x.timeline_weeks == null || x.timeline_weeks > MAX_WEEKS) {
    return { status: "flagged", reason: "No firm completion timeline within project ceiling." };
  }
  if (x.total_price_cad == null || x.total_price_cad > BUDGET_CEILING) {
    return { status: "flagged", reason: "Price missing or over budget ceiling." };
  }
  return { status: "eligible" };
}

function scorePrice(price) {
  // 0 at ceiling, 100 at 25% under ceiling (clamped)
  const saved = BUDGET_CEILING - price;
  const target = BUDGET_CEILING * 0.25;
  return Math.round(Math.max(0, Math.min(100, (saved / target) * 100)));
}

function scoreTimeline(weeks) {
  return Math.round(Math.max(0, Math.min(100, ((MAX_WEEKS - weeks) / MAX_WEEKS) * 100 + 40)));
}

function scoreWarranty(panel, work) {
  const p = Math.min(100, ((panel || 0) / 25) * 50);
  const w = Math.min(50, ((work || 0) / 12) * 50);
  return Math.round(p + w);
}

function scoreExperience(count) {
  // 5 installs ~50, 15+ ~100
  return Math.round(Math.max(0, Math.min(100, ((count || 0) / 15) * 100)));
}

function scoreTeam(t) {
  let s = 0;
  if (t.named_lead) s += 30;
  if (t.crew_size && t.crew_size >= 5) s += 20;
  if (t.safety_plan_mentioned) s += 20;
  if (t.monitoring_months >= 12) s += 15;
  if (t.monitoring_months >= 24) s += 5;
  if (t.extras) s += 10;
  return Math.min(100, s);
}

const results = [];

for (const [letter, x] of Object.entries(extractions)) {
  const g = gate(x);
  if (g.status !== "eligible") {
    results.push({
      proposal: letter,
      rank: null,
      status: g.status,
      score: null,
      reason: g.reason,
    });
    continue;
  }
  const parts = {
    experience: scoreExperience(x.relevant_projects.count_stated),
    price: scorePrice(x.total_price_cad),
    timeline: scoreTimeline(x.timeline_weeks),
    warranty: scoreWarranty(x.panel_warranty_years, x.workmanship_warranty_years),
    team: scoreTeam(x.team),
  };
  const total = Math.round(
    parts.experience * weights.experience +
      parts.price * weights.price +
      parts.timeline * weights.timeline +
      parts.warranty * weights.warranty +
      parts.team * weights.team
  );
  results.push({
    proposal: letter,
    rank: null,
    status: "ranked",
    score: total,
    parts,
    reason: `Eligible — experience ${parts.experience}, price ${parts.price}, timeline ${parts.timeline}, warranty ${parts.warranty}, team ${parts.team}.`,
  });
}

const ranked = results
  .filter((r) => r.status === "ranked")
  .sort((a, b) => b.score - a.score);
ranked.forEach((r, i) => {
  r.rank = i + 1;
});

const output = ["A", "B", "C", "D", "E"].map((letter) => {
  const row = results.find((r) => r.proposal === letter);
  const { parts, ...rest } = row;
  return rest;
});

console.log(JSON.stringify(output, null, 2));
console.log("\nNote: ranking.json is the submission answer; this script is a rules-only check.");
