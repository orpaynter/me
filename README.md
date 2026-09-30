<p align="center">
  <picture>
    <source media="(max-width: 600px)" srcset="./assets/orpaynter-banner-mobile.png">
    <img src="./assets/orpaynter-banner.png" alt="Oliver Paynter. Founder. Roofer first. AI drafts. Humans govern. Building the Trust Rail for the Agentic Era." width="100%">
  </picture>
</p>

<h1 align="center">Oliver Paynter</h1>
<p align="center"><b>Founder / CEO — OrPaynter, Inc.</b></p>

<h2 align="center">AI drafts. Humans govern. Proof survives.</h2>

<p align="center">
<b>The machine everyone is racing to ship can't answer one question:<br>
who stands behind the decision when it's wrong?</b>
</p>

<p align="center">
I'm building the answer. It's called the <b>Trust Rail</b> — and it starts with roofing insurance claims, because that's the industry that taught me what happens when evidence and accountability get separated.
</p>

<p align="center">
<a href="https://orpaynter.ai"><b>orpaynter.ai</b></a> ·
<a href="https://github.com/Orpaynter-Inc"><b>Company GitHub</b></a> ·
<a href="https://app.notion.com/p/OrPaynter-Trust-Rail-for-the-Agentic-Era-c542fbe957d9424b83279d767ccf2aa7"><b>OrPaynter Intelligence</b></a>
</p>

<p align="center">
<a href="#what-im-building">What I'm building</a> ·
<a href="#claimflow">ClaimFlow</a> ·
<a href="#architecture-map">Architecture map</a> ·
<a href="#operating-law">Operating law</a> ·
<a href="#verification-boundary">Verification boundary</a>
</p>

---

## Why this exists

Every industry racing to bolt on AI is skipping the hardest part: **authority**.

Machines are fast. They are also confidently wrong. The companies shipping "autonomous AI agents" into money-facing decisions are building liability, not leverage.

Roofing insurance claims made this undeniable to me first-hand — I've stood on the roof, I've seen the adjuster's judgment call, and I've watched good evidence get lost the moment a workflow gets automated carelessly.

**OrPaynter is the fix.** Not a smarter chatbot. A governed operating layer where:

- the machine prepares the work
- a named human owns the decision
- the evidence is permanently attached to that decision
- authority is never inherited by the automation

This is the Trust Rail — the infrastructure layer the agentic era needs before it can be trusted with anything that matters.

---

## What I'm building

OrPaynter is a software company building **governed AI for roofing insurance claims** — the first proving ground for the Trust Rail.

The flagship product is **ClaimFlow**: a claim operating system that turns scattered field evidence — photos, notes, documents, job context — into an evidence-linked draft, routes it through a real human approval gate, and locks the result into a reconstructable Decision Package.

This isn't an autonomous claims robot. It isn't a replace-the-adjuster play. It's the system that lets contractors and carriers move at machine speed **without losing the one thing that actually protects everyone: accountability.**

---

## ClaimFlow

### Intake → Evidence-linked draft → Human gate → Locked Decision Package

One rule governs everything: **automation can prepare work. It can never own authority.**

<p align="center">
  <picture>
    <source media="(max-width: 600px)" srcset="./assets/claimflow-workflow-mobile.png">
    <img src="./assets/claimflow-workflow.png" alt="ClaimFlow workflow: intake, evidence-linked draft, named human review, then locked Decision Package. Rejected drafts return to review and correction." width="100%">
  </picture>
</p>

| Layer | Purpose |
| :--- | :--- |
| **Intake** | Capture job facts, photos, files, notes, and claim context — nothing gets lost. |
| **Evidence-linked draft** | AI organizes and prepares the work — claims never separate from source evidence. |
| **Human gate** | An identity-bound human approves, rejects, or returns the draft. No exceptions. |
| **Decision Package** | The permanent record: what was decided, who authorized it, what evidence backed it. |

**The product goal:** help contractors and carriers move faster — without ever losing who's accountable.

---

## Architecture map

GitHub is my build trail. Not every repo is the product — some are experiments, some are history, and four define where this is actually going.

### 🎯 Canonical direction

