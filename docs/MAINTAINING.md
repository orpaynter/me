# Maintaining the README system

## Sources and ownership

- `data/profile.yml`: owner, README repository, CTA URLs/tracking, and the repository build map.
- `templates/README.template.md`: narrative and presentation.
- `scripts/build-readme.mjs`: replaces `BUILD-MAP`, `RECENT-ACTIVITY`, and `SIGNALS` `START`/`END` blocks and the five `{{…_URL}}` CTA placeholders.
- `scripts/collect-traffic.mjs`: appends validated public observations.
- `scripts/render-stats.mjs`: deduplicates daily observations and renders both signal themes.
- `assets/svg/`: original local illustrations. `signals.svg` is dark; `signals-light.svg` is light.

`profile.yml` deliberately uses **JSON-form YAML 1.2**. JSON is valid YAML 1.2, and using `JSON.parse` keeps this pipeline dependency-free without pretending to implement a general YAML parser. Keep quoted keys/strings, no comments, and no trailing commas. Arbitrary YAML syntax is not accepted.

Keep all repository entries, including inaccessible, historical, experimental, and upstream-derived work. Only entries explicitly `public: true` receive repository links. A public API 404 means **not publicly verified**, not proof a repository does not exist. Do not substitute an experiment for unavailable canonical code.

Use `status` to record intent: `canonical`, `experimental`, `historical`, or `upstream fork`. `fork` is the actual GitHub metadata flag; an upstream-derived repository may have `fork: false` and still belong outside canonical activity. Check visibility/fork metadata before changing `public`, and update `verifiedOn` plus a truthful note. Scheduled activity and traffic independently recheck live visibility; the curated build-map links reflect the documented configuration, not a live availability guarantee.

## Local regeneration

Use Node 24 (supported LTS), with no dependency installation:

```sh
node scripts/build-readme.mjs
node scripts/render-stats.mjs
node scripts/build-readme.mjs
```

The first command is offline: no token is needed and no API request occurs. It reconstructs safe cached activity from the current README's encoded observation, or optional `data/recent-activity.json`, rather than trusting raw cached Markdown. With unchanged inputs, repeated builds are deterministic. No cache means a truthful availability message, not invented activity.

To request fresh activity explicitly:

```sh
node scripts/build-readme.mjs --fetch-activity
```

An optional `GITHUB_TOKEN` improves the API rate limit. Activity is bounded to verified public canonical non-forks; private metadata, release bodies, commit contents, and PR bodies are never published. Errors omit unsafe/unavailable observations. With no verified eligible repositories, the block contains no fabricated activity or observation timestamp. If a refresh finds identical public evidence, it preserves the original observation time rather than causing a timestamp-only commit. The fetch embeds its validated cache in the README, so the update workflow needs to commit **only README.md**. Offline builds cannot recheck visibility; run an authenticated refresh after changing visibility. See [analytics and privacy limits](ANALYTICS.md).

For traffic, set `TRAFFIC_TOKEN` securely and run the three-command sequence in [ANALYTICS.md](ANALYTICS.md). Missing credentials are a successful no-op. Never edit snapshots to manufacture zeros or inflate uniques.

## Automation and deployment

Both workflows support manual dispatch and daily schedules. README refresh also runs on branch pushes changing `data/**`, `templates/**`, or its builder/helper/workflow sources. GitHub-token bot commits do not recursively trigger other workflows. They share a branch-scoped concurrency group so traffic and README jobs do not race. Read-only generation jobs transfer only generated outputs via short-lived artifacts; separate commit jobs hold `contents: write`. They stage only expected paths, skip unchanged commits, and use normal fast-forward pushes (an outside branch change fails safely rather than force-overwriting it).

`update-readme.yml` commits only `README.md`. `traffic.yml` commits JSON observations, both signal SVGs, and their README rendering. PAT permissions are read-only; GitHub's workflow token performs writes. Action versions are pinned to verified full commit SHAs; check the GitHub Advisory Database and verify upstream tags before updating pins. The pipeline uses current supported Node 24.

This is **`orpaynter/me`**, not the special user-profile repository. To deploy to the actual GitHub profile, deliberately create/use public **`orpaynter/orpaynter`**, review relative assets and workflow permissions there, and update configuration accordingly. No cross-repository publishing is configured. Before using the interactive companion's Pages workflow, choose **Settings → Pages → Build and deployment → Source: GitHub Actions** in the repository. The Pages build job has `contents: read` and `pages: read`; only its deployment job has `pages: write` and `id-token: write`. Enabling Pages is an explicit repository setting, not something these maintenance jobs do.

## Review checklist

1. Keep operating-law language and proof boundaries intact.
2. Validate source JSON, URLs, and repository metadata; never copy private API payloads into public assets.
3. Regenerate and inspect both light/dark SVGs and the narrow-screen README.
4. Confirm inaccessible canonical repositories remain visible as **unlinked** map entries and experiments never enter canonical activity.
5. Check that observations label UTC dates, missing data is not zero, and uniques are not added across days/repositories.
6. Review the exact diff before committing. Do not commit credentials or unrelated generated changes.
