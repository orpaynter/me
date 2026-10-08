import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, loadProfile, canonical, repositoryKey, GitHub, timestamp, count, text } from './lib.mjs';

export function validateSeries(value, field) {
  if (!value || !Array.isArray(value[field]) || value[field].length > 31) throw new Error('Invalid traffic series');
  const days = value[field].map(day => ({
    timestamp: timestamp(day.timestamp), count: count(day.count), uniques: count(day.uniques),
  }));
  if (days.some(d => d.uniques > d.count || !d.timestamp.endsWith('T00:00:00.000Z')) ||
      new Set(days.map(d => d.timestamp)).size !== days.length) throw new Error('Invalid daily traffic');
  const total = count(value.count), uniques = count(value.uniques);
  if (uniques > total || days.reduce((sum, d) => sum + d.count, 0) !== total) throw new Error('Invalid traffic totals');
  return { count: total, uniques, days };
}

export function validateReferrers(value) {
  if (!Array.isArray(value) || value.length > 100) throw new Error('Invalid referrers');
  return value.map(r => {
    const result = { referrer: text(r.referrer, 300), count: count(r.count), uniques: count(r.uniques) };
    if (result.uniques > result.count) throw new Error('Invalid referrer counts');
    return result;
  });
}

export function validatePaths(value) {
  if (!Array.isArray(value) || value.length > 100) throw new Error('Invalid popular paths');
  return value.map(p => {
    const result = { path: text(p.path, 2048), title: text(p.title), count: count(p.count), uniques: count(p.uniques) };
    if (!result.path.startsWith('/') || /[\r\n]/.test(result.path) || result.uniques > result.count) {
      throw new Error('Invalid popular path');
    }
    return result;
  });
}

export async function collect(p, api, observedAt) {
  const targets = new Map(canonical(p).map(r => [repositoryKey(r), r]));
  targets.set(`${p.owner}/${p.profileRepository}`, { owner: p.owner, name: p.profileRepository, public: true });
  const repositories = [];
  for (const [repository, r] of targets) {
    const visible = await api.visibility(r);
    if (!visible.ok || !r.public) {
      repositories.push({ repository, status: visible.ok ? 'not-public' : visible.status });
      continue;
    }
    const metrics = {};
    const errors = [];
    for (const field of ['views', 'clones', 'referrers', 'paths']) {
      const popular = ['referrers', 'paths'].includes(field);
      const result = await api.get(`/repos/${repository}/traffic/${popular ? `popular/${field}` : `${field}?per=day`}`);
      if (!result.ok) { errors.push(field); continue; }
      try {
        metrics[field] = field === 'referrers' ? validateReferrers(result.value)
          : field === 'paths' ? validatePaths(result.value) : validateSeries(result.value, field);
        if (!popular && metrics[field].days.some(d => d.timestamp > observedAt)) {
          delete metrics[field]; errors.push(field);
        }
      } catch { errors.push(field); }
    }
    const finalVisibility = await api.visibility(r);
    if (!finalVisibility.ok) {
      repositories.push({ repository, status: finalVisibility.status });
      continue;
    }
    repositories.push({ repository, status: errors.length ? 'partial' : 'collected', metrics, ...(errors.length ? { errors } : {}) });
  }
  return { schemaVersion: 1, observedAt: timestamp(observedAt), repositories };
}

export async function main(args = process.argv.slice(2)) {
  if (args.length) throw new Error('Usage: node scripts/collect-traffic.mjs');
  const token = process.env.TRAFFIC_TOKEN;
  if (!token) { console.log('Traffic not collected: TRAFFIC_TOKEN is not configured. Existing observations unchanged.'); return; }
  const p = await loadProfile();
  const snapshot = await collect(p, new GitHub(token), new Date().toISOString());
  const directory = resolve(root, 'data/traffic');
  await mkdir(directory, { recursive: true });
  const base = snapshot.observedAt.replace(/[:.]/g, '-');
  // Exclusive creation preserves even two observations made in the same millisecond.
  for (let suffix = 0; ; suffix++) {
    const path = resolve(directory, `${base}${suffix ? `-${suffix}` : ''}.json`);
    try { await writeFile(path, `${JSON.stringify(snapshot, null, 2)}\n`, { flag: 'wx' }); break; }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  console.log(`Traffic observation saved: ${snapshot.observedAt}; ${snapshot.repositories.filter(r => r.status === 'collected').length} complete public repositories.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
