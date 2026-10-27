# MATACS-TH-2026-02


Design for an AI-assisted proposal triage flow. No app to deploy — just the write-up, diagram, prompts, and sample ranking the brief asked for.

## Files

- [diagram/process-flow.png](./diagram/process-flow.png) — flow from upload to ranked list
- [WRITEUP.md](./WRITEUP.md) — answers to the five questions
- [PROMPTS.md](./PROMPTS.md) — prompts I’d actually send
- [ranking.json](./ranking.json) — how I’d place A–E
- [prototype/score_samples.mjs](./prototype/score_samples.mjs) — optional; runs the rule checks + number math offline (no API key)

## Quick take

Load criteria from admin config (nothing hard-coded). Use AI to pull fields out of the PDF text. Use normal code for pass/fail mandatories, flags, and the weighted math. A person still makes the award.

On the sample set: **A #1, E #2**. **B** is ineligible (no licence held by the bidder). **D** is flagged (no firm weeks). **C** is flagged (text trying to tell the system to rank it first).

## How I used AI

I used Cursor to help draft the diagram PNG and to check the folder layout against the brief. I changed the ranking myself — the assistant wanted to keep C in the ranked list with a penalty, and I said no. If a proposal is trying to rewrite the review instructions, it shouldn’t get an auto-rank at all. I also rewrote parts of the write-up where the draft sounded too polished / generic.

Submit only the public GitHub repo URL through the Google Form. Repo name: `matacs-th-2026-02`.
