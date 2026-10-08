import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, loadProfile, publicTargets, repositoryKey, GitHub, readJSON, timestamp, count, xml, writeChanged } from './lib.mjs';
import { validateSeries, validateReferrers, validatePaths } from './collect-traffic.mjs';

const validStatuses = new Set(['collected', 'partial', 'private-withheld', 'fork-withheld', 'not-public', 'unavailable', 'invalid-metadata']);

export function validateSnapshot(value, allowed) {
  if (value?.schemaVersion !== 1 || !Array.isArray(value.repositories) || value.repositories.length > 1000) {
    throw new Error('Invalid snapshot');
  }
  const observedAt = timestamp(value.observedAt);
  const seen = new Set();
  const repositories = value.repositories.filter(r => allowed.has(r?.repository)).map(r => {
    if (!validStatuses.has(r.status) || seen.has(r.repository)) throw new Error('Invalid snapshot repository');
    seen.add(r.repository);
    const metrics = {};
    if (['collected', 'partial'].includes(r.status)) {
      if (!r.metrics || typeof r.metrics !== 'object') throw new Error('Invalid metrics');
      for (const field of ['views', 'clones', 'referrers', 'paths']) {
        if (r.metrics[field] === undefined) continue;
        metrics[field] = field === 'referrers' ? validateReferrers(r.metrics[field])
          : field === 'paths' ? validatePaths(r.metrics[field]) : validateSeries({
          ...r.metrics[field], [field]: r.metrics[field].days,
        }, field);
        if (!['referrers', 'paths'].includes(field) && metrics[field].days.some(d => d.timestamp > observedAt)) throw new Error('Future traffic day');
      }
    }
    return { repository: r.repository, status: r.status, metrics };
  });
  return { observedAt, repositories };
}

export function summarize(snapshots, targets) {
  const summaries = new Map(targets.map(repository => [repository, {
    repository, days: new Map(), referrers: null, observedAt: null, referrersAt: null,
  }]));
  for (const snapshot of [...snapshots].sort((a, b) => a.observedAt.localeCompare(b.observedAt))) {
    for (const r of snapshot.repositories) {
      const summary = summaries.get(r.repository);
      if (!summary) continue;
      if (r.metrics.views) {
        summary.observedAt = snapshot.observedAt;
        for (const day of r.metrics.views.days) summary.days.set(day.timestamp, day);
      }
      if (r.metrics.referrers) {
        summary.referrers = r.metrics.referrers;
        summary.referrersAt = snapshot.observedAt;
      }
    }
  }
  return [...summaries.values()].map(s => {
    const observationDay = s.observedAt?.slice(0, 10);
    const end = observationDay ? Date.parse(`${observationDay}T00:00:00.000Z`) : 0;
    const days = [...s.days.values()].filter(d => Date.parse(d.timestamp) >= end - 13 * 86400000 && Date.parse(d.timestamp) <= end)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const views = days.length ? count(days.reduce((total, d) => total + d.count, 0)) : null;
    return { ...s, days, views, lastDay: days.at(-1) };
  });
}

function sparkline(days, x, y, width, height, color) {
  if (!days.length) return '';
  const max = Math.max(1, ...days.map(d => d.count));
  const end = Date.parse(days.at(-1).timestamp);
  const points = days.map(d => `${(x + (13 - (end - Date.parse(d.timestamp)) / 86400000) / 13 * width).toFixed(1)},${(y + height - d.count / max * height).toFixed(1)}`);
  return `<polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/><circle cx="${points.at(-1).split(',')[0]}" cy="${points.at(-1).split(',')[1]}" r="3" fill="${color}"/>`;
}

