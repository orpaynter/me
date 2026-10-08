import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const statuses = new Set(['canonical', 'experimental', 'historical', 'upstream fork']);
const ownerPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const repoPattern = /^[A-Za-z0-9_.-]{1,100}$/;
export const repositoryKey = ({ owner, name }) => `${owner}/${name}`;
export const canonical = p => p.repositories.filter(r => r.status === 'canonical' && !r.fork);
export const publicCanonical = p => canonical(p).filter(r => r.public);
export const publicTargets = p => [...publicCanonical(p), { owner: p.owner, name: p.profileRepository }];

export function text(value, max = 500) {
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)) {
    throw new Error('Invalid text value');
  }
  return value;
}

export function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) ||
      !Number.isFinite(Date.parse(value))) throw new Error('Invalid UTC timestamp');
  const normalized = new Date(value).toISOString();
  if (normalized.slice(0, 19) !== value.slice(0, 19)) throw new Error('Invalid UTC calendar date');
  return normalized;
}

export function count(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid count');
  return value;
}

export function safeURL(value, { mailto = false, github = false } = {}) {
  text(value, 2048);
  if (/[<>"'\\\s]/u.test(value)) throw new Error('Unsafe URL');
  const url = new URL(value);
  if (url.username || url.password ||
      !(url.protocol === 'https:' || (mailto && url.protocol === 'mailto:')) ||
      (github && (url.origin !== 'https://github.com' || url.protocol !== 'https:'))) {
    throw new Error('Unsafe URL');
  }
  // Parentheses and brackets must not break Markdown link destinations.
  return url.href.replace(/[()[\]]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

export const markdown = value => text(value).replace(/\r?\n/g, ' ').replace(/&/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\\`*_{}\[\]()#!|~]/g, '\\$&');
export const xml = value => String(value).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

export async function readJSON(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function optionalRead(path) {
  try { return await readFile(path, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

export async function writeChanged(path, contents) {
  if (await optionalRead(path) === contents) return false;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents, 'utf8');
  return true;
}

export async function loadProfile() {
  const p = await readJSON(resolve(root, 'data/profile.yml'));
  if (!p || typeof p.owner !== 'string' || typeof p.profileRepository !== 'string' ||
      !ownerPattern.test(p.owner) || !repoPattern.test(p.profileRepository) ||
      ['.', '..'].includes(p.profileRepository) || !Array.isArray(p.repositories) ||
      !p.links || !p.tracking || typeof p.tracking.enabled !== 'boolean') throw new Error('Invalid profile configuration');
  for (const name of ['system', 'claimflow', 'company', 'contact', 'interactive']) {
    safeURL(p.links[name], { mailto: name === 'contact' });
  }
  text(p.tracking.source, 100);
  text(p.tracking.medium, 100);
  const seen = new Set();
  for (const r of p.repositories) {
    if (!r || typeof r.owner !== 'string' || typeof r.name !== 'string' ||
        !ownerPattern.test(r.owner) || !repoPattern.test(r.name) || ['.', '..'].includes(r.name) ||
        !statuses.has(r.status) || typeof r.public !== 'boolean' || typeof r.fork !== 'boolean' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(r.verifiedOn)) throw new Error('Invalid repository configuration');
    text(r.role); text(r.note);
    timestamp(`${r.verifiedOn}T00:00:00Z`);
    const key = repositoryKey(r).toLowerCase();
    if (seen.has(key)) throw new Error('Duplicate repository configuration');
    seen.add(key);
  }
  return p;
}

export function trackedURL(p, name) {
  const href = safeURL(p.links[name], { mailto: name === 'contact' });
  if (!p.tracking.enabled || !['system', 'claimflow'].includes(name)) return href;
  const url = new URL(href);
  if (url.origin !== 'https://orpaynter.ai') return href;
  url.searchParams.set('utm_source', p.tracking.source);
  url.searchParams.set('utm_medium', p.tracking.medium);
  url.searchParams.set('utm_campaign', name);
  return safeURL(url.href);
}

export class GitHub {
  constructor(token = process.env.GITHUB_TOKEN || '') { this.token = token; }
  async get(path) {
    if (!path.startsWith('/repos/')) throw new Error('Invalid GitHub API path');
    const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'orpaynter-readme-builder' };
    if (this.token) headers.Authorization = ['Bearer', this.token].join(' ');
    try {
      const response = await fetch(`https://api.github.com${path}`, {
        headers, redirect: 'error', signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) return { ok: false, status: response.status };
      return { ok: true, value: await response.json() };
    } catch { return { ok: false, status: 'network-or-invalid-json' }; }
  }
  async visibility(r) {
    const result = await this.get(`/repos/${repositoryKey(r)}`);
    if (!result.ok) return { ok: false, status: 'unavailable' };
    const m = result.value;
    if (!m || typeof m.private !== 'boolean' || typeof m.fork !== 'boolean' ||
        typeof m.full_name !== 'string' || m.full_name.toLowerCase() !== repositoryKey(r).toLowerCase()) {
      return { ok: false, status: 'invalid-metadata' };
    }
    if (m.private) return { ok: false, status: 'private-withheld' };
    if (m.fork) return { ok: false, status: 'fork-withheld' };
    return { ok: true, value: m };
  }
}
