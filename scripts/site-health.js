#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://www.topchinacar.com';
const LIVE = process.argv.includes('--live');

function walk(dir, predicate) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(absolute, predicate));
    else if (predicate(absolute)) files.push(absolute);
  }
  return files;
}

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])((?:(?!\\1).)*)\\1`, 'i'));
  return match ? decodeEntities(match[2]) : null;
}

function matches(html, expression) {
  return Array.from(html.matchAll(expression), match => match[0]);
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
}

function cleanPathname(value) {
  try {
    const url = new URL(value, ORIGIN);
    if (url.origin !== ORIGIN) return null;
    return decodeURIComponent(url.pathname);
  } catch {
    return null;
  }
}

const redirects = new Set(
  fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split(/\s+/)[0])
);

function localTarget(pathname) {
  if (!pathname) return null;
  if (pathname === '/') return path.join(ROOT, 'index.html');
  if (pathname === '/zh' || pathname === '/zh/') return path.join(ROOT, 'zh/index.html');
  const relative = pathname.replace(/^\/+/, '');
  const candidates = [
    path.join(ROOT, relative),
    path.join(ROOT, `${relative}.html`),
    path.join(ROOT, relative, 'index.html')
  ];
  return candidates.find(candidate => fs.existsSync(candidate)) || null;
}

function addIssue(issues, code, file, detail) {
  issues.push({ code, file: path.relative(ROOT, file), detail });
}

function auditLocal() {
  const issues = [];
  const htmlFiles = walk(ROOT, file => file.endsWith('.html'));
  const canonicalOwners = new Map();

  for (const file of htmlFiles) {
    const relative = path.relative(ROOT, file);
    const html = fs.readFileSync(file, 'utf8');
    const is404 = relative === '404.html';
    const titles = matches(html, /<title\b[^>]*>[\s\S]*?<\/title>/gi);
    const descriptions = matches(html, /<meta\b[^>]*name=["']description["'][^>]*>/gi);
    const canonicals = matches(html, /<link\b[^>]*rel=["']canonical["'][^>]*>/gi);
    const h1s = matches(html, /<h1\b[^>]*>[\s\S]*?<\/h1>/gi);

    if (/topchinacar-event-intelligence\.vercel\.app\/admin\/login/i.test(html)) {
      addIssue(issues, 'admin-url-exposed', file, 'public template contains the admin login URL');
    }

    if (titles.length !== 1 || !stripTags(titles[0] || '')) addIssue(issues, 'title', file, `found ${titles.length}`);
    if (!is404 && descriptions.length !== 1) addIssue(issues, 'description', file, `found ${descriptions.length}`);
    if (!is404 && canonicals.length !== 1) addIssue(issues, 'canonical', file, `found ${canonicals.length}`);
    if (!is404 && h1s.length !== 1) addIssue(issues, 'h1', file, `found ${h1s.length}`);

    if (canonicals.length === 1) {
      const canonical = attr(canonicals[0], 'href');
      if (!canonical?.startsWith(`${ORIGIN}/`)) addIssue(issues, 'canonical-origin', file, canonical || 'missing href');
      if (canonicalOwners.has(canonical)) addIssue(issues, 'duplicate-canonical', file, `${canonicalOwners.get(canonical)} also uses ${canonical}`);
      canonicalOwners.set(canonical, relative);
    }

    const lang = attr(html.match(/<html\b[^>]*>/i)?.[0] || '', 'lang');
    // 独立研究报告放在 /reports/ 下，中英文共用一个地址（build.js 的设计），只要求声明了语言；其余页面根目录是英文、zh/ 是中文
    const isReport = relative.startsWith('reports/');
    const langOk = isReport ? /^(en|zh(-CN)?)$/.test(lang || '') : relative.startsWith('zh/') ? lang === 'zh' : lang === 'en';
    if (!langOk) addIssue(issues, 'lang', file, lang || 'missing');

    if (!is404) {
      const alternates = matches(html, /<link\b[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>/gi);
      const byLanguage = new Map(alternates.map(tag => [attr(tag, 'hreflang'), attr(tag, 'href')]));
      for (const language of ['en', 'zh-CN', 'x-default']) {
        if (!byLanguage.has(language)) addIssue(issues, 'hreflang-missing', file, language);
      }
      for (const [language, href] of byLanguage) {
        const pathname = cleanPathname(href);
        if (!pathname || !localTarget(pathname)) addIssue(issues, 'hreflang-target', file, `${language}: ${href || 'missing href'}`);
      }
      const alternateLocale = matches(html, /<meta\b[^>]*property=["']og:locale:alternate["'][^>]*>/gi);
      if (alternateLocale.length !== 1) addIssue(issues, 'og-locale-alternate', file, `found ${alternateLocale.length}`);
    }

    const ids = matches(html, /\bid=["'][^"']+["']/gi).map(tag => attr(tag, 'id'));
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length) addIssue(issues, 'duplicate-id', file, [...new Set(duplicateIds)].join(', '));

    for (const script of matches(html, /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi)) {
      const json = script.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '');
      try { JSON.parse(json); } catch (error) { addIssue(issues, 'json-ld', file, error.message); }
    }

    for (const image of matches(html, /<img\b[^>]*>/gi)) {
      const src = attr(image, 'src');
      if (attr(image, 'alt') === null) addIssue(issues, 'image-alt', file, src || 'image without src');
      if (!src || /^(?:data:|https?:)/i.test(src)) continue;
      const target = localTarget(cleanPathname(src));
      if (!target) addIssue(issues, 'missing-asset', file, src);
    }

    for (const link of matches(html, /<a\b[^>]*href=["'][^"']+["'][^>]*>/gi)) {
      const href = attr(link, 'href');
      if (!href || /^(?:#|mailto:|tel:|javascript:)/i.test(href)) continue;
      const pathname = cleanPathname(href);
      if (!pathname) continue;
      const redirectMatch = [...redirects].some(pattern => {
        if (pattern.endsWith('/*')) return pathname.startsWith(pattern.slice(0, -1));
        return pathname === pattern;
      });
      if (!localTarget(pathname) && !redirectMatch) addIssue(issues, 'broken-link', file, href);
    }

    if (/class=["']spec-label["']>\s*From\s*<\/span>\s*<span class=["']spec-value["']>\s*from\b/i.test(html)) {
      addIssue(issues, 'duplicate-price-prefix', file, 'From from …');
    }
  }

  const sitemapFiles = ['sitemap-pages.xml', 'sitemap-posts.xml'];
  for (const sitemapFile of sitemapFiles) {
    const file = path.join(ROOT, sitemapFile);
    const xml = fs.readFileSync(file, 'utf8');
    for (const loc of Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), match => decodeEntities(match[1]))) {
      const pathname = cleanPathname(loc);
      if (!localTarget(pathname)) addIssue(issues, 'sitemap-target', file, loc);
    }
  }

  const postSitemap = fs.readFileSync(path.join(ROOT, 'sitemap-posts.xml'), 'utf8');
  const postLastmods = new Set(Array.from(postSitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g), match => match[1]));
  if (postLastmods.size < 2) addIssue(issues, 'sitemap-lastmod', path.join(ROOT, 'sitemap-posts.xml'), 'all post dates are identical');

  return { pages: htmlFiles.length, issues };
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    return await fetch(url, { ...options, signal: controller.signal, headers: { 'user-agent': 'TopChinaCar-Site-Health/1.0', ...(options.headers || {}) } });
  } finally {
    clearTimeout(timer);
  }
}

async function runPool(items, concurrency, worker) {
  const results = new Array(items.length);
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

async function auditLive() {
  const issues = [];
  const indexResponse = await fetchWithTimeout(`${ORIGIN}/sitemap.xml`);
  const indexXml = await indexResponse.text();
  const sitemapUrls = Array.from(indexXml.matchAll(/<loc>([^<]+)<\/loc>/g), match => decodeEntities(match[1]));
  const pageUrls = new Set();

  for (const sitemapUrl of sitemapUrls) {
    const response = await fetchWithTimeout(sitemapUrl);
    if (!response.ok) issues.push({ code: 'sitemap-status', file: sitemapUrl, detail: String(response.status) });
    const xml = await response.text();
    for (const loc of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) pageUrls.add(decodeEntities(loc[1]));
  }

  const pages = await runPool([...pageUrls], 8, async url => {
    try {
      const response = await fetchWithTimeout(url);
      const html = await response.text();
      return { url, status: response.status, type: response.headers.get('content-type') || '', html };
    } catch (error) {
      return { url, status: 0, type: '', html: '', error: error.message };
    }
  });

  for (const page of pages) {
    if (page.status !== 200) {
      issues.push({ code: 'live-status', file: page.url, detail: page.error || String(page.status) });
      continue;
    }
    if (!page.type.includes('text/html')) issues.push({ code: 'live-content-type', file: page.url, detail: page.type });
    const canonicalTag = page.html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0] || '';
    const canonical = attr(canonicalTag, 'href');
    if (canonical !== page.url) issues.push({ code: 'live-canonical', file: page.url, detail: canonical || 'missing' });
    if (/<title\b[^>]*>\s*<\/title>/i.test(page.html) || !/<title\b/i.test(page.html)) issues.push({ code: 'live-title', file: page.url, detail: 'missing or empty' });
  }

  const contentTypes = [
    ['/robots.txt', 'text/plain'],
    ['/sitemap.xml', 'xml'],
    ['/sitemap-pages.xml', 'xml'],
    ['/sitemap-posts.xml', 'xml'],
    ['/sitemap-news.xml', 'xml'],
    ['/feed.xml', 'xml']
  ];
  for (const [pathname, expected] of contentTypes) {
    const response = await fetchWithTimeout(`${ORIGIN}${pathname}`);
    const type = response.headers.get('content-type') || '';
    if (!response.ok || !type.includes(expected)) issues.push({ code: 'special-content-type', file: pathname, detail: `${response.status} ${type}` });
  }

  const redirectChecks = [
    ['https://topchinacar.com/', `${ORIGIN}/`],
    [`${ORIGIN}/brands`, `${ORIGIN}/chinese-car-brands`],
    [`${ORIGIN}/zh/brands`, `${ORIGIN}/zh/chinese-car-brands`]
  ];
  for (const [from, expected] of redirectChecks) {
    const response = await fetchWithTimeout(from, { redirect: 'manual' });
    const location = response.headers.get('location');
    if (![301, 302, 307, 308].includes(response.status) || new URL(location || '/', from).href !== expected) {
      issues.push({ code: 'redirect', file: from, detail: `${response.status} ${location || 'no location'}` });
    }
  }

  return { pages: pageUrls.size, sitemaps: sitemapUrls.length, issues };
}

(async () => {
  const local = auditLocal();
  const report = { local };
  if (LIVE) report.live = await auditLive();
  console.log(JSON.stringify(report, null, 2));
  const failures = local.issues.length + (report.live?.issues.length || 0);
  process.exitCode = failures ? 1 : 0;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
