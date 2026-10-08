# Repository signals, not profile analytics

`orpaynter/me` is a repository README. GitHub displays a user-profile README only from the matching public `orpaynter/orpaynter` repository. This project does not silently deploy there.

## What is measured

- GitHub's **repository** traffic API reports repository views, clones, top referring sites, and popular repository paths over a rolling window (normally 14 days). All four endpoints are saved in validated snapshots; cards display views and referrers. It does **not** report GitHub user-profile-page views or direct README-link clicks.
- The cards show public canonical, non-fork repositories and this README repository. Experiments, historical repositories, upstream forks, and private metrics are excluded. The current canonical repositories are not publicly verified, so their metrics are withheld.
- Sparklines show recorded **repository views** by UTC day. Overlapping snapshots are deduplicated by repository/day, with the newest observation winning. The displayed view count sums those recorded daily view counts within the latest observation's 14-day window. Missing days are missing, not zero.
- “Daily uniques” means the API's distinct visitors for that repository on the labeled day. Daily uniques are **never summed into period visitors**, and uniques from different repositories are never combined into an alleged audience total. Each snapshot also preserves the API's period-level uniques separately.
- Top referrers use each repository's latest successful referrer response. They are ranked by views, with repository and observation date visible; they are not merged into cross-repository unique people. Views and referrers can have different observation times after partial failures.
- The **Last updated:** timestamp is the latest included actual UTC observation, not an image-render/build time. Before collection the cards say **Not collected yet**. Both SVG themes use a narrow 480-pixel stacked layout with large text so GitHub's mobile scaling remains readable.

Activity is a separate bounded feed: latest public repository `pushed_at`, published releases (including prereleases), and merged pull requests. It checks only canonical entries configured public and non-fork, then verifies live `private=false` and `fork=false`. Recent closed-PR/release pages are bounded; this is not a complete contribution history, quality score, or production claim.

## Collection and credentials

Configure a repository Actions secret named `TRAFFIC_TOKEN`: a fine-grained GitHub PAT restricted to the selected repositories, with **Administration: read** for traffic and the automatically available **Metadata: read** permission. The token holder must have sufficient access to read traffic (GitHub requires push access). An organization may require approval. A classic PAT has broader `repo` scope; prefer the fine-grained token.

The PAT does **not** need Contents: write. Commits use the workflow's separate `GITHUB_TOKEN`, and only the commit job has `contents: write`. Generation jobs have `contents: read`. No token is written to snapshots, SVGs, or the README.

Run with Node 24:

```sh
node scripts/collect-traffic.mjs
node scripts/render-stats.mjs --verify-visibility
node scripts/build-readme.mjs
```

Set `TRAFFIC_TOKEN` through your shell's secret facility, not in source or a committed file. The daily workflow does the same sequence. Missing `TRAFFIC_TOKEN` is a successful no-op: no fake zero snapshot, and visibility-verified rendering leaves existing cards unchanged. Rate limits, unavailable repositories, denied scopes, and partial endpoint failures retain earlier observations; error states are recorded without API bodies or private metadata.

## Privacy boundary and retention

The collector attempts authenticated metadata reads for **all canonical non-forks**, even entries unavailable to a public lookup, plus `me`. It does not request traffic for a private repository or an entry configured `public: false`. Public metrics are whitelisted and validated before serialization. Metadata is rechecked immediately before saving; rendering in the daily workflow also rechecks visibility before displaying history. API/network errors omit unverified repositories rather than interpreting them as public.

Snapshots are append-only `data/traffic/<UTC-observation>.json` files, with exclusive creation to prevent overwrites. Partial failures never delete prior snapshots. The newest valid daily observation replaces overlapping values only in the renderer, not on disk. Invalid cached data is ignored. Do not import private traffic snapshots.

Offline rendering (`node scripts/render-stats.mjs`) uses the current configuration and previously collected public observations; it cannot establish current visibility. Offline README builds reconstruct validated activity cached in the existing README (or `data/recent-activity.json`, if supplied), without API requests. A visibility change should be followed by an authenticated refresh and configuration review. Already committed public observations remain in Git history if a repository later becomes private; deleting a working-tree snapshot does not erase history. Review retention and token access periodically.

## CTA attribution is opt-in

`data/profile.yml` has `tracking.enabled`. When enabled, only the system and ClaimFlow HTTPS CTA destinations on `orpaynter.ai` receive `utm_source`, `utm_medium`, and a per-link `utm_campaign`. Existing query parameters are preserved; company GitHub, the interactive companion, and `mailto:` stay untagged. Other destination origins are never tagged. Set `enabled` to `false` to restore plain URLs.

UTMs only make attribution possible **if** the destination operates an appropriate first-party analytics system. This repository does not install one, count clicks, add tracking pixels, claim conversion rates, or fetch third-party analytics images. The cards are locally generated SVGs.
