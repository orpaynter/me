import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, loadProfile, repositoryKey, publicCanonical, GitHub, markdown, safeURL,
  timestamp, trackedURL, optionalRead, writeChanged } from './lib.mjs';

const cachePattern = /<!-- ACTIVITY-CACHE: ([A-Za-z0-9+/=]+) -->/;

export function validateActivity(cache, p) {
  if (cache?.schemaVersion !== 1 || !Array.isArray(cache.items) || cache.items.length > 30) {
    throw new Error('Invalid activity cache');
  }
  const observedAt = timestamp(cache.observedAt);
  const allowed = new Set(publicCanonical(p).map(repositoryKey));
  const items = cache.items.filter(item => allowed.has(item.repository)).map(item => {
    if (!['push', 'release', 'merged-pr'].includes(item.type)) throw new Error('Invalid activity type');
    const at = timestamp(item.at);
    if (Date.parse(at) > Date.parse(observedAt)) throw new Error('Activity is newer than observation');
    const href = safeURL(item.href, { github: true });
    const url = new URL(href);
    const prefix = `/${item.repository}/`;
    if (!(url.pathname.startsWith(prefix) || url.pathname === `/${item.repository}`)) throw new Error('Wrong activity repository');
    const label = markdown(item.label);
    return { repository: item.repository, type: item.type, at, href, label: item.label, escapedLabel: label };
  });
  return { schemaVersion: 1, observedAt, items };
}