| Repository | Responsibility |
| :--- | :--- |
| [**AIA**](https://github.com/orpaynter/AIA) | Backend authority layer — FastAPI foundation, decision-package logic, intelligence services, human-gate controls. |
| [**claimflow**](https://github.com/orpaynter/claimflow) | Shared claim operating flow — case state machine, Intake Foreman, TRAE/AIA gates, portable proof. |
| [**orpa**](https://github.com/orpaynter/orpa) | Governed operator console — identity-bound approve/reject, fail-closed behavior, payments disabled by design. |
| [**orpaynter-web**](https://github.com/orpaynter/orpaynter-web) | Public product + verification surface — ClaimFlow site, record verification, synthetic proving ground. |

### 🔧 Supporting work

| Repository | Role |
| :--- | :--- |
| **orpaynter-claim-rail** | Earlier Foreman / claim rail MVP work — context, not the canonical runtime. |
| **orpaynter-agent-factory** | Agent constitution and sandbox work — agents may improve, they may never self-promote authority. |
| **website** | Marketing/SaaS shell work — no unverifiable stats, no production claims. |

### 🗂️ Historical and upstream work

Older overlays, Nexus spaces, starter projects, tutorials, investor databases, mobile experiments, CDN starters, and upstream forks make up the build history. Forks like UI-TARS-desktop, browser-use, Auto-GPT, Langtrace, Ollama, PocketManus, and OSINT-Assistant are references and tooling — **not** the OrPaynter product.

> **The tiebreaker rule:** Company identity wins on *who we are*. AIA + ClaimFlow win on *what the product does*. A real job plus tests win on *what actually works*. The newest demo never wins by default.

---

## Operating law

1. **The system drafts. A human approves.**
2. **Agents may become more capable. They may never grant themselves more authority.**
3. **Every money-facing or customer-facing action needs a reconstructable Decision Package plus evidence.**
4. **No published accuracy, ROI, customer counts, certifications, or production claims that can't be shown on real jobs.**
5. **Synthetic proof is useful. It is never customer validation.**

---

## Verification boundary

Built in public enough to show direction — carefully enough to never confuse a demo with production proof.

| Signal | How to read it |
| :--- | :--- |
| **HTTP 200 / live URL** | The surface loads. Not customer production. |
| **Synthetic bundle** | Useful machine proof. Not a real claim. |
| **Agent run** | Helpful automation. Not human approval. |
| **Decision Package** | The target record — decision, authority, evidence, reconstructable context. |
| **Real job + named review** | ⭐ The standard that matters. |

**The bar isn't "does it look impressive?"** It's: **can a person stand behind this decision later?**

---

## Company boundary

**OrPaynter, Inc.** is the software company.

**Oliver's Roofing & Contracting** is the trade background and real-world domain proving ground. The field experience informs the product — the entities are not the same thing.

The company face is [Orpaynter-Inc](https://github.com/Orpaynter-Inc). This account, `orpaynter`, is the founder/build account until canonical Wave 1 repos move under the company org.

---

## OrPaynter Intelligence

The strategy layer behind the code — doctrine, research, architecture, prompt patterns, agent instructions, failure cases, decision frameworks.

Not a bigger pile of prompts. **Reusable operating intelligence where responsibility is explicit and evidence survives the workflow.**

[**Explore OrPaynter Intelligence →**](https://app.notion.com/p/OrPaynter-Trust-Rail-for-the-Agentic-Era-c542fbe957d9424b83279d767ccf2aa7)

---

## Build something that holds up

If you work in roofing, insurance claims, field operations, or AI systems where a human must stand behind the outcome — **let's talk.**

I'm building from the field up, with proof ahead of promises. No hype, no vaporware, no "trust me" — just a rail strong enough to hold real weight.

<p align="center">
<a href="mailto:ov@orpaynter.com"><b>Start a conversation</b></a> ·
<a href="https://orpaynter.ai"><b>orpaynter.ai</b></a> ·
<a href="https://github.com/Orpaynter-Inc"><b>Company GitHub</b></a>
</p>

<p align="center"><sub><b>AI drafts. Humans govern. Proof matters.</b></sub></p>
