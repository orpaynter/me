<p align="center">
  <picture>
    <source media="(max-width: 600px)" srcset="./assets/orpaynter-banner-mobile.png">
    <img src="./assets/orpaynter-banner.png" alt="Oliver Paynter. Founder. Roofer first. AI drafts. Humans govern. Building the Trust Rail for the Agentic Era." width="100%">
  </picture>
</p>

# Oliver Paynter

### Founder / CEO of [OrPaynter, Inc.](https://github.com/Orpaynter-Inc)

Roofer first. AI systems architect. Builder of governed AI for roofing insurance claims.

I am building the trust rail for the moment when AI work becomes somebody's real-world decision: the machine prepares the work, a named human owns the decision, and the evidence remains attached to the record.

**AI drafts. Humans govern. Proof matters.**

[orpaynter.ai](https://orpaynter.ai) · [Company GitHub](https://github.com/Orpaynter-Inc) · [OrPaynter Intelligence](https://app.notion.com/p/OrPaynter-Trust-Rail-for-the-Agentic-Era-c542fbe957d9424b83279d767ccf2aa7) · [Get in touch](mailto:ov@orpaynter.com)

[What I am building](#what-i-am-building) · [ClaimFlow](#claimflow) · [Architecture map](#architecture-map) · [Operating law](#operating-law) · [Verification boundary](#verification-boundary)

---

## What I am building

OrPaynter is a software company building governed AI for roofing insurance claims.

The first product is **ClaimFlow**: a claim operating flow that turns scattered photos, notes, documents, and job context into an evidence-linked draft, routes that draft through a human approval gate, and preserves the final result as a locked Decision Package.

This starts in roofing because that is the work I know firsthand. Roofing taught me that field work is messy, evidence matters, and bad decisions cost people real money.

OrPaynter exists to make AI useful inside that reality—not to create an autonomous claims robot, not to replace judgment, and not to publish claims that cannot be proven on real jobs.

---

## ClaimFlow

### Intake → evidence-linked draft → human gate → locked Decision Package

ClaimFlow is designed around one rule: **automation can prepare work, but it does not own authority.**

<p>
  <picture>
    <source media="(max-width: 600px)" srcset="./assets/claimflow-workflow-mobile.png">
    <img src="./assets/claimflow-workflow.png" alt="ClaimFlow workflow: intake, evidence-linked draft, named human review, then locked Decision Package. Rejected drafts return to review and correction." width="100%">
  </picture>
</p>

| Layer | Purpose |
| :--- | :--- |
| **Intake** | Gather job facts, photos, files, notes, and claim context. |
| **Evidence-linked draft** | Use AI to organize and prepare the work without separating claims from source material. |
| **Human gate** | Require an identity-bound human to approve, reject, or return the draft for correction. |
| **Decision Package** | Preserve what was decided, who authorized it, and what evidence supported it. |

The product goal is simple: help contractors move faster without losing accountability.

---

## Architecture map

GitHub is my build trail. Not every repository is the product, and not every experiment should be treated as the canonical direction.

### Canonical direction

These four repositories define the current product architecture. Some are private or production-scoped foundations rather than public open-source releases.

| Repository | Responsibility |
| :--- | :--- |
| [**AIA**](https://github.com/orpaynter/AIA) | Backend authority layer: FastAPI foundation, decision-package logic, intelligence services, and human-gate controls. |
| [**claimflow**](https://github.com/orpaynter/claimflow) | Shared claim operating flow: case state machine, Intake Foreman, TRAE/AIA gates, and portable proof. |
| [**orpa**](https://github.com/orpaynter/orpa) | Governed operator console: identity-bound approve/reject, fail-closed behavior, and payments disabled by design. |
| [**orpaynter-web**](https://github.com/orpaynter/orpaynter-web) | Public product and verification surface: ClaimFlow site, record verification, and synthetic proving ground. |

### Supporting work

| Repository | Role |
| :--- | :--- |
| **orpaynter-claim-rail** | Earlier Foreman / claim rail MVP work. Useful context, not the canonical runtime. |
| **orpaynter-agent-factory** | Agent constitution and sandbox work. Agents may improve, but they may never promote their own authority. |
| **website** | Marketing and SaaS shell work. Any public use must avoid unverifiable stats or production claims. |

### Historical and upstream work

Older overlays, Nexus spaces, starter projects, tutorial repos, investor databases, mobile experiments, CDN starters, and copied upstream tools are part of the build history.

Forks and experiments such as UI-TARS-desktop, browser-use, Auto-GPT, Langtrace, Ollama, PocketManus, OSINT-Assistant, and related agent tools are useful references or tooling—not the OrPaynter product.

If two files disagree, this is the rule:

> Company identity wins on who we are. AIA + ClaimFlow win on what the product does. A real job plus tests win on what works. The newest demo never wins by default.

---

## Operating law

1. **The system drafts. A human approves.**
2. **Agents may become more capable. They may never grant themselves more authority.**
3. **Every money-facing or customer-facing action needs a reconstructable Decision Package plus evidence.**
4. **Do not publish accuracy, ROI, customer counts, certifications, or production claims that cannot be shown on real jobs.**
5. **Synthetic proof is useful, but it is not customer validation.**

---

## Verification boundary

OrPaynter is being built in public enough to show direction, but carefully enough not to confuse prototypes, demos, and synthetic verification with production proof.

| Signal | How to read it |
| :--- | :--- |
| **HTTP 200 / live URL** | The surface loads. It does not prove customer production. |
| **Synthetic bundle** | Useful machine proof. Not the same as a real claim. |
| **Agent run** | Helpful automation. Not human approval. |
| **Decision Package** | The target record: decision, human authority, supporting evidence, and reconstructable context. |
| **Real job + named review** | The standard that matters. |

The standard is not “does it look impressive?” The standard is “can a person stand behind this decision later?”

---

## Company boundary

**OrPaynter, Inc.** is the software company.

**Oliver's Roofing & Contracting** is the trade background and real-world domain context. The field experience informs the product, but the entities are not the same thing.

The company GitHub face is [Orpaynter-Inc](https://github.com/Orpaynter-Inc). This account, `orpaynter`, remains the founder/build account until the canonical Wave 1 repositories move under the company organization.

---

## OrPaynter Intelligence

OrPaynter Intelligence is the strategy and systems layer behind the code: product doctrine, research, architecture, prompt patterns, agent instructions, evaluation ideas, failure cases, and decision design.

The goal is not a bigger pile of prompts. The goal is reusable operating intelligence where responsibility is explicit and evidence survives the workflow.

[Explore OrPaynter Intelligence in Notion](https://app.notion.com/p/OrPaynter-Trust-Rail-for-the-Agentic-Era-c542fbe957d9424b83279d767ccf2aa7)

---

## Build something that holds up

If you work in roofing, insurance claims, field operations, or AI systems where a human must stand behind the outcome, I want to talk.

I am building from the field up—with proof ahead of promises.

[**Start a conversation**](mailto:ov@orpaynter.com) · [orpaynter.ai](https://orpaynter.ai) · [Company GitHub](https://github.com/Orpaynter-Inc)

<p align="center"><sub>AI drafts. Humans govern. Proof matters.</sub></p>