export function activityBlock(cache, p) {
  if (!cache) return 'No verified public canonical activity is available yet. Experiments, forks, and private repositories are excluded.';
  const valid = validateActivity(cache, p);
  const serialized = { schemaVersion: 1, observedAt: valid.observedAt,
    items: valid.items.map(({ escapedLabel, ...item }) => item) };
  const lines = valid.items.slice(0, 8).map(item =>
    `- **${item.at.slice(0, 10)}** · [${markdown(item.repository)}](${safeURL(`https://github.com/${item.repository}`)}) · [${item.escapedLabel}](${item.href})`);
  return [
    lines.length ? lines.join('\n') : 'No verified public canonical activity was available at the last check. Experiments, forks, and private repositories are excluded.',
    '',
    `Public evidence observed: ${valid.observedAt}. Unchanged evidence retains its original observation time; offline builds do not recheck visibility.`,
    `<!-- ACTIVITY-CACHE: ${Buffer.from(JSON.stringify(serialized)).toString('base64')} -->`,
  ].join('\n');
}

export async function fetchActivity(p, api, now = new Date().toISOString()) {
  const items = [];
  let verifiedRepositories = 0;
  for (const r of publicCanonical(p)) {
    const repository = repositoryKey(r);
    const visible = await api.visibility(r);
    if (!visible.ok) { console.warn(`Activity: ${repository}: ${visible.status}; omitted.`); continue; }
    const m = visible.value;
    try {
      if (m.pushed_at) items.push({ repository, type: 'push', at: timestamp(m.pushed_at),
        href: `https://github.com/${repository}`, label: 'Latest public repository push' });
    } catch { console.warn(`Activity: ${repository}: invalid push timestamp; omitted.`); }
    const releases = await api.get(`/repos/${repository}/releases?per_page=10`);
    if (releases.ok && Array.isArray(releases.value)) {
      for (const release of releases.value.filter(x => x && !x.draft && x.published_at)) {
        try {
          items.push({ repository, type: 'release', at: timestamp(release.published_at),
            href: safeURL(release.html_url, { github: true }), label: `Release: ${release.name || release.tag_name}` });
        } catch { console.warn(`Activity: ${repository}: invalid release; omitted.`); }
      }
    }
    const pulls = await api.get(`/repos/${repository}/pulls?state=closed&sort=updated&direction=desc&per_page=30`);
    if (pulls.ok && Array.isArray(pulls.value)) {
      for (const pull of pulls.value.filter(x => x?.merged_at)) {
        try {
          items.push({ repository, type: 'merged-pr', at: timestamp(pull.merged_at),
            href: safeURL(pull.html_url, { github: true }), label: `Merged PR: ${pull.title}` });
        } catch { console.warn(`Activity: ${repository}: invalid merged PR; omitted.`); }
      }
    }
    // Check again before publishing: repositories can change visibility mid-run.
    if (!(await api.visibility(r)).ok) {
      for (let i = items.length - 1; i >= 0; i--) if (items[i].repository === repository) items.splice(i, 1);
    } else verifiedRepositories++;
  }
  if (!verifiedRepositories) return null;
  const cache = { schemaVersion: 1, observedAt: now, items: items
    .filter(item => Date.parse(item.at) <= Date.parse(now))
    .sort((a, b) => b.at.localeCompare(a.at) || a.repository.localeCompare(b.repository) || a.href.localeCompare(b.href)).slice(0, 30) };
  // Invalid API fields must not poison a whole otherwise usable observation.
  cache.items = cache.items.filter(item => {
    try { validateActivity({ ...cache, items: [item] }, p); return true; } catch { return false; }
  });
  return cache;
}

function replaceBlock(template, name, contents) {
  const start = `<!-- ${name}:START -->`;
  const end = `<!-- ${name}:END -->`;
  if (template.split(start).length !== 2 || template.split(end).length !== 2 ||
      template.indexOf(start) > template.indexOf(end)) throw new Error(`Expected exactly one ${name} block`);
  const first = template.indexOf(start) + start.length;
  return `${template.slice(0, first)}\n${contents}\n${template.slice(template.indexOf(end))}`;
}

export async function main(args = process.argv.slice(2)) {
  if (args.some(a => a !== '--fetch-activity')) throw new Error('Usage: node scripts/build-readme.mjs [--fetch-activity]');
  const p = await loadProfile();
  const template = await readFile(resolve(root, 'templates/README.template.md'), 'utf8');
  const current = await optionalRead(resolve(root, 'README.md'));
  const fetching = args.includes('--fetch-activity');
  let cache = null;
  const data = await optionalRead(resolve(root, 'data/recent-activity.json'));
  try {
    if (current?.match(cachePattern)) cache = validateActivity(JSON.parse(Buffer.from(current.match(cachePattern)[1], 'base64').toString('utf8')), p);
    else if (data) cache = validateActivity(JSON.parse(data), p);
  } catch { console.warn('Activity: invalid cache ignored.'); }
  if (fetching) {
    const fresh = await fetchActivity(p, new GitHub());
    const payload = value => value?.items.map(({ escapedLabel, ...item }) => item);
    // Retain the actual original observation time when the public evidence is unchanged.
    if (!cache || !fresh || JSON.stringify(payload(cache)) !== JSON.stringify(payload(fresh))) cache = fresh;
  }
  let output = template;
  for (const name of ['system', 'claimflow', 'contact', 'company', 'interactive']) {
    output = output.replaceAll(`{{${name.toUpperCase()}_URL}}`, trackedURL(p, name));
  }
  if (/\{\{[A-Z_]+_URL\}\}/.test(output)) throw new Error('Unknown URL placeholder');
  const map = ['| Repository | Role | Status | Visibility / evidence |', '|---|---|---|---|'];
  for (const r of p.repositories) {
    const name = markdown(r.name);
    map.push(`| ${r.public ? `[${name}](https://github.com/${repositoryKey(r)})` : `**${name}**`} | ${markdown(r.role)} | ${markdown(r.status)}${r.fork ? ' · fork' : ''} | ${r.public ? 'Public' : 'Not publicly verified'} · verified ${r.verifiedOn}. ${markdown(r.note)} |`);
  }
  output = replaceBlock(output, 'BUILD-MAP', map.join('\n'));
  output = replaceBlock(output, 'RECENT-ACTIVITY', activityBlock(cache, p));
  const signals = '<picture>\n  <source media="(prefers-color-scheme: light)" srcset="./assets/svg/signals-light.svg">\n  <img src="./assets/svg/signals.svg" alt="Repository traffic observations: views, daily unique counts, and top referrers; not GitHub profile-page analytics." width="480">\n</picture>\n\nRepository traffic only — not profile-page views or CTA click counts. [Collection and privacy limits](./docs/ANALYTICS.md).';
  output = replaceBlock(output, 'SIGNALS', signals);
  await writeChanged(resolve(root, 'README.md'), `${output.trimEnd()}\n`);
  console.log('README built.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
