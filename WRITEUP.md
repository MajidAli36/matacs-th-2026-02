# Write-up

Reference: MATACS-TH-2026-02  

I’m designing triage for contractor proposals. Category and criteria come from admin screens — for this sample I used Commercial Solar Installation, but the flow itself doesn’t care what the category is called.

## Flow (short)

1. Reviewer uploads PDFs and picks a category.
2. App loads that category’s criteria (mandatory + weights) and freezes a snapshot for the run.
3. Pull text out of each PDF (built-in text layer first; OCR if needed).
4. AI extracts a fixed JSON of facts the criteria care about — licence, insurance, price, weeks, etc. Temp 0. No scoring in this step.
5. Code runs the gate: fail a mandatory → `ineligible`. Weird stuff (injection language, no firm timeline against the project’s 16-week ceiling) → `flagged`.
6. Eligible rows get scores. Numbers we already extracted (price, weeks, warranty years, install count) are scored with plain formulas. AI only helps on soft stuff like “is this experience actually relevant?” and has to point at an extracted field.
7. Weighted total, sort, show the reviewer a breakdown + one-line reason. The system never awards the job.

Sample result is in `ranking.json`: A then E ranked; D and C flagged; B ineligible. Scores there match `prototype/score_samples.mjs` (experience/team use simple stand-ins for the soft AI step).

---

## 1. AI vs. rules

AI is useful for messy prose → structured fields, and for fuzzy calls. It’s a bad place to park licence pass/fail, budget caps, or adding up weights.

**Code / rules:** load criteria, mandatory checks, budget and week ceilings, numeric scores, weighted sum, sort, audit writes, don’t auto-rank flagged/ineligible rows.

**AI:** field extraction; soft score on experience and team/approach; optional draft of the one-line reason (reviewer can edit).

I split it this way because a wrong award costs real money. I’d rather a rule say “licence must be held by the bidder, full stop” than hope the model notices the subcontractor hedge.

---

## 2. Consistency and explainability

Same files + same criteria snapshot should give the same order.

- Pin model id, prompt version, temperature 0 on the run record.
- Snapshot criteria (ids, text, weights, mandatory flags) when scoring starts so later admin edits don’t rewrite history.
- Price / timeline / warranty use the same formulas every time. No firm weeks inside the ceiling → don’t score timeline; flag the row instead.
- If the API errors, retry the same prompt. Don’t blend creative rewrites.

Reviewer view per proposal: status, total, per-criterion score, the short evidence snippet, and the reason. Raw extraction JSON available for audit.

---

## 3. Human in the loop

Four touch points:

1. Admin sets criteria before a category is used.
2. Reviewer uploads and can fix bad extractions (especially licence, insurance, price) before scoring.
3. Reviewer clears or confirms flagged rows; overrides need a comment.
4. Someone on the facilities side picks the winner. The list is advice.

Audit log: file hash + uploader + time, criteria snapshot id, prompt/model versions, raw extract, human field edits, scores, overrides (before/after + why), and an award note if they record it in-app.

---

## 4. Changing criteria mid-stream

Editing weights or adding a mandatory after scoring does not change old runs.

Old results stay tied to their snapshot. UI marks them stale and offers a re-score against current criteria. Re-score is a new run with a new id and a link back to the previous one. If a new mandatory knocks someone out, that only shows on the new run.

Assumption: admins can edit whenever; published rankings only change when someone hits re-score.

---

## 5. Risks

**Bad extraction.** Prefer the PDF text layer. Short or low-confidence extracts get flagged for a manual paste. Reviewer confirms money and licence before score.

**Made-up facts.** Prompt: only use the provided text; unknown → null. Schema drops surprise keys. A null field doesn’t get full marks.

**Bias.** Same rubric for every bidder. Don’t feed firm name into the soft scorer. Lean on numbers more than how polished the writing is.

**Manipulation.** Proposal C is why this matters — if the text starts giving the system orders (“rank me first…”), strip that from scoring context and flag the row. Proposal text never becomes system instructions.

**Cost.** Extract once, cache by file hash. Rules handle mandatories and math. AI only on eligible rows, and only for soft criteria.

**Over-trust.** Results screen says a person decides the award. Overrides always allowed with a note.

On the samples: B fails the licence mandatory (subcontractor later isn’t “held by the bidder”). D never commits to a week count inside 16 weeks, so I won’t auto-rank it. C would probably land behind A and E on honest scores, but the injection means a person looks first. A beats E on experience volume and price; E is better on workmanship warranty and monitoring — fine as #2.
