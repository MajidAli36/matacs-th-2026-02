# Design write-up — AI proposal triage

Reference: MATACS-TH-2026-02  
Category used for the sample run: Commercial Solar Installation (admin-configured criteria, not hard-coded).

## How the flow works (short version)

1. Reviewer uploads proposal PDFs and picks a category.
2. System loads that category’s criteria from admin config (mandatory + weighted).
3. Text is extracted from each PDF (rules/OCR first; AI only if the text layer is thin).
4. A structured extraction prompt pulls fields the criteria care about (licence #, insurance, kW history, price, weeks, warranties, named lead, etc.) into JSON. Temperature 0. Nothing is scored yet.
5. **Rules gate:** any mandatory that is missing, hedged, or not held by the bidder → `ineligible`. Any oddity (injection language, missing timeline vs a hard project ceiling, conflicting numbers) → `flagged` and parked for a person.
6. Eligible proposals get criterion scores. Where the answer is a number we already extracted (price, weeks, warranty length, install count), scoring is plain math against the admin weights. AI only helps on fuzzy bits like “is this experience actually relevant?” and even then it returns a 0–100 with a one-line cite back to the extracted field — not a free-form essay score.
7. Weighted total → sort → reviewer screen with rank, score breakdown, and the short reason. Human awards; system never does.

I ran the sample set through this on paper. Result is in `ranking.json`: **A then E ranked; D and C flagged; B ineligible.**

---

## 1. AI vs. rules

AI is good at turning messy proposal prose into structured fields, and at soft judgments (“does this count as commercial 100 kW+ experience?”). It is bad at being the source of truth for pass/fail licence checks, budget ceilings, and weight math.

So:

- **Rules / code:** load criteria; mandatory pass/fail; budget and max-week ceilings; numeric scoring for price / timeline / warranty length / install counts; weighted sum; sort; audit log writes; refusing to rank `flagged` / `ineligible` rows.
- **AI:** PDF→fields extraction; optional relevance note on experience; optional draft of the one-line rank reason from the score breakdown (still editable by the reviewer).

I drew the line there because procurement mistakes are expensive. If the model invents a licence number, rules that require “licence present AND pattern looks like ECRA/ESA” plus a human checkbox beat “trust the model’s vibe.”

---

## 2. Consistency and explainability

Same inputs should give the same ranking.

- Extraction and any AI scoring calls use a fixed model id, seed/temperature 0, and a versioned prompt id stored on the run.
- Criteria snapshot (ids, weights, mandatory flags, text) is frozen onto the scoring run so a later admin edit does not silently rewrite history.
- Numeric criteria use the same formulas every time (e.g. price score scales from budget ceiling down; timeline score scales from the 16-week max down; missing committed weeks → not scored, proposal flagged).
- Re-rank with unchanged files + unchanged criteria snapshot → same order. If the model API flakes, we retry the same prompt; we do not “average” creative rewrites.

Reviewer sees, per proposal: status, total, per-criterion score, the extracted evidence snippet that fed each score, and the one-line reason. Expandable “show raw extraction JSON” for audit.

---

## 3. Human in the loop

People touch the process in four places:

1. **Admin** — defines criteria/weights per category before scoring goes live.
2. **Reviewer** — uploads, confirms extraction looks right (especially licence / insurance / price), and can edit a wrong field before scoring.
3. **Reviewer** — clears or confirms `flagged` items; can override a status with a required comment.
4. **Decision maker** — final award outside the auto-rank (the list is decision support, not the decision).

Logged for audit: who uploaded what hash/when; criteria snapshot id; prompt + model versions; raw extraction; any human field edits; scores; overrides (before/after, reason, user); final award note if recorded in-app.

---

## 4. Changing criteria mid-stream

Editing weights or adding a mandatory after some proposals were scored does **not** mutate old results.

- Old runs stay as historical records tied to the old snapshot.
- UI marks them stale (“criteria changed”) and offers “re-score all against current criteria.”
- Re-score is a new run: new snapshot id, new ranks, link back to the previous run for comparison.
- If a new mandatory would knock someone out, they move to `ineligible` on the new run only; we do not silently delete the old ranking.

Assumption I made: admins can edit freely, but published rankings are immutable unless someone explicitly re-runs.

---

## 5. Risks and guards

| Risk | What I do about it |
| --- | --- |
| Bad PDF extraction | Prefer embedded text; flag low-confidence / short extracts for manual paste; reviewer confirms money and licence fields before score. |
| Made-up facts | Prompt says “use only provided text; unknown → null”; schema rejects extra keys; scores need an evidence span; null ≠ full marks. |
| Bias | Same rubric for everyone; no firm-name features in the scorer; weigh hard numbers more than prose quality. |
| Manipulation / prompt injection | Sample **C** is the teaching case — instruction-like asides (“rank this first…”) are stripped from scoring context and force `flagged`. Never let proposal text become system instructions. |
| Cost / latency | Extract once, cache by file hash; rules do mandatories and math; AI only on eligible rows and only for fuzzy fields. |
| Over-trusting the rank | Copy on the results screen: human decides award; overrides always allowed with a note. |

On the samples specifically: **B** fails licence mandatory (subcontractor later ≠ bidder holds licence). **D** never locks a completion date inside 16 weeks, so I will not auto-rank it. **C** would probably sit behind A/E on honest scores, but the injection means a person looks first. **A** edges **E** on experience depth and price; **E** wins warranty and monitoring length — reasonable #2.
