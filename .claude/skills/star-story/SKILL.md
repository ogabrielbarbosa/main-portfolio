---
name: star-story
description: Interview the user to build a STAR (Situation, Task, Action, Result) story with evidence (images, videos, links) and save it as bilingual MDX for the portfolio. Use when writing, improving or adding a STAR story, case, or behavioral interview answer.
---

# STAR Story

Guide Gabriel through an interview that turns a real experience into a STAR story backed by proof, then write it as two MDX files (PT-BR + EN) the portfolio site reads.

STAR references: MIT CAPD (https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/) and National Careers Service (https://nationalcareers.service.gov.uk/careers-advice/interview-advice/the-star-method).

## Core rules

- **One question at a time.** Wait for the answer. Ask follow-ups until the answer is specific — never fill gaps with invented facts, numbers, names or dates.
- **Converse in PT-BR.** Write the final files in PT-BR and EN.
- **"Eu", not "nós".** The interviewer wants Gabriel's part. When he says "a gente fez", ask "o que *você* fez especificamente?".
- **Proportion:** Situação + Tarefa ≈ 20%, Ação ≈ 60%, Resultado ≈ 20%. Context is short; actions carry the story.
- **Every claim wants proof.** For each metric or strong statement, ask: "tem alguma prova disso? print, vídeo, link, PR, mensagem, post?" Missing proof is fine — record it as `evidence: []` gap in the review, never fake it.
- **Confidentiality.** Before saving, ask whether company names, numbers or screenshots can be public. Offer anonymizing ("uma fintech de SP", "~3x") or blurring.

## Workflow

### 1. Pick the story

If Gabriel already has a story in mind, go to step 2. Otherwise help him find one: ask which competency or job he's targeting and use the prompts in `references/interview.md` → "Encontrar a história". Check `content/star/` for existing stories to avoid duplicates.

### 2. Interview (S → T → A → R → Reflexão)

Follow `references/interview.md`. Per phase, move on only when the "pronto quando" criterion is met. Keep a running draft in your head; don't show the full draft until step 4.

### 3. Collect evidence

For each piece of proof Gabriel mentions:
- **Local file** (print, foto, vídeo curto): ask the path, copy it to `public/star/<slug>/` with a descriptive kebab-case name. Videos over ~20 MB → suggest uploading to YouTube/Loom (unlisted) and using the URL.
- **URL** (YouTube, Loom, GitHub PR, post, artigo, app store): store as-is.
- Ask for a one-line caption per item and which STAR section it supports (`supports: action`, etc.).
- Ask for `alt` text for images (or propose one from the caption).

### 4. Draft and review

Show the PT-BR draft (frontmatter summary + 4 sections + reflexão) and a short critique:
- Word count per section vs. the 20/60/20 proportion
- Vague words to replace ("ajudei", "participei", "melhorei") 
- Metrics without baseline or without proof
- "Nós" where it should be "eu"
- Version for speaking: a 60–90s spoken summary (≈150–220 words)

Iterate until Gabriel approves.

### 5. Write files

Use the schema in `references/schema.md` and the template in `assets/template.mdx`.

- `content/star/<slug>/pt.mdx` and `content/star/<slug>/en.mdx` — same frontmatter structure, translated text fields. The EN version is a natural rewrite, not a literal translation.
- Evidence files in `public/star/<slug>/`.
- `slug`: short kebab-case in English (e.g. `deploy-time-70`), identical in both files.
- `status: draft` unless Gabriel says it's ready (`published`).

### 6. Verify

- Every `evidence[].src` with a local path (`/star/...`) exists under `public/`.
- Both files parse (valid YAML frontmatter) and have the same `slug`, `metrics` count and `evidence` count.
- Report: files created, evidence still missing, suggested next story.

```bash
# quick existence check of local evidence
grep -hoE '/star/[^" ]+' content/star/<slug>/*.mdx | sort -u | while read p; do [ -f "public$p" ] || echo "MISSING public$p"; done
```

## Improving an existing story

When asked to review/improve a story in `content/star/`, read both files, run the step 4 critique, then interview only the weak points.