export function render(summaries, light = false) {
  const c = light
    ? { bg: '#f4f8fc', card: '#e6eef6', border: '#71869c', ink: '#14263a', muted: '#405975', accent: '#086f62' }
    : { bg: '#101b2b', card: '#16263b', border: '#59718b', ink: '#f0f6ff', muted: '#b2c5db', accent: '#71dfc6' };
  const rows = Math.max(1, summaries.length);
  const referrers = summaries.flatMap(s => (s.referrers || []).slice(0, 3).map(r => ({ ...r, repository: s.repository, observedAt: s.referrersAt })))
    .sort((a, b) => b.count - a.count || a.repository.localeCompare(b.repository) || a.referrer.localeCompare(b.referrer)).slice(0, 6);
  const refY = 156 + rows * 204;
  const height = refY + 108 + Math.max(1, referrers.length) * 82 + 126;
  const observed = summaries.flatMap(s => [s.observedAt, s.referrersAt]).filter(Boolean).sort().at(-1);
  const label = value => xml(String(value).replace(/\r?\n/g, ' '));
  const short = (value, max) => value.length > max ? `${value.slice(0, max - 1)}…` : value;
  const t = (x, y, value, size = 16, fill = c.ink, weight = 400) =>
    `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}">${label(value)}</text>`;
  const body = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="${height}" viewBox="0 0 480 ${height}" role="img" aria-labelledby="title desc">`,
    '<title id="title">OrPaynter repository signals</title>',
    '<desc id="desc">GitHub repository traffic, not profile-page analytics. Views are deduplicated by repository and UTC day. Daily unique visitors are shown only for the latest recorded day of each repository, never summed. Missing data is not a zero.</desc>',
    `<rect width="480" height="${height}" rx="20" fill="${c.bg}"/>`,
    '<g font-family="ui-sans-serif, system-ui, sans-serif">',
    `<path d="M24 38h10l5-12 8 24 5-12h12" fill="none" stroke="${c.accent}" stroke-width="3"/>`,
    t(80, 44, 'REPOSITORY SIGNALS', 22, c.ink, 700),
    t(24, 79, observed ? `Last updated: ${observed}` : 'Last updated: Not collected yet', 16, c.muted),
    t(24, 108, 'Public canonical repos + this README repository.', 16, c.muted),
    t(24, 134, 'Not profile-page views or direct-click tracking.', 16, c.muted),
  ];
  if (!summaries.length) body.push(t(24, 195, 'No eligible public observations.', 18, c.muted));
  summaries.forEach((s, i) => {
    const y = 154 + i * 204;
    body.push(`<g><title>${label(s.repository)}</title>`,
      `<rect x="24" y="${y}" width="432" height="192" rx="10" fill="${c.card}" stroke="${c.border}"/>`,
      t(38, y + 29, short(s.repository, 32), 18, c.ink, 600),
      t(38, y + 55, s.observedAt ? `Observed ${s.observedAt.slice(0, 16).replace('T', ' ')} UTC` : 'Not collected yet', 15, c.muted),
      t(38, y + 85, s.views === null ? 'Views: not collected' : `${s.views.toLocaleString('en-US')} repository views`, 20, c.ink, 600),
      t(38, y + 111, s.lastDay ? `${s.lastDay.uniques} daily uniques · ${s.lastDay.timestamp.slice(0, 10)}` : 'Daily uniques: unavailable', 16, c.muted),
      sparkline(s.days, 38, y + 123, 375, 30, c.accent),
      t(38, y + 178, `${s.days.length}/14 UTC days recorded`, 15, c.muted), '</g>');
  });
  body.push(t(24, refY + 24, 'TOP REFERRERS', 20, c.ink, 700),
    t(24, refY + 51, 'Latest available API period per repository.', 16, c.muted),
    t(24, refY + 76, 'Ranked by views, not combined unique people.', 16, c.muted));
  if (!referrers.length) body.push(t(24, refY + 119, observed ? 'No referrer observations available.' : 'Not collected yet', 16, c.muted));
  referrers.forEach((r, i) => body.push(t(24, refY + 116 + i * 82, short(r.referrer, 36), 18, c.ink, 600),
    t(24, refY + 141 + i * 82, `${short(r.repository, 28)} · ${r.count} views`, 15, c.muted),
    t(24, refY + 166 + i * 82, `Observed ${r.observedAt.slice(0, 10)}`, 15, c.muted)));
  body.push(t(24, height - 91, '14-day sparkline: recorded repository views.', 16, c.muted),
    t(24, height - 66, 'Missing days are not invented zeros.', 16, c.muted),
    t(24, height - 41, 'Partial failures keep prior observations.', 16, c.muted),
    t(24, height - 16, 'Cached history cannot verify current visibility.', 16, c.muted),
    '</g></svg>\n');
  return body.join('\n');
}

export async function main(args = process.argv.slice(2)) {
  if (args.some(a => a !== '--verify-visibility')) throw new Error('Usage: node scripts/render-stats.mjs [--verify-visibility]');
  const p = await loadProfile();
  let targets = [...new Set(publicTargets(p).map(repositoryKey))];
  if (args.includes('--verify-visibility')) {
    if (!process.env.TRAFFIC_TOKEN) { console.log('Signals unchanged: visibility verification requires TRAFFIC_TOKEN.'); return; }
    const api = new GitHub(process.env.TRAFFIC_TOKEN);
    const verified = [];
    for (const key of targets) {
      const [owner, name] = key.split('/');
      if ((await api.visibility({ owner, name })).ok) verified.push(key);
      else console.warn(`Signals: ${key}: visibility not verified; omitted.`);
    }
    targets = verified;
  }
  const directory = resolve(root, 'data/traffic');
  let files = [];
  try { files = (await readdir(directory)).filter(f => f.endsWith('.json')).sort(); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const snapshots = [];
  for (const file of files) {
    try { snapshots.push(validateSnapshot(await readJSON(resolve(directory, file)), new Set(targets))); }
    catch { console.warn(`Signals: invalid snapshot ${file}; ignored.`); }
  }
  const summaries = summarize(snapshots, targets);
  await writeChanged(resolve(root, 'assets/svg/signals.svg'), render(summaries));
  await writeChanged(resolve(root, 'assets/svg/signals-light.svg'), render(summaries, true));
  console.log('Signals rendered.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
