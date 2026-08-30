# Oliver Paynter

Founder / CEO, [OrPaynter, Inc.](https://github.com/Orpaynter-Inc). Roofer first.

OrPaynter builds **governed AI for roofing insurance claims**. The product is ClaimFlow: intake → evidence-linked draft → human gate → locked Decision Package. AI drafts. You govern.

[orpaynter.ai](https://orpaynter.ai) · Oliver@OrPaynter.com · 469-479-2526

This public page is the **canonical vs historical** map of github.com/orpaynter. Company face: [Orpaynter-Inc](https://github.com/Orpaynter-Inc).

---

# OrPaynter GitHub map

**Canonical vs historical.** Every repo stays. This page is the index so another human or model does not treat a Manus template as the product.

Product in one line: **ClaimFlow** — intake → evidence-linked draft → human approval → locked Decision Package.

## Canonical (Wave 1 — transfer to Orpaynter-Inc later)

Private. These are the four that matter.

| Repo | Role | Do not confuse with |
|---|---|---|
| [AIA](https://github.com/orpaynter/AIA) | Backend authority. FastAPI. Decision Package. Human gate. | Older `agsi_v2` folders on disk |
| [claimflow](https://github.com/orpaynter/claimflow) | Shared case state machine + portable proof | Marketing “ClaimFlow” copy in Overlay sites |
| [orpa](https://github.com/orpaynter/orpa) | Governed operator. Named human owns the decision. Payments disabled. | Generic “agent consoles” |
| [orpaynter-web](https://github.com/orpaynter/orpaynter-web) | Silent public site. `/record` verifies a **SYNTHETIC** bundle against AIA. `/arena` keeps `execution_authorized=false`. | `website`, `orpaynter-website` |

## Active but not Wave 1

Company IP. Transfer only after the four remotes are stable.

| Repo | Role |
|---|---|
| [orpaynter-claim-rail](https://github.com/orpaynter/orpaynter-claim-rail) | Foreman UI. README: not runtime-verified. |
| [orpaynter-agent-factory](https://github.com/orpaynter/orpaynter-agent-factory) | Internal constitution. Must never self-promote authority. |
| [website](https://github.com/orpaynter/website) | Marketing + SaaS shell. Strip unverifiable stats before any public use. |

## Historical (keep, do not open as “the platform”)

Manus overlays, THE-ONE copies, Nexus spaces, CDN starter, investor DB, phone-app spike, rust_core, MCP lead-gen, seven-Foreman stubs, Downloads dump, tutorial repos.

If two files disagree: company identity wins on who we are; AIA + ClaimFlow win on what the product does; a real job plus tests win on what works. The newest PDF never wins.

## Forks (personal, do not transfer)

UI-TARS-desktop, browser-use, Auto-GPT, and other upstream clones stay on this account. They are tools, not OrPaynter products.

## What a visiting operator should do

1. Read this map.
2. Open AIA + orpa docs (`SHOW_THE_WORLD.md`, `RC1_MANIFEST.md`) if you have access.
3. Treat `/record` and portable `verify.py` as **synthetic / machine** proof until a cold human signs `VERIFIER.md` on a real job.
4. Do not auto-approve. Do not claim customer production from HTTP 200.
