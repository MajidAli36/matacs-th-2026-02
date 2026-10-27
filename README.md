# MATACS-TH-2026-02 — AI proposal triage design

**Candidate:** Zain *(update this to your full legal name before submitting)*  
**Reference:** MATACS-TH-2026-02  
**Role:** Associate Software Developer  
**Time spent:** ~55 minutes  

## What’s in here

| File | What it is |
| --- | --- |
| [diagram/process-flow.png](./diagram/process-flow.png) | Flow from upload → ranked list (rules / AI / human marked) |
| [WRITEUP.md](./WRITEUP.md) | Answers to the five brief questions |
| [PROMPTS.md](./PROMPTS.md) | Extraction + scoring prompts as I would send them |
| [ranking.json](./ranking.json) | How I’d place sample proposals A–E |
| [prototype/](./prototype/) | Optional offline scorer — no API keys, runs the rule gate + numeric math on fixture extracts |

No deployed app. No copy of the brief text in this repo.

## Design in one paragraph

Pull admin criteria at runtime, extract fields with AI into JSON, fail mandatories and weird cases with rules (not the model), score hard numbers in code, let AI help only on soft criteria, then hand a person a ranked list with evidence. On the sample set that means **A #1, E #2**, **D flagged** (no firm weeks), **C flagged** (injection), **B ineligible** (licence not held by the bidder).

## How I used AI tools

I used an AI coding assistant to turn a hand-sketched flow into an SVG/PNG and to tidy folder layout. I did **not** let it invent the ranking: it first tried to keep C in the ranked list with a discounted score, and I overruled that. Once a proposal is trying to rewrite the reviewer’s instructions, it shouldn’t sit in the auto-rank at all — `flagged` plus a human eyes-on is the safer default for a facilities award. I also cut a bunch of generic “leverage / robust pipeline” wording it suggested in the write-up and rewrote those bits in my own words.

## Submit note

Push this as a **public** GitHub repo named `matacs-th-2026-02`, then paste only the repo URL into the Google Form from the brief. Don’t email the files.
