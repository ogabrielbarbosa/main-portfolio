# STAR MDX schema

Files: `content/star/<slug>/pt.mdx` and `content/star/<slug>/en.mdx`.
Assets: `public/star/<slug>/` (referenced as `/star/<slug>/<file>`).

## Frontmatter

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Result-oriented headline. "Reduzi o tempo de deploy em 70%" — not "Projeto de CI". |
| `slug` | string | yes | kebab-case EN, same in both locales. |
| `locale` | `pt` \| `en` | yes | |
| `status` | `draft` \| `published` | yes | Site shows only `published`. |
| `summary` | string | yes | 1–2 sentence teaser for cards. |
| `role` | string | yes | Gabriel's role at the time. |
| `company` | string | yes | Real name or anonymized ("Fintech B2B"). |
| `companyPublic` | boolean | yes | `false` if anonymized. |
| `period` | `{ start: "YYYY-MM", end?: "YYYY-MM" }` | yes | Omit `end` if ongoing. |
| `competencies` | string[] | yes | From the list below. 1–3 items. |
| `skills` | string[] | no | Tech/tools (e.g. `Next.js`, `Supabase`, `n8n`). |
| `metrics` | Metric[] | no | Headline numbers. |
| `cover` | string | no | Path/URL of the card image (usually one of the body images). |
| `featured` | boolean | no | Highlight on the landing page. |
| `order` | number | no | Manual sort. |

### Metric

```yaml
- label: Tempo de deploy      # what was measured
  before: 40min               # optional
  after: 12min                # optional
  value: "-70%"               # headline figure shown in big type
  approximate: false          # true if estimated ("~")
```

### Competencies (pick 1–3)

`lideranca`, `trabalho-em-equipe`, `resolucao-de-problemas`, `iniciativa`, `comunicacao`, `conflito`, `falha-e-aprendizado`, `prazo-e-pressao`, `impacto-tecnico`, `aprendizado-rapido`, `foco-no-cliente`, `influencia`, `organizacao`

Use the same slugs in the EN file (they're keys, the site translates labels).

## Body

Fixed headings so the site can split sections (EN in parentheses):

```
## Situação        (## Situation)
## Tarefa          (## Task)
## Ação            (## Action)
## Resultado       (## Result)
## Aprendizado     (## Reflection)    ← optional
```

- **Ação** may be a numbered list of steps; each step starts with a verb in first person.
- Images/GIFs go inline: `![alt (dados fictícios)](/star/<slug>/file.gif)`, or `<Compare before={{ src, alt, label }} after={{ src, alt, label }} />` for before/after.
- No evidence/proof section: the site doesn't render one.
- No other `##` headings. Use `###` inside a section if needed.
