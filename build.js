#!/usr/bin/env node
// ============ STATIC PRERENDER ============
// Generates one fully-rendered HTML file per route so search engines see real
// content at real URLs. Run after editing js/data.js or js/i18n.js:
//   node build.js
// Output: index.html, brands.html, models.html, news.html, tech.html,
//         about.html, 404.html  (Vercel cleanUrls serves /chinese-car-brands from brands.html)

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const SITE = 'https://www.topchinacar.com';
const SITE_TIME_ZONE = 'Asia/Shanghai';
const BUILD_NOW = process.env.BUILD_NOW ? new Date(process.env.BUILD_NOW) : new Date();
if (Number.isNaN(BUILD_NOW.getTime())) {
  throw new Error(`Invalid BUILD_NOW value: ${process.env.BUILD_NOW}`);
}

function dateInTimeZone(date, timeZone = SITE_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function shiftIsoDate(date, days) {
  const shifted = new Date(`${date}T12:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

const BUILD_V = BUILD_NOW.toISOString().slice(0, 16).replace(/[-:T]/g, ''); // cache-busting version
const TODAY = dateInTimeZone(BUILD_NOW);
const DEFAULT_OG_IMAGE = 'images/hero-xiaomi.jpg';
const SITE_LOGO = 'images/topchinacar-logo.svg';

const imageDimensionCache = new Map();

function imageDimensions(src) {
  const relative = String(src || '').replace(/^\//, '');
  if (!relative.startsWith('images/')) return null;
  if (imageDimensionCache.has(relative)) return imageDimensionCache.get(relative);

  const file = path.join(ROOT, relative);
  let result = null;
  try {
    const buffer = fs.readFileSync(file);
    if (buffer.length >= 24 && buffer.toString('ascii', 1, 4) === 'PNG') {
      result = { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    } else if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
      while (offset + 8 < buffer.length) {
        if (buffer[offset] !== 0xff) { offset += 1; continue; }
        const marker = buffer[offset + 1];
        offset += 2;
        if (marker === 0xd8 || marker === 0xd9) continue;
        if (offset + 2 > buffer.length) break;
        const segmentLength = buffer.readUInt16BE(offset);
        if (sofMarkers.has(marker) && offset + 7 <= buffer.length) {
          result = {
            width: buffer.readUInt16BE(offset + 5),
            height: buffer.readUInt16BE(offset + 3)
          };
          break;
        }
        if (segmentLength < 2) break;
        offset += segmentLength;
      }
    }
  } catch (error) {
    console.warn(`! unable to read image dimensions for ${relative}: ${error.message}`);
  }

  imageDimensionCache.set(relative, result);
  return result;
}

function addImageDimensions(html) {
  return html.replace(/<img\b[^>]*>/g, tag => {
    if (/\bwidth=/.test(tag) && /\bheight=/.test(tag)) return tag;
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    const dimensions = imageDimensions(src);
    if (!dimensions) return tag;
    return tag.replace('<img', `<img width="${dimensions.width}" height="${dimensions.height}"`);
  });
}

function namespaceFragmentIds(html, namespace) {
  const source = String(html || '');
  const ids = new Set(Array.from(
    source.matchAll(/\bid=(["'])([^"']+)\1/gi),
    match => match[2]
  ));
  if (!ids.size) return source;

  return source
    .replace(/\bid=(["'])([^"']+)\1/gi,
      (all, quote, id) => `id=${quote}${namespace}-${id}${quote}`)
    .replace(/\bhref=(["'])#([^"']+)\1/gi,
      (all, quote, id) => ids.has(id) ? `href=${quote}#${namespace}-${id}${quote}` : all)
    .replace(/\b(aria-labelledby|aria-describedby)=(["'])([^"']+)\2/gi,
      (all, name, quote, value) => {
        const references = value.split(/\s+/).map(id => ids.has(id) ? `${namespace}-${id}` : id);
        return `${name}=${quote}${references.join(' ')}${quote}`;
      });
}

// ---- Collect daily articles (articles/*.json, written by the GCP pipeline) ----
const ARTICLES_DIR = path.join(ROOT, 'articles');
function articlePublishedTime(article) {
  const raw = article?.published_at || article?.date;
  if (!raw) return 0;
  const value = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00Z` : raw;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

let articles = [];
if (fs.existsSync(ARTICLES_DIR)) {
  articles = fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf-8')); }
      catch (e) { console.error(`✗ skipping bad article ${f}: ${e.message}`); return null; }
    })
    .filter(a => a && a.slug && a.date && a.title_en && a.html_en)
    .sort((a, b) => articlePublishedTime(b) - articlePublishedTime(a) || b.slug.localeCompare(a.slug));
}

function assertNoMarkdownResidue(article, field) {
  const html = String(article[field] || '');
  const checks = [
    { name: 'raw markdown heading', re: /(^|[\n>])\s*#{1,6}\s+\S/ },
    { name: 'raw markdown table separator', re: /\|\s*:?[—–-]{3,}:?\s*\|/ },
    { name: 'raw markdown table paragraph', re: /<p>[^<]{0,240}\|[^<]{0,240}\|[^<]{0,240}<\/p>/ }
  ];
  const failed = checks.find(check => check.re.test(html));
  if (!failed) return;
  throw new Error(
    `Article "${article.slug}" ${field} contains ${failed.name}. ` +
    'Convert Markdown to HTML before publishing.'
  );
}

for (const article of articles) {
  assertNoMarkdownResidue(article, 'html_en');
  assertNoMarkdownResidue(article, 'html_zh');
}

// Lightweight index (no article bodies) shared with the client for the News page
const articlesIndex = articles.map(a => ({
  slug: a.slug, date: a.date, published_at: a.published_at || a.date,
  title_en: a.title_en, title_zh: a.title_zh || a.title_en,
  excerpt_en: a.excerpt_en || '', excerpt_zh: a.excerpt_zh || a.excerpt_en || '',
  tag_en: a.tag_en || 'Daily Briefing', tag_zh: a.tag_zh || '每日简报'
}));
fs.writeFileSync(path.join(ROOT, 'js', 'articles-data.js'),
  '// Generated by build.js — do not edit\nconst SITE_ARTICLES = '
  + JSON.stringify(articlesIndex, null, 2) + ';\n');

// ---- Load site scripts in a sandbox with a minimal document stub ----
const sandbox = {
  document: { documentElement: { lang: 'en' } },
  module: undefined,
  console
};
vm.createContext(sandbox);
for (const f of ['js/data.js', 'js/i18n.js', 'js/articles-data.js', 'js/pages.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf-8'), sandbox, { filename: f });
}
const PAGE_ROUTES = vm.runInContext('PAGE_ROUTES', sandbox);
const MAP_WARS_ORDER = vm.runInContext('MAP_WARS_SLUG_ORDER', sandbox);

// ============ Chinese mirror (/zh/...) helpers ============
const I18N_ZH = vm.runInContext('I18N.zh', sandbox);
const I18N_EN = vm.runInContext('I18N.en', sandbox);
const setSandboxLang = l => vm.runInContext(`document.documentElement.lang='${l}'`, sandbox);

// Post-process a rendered page into its Chinese variant:
//  - translate header/footer/newsletter chrome (data-i18n / data-i18n-attr)
//  - flip bilingual data-lang blocks (zh visible, en hidden)
//  - prefix internal links with /zh (assets, api and external links untouched)
function zhChrome(html) {
  // Translate only nodes still holding the exact English dictionary value —
  // re-rendered zh content (already Chinese) is left untouched.
  html = html.replace(/(<[^>]*data-i18n="([^"]+)"[^>]*>)([^<]*)/g,
    (all, open, key, txt) =>
      (I18N_ZH[key] !== undefined && txt.trim() === String(I18N_EN[key] || '').trim())
        ? open + I18N_ZH[key] : all);
  html = html.replace(/placeholder="[^"]*"([^>]*data-i18n-attr="placeholder:([^"]+)")/g,
    (all, rest, key) => I18N_ZH[key] !== undefined ? `placeholder="${I18N_ZH[key]}"${rest}` : all);
  html = html
    .replace(/data-lang="zh" hidden/g, 'data-lang="zh" data-zh-keep')
    .replace(/data-lang="en"/g, 'data-lang="en" hidden')
    .replace(/data-lang="zh" data-zh-keep/g, 'data-lang="zh"');
  html = html.replace(/href="\/(?!zh\/|zh"|images\/|css\/|js\/|api\/|cdn-cgi\/)/g, 'href="/zh/');
  return html;
}

function writeZh(relPath, html) {
  const dest = path.join(ROOT, 'zh', relPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
}

const PAGES_ZH = {
  '/': { title: 'TopChinaCar | 中国汽车全球化新闻：新能源、出口与全球市场', desc: 'TopChinaCar 面向国际读者报道中国汽车品牌、电动车、出口市场、政策变化与全球扩张。' },
  '/editorial-policy': { title: 'TopChinaCar 编辑方针与信源标准', desc: 'TopChinaCar 如何报道中国汽车全球化：内容主线、信源标准、文章结构、独立性与更正政策。' },
  '/contact': { title: '联系 TopChinaCar — 媒体、市场情报与合作', desc: '报道线索、勘误、媒体、市场情报与合作事宜，请联系 TopChinaCar。48 小时内回复。' },
  '/newsletter': { title: '中国车企出海日报 — 邮件订阅 | TopChinaCar', desc: '每天早晨发送的中国车企出海日报：新能源出口、海外工厂、经销网络、政策、ADAS 与市场进入信号。' },
  '/chinese-car-brands': { title: '中国汽车品牌大全 | TopChinaCar', desc: '中国汽车品牌指南：比亚迪、吉利、奇瑞、长安、上汽、一汽、长城、广汽、东风、北汽，以及蔚来、小鹏、理想、小米、零跑等新势力。' },
  '/models': { title: '中国电动车明星车型 — 续航、价格与参数 | TopChinaCar', desc: '定义新时代的中国电动车：比亚迪海豹、小米 SU7 Ultra、蔚来 ET9、小鹏 G6、理想 MEGA、极氪 001——真实续航、零百加速与美元指导价。' },
  '/news': { title: '中国汽车出海与电动车行业新闻 | TopChinaCar', desc: '中国汽车出口、新车发布、电池技术与政策动态的精选报道，以及每个工作日更新的出海简报。' },
  '/series/map-wars': { title: '地图战争：全球数字地图产业八部曲 | TopChinaCar', desc: '八篇连续深度文章，梳理 Navteq、HERE、TomTom、Google、Overture 与 AI 地理基础设施的产业演变。' },
  '/intelligence': { title: 'TopChinaCar 情报系统 | 看懂中国汽车全球化', desc: 'TopChinaCar 追踪中国车企出海、海外工厂、出口、价格、政策风险与市场变化，把分散新闻转化为结构化市场信号。' },
  '/tech': { title: '中国电动车技术解读：800V、城市智驾、刀片电池 | TopChinaCar', desc: '深度解读中国汽车领先背后的技术：800V 高压平台、城市级智能驾驶、智能座舱、刀片电池与 CTB 电池车身一体化。' },
  '/about': { title: '关于 TopChinaCar — 独立的中国汽车编辑报道', desc: 'TopChinaCar 是面向海外读者的独立双语编辑出版物，讲解中国汽车——品牌、车型、技术与人。不吹捧，不贬低。' },
  '/quote': { title: '商业与合作联系 | TopChinaCar', desc: '面向合作、市场情报、赞助与研究需求的联系页面。TopChinaCar 的核心定位仍是独立新闻与信息报道。', robots: 'noindex,follow' },
  '/privacy': { title: 'TopChinaCar 隐私政策与数据使用说明', desc: 'TopChinaCar 如何收集、使用与保护您的信息：联系表单、邮件订阅与网站分析的数据用途说明。' }
};


// Feature story bodies (build-time only — never shipped to the client)
let SITE_STORIES = [];
if (fs.existsSync(path.join(ROOT, 'js', 'stories-data.js'))) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'stories-data.js'), 'utf-8'), sandbox, { filename: 'js/stories-data.js' });
  SITE_STORIES = vm.runInContext('typeof SITE_STORIES !== "undefined" ? SITE_STORIES : []', sandbox);
}
const SITE_DATA = vm.runInContext('SITE_DATA', sandbox);

// ---- Per-page metadata ----
const PAGES = {
  '/': {
    file: 'index.html',
    title: 'TopChinaCar | Chinese Auto News, EVs, Exports and Global Markets',
    desc: 'TopChinaCar covers Chinese car brands, electric vehicles, export markets, policy changes, and global expansion for international readers.'
  },
  '/chinese-car-brands': {
    file: 'chinese-car-brands.html',
    title: 'Chinese Car Brands: BYD, Geely, NIO & More | TopChinaCar',
    desc: 'A field guide to Chinese legacy auto groups, EV startups and sub-brands, with founding dates, headquarters, focus areas and export footprint.'
  },
  '/models': {
    file: 'models.html',
    title: 'Featured Chinese EV Models — Range, Price & Specs | TopChinaCar',
    desc: 'The Chinese EVs defining the new era: BYD Seal, Xiaomi SU7 Ultra, NIO ET9, Xpeng G6, Li Auto MEGA, Zeekr 001 — with real range figures, 0-100 times and prices in ¥/$/€.'
  },
  '/news': {
    file: 'news.html',
    title: 'China Auto Export & EV Industry News | TopChinaCar',
    desc: 'Curated reporting on Chinese car exports, new model launches, battery technology and policy — plus the daily China Auto Overseas Daily.'
  },
  '/series/map-wars': {
    file: 'series/map-wars.html',
    title: 'Map Wars: Eight Essays on the Global Digital Map Industry | TopChinaCar',
    desc: 'An eight-part series on Navteq, HERE, TomTom, Google, Overture and the map infrastructure being rebuilt for AI agents.',
    lastmod: '2026-07-26'
  },
  '/intelligence': {
    file: 'intelligence.html',
    title: 'TopChinaCar Intelligence System | China Auto Globalization Signals',
    desc: 'TopChinaCar tracks Chinese automakers, overseas markets, factories, exports, pricing and policy risk, then turns fragmented news into structured market signals.'
  },
  '/tech': {
    file: 'tech.html',
    title: 'Chinese EV Technology Explained: 800V, City Autonomy, Blade Batteries | TopChinaCar',
    desc: 'Deep dives into the technologies behind China\'s automotive lead: 800V high-voltage platforms, city-level autonomous driving, smart cockpits, and Blade & CTB batteries.'
  },
  '/about': {
    file: 'about.html',
    title: 'About TopChinaCar — Independent Editorial on Chinese Automakers',
    desc: 'TopChinaCar is an independent, bilingual editorial publication explaining Chinese automobiles to overseas readers — brands, cars, technology and people. No hype, no dismissal.'
  },
  '/quote': {
    file: 'quote.html',
    title: 'Commercial & Partnership Contact | TopChinaCar',
    desc: 'Contact page for partnerships, market intelligence, sponsorship and research requests. TopChinaCar remains an independent news and information site.',
    robots: 'noindex,follow'
  },
  '/privacy': {
    file: 'privacy.html',
    title: 'Privacy Policy | TopChinaCar',
    desc: 'How TopChinaCar collects, uses and protects your information: contact forms, newsletter subscriptions and site analytics.'
  },
  '/editorial-policy': {
    file: 'editorial-policy.html',
    title: 'Editorial Policy | TopChinaCar',
    desc: 'How TopChinaCar reports on China auto globalization: coverage pillars, sourcing standards, article structure, independence and corrections.'
  },
  '/contact': {
    file: 'contact.html',
    title: 'Contact TopChinaCar — Media, Market Intelligence & Partnerships',
    desc: 'For editorial tips, corrections, media, market intelligence and partnerships, contact TopChinaCar. We respond within 48 hours.'
  },
  '/newsletter': {
    file: 'newsletter.html',
    title: 'China Auto Overseas Daily — Email Newsletter | TopChinaCar',
    desc: 'Daily intelligence on Chinese automakers overseas, EV exports, plants, dealers, policy, ADAS and market-entry signals, curated for global readers.'
  }
};

const NAV = [
  ['/news', 'nav.news', 'News'],
  ['/intelligence', 'nav.intelligence', 'Intelligence'],
  ['/china-ev-news', 'nav.ev', 'EV'],
  ['/china-car-export-news', 'nav.exports', 'Exports'],
  ['/chinese-car-brands', 'nav.brands', 'Brands'],
  ['/markets', 'nav.markets', 'Markets'],
  ['/policy', 'nav.policy', 'Policy'],
  ['/data', 'nav.data', 'Data'],
  ['/analysis', 'nav.analysis', 'Analysis']
];

function headerHTML(route, isZh = false) {
  const navLinks = NAV.map(([href, key, label]) =>
    `<a href="${href}"${href === route ? ' class="active"' : ''} data-i18n="${key}">${label}</a>`).join('\n      ');
  const languageHref = isZh
    ? (route === '/' ? `${SITE}/` : `${SITE}${route}`)
    : (route === '/' ? '/zh/' : `/zh${route}`);
  return `<header class="site-header" id="siteHeader">
  <div class="container header-inner">
    <a href="/" class="logo">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="2" fill="currentColor"/>
        <text x="16" y="23" font-family="Playfair Display,serif" font-size="22" font-weight="900" text-anchor="middle" fill="#d4302a">T</text>
      </svg>
      <span class="logo-text">
        <span class="logo-main">TopChinaCar</span>
        <span class="logo-sub" data-i18n="logo.sub">China Auto News for Global Markets</span>
      </span>
    </a>

    <nav class="main-nav" id="primaryNav" aria-label="Primary">
      ${navLinks}
    </nav>

    <div class="header-tools">
      <a class="admin-link" href="/newsletter" data-i18n="nav.newsletter">Newsletter</a>
      <a class="lang-toggle" id="langToggle" href="${languageHref}" aria-label="Switch language (EN/中)" title="Switch language">
        <span class="lang-en">EN</span><span class="lang-sep">/</span><span class="lang-zh">中</span>
      </a>
      <button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-controls="primaryNav" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>

  <div class="hot-strip">
    <div class="container hot-strip-inner">
      <span class="hot-strip-label" data-i18n="nav.hot">Hot brands</span>
      <a href="/chinese-car-brands/byd" class="hot-pill">BYD</a>
      <a href="/chinese-car-brands/xiaomi" class="hot-pill">Xiaomi</a>
      <a href="/chinese-car-brands/nio" class="hot-pill">NIO</a>
      <a href="/chinese-car-brands/xpeng" class="hot-pill">Xpeng</a>
      <a href="/chinese-car-brands/zeekr" class="hot-pill">Zeekr</a>
      <a href="/chinese-car-brands/geely" class="hot-pill">Geely</a>
    </div>
  </div>
</header>`;
}

const NEWSLETTER = `<section class="newsletter" aria-label="Newsletter subscription">
  <div class="container newsletter-inner">
    <div class="newsletter-text">
      <div class="newsletter-eyebrow" data-i18n="newsletter.eyebrow">China Auto Overseas Daily</div>
      <h2 class="newsletter-title" data-i18n="newsletter.title">Daily intelligence on Chinese automakers going global.</h2>
      <p class="newsletter-deck" data-i18n="newsletter.deck">Every morning: Chinese automakers overseas, EV exports, plants, dealers, policy, ADAS and market-entry signals. Curated for global readers. No spam. Unsubscribe anytime.</p>
    </div>
    <div class="newsletter-form-wrap">
      <form class="newsletter-form" id="newsletterForm">
        <label class="sr-only" for="newsletterEmail" data-i18n="newsletter.emailLabel">Email address</label>
        <input class="newsletter-input" id="newsletterEmail" type="email" name="email" placeholder="your@email.com" required data-i18n-attr="placeholder:newsletter.placeholder" />
        <button class="newsletter-btn" type="submit" data-i18n="newsletter.cta">Subscribe</button>
      </form>
      <div class="newsletter-ok" id="newsletterOk" hidden data-i18n="newsletter.success">Thanks — you are on the list for the next China Auto Overseas Daily.</div>
      <p class="newsletter-note"><span data-i18n="newsletter.resendNote">Delivered by Resend. Unsubscribe anytime.</span></p>
    </div>
  </div>
</section>`;

const FOOTER = `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <div class="footer-logo">TopChinaCar</div>
      <p data-i18n="footer.tagline">An editorial guide to the new era of Chinese automobiles, written for the world.</p>
    </div>
    <div class="footer-col">
      <h2 class="footer-heading" data-i18n="footer.explore">Explore</h2>
      <a href="/news" data-i18n="nav.news">News</a>
      <a href="/intelligence" data-i18n="nav.intelligence">Intelligence</a>
      <a href="/china-ev-news" data-i18n="nav.ev">EV</a>
      <a href="/china-car-export-news" data-i18n="nav.exports">Exports</a>
      <a href="/chinese-car-brands" data-i18n="nav.brands">Brands</a>
      <a href="/markets" data-i18n="nav.markets">Markets</a>
      <a href="/models" data-i18n="nav.models">Models</a>
    </div>
    <div class="footer-col">
      <h2 class="footer-heading" data-i18n="footer.about">About</h2>
      <a href="/about" data-i18n="nav.about">Our story</a>
      <a href="/editorial-policy" data-i18n="footer.editorial">Editorial Policy</a>
      <a href="/newsletter" data-i18n="footer.newsletter">Newsletter</a>
      <a href="/contact" data-i18n="footer.contact">Contact</a>
      <a href="/privacy" data-i18n="footer.privacy">Privacy Policy</a>
    </div>
    <div class="footer-col footer-meta">
      <h2 class="footer-heading" data-i18n="footer.status">Status</h2>
      <p>© 2026 TopChinaCar</p>
      <p data-i18n="footer.rights">Editorial, independent, worldwide.</p>
    </div>
  </div>
</footer>`;

const JSONLD = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "${SITE}/#organization",
      "name": "TopChinaCar",
      "url": "${SITE}/",
      "logo": {
        "@type": "ImageObject",
        "url": "${SITE}/${SITE_LOGO}",
        "width": 512,
        "height": 512
      },
      "description": "Independent news site covering Chinese automakers, EVs, exports and global market expansion.",
      "foundingDate": "2026",
      "sameAs": []
    },
    {
      "@type": "WebSite",
      "@id": "${SITE}/#website",
      "url": "${SITE}/",
      "name": "TopChinaCar",
      "publisher": { "@id": "${SITE}/#organization" },
      "inLanguage": ["en", "zh-CN"]
    },
    {
      "@type": "NewsMediaOrganization",
      "@id": "${SITE}/#newsmedia",
      "name": "TopChinaCar",
      "url": "${SITE}/",
      "logo": {
        "@type": "ImageObject",
        "url": "${SITE}/${SITE_LOGO}",
        "width": 512,
        "height": 512
      },
      "diversityPolicy": "${SITE}/about",
      "ethicsPolicy": "${SITE}/about"
    }
  ]
}
</script>`;

function escAttr(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function xmlEscape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function plainText(html) {
  return String(html || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateMeta(s, max = 160) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[,:;—-]\s*$/, '') + '…';
}

function canonicalUrl(route, isZh = false) {
  if (route === '/') return isZh ? `${SITE}/zh/` : `${SITE}/`;
  return isZh ? `${SITE}/zh${route}` : `${SITE}${route}`;
}

function assetUrl(asset) {
  if (!asset) return `${SITE}/${DEFAULT_OG_IMAGE}`;
  if (/^https?:\/\//i.test(asset)) return asset;
  return `${SITE}/${String(asset).replace(/^\/+/, '')}`;
}

function jsonLdScript(data) {
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
}

function breadcrumbJsonLd(route, items, isZh = false) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.route || route, isZh)
    }))
  };
}

function collectionJsonLd(route, title, description, itemRoutes = [], isZh = false) {
  const pageUrl = canonicalUrl(route, isZh);
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#collection`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: isZh ? 'zh-CN' : 'en',
        isPartOf: { '@id': `${SITE}/#website` }
      },
      {
        '@type': 'ItemList',
        itemListElement: itemRoutes.slice(0, 50).map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: canonicalUrl(item.route, isZh),
          name: item.name
        }))
      },
      breadcrumbJsonLd(route, [
        { name: 'Home', route: '/' },
        { name: title, route }
      ], isZh)
    ]
  });
}

function webPageJsonLd(route, title, description, type = 'WebPage', isZh = false) {
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${canonicalUrl(route, isZh)}#webpage`,
    url: canonicalUrl(route, isZh),
    name: title,
    description,
    inLanguage: isZh ? 'zh-CN' : 'en',
    isPartOf: { '@id': `${SITE}/#website` },
    publisher: { '@id': `${SITE}/#organization` },
    breadcrumb: breadcrumbJsonLd(route, [
      { name: 'Home', route: '/' },
      { name: title, route }
    ], isZh)
  });
}

const STATIC_FAQS = {
  '/chinese-car-brands': [
    ['Which Chinese car brands sell internationally?', 'BYD, Geely, Chery, Changan, SAIC/MG, FAW/Hongqi, Great Wall, GAC, Dongfeng, BAIC and newer EV brands such as NIO, Xpeng, Li Auto, Xiaomi and Leapmotor all sell or prepare vehicles outside China.'],
    ['What is the difference between Chinese legacy groups and EV startups?', 'Legacy groups such as BYD, Geely, Chery, Changan, SAIC, FAW, Great Wall, GAC, Dongfeng and BAIC have complete manufacturing systems and export networks. EV startups usually focus on newer EV, EREV and smart-car platforms.'],
    ['Which Chinese brands are strongest for export markets?', 'BYD, Chery, Geely, SAIC/MG and Great Wall have broad overseas footprints today, while Changan, GAC, Dongfeng, FAW and BAIC remain important state-group systems to track.']
  ],
  '/models': [
    ['Which Chinese EV models are most relevant internationally?', 'BYD Seal, BYD Atto 3, MG4, Xiaomi SU7, Xpeng G6, Zeekr 001, NIO ET5 and Leapmotor C10 are among the models international readers often track.'],
    ['Are the prices listed on TopChinaCar transaction prices?', 'No. Model pages use indicative local list prices and approximate USD conversions for editorial context. Actual market prices vary by country, trim, taxes, logistics and local incentives.'],
    ['Do Chinese EV specs differ by country?', 'Yes. Battery size, charging standard, safety equipment, software, warranty and homologation package can differ between China-market vehicles and export-market versions.']
  ],
  '/news': [
    ['What does TopChinaCar cover every day?', 'TopChinaCar tracks Chinese automakers overseas, EV and battery news, export data, overseas plants, dealer networks, tariffs, regulations and market-entry stories.'],
    ['Are TopChinaCar articles sourced?', 'Articles cite primary or reputable secondary sources inline and list source links where available, especially for data, policy and company announcements.'],
    ['Why focus on Chinese auto exports?', 'China has become the world’s largest car exporter, and export growth now shapes automaker strategy, global pricing, supply chains and policy debates.']
  ],
};

const STATIC_FAQS_ZH = {
  '/chinese-car-brands': [
    ['哪些中国汽车品牌正在海外销售？', '比亚迪、吉利、奇瑞、长安、上汽/MG、一汽/红旗、长城、广汽、东风、北汽，以及蔚来、小鹏、理想、小米、零跑等新势力，都在海外销售或准备进入海外市场。'],
    ['传统车企集团和造车新势力有什么区别？', '传统整车集团包括比亚迪、吉利、奇瑞、长安、上汽、一汽、长城、广汽、东风、北汽，通常拥有完整制造体系和出口网络；新势力更多聚焦纯电、增程和智能化平台。'],
    ['哪些中国品牌的出口能力最强？', '比亚迪、奇瑞、吉利、上汽/MG 和长城目前海外版图较广；长安、广汽、东风、一汽、北汽等国有集团体系也需要持续跟踪。']
  ],
  '/models': [
    ['哪些中国电动车最值得国际读者关注？', '比亚迪海豹、BYD Atto 3、MG4、小米 SU7、小鹏 G6、极氪 001、蔚来 ET5 和零跑 C10 是国际读者常关注的车型。'],
    ['TopChinaCar 上的价格是成交价吗？', '不是。车型页使用本地指导价和近似美元换算，仅作为编辑背景信息。实际市场价格会因国家、配置、税费、物流和本地激励而变化。'],
    ['中国电动车在不同国家的配置会不同吗？', '会。电池容量、充电标准、安全配置、软件、质保和认证包可能因中国版与出口版不同而变化。']
  ],
  '/news': [
    ['TopChinaCar 每天报道什么？', 'TopChinaCar 追踪中国车企出海、新能源与电池新闻、出口数据、海外工厂、经销网络、关税、监管和市场进入动态。'],
    ['TopChinaCar 的文章有信源吗？', '文章会在正文内引用一手或可信二手信源，尤其是涉及数据、政策和企业公告时，会尽量列出可核查链接。'],
    ['为什么重点关注中国汽车出口？', '中国已经成为全球第一大汽车出口国，出口增长正在影响车企战略、全球定价、供应链和政策讨论。']
  ],
};

function faqJsonLd(route, lang = 'en') {
  const items = (lang === 'zh' ? STATIC_FAQS_ZH : STATIC_FAQS)[route];
  if (!items) return '';
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  });
}

function serviceJsonLd(route) {
  return '';
}

function pageHTML(route, meta, mainHTML, opts = {}) {
  const isZh = !!opts.zh;
  const enUrl = canonicalUrl(route, false);
  const zhUrl = canonicalUrl(route, true);
  const canonical = isZh ? zhUrl : enUrl;
  const ogImageSource = meta.image || opts.image || DEFAULT_OG_IMAGE;
  const ogImage = assetUrl(ogImageSource);
  const ogDimensions = imageDimensions(ogImageSource) || { width: 1200, height: 630 };
  const canonicalLinks = opts.noCanonical ? '' : `<link rel="canonical" href="${canonical}" />
${opts.noAlt ? '' : `<link rel="alternate" hreflang="en" href="${enUrl}" />
<link rel="alternate" hreflang="zh-CN" href="${zhUrl}" />
<link rel="alternate" hreflang="x-default" href="${enUrl}" />
`}`;
  const extraHead = opts.extraHead || meta.extraHead || '';
  meta = { ...meta, title: escAttr(meta.title), desc: escAttr(truncateMeta(meta.desc, 165)) };
  const modified = meta.modified || meta.published;
  const includeNewsletter = route !== '/newsletter';
  const fontFamilies = isZh
    ? 'family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,500&family=Inter:wght@400;500;600;700&family=Noto+Serif+SC:wght@500;700;900&family=Noto+Sans+SC:wght@400;500;700'
    : 'family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,500&family=Inter:wght@400;500;600;700';
  const fontHref = `https://fonts.googleapis.com/css2?${fontFamilies}&display=optional`.replace(/&/g, '&amp;');
  const html = `<!DOCTYPE html>
<html lang="${isZh ? 'zh' : 'en'}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${meta.title}</title>
<meta name="description" content="${meta.desc}" />
${meta.robots ? `<meta name="robots" content="${escAttr(meta.robots)}" />\n` : ''}<meta name="author" content="TopChinaCar Editorial" />
<meta name="theme-color" content="#1a1a1a" />
${canonicalLinks}
<!-- Open Graph -->
<meta property="og:type" content="${meta.ogType || 'website'}" />
<meta property="og:site_name" content="TopChinaCar" />
<meta property="og:title" content="${meta.title}" />
<meta property="og:description" content="${meta.desc}" />
${opts.noCanonical ? '' : `<meta property="og:url" content="${canonical}" />`}
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="${ogDimensions.width}" />
<meta property="og:image:height" content="${ogDimensions.height}" />
<meta property="og:locale" content="${isZh ? 'zh_CN' : 'en_US'}" />
${opts.noAlt ? '' : `<meta property="og:locale:alternate" content="${isZh ? 'en_US' : 'zh_CN'}" />`}
${meta.published ? `<meta property="article:published_time" content="${meta.published}" />\n<meta property="article:modified_time" content="${modified}" />\n<meta property="article:section" content="${escAttr(meta.section || 'Analysis')}" />` : ''}

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${meta.title}" />
<meta name="twitter:description" content="${meta.desc}" />
<meta name="twitter:image" content="${ogImage}" />
<link rel="alternate" type="application/rss+xml" title="TopChinaCar News" href="${SITE}/feed.xml" />

${route === '/' ? JSONLD + '\n' : ''}${extraHead ? extraHead + '\n' : ''}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="${fontHref}" as="style">
<link href="${fontHref}" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="${fontHref}" rel="stylesheet"></noscript>
<link rel="stylesheet" href="/css/style.css?v=${BUILD_V}" />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%231a1a1a'/><text x='16' y='22' font-family='Playfair Display,serif' font-size='20' font-weight='900' text-anchor='middle' fill='%23d4302a'>T</text></svg>">
</head>
<body>

${headerHTML(route, isZh)}

<main id="app">${mainHTML}</main>

${includeNewsletter ? NEWSLETTER : ''}

${FOOTER}

<script src="/js/data.js?v=${BUILD_V}"></script>
<script src="/js/i18n.js?v=${BUILD_V}"></script>
<script src="/js/articles-data.js?v=${BUILD_V}"></script>
<script src="/js/pages.js?v=${BUILD_V}"></script>
<script src="/js/app.js?v=${BUILD_V}"></script>
</body>
</html>
`;
  return addImageDimensions(html.replace(/[ \t]+$/gm, ''));
}

function staticCollectionItems(route) {
  if (route === '/chinese-car-brands') {
    return SITE_DATA.brands.map(b => ({ route: `/chinese-car-brands/${b.id}`, name: b.name }));
  }
  if (route === '/models') {
    return SITE_DATA.models.filter(m => m.id).map(m => ({ route: `/models/${m.id}`, name: `${m.brand} ${m.name}` }));
  }
  if (route === '/news') {
    return articles.map(a => ({ route: `/news/${a.slug}`, name: a.title_en }));
  }
  if (route === '/series/map-wars') {
    const bySlug = new Map(articles
      .filter(a => a.tag_en === 'Map Wars')
      .map(a => [a.slug, a]));
    return MAP_WARS_ORDER
      .map(slug => bySlug.get(slug))
      .filter(Boolean)
      .map(a => ({ route: `/news/${a.slug}`, name: a.title_en }));
  }
  if (route === '/tech') {
    const techArticles = articles
      .filter(a => /EV|electric|battery|charging|swap|autonomous|smart|ADAS|software|800V|PHEV|EREV/i.test(`${a.title_en} ${a.excerpt_en || ''}`))
      .map(a => ({ route: `/news/${a.slug}`, name: a.title_en }));
    const techStories = SITE_STORIES
      .map(s => {
        const f = (SITE_DATA.features || []).find(x => x.slug === s.slug);
        return f ? { route: `/stories/${s.slug}`, name: f.title_en || s.slug } : null;
      })
      .filter(Boolean);
    return techArticles.concat(techStories);
  }
  if (route === '/markets') {
    return MARKETS.map(m => ({ route: `/markets/${m.slug}`, name: m.name_en }));
  }
  return [];
}

const STATIC_COLLECTION_ROUTES = new Set(['/chinese-car-brands', '/models', '/news', '/tech', '/series/map-wars']);
const STATIC_WEBPAGE_TYPES = {
  '/about': 'AboutPage',
  '/intelligence': 'WebPage',
  '/editorial-policy': 'WebPage',
  '/contact': 'ContactPage',
  '/newsletter': 'WebPage',
  '/privacy': 'WebPage'
};

function staticExtraHead(route, meta, lang = 'en') {
  if (meta.robots && meta.robots.includes('noindex')) return '';
  if (route === '/') return '';
  const title = meta.title.replace(/\s+\|\s+TopChinaCar$/, '');
  const isZh = lang === 'zh';
  if (STATIC_WEBPAGE_TYPES[route]) {
    return webPageJsonLd(route, title, meta.desc, STATIC_WEBPAGE_TYPES[route], isZh);
  }
  if (!STATIC_COLLECTION_ROUTES.has(route)) return '';
  return [
    collectionJsonLd(route, title, meta.desc, staticCollectionItems(route), isZh),
    faqJsonLd(route, lang),
    serviceJsonLd(route)
  ].filter(Boolean).join('\n');
}

// ---- Generate pages (EN + /zh mirror) ----
let count = 0;
for (const [route, meta] of Object.entries(PAGES)) {
  const mainHTML = PAGE_ROUTES[route]();
  const outputFile = path.join(ROOT, meta.file);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, pageHTML(route, { ...meta, extraHead: staticExtraHead(route, meta, 'en') }, mainHTML));
  setSandboxLang('zh');
  const mainZh = PAGE_ROUTES[route]();
  setSandboxLang('en');
  const zhMeta = PAGES_ZH[route] || meta;
  writeZh(meta.file, zhChrome(pageHTML(route, { ...zhMeta, extraHead: staticExtraHead(route, zhMeta, 'zh') }, mainZh, { zh: true })));
  console.log(`✓ ${meta.file} + zh (${mainHTML.length} chars of prerendered content)`);
  count++;
}

// ---- Brand detail pages (/chinese-car-brands/<id>) ----
const BRANDS_OUT = path.join(ROOT, 'chinese-car-brands');
if (!fs.existsSync(BRANDS_OUT)) fs.mkdirSync(BRANDS_OUT);

const CATEGORY_LABEL = {
  group:    { en: 'Legacy Group', zh: '传统车企集团' },
  startup:  { en: 'New-Energy Startup', zh: '造车新势力' },
  subbrand: { en: 'Group Sub-Brand', zh: '集团子品牌' }
};

// Category-level buyer context (adds substance beyond the short brand blurb)
const CATEGORY_CONTEXT = {
  group: {
    en: 'As an established manufacturing group, it ships complete knock-down and fully-built vehicles worldwide, with mature homologation experience across left- and right-hand-drive markets. For dealers, that typically means broader spare-parts availability and factory-backed export documentation.',
    zh: '作为成熟的制造集团，其整车与 KD 件出口遍及全球，在左舵/右舵市场均有成熟的认证经验。对经销商而言，这通常意味着更完善的配件供应与厂家出口文件支持。'
  },
  startup: {
    en: 'As a new-energy startup, its lineup is EV-first with over-the-air software updates and rapid model cycles. Dealers importing these vehicles should verify charging-standard compatibility (CCS/GB-T) and local service arrangements for the destination market.',
    zh: '作为新势力车企，其产品以纯电为主，支持整车 OTA、车型迭代快。进口时需确认目的市场的充电标准兼容性（CCS/GB-T）与本地售后安排。'
  },
  subbrand: {
    en: 'It operates as an independent marque within its parent group, sharing platforms and the export network while targeting a distinct segment. Parts and homologation support generally flow through the parent group\'s international channels.',
    zh: '它作为母集团旗下的独立品牌运营，共享平台与出口网络，同时瞄准差异化细分市场。配件与认证支持通常通过母集团的国际渠道提供。'
  }
};

function langSpan(en, zh) {
  return `<span data-lang="en">${en}</span><span data-lang="zh" hidden>${zh}</span>`;
}

function entityMention(text, value) {
  const source = String(text || '');
  const needle = String(value || '').trim();
  if (!needle) return false;
  if (/^[\x00-\x7F]+$/.test(needle)) {
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'i').test(source);
  }
  return source.includes(needle);
}

function articleBrandRelevance(article, brand) {
  const identities = [brand.id, brand.name, brand.cn].filter(Boolean);
  const tagged = values => Array.isArray(values) && values.some(value =>
    identities.some(identity => String(value).toLowerCase() === String(identity).toLowerCase()));

  if (tagged(article.primary_brands) || tagged(article.brands)) return 3;
  if (identities.some(identity => entityMention(`${article.title_en || ''} ${article.title_zh || ''}`, identity))) return 3;
  if (tagged(article.secondary_brands)) return 1;
  if (identities.some(identity => entityMention(`${article.excerpt_en || ''} ${article.excerpt_zh || ''}`, identity))) return 1;
  if (identities.some(identity => entityMention(`${article.html_en || ''} ${article.html_zh || ''}`, identity))) return 1;
  return 0;
}

function rankedBrandArticles(brand, limit = 5, secondaryLimit = 1) {
  const matches = articles
    .map(article => ({ article, relevance: articleBrandRelevance(article, brand) }))
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance
      || articlePublishedTime(b.article) - articlePublishedTime(a.article)
      || b.article.slug.localeCompare(a.article.slug));
  const primary = matches.filter(item => item.relevance >= 3).map(item => item.article);
  const secondary = matches.filter(item => item.relevance < 3).slice(0, secondaryLimit).map(item => item.article);
  return primary.concat(secondary).slice(0, limit);
}

function brandMain(b) {
  const cat = CATEGORY_LABEL[b.category] || CATEGORY_LABEL.group;
  const ctx = CATEGORY_CONTEXT[b.category] || CATEGORY_CONTEXT.group;
  const models = SITE_DATA.models.filter(m => m.brand === b.name);
  const related = rankedBrandArticles(b);

  const fact = (labelEn, labelZh, val) => `
    <div class="brand-fact"><span class="spec-label">${langSpan(labelEn, labelZh)}</span><span class="spec-value">${val}</span></div>`;

  return `
  <section class="page-header">
    <div class="container">
      <div class="section-eyebrow">${langSpan(cat.en, cat.zh)}${b.parent_en ? ` · ${langSpan('Part of ' + b.parent_en, '隶属于' + (b.parent_zh || b.parent_en))}` : ''}</div>
      <h1 class="page-title">${b.name} <span style="font-size:.55em;color:#9ca3af;font-weight:500;">${b.cn}</span></h1>
      <p class="page-deck">${langSpan(b.desc_en, b.desc_zh)}</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container" style="max-width:920px;">
      <div class="brand-facts" style="display:flex;gap:36px;flex-wrap:wrap;margin-bottom:36px;">
        ${fact('Founded', '创立', b.founded)}
        ${fact('HQ', '总部', b.hq)}
        ${fact('Focus', '主攻', b.focus)}
        ${b.subBrands_en ? fact('Sub-brands', '旗下品牌', `${langSpan(b.subBrands_en, b.subBrands_zh || b.subBrands_en)}`) : ''}
      </div>
      <div style="font-size:16px;line-height:1.8;color:#374151;">
        <p>${langSpan(ctx.en, ctx.zh)}</p>
      </div>
      ${models.length ? `
      <h2 style="font-size:22px;margin:40px 0 20px;">${langSpan('Featured ' + b.name + ' models', b.name + ' 明星车型')}</h2>
      <div class="models-grid">
        ${models.map(m => modelCardHTML(m, 'en')).join('')}
      </div>` : ''}
      ${related.length ? `
      <h2 style="font-size:22px;margin:40px 0 20px;">${langSpan('Latest ' + b.name + ' news', b.name + ' 最新动态')}</h2>
      <ul style="list-style:none;padding:0;margin:0;">
        ${related.map(a => `<li style="margin-bottom:14px;"><a href="/news/${a.slug}" style="color:inherit;text-decoration:none;"><strong>${a.title_en}</strong></a><br/><span style="font-size:13px;color:#9ca3af;">${a.date}</span></li>`).join('')}
      </ul>` : ''}
      <p style="margin-top:40px;"><a href="/chinese-car-brands" style="color:var(--accent, #d4302a);font-family:var(--mono);font-size:13px;">← All Chinese car brands</a></p>
    </div>
  </section>`;
}

function brandJsonLd(b, isZh = false) {
  const route = `/chinese-car-brands/${b.id}`;
  return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Brand",
      "name": "${b.name}",
      "alternateName": "${b.cn}",
      "url": "${canonicalUrl(route, isZh)}",
      "image": "${assetUrl(b.image)}",
      "description": ${JSON.stringify(b.desc_en)}
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "${canonicalUrl('/', isZh)}"},
        {"@type": "ListItem", "position": 2, "name": "Brands", "item": "${canonicalUrl('/chinese-car-brands', isZh)}"},
        {"@type": "ListItem", "position": 3, "name": "${b.name}", "item": "${canonicalUrl(route, isZh)}"}
      ]
    }
  ]
}
</script>`;
}

// ---- Brand auto-linker: first mention of each brand in article text → /chinese-car-brands/<id> ----
// Works on HTML strings; skips text inside <a>…</a> and headings.
function linkifyBrands(html, lang) {
  if (!html) return html;
  const done = new Set();
  const segments = html.split(/(<[^>]+>)/);
  let skipDepth = 0;
  const brands = [...SITE_DATA.brands].sort((x, y) => y.name.length - x.name.length);
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.startsWith('<')) {
      if (/^<(a|h[1-6])[\s>]/i.test(seg)) skipDepth++;
      else if (/^<\/(a|h[1-6])>/i.test(seg)) skipDepth = Math.max(0, skipDepth - 1);
      continue;
    }
    if (skipDepth > 0 || !seg.trim()) continue;
    let text = seg;
    for (const b of brands) {
      if (done.has(b.id)) continue;
      const needle = lang === 'zh' ? b.cn : b.name;
      if (!needle) continue;
      let idx = -1;
      if (lang === 'zh') {
        idx = text.indexOf(needle);
      } else {
        const re = new RegExp('\\b' + needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
        const m2 = text.match(re);
        idx = m2 ? m2.index : -1;
      }
      if (idx === -1) continue;
      text = text.slice(0, idx)
        + `<a href="/chinese-car-brands/${b.id}" style="color:inherit;text-decoration:underline;text-decoration-color:#d4302a;text-underline-offset:3px;">${needle}</a>`
        + text.slice(idx + needle.length);
      done.add(b.id);
    }
    segments[i] = text;
  }
  return segments.join('');
}


const modelCardHTML = vm.runInContext('modelCardHTML', sandbox);
for (const b of SITE_DATA.brands) {
  const catEn = (CATEGORY_LABEL[b.category] || CATEGORY_LABEL.group).en;
  const main = brandMain(b);
  const html = pageHTML(`/chinese-car-brands/${b.id}`, {
    title: `${b.name} (${b.cn}): Models, Sub-brands & Global Footprint | TopChinaCar`,
    desc: `${b.desc_en} ${catEn}, founded ${b.founded}, HQ ${b.hq} — brand profile, featured models and export news.`,
    image: b.image
  }, main).replace('</head>', brandJsonLd(b) + '\n</head>');
  fs.writeFileSync(path.join(BRANDS_OUT, `${b.id}.html`), html);
  writeZh(`chinese-car-brands/${b.id}.html`, zhChrome(pageHTML(`/chinese-car-brands/${b.id}`, {
    title: `${b.name}（${b.cn}）：车型、子品牌与全球布局 | TopChinaCar`,
    desc: `${b.desc_zh} 创立于 ${b.founded}，总部 ${b.hq}——品牌档案、明星车型与最新出海动态。`,
    image: b.image
  }, main, { zh: true }).replace('</head>', brandJsonLd(b, true) + '\n</head>')));
}
console.log(`✓ ${SITE_DATA.brands.length} brand pages → brands/ + zh/chinese-car-brands/`);

// ---- Model detail pages (/models/<id>) ----
const MODELS_OUT = path.join(ROOT, 'models');
if (!fs.existsSync(MODELS_OUT)) fs.mkdirSync(MODELS_OUT);

function modelMain(m, brand) {
  const cat = brand ? (CATEGORY_LABEL[brand.category] || CATEGORY_LABEL.group) : CATEGORY_LABEL.group;
  const modelBodyEn = m.body_en || `${m.brand} ${m.name} is tracked as part of TopChinaCar's model database because it is relevant to Chinese automakers' overseas product strategy. Specifications can vary by trim, market, homologation package and launch timing, so the figures below should be treated as editorial reference data rather than transaction quotes.`;
  const modelBodyZh = m.body_zh || `${m.brand} ${m.name} 被纳入 TopChinaCar 车型数据库，是因为它与中国车企海外产品策略相关。不同配置、市场、认证包与上市时间会导致参数差异，因此下方数据应作为编辑参考，而不是成交报价。`;
  const specNote = m.specNote_en ? `
        <p class="model-spec-note model-detail-spec-note" style="background:#f9fafb;border-left:3px solid #d4302a;padding:10px 12px;margin:18px 0 0;">${langSpan(m.specNote_en, m.specNote_zh || m.specNote_en)}</p>` : '';
  const related = brand ? rankedBrandArticles(brand) : articles.filter(a =>
    entityMention(`${a.title_en || ''} ${a.excerpt_en || ''}`, m.name)).slice(0, 5);
  const siblings = SITE_DATA.models.filter(x => x.brand === m.brand && x.id !== m.id);
  const fact = (labelEn, labelZh, val) => `
    <div class="brand-fact"><span class="spec-label">${langSpan(labelEn, labelZh)}</span><span class="spec-value">${val}</span></div>`;
  const visual = m.image
    ? `<div style="margin:0 0 32px;border-radius:12px;overflow:hidden;position:relative;"><img src="/${m.image}" alt="${m.brand} ${m.name}" style="width:100%;display:block;" />${m.imageCredit ? `<span class="img-credit">Photo: ${m.imageCredit}</span>` : ''}</div>`
    : '';
  return `
  <section class="page-header">
    <div class="container">
      <div class="section-eyebrow">${brand ? `<a href="/chinese-car-brands/${brand.id}" style="color:inherit;text-decoration:none;">${m.brand}</a>` : m.brand} · ${langSpan(cat.en, cat.zh)}</div>
      <h1 class="page-title">${m.brand} ${m.name}</h1>
      <p class="page-deck">${langSpan(m.tag_en, m.tag_zh)}</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container" style="max-width:920px;">
      ${visual}
      <div class="brand-facts" style="display:flex;gap:36px;flex-wrap:wrap;margin-bottom:36px;">
        ${fact('Range', '续航', m.range)}
        ${fact('0–100 km/h', '零百加速', m.accel)}
        ${fact('From', '起价', `${m.price}${m.priceLocal ? ` <span style="font-size:12px;color:#9ca3af;font-weight:400;">(${m.priceLocal})</span>` : ''}`)}
      </div>
      <div style="font-size:16px;line-height:1.8;color:#374151;">
        <p>${langSpan(modelBodyEn, modelBodyZh)}</p>
        ${specNote}
        <p style="font-size:13px;color:#9ca3af;">${langSpan(
          'USD figures are approximate conversions of the local list price shown in brackets. Range, acceleration and pricing can refer to different trims unless explicitly marked as a single configuration.',
          '美元价格为括号内当地指导价的近似换算。除非明确标为同一配置，否则续航、加速与价格可能对应不同配置区间。')}</p>
      </div>
      ${siblings.length ? `
      <h2 style="font-size:22px;margin:40px 0 20px;">${langSpan('More ' + m.brand + ' models', m.brand + ' 其他车型')}</h2>
      <ul style="list-style:none;padding:0;margin:0;">
        ${siblings.map(s => `<li style="margin-bottom:10px;"><a href="/models/${s.id}" style="color:inherit;text-decoration:none;"><strong>${s.brand} ${s.name}</strong></a> <span style="font-size:13px;color:#9ca3af;">· ${s.range} · ${s.price}</span></li>`).join('')}
      </ul>` : ''}
      ${related.length ? `
      <h2 style="font-size:22px;margin:40px 0 20px;">${langSpan('Related news', '相关动态')}</h2>
      <ul style="list-style:none;padding:0;margin:0;">
        ${related.map(a => `<li style="margin-bottom:14px;"><a href="/news/${a.slug}" style="color:inherit;text-decoration:none;"><strong>${a.title_en}</strong></a><br/><span style="font-size:13px;color:#9ca3af;">${a.date}</span></li>`).join('')}
      </ul>` : ''}
      <p style="margin-top:40px;">
        ${brand ? `<a href="/chinese-car-brands/${brand.id}" style="color:var(--accent, #d4302a);font-family:var(--mono);font-size:13px;">← ${m.brand} brand profile</a> · ` : ''}
        <a href="/models" style="color:var(--accent, #d4302a);font-family:var(--mono);font-size:13px;">← All featured models</a>
      </p>
    </div>
  </section>`;
}

function modelJsonLd(m, isZh = false) {
  const route = `/models/${m.id}`;
  return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "name": "${m.brand} ${m.name}",
      "brand": {"@type": "Brand", "name": "${m.brand}"},
      "url": "${canonicalUrl(route, isZh)}",
      "image": "${assetUrl(m.image)}",
      "description": ${JSON.stringify(m.tag_en)},
      "category": "Vehicle"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "${canonicalUrl('/', isZh)}"},
        {"@type": "ListItem", "position": 2, "name": "Models", "item": "${canonicalUrl('/models', isZh)}"},
        {"@type": "ListItem", "position": 3, "name": "${m.brand} ${m.name}", "item": "${canonicalUrl(route, isZh)}"}
      ]
    }
  ]
}
</script>`;
}

let modelCount = 0;
for (const m of SITE_DATA.models) {
  if (!m.id) continue;
  const brand = SITE_DATA.brands.find(b => b.name === m.brand);
  const main = modelMain(m, brand);
  const html = pageHTML(`/models/${m.id}`, {
    title: `${m.brand} ${m.name}: Specs, Range & Price | TopChinaCar`,
    desc: `${m.brand} ${m.name} specs: ${m.range} range, ${m.accel} 0-100 km/h and ${m.price} reference price, with trim and export-market notes.`,
    image: m.image,
    ogType: 'product'
  }, main).replace('</head>', modelJsonLd(m) + '\n</head>');
  fs.writeFileSync(path.join(MODELS_OUT, `${m.id}.html`), html);
  writeZh(`models/${m.id}.html`, zhChrome(pageHTML(`/models/${m.id}`, {
    title: `${m.brand} ${m.name} 参数、续航与价格 | TopChinaCar`,
    desc: `${m.brand} ${m.name} 参数：续航 ${m.range}，零百加速 ${m.accel}，参考价 ${m.price}，并标注配置与出口市场口径。`,
    image: m.image,
    ogType: 'product'
  }, main, { zh: true }).replace('</head>', modelJsonLd(m, true) + '\n</head>')));
  modelCount++;
}
console.log(`✓ ${modelCount} model pages → models/ + zh/models/`);

// ============ SECTION PAGES (news-site taxonomy) ============
// Articles are matched to sections by keyword — until the pipeline tags them natively.
const SECTIONS = [
  {
    route: '/china-ev-news', file: 'china-ev-news.html',
    title_en: 'China EV News — Electric Vehicles, Batteries & Smart Cars | TopChinaCar',
    title_zh: '中国新能源车新闻 — 电动车、电池与智能汽车 | TopChinaCar',
    h1_en: 'China EV News', h1_zh: '中国新能源车新闻',
    deck_en: 'Electric vehicles, plug-in hybrids, EREVs, batteries, charging and smart-driving — the technology side of China’s auto globalization.',
    deck_zh: '追踪中国纯电、插混、增程、电池、补能与智能驾驶进展，解释这些技术如何影响中国汽车全球化。',
    intro_en: 'China builds and exports more electric vehicles than any other country. This section tracks the products and technologies behind that lead: new EV, PHEV and EREV launches relevant to overseas markets, battery and charging developments, and the smart-driving and cockpit systems that increasingly differentiate Chinese cars abroad.',
    intro_zh: '中国是全球最大的电动车生产国和出口国。本栏目追踪这一领先地位背后的产品与技术：与海外市场相关的纯电、插混、增程新车，电池与补能进展，以及日益成为中国汽车海外差异化优势的智驾与座舱系统。',
    kw: /\bEVs?\b|electric|battery|batteries|PHEV|EREV|plug-in|hybrid|charging|swap|autonomous|smart driving|ADAS|\bNEV/i
  },
  {
    route: '/china-car-export-news', file: 'china-car-export-news.html',
    title_en: 'China Car Export News — Shipments, Plants & Overseas Growth | TopChinaCar',
    title_zh: '中国汽车出口新闻 — 出口数据、海外工厂与增长 | TopChinaCar',
    h1_en: 'China Car Export News', h1_zh: '中国汽车出口新闻',
    deck_en: 'Monthly export figures, overseas plants, dealer networks, logistics and homologation — how Chinese cars reach the world.',
    deck_zh: '追踪中国汽车月度出口数据、海外工厂、经销商网络、物流与认证，解释中国汽车如何进入全球市场。',
    intro_en: 'China became the world’s largest car exporter by volume, and the export machine keeps evolving: from shipping fully-built vehicles to building plants in Thailand, Brazil, Hungary and Spain. This section follows the numbers, the factories, the dealer networks, and the fuel-mix of what actually gets exported — ICE, hybrid and electric.',
    intro_zh: '中国已成为全球第一大汽车出口国，而且出海模式仍在进化：从整车出口到在泰国、巴西、匈牙利、西班牙建厂。本栏目跟踪出口数据、海外工厂、经销网络，以及实际出口的燃油/混动/纯电结构。',
    kw: /export|overseas|shipment|ro-ro|plant|factory|localis|localiz|assembl|dealer network|knock-down/i
  },
  {
    route: '/markets', file: 'markets.html',
    title_en: 'Global Markets — Where Chinese Cars Are Expanding | TopChinaCar',
    title_zh: '全球市场 — 中国汽车的海外扩张版图 | TopChinaCar',
    h1_en: 'Global Markets', h1_zh: '全球市场',
    deck_en: 'Market-by-market coverage of Chinese auto expansion — Europe, the Middle East, Africa, Latin America, Southeast Asia and Australia.',
    deck_zh: '逐个市场追踪中国汽车的海外扩张路径，覆盖欧洲、中东、非洲、拉美、东南亚与澳洲等重点区域。',
    intro_en: 'Chinese automakers do not expand everywhere the same way: Europe means tariffs and localisation, the Gulf means rapid brand adoption, Latin America means plants and pickups, Southeast Asia means right-hand-drive EV hubs. Pick a market below to follow the coverage.',
    intro_zh: '中国车企在不同市场的打法完全不同：欧洲是关税与本地化，海湾是品牌快速渗透，拉美是建厂与皮卡，东南亚是右舵电动车枢纽。选择下方市场查看对应报道。',
    kw: /Europe|EU\b|Middle East|Gulf|Saudi|UAE|Dubai|Africa|Latin America|Brazil|Mexico|Chile|Thailand|Indonesia|Malaysia|Vietnam|Australia|Russia|Central Asia/i,
    isMarketsIndex: true
  },
  {
    route: '/policy', file: 'policy.html',
    title_en: 'Policy & Tariffs — Rules Shaping China Auto Exports | TopChinaCar',
    title_zh: '政策与关税 — 影响中国汽车出口的规则 | TopChinaCar',
    h1_en: 'Policy & Tariffs', h1_zh: '政策与关税',
    deck_en: 'EU tariffs, US restrictions, homologation, subsidies — the regulatory forces shaping where Chinese cars can go.',
    deck_zh: '解读欧盟关税、美国限制、海外认证与补贴政策，追踪决定中国汽车能去哪里的监管力量。',
    intro_en: 'Trade policy is now the single biggest variable in China auto globalization. EU anti-subsidy duties pushed Chinese brands toward European plants; US rules effectively closed one market while opening questions about Mexico; certification regimes decide launch timelines everywhere. This section tracks the rules and what automakers do about them.',
    intro_zh: '贸易政策已成为中国汽车全球化的最大变量。欧盟反补贴税把中国品牌推向欧洲建厂；美国规则实际关闭了一个市场；各国认证体系决定上市节奏。本栏目追踪规则本身，以及车企的应对。',
    kw: /tariff|policy|regulat|subsid|homologation|sanction|trade|duty|duties|ban\b|restriction/i
  },
  {
    route: '/data', file: 'data.html',
    title_en: 'China Auto Data Intelligence Layer | TopChinaCar',
    title_zh: '中国汽车数据情报层 | TopChinaCar',
    h1_en: 'China Auto Data Intelligence Layer', h1_zh: '中国汽车数据情报层',
    deck_en: 'Structured data layer connecting events, companies, markets and models for China auto globalization analysis.',
    deck_zh: '连接事件、公司、市场与车型的结构化数据层，用于中国汽车全球化分析。',
    intro_en: 'Structured data layer for event ranking, entity linking and market analysis.',
    intro_zh: '用于事件排序、实体关联与市场分析的结构化数据层。',
    kw: /sales|deliver|units|record|ranking|market share|figure|\bH[12]\b|\bQ[1-4]\b|million|\d{2,3},\d{3}/i,
    isDataLayer: true
  },
  {
    route: '/analysis', file: 'analysis.html',
    title_en: 'Analysis — China Auto Globalization Explained | TopChinaCar',
    title_zh: '深度分析 — 解读中国汽车全球化 | TopChinaCar',
    h1_en: 'Analysis', h1_zh: '深度分析',
    deck_en: 'Longer reads on why, how and where Chinese automakers are going global.',
    deck_zh: '提供中国车企为什么出海、如何出海、去哪里的长篇解读，关注战略、供应链、商业模式与全球竞争。',
    intro_en: 'Beyond the daily news cycle: structural pieces on supply chains, business models and strategy that explain China auto globalization to international readers.',
    intro_zh: '跳出每日新闻循环：从供应链、商业模式与战略层面，向国际读者解释中国汽车全球化的结构性文章。',
    kw: /strategy|why |analysis|explained|model\b.*global/i,
    showStories: true
  }
];

const MARKETS = [
  { slug: 'europe', name_en: 'Europe', name_zh: '欧洲',
    kw: /Europe|\bEU\b|Germany|France|Spain|Italy|UK\b|Britain|Norway|Netherlands|Hungary|Munich|Zaragoza|Poland|Belgium/i,
    intro_en: 'Europe is the highest-stakes market for Chinese automakers: big EV demand, strong incumbent brands, and anti-subsidy tariffs that have pushed BYD, Chery, Leapmotor and others toward local production in Hungary, Spain and beyond. MG remains the best-selling Chinese badge; premium EV brands test the waters from Norway outward.',
    intro_zh: '欧洲是中国车企风险与回报最高的市场：电动车需求大、本土品牌强势，反补贴关税正把比亚迪、奇瑞、零跑等推向匈牙利、西班牙等地的本地化生产。MG 仍是销量最高的中国血统品牌，高端电动品牌则从挪威开始试水。',
    body_en: `<h3>Scale and momentum</h3>
<p>Europe is where Chinese automakers face their toughest competition and their biggest prize. In full-year 2025, Chinese brands sold roughly 811,000 vehicles across Europe — up about 99% year on year — for close to a 6.1% market share, according to JATO Dynamics. December 2025 was the first month Chinese-brand sales topped 100,000 units, briefly reaching around 10% share. That momentum carried into 2026: Chinese brands roughly doubled their EU registration share to about 6% in early 2026, and by mid-year had out-registered Mercedes in a single month and Ford over the first half. Chinese brands now account for roughly 11% of Europe's electrified (BEV + PHEV) market.</p>
<h3>Who is winning</h3>
<p>MG (SAIC) remains the volume leader, with roughly 307,000 units in 2025, and it briefly outsold Tesla in the first half of 2025. BYD is the fastest riser — about 187,000 units in 2025, up from under 50,000 in 2024 — with Q1 2026 registrations up nearly 170%. Chery (via Omoda and Jaecoo) and Leapmotor (through its Stellantis joint venture) both grew triple digits in H1 2026. Key models include the MG ZS, MG3 and MG4; the BYD Dolphin Surf budget EV (launched May 2025 from around €23,000–26,000), Atto 3 and Seal; the Omoda 5 and Jaecoo 7 PHEV; and the Leapmotor T03 and C10.</p>
<h3>Tariffs and localisation</h3>
<p>Trade policy is the defining variable. Since October 2024 the EU has levied definitive anti-subsidy duties — on top of the standard 10% import duty — of roughly 17.0% on BYD, 18.8% on Geely and 35.3% on SAIC, pushing total tariffs as high as about 45%. Brussels has been negotiating minimum-import-price undertakings as an alternative and is weighing extending measures to plug-in hybrids. The response is localisation: BYD's plant in Szeged, Hungary is ramping to mass production in 2026 (targeting 300,000 units a year), a Turkey plant is due around mid-2026, Leapmotor's T03 is built at Stellantis's Tychy plant in Poland, and Chery is restarting the former Nissan plant in Barcelona under its Ebro venture. Growth is increasingly tilting toward PHEVs and hybrids to sidestep the BEV-specific duties.</p>
<p style="font-size:13px;color:#6b7280;">Figures reflect 2025 full-year and 2026 H1 data (JATO Dynamics, European Commission, company releases).</p>`,
    body_zh: `<h3>规模与势头</h3>
<p>欧洲是中国车企竞争最激烈、也回报最高的战场。据 JATO Dynamics，2025 全年中国品牌在欧洲销量约 81 万辆，同比增长约 99%，市场份额接近 6.1%。2025 年 12 月首次单月突破 10 万辆，份额一度接近 10%。这一势头延续至 2026 年：中国品牌在欧盟的上牌份额较上年翻倍至约 6%，年中更曾单月超过奔驰、上半年累计超过福特。目前中国品牌约占欧洲电动化（BEV+PHEV）市场的 11%。</p>
<h3>谁在领跑</h3>
<p>MG（上汽）仍是销量冠军，2025 年约 30.7 万辆，并在 2025 上半年一度反超特斯拉。比亚迪增速最快——2025 年约 18.7 万辆，而 2024 年尚不足 5 万辆，2026 年一季度上牌量同比增长近 170%。奇瑞（经 Omoda、Jaecoo）与零跑（经 Stellantis 合资）在 2026 上半年均为三位数增长。主力车型包括 MG ZS、MG3、MG4；比亚迪 Dolphin Surf 入门电动车（2025 年 5 月起售，约 €2.3 万–2.6 万）、Atto 3、Seal；Omoda 5 与 Jaecoo 7 插混；以及零跑 T03、C10。</p>
<h3>关税与本地化</h3>
<p>贸易政策是决定性变量。自 2024 年 10 月起，欧盟在 10% 基准关税之上加征反补贴税——比亚迪约 +17.0%、吉利 +18.8%、上汽 +35.3%，使综合税率最高达约 45%。欧盟一直在谈判以"最低进口价"作为替代方案，并考虑将措施扩展至插电混动。车企的应对是本地化：比亚迪匈牙利 Szeged 工厂 2026 年进入量产（目标年产 30 万辆），土耳其工厂预计 2026 年年中投产，零跑 T03 在 Stellantis 波兰 Tychy 工厂生产，奇瑞则以 Ebro 品牌重启巴塞罗那前日产工厂。为规避针对纯电的关税，增长正日益向 PHEV 与混动倾斜。</p>
<p style="font-size:13px;color:#6b7280;">数据为 2025 全年及 2026 上半年（来源：JATO Dynamics、欧盟委员会、企业公告）。</p>` },
  { slug: 'middle-east', name_en: 'Middle East', name_zh: '中东',
    kw: /Middle East|Gulf|Saudi|UAE|Dubai|Qatar|Kuwait|Oman|Bahrain|Israel|GCC/i,
    intro_en: 'The Gulf has become one of the fastest-adopting regions for Chinese cars — ICE SUVs first, EVs increasingly. Chery, GWM, BYD and MG all run growing dealer networks, and Dubai doubles as a re-export hub for the wider region.',
    intro_zh: '海湾地区已成为中国汽车渗透最快的区域之一——先是燃油 SUV，如今电动车加速跟进。奇瑞、长城、比亚迪、MG 的经销网络都在扩张，迪拜还是面向更大区域的转口枢纽。',
    body_en: `<h3>A fast-opening region</h3>
<p>The Gulf Cooperation Council (GCC) has moved from the margins to the centre of China's export map. Chinese brands' combined GCC share rose from around 2% in 2019 to an estimated 15% by 2025, according to Roland Berger. Low tariffs are a big reason: the GCC applies a common external duty of roughly 5% on vehicles, with free movement between member states — a stark contrast to the EU and US walls. Industry trackers estimate the Gulf, led by Saudi Arabia and the UAE, absorbed well over a million China-made vehicles in 2025, making it one of China's largest external auto markets, and Middle East imports of Chinese EVs jumped sharply year on year.</p>
<h3>Brands and models</h3>
<p>The strongest players are MG, Geely, Changan, Haval and Chery on the ICE side, with Jetour a breakout success — it climbed into the UAE's top brands on the strength of the T2 SUV — and BYD leading on EVs. Typical best-sellers are the Jetour T1 and T2, Changan CS55/CS75, Haval H6 and Jolion, MG RX5 and ZS, Geely Coolray and Emgrand, and the BYD Atto 3, Song, Seal and Han. Dubai's Jebel Ali free zone acts as a regional assembly and distribution hub — Jetour, for example, uses it to stage a wider GCC rollout — though most volume is still imported fully built rather than assembled locally.</p>
<h3>ICE today, EV tomorrow</h3>
<p>The region remains overwhelmingly an ICE and SUV market — cheap fuel, long distances and extreme heat all favour combustion — but EV sales are climbing fast off a low base, and China dominates the Gulf's EV import mix. Governments are pulling rather than pushing: Saudi Vision 2030 and UAE EV targets back charging infrastructure and incentives instead of punitive tariffs. Notable 2025–2026 moves include Jetour's aggressive UAE expansion, major dealer groups such as Gargash adding Chinese franchises, and BYD's regional manufacturing push spanning Egypt entry, Pakistan production and Saudi feasibility studies.</p>
<p style="font-size:13px;color:#6b7280;">Regional shares are estimates — the GCC has no single unified registration body (sources: Roland Berger, AGBI, company releases).</p>`,
    body_zh: `<h3>一个快速开放的区域</h3>
<p>海湾合作委员会（GCC）已从中国出口版图的边缘走到中心。据罗兰贝格，中国品牌在 GCC 的合计份额从 2019 年约 2% 升至 2025 年约 15%。低关税是重要原因：GCC 对整车统一征收约 5% 的对外关税，成员国之间自由流通，与欧美的高墙形成鲜明对比。行业机构估计，以沙特和阿联酋为首的海湾在 2025 年吸纳了远超百万辆的中国制造汽车，成为中国最大的海外汽车市场之一，中东对中国电动车的进口额亦同比大幅跃升。</p>
<h3>品牌与车型</h3>
<p>燃油车阵营中最强的是 MG、吉利、长安、哈弗与奇瑞；捷途（Jetour）异军突起，凭借 T2 SUV 跻身阿联酋畅销品牌之列；比亚迪则领跑电动车。典型畅销车型有捷途 T1/T2、长安 CS55/CS75、哈弗 H6 与 Jolion、MG RX5 与 ZS、吉利 Coolray 与 Emgrand，以及比亚迪 Atto 3、Song、Seal、Han。迪拜杰贝阿里自由区扮演区域组装与分销枢纽——例如捷途以此为跳板向整个 GCC 铺开——但目前多数销量仍为整车进口，而非本地组装。</p>
<h3>今天是燃油，明天是电动</h3>
<p>该区域仍以燃油 SUV 为绝对主体——低油价、长距离、极端高温都偏向内燃机——但电动车正从低基数快速攀升，而中国主导着海湾的电动车进口结构。当地政府以"拉"代"推"：沙特 2030 愿景与阿联酋电动化目标以充电基础设施和补贴激励为主，而非惩罚性关税。2025–2026 年的看点包括捷途在阿联酋的激进扩张、Gargash 等大型经销集团新增中国品牌代理，以及比亚迪进入埃及、在巴基斯坦投产、在沙特开展可行性研究的区域制造布局。</p>
<p style="font-size:13px;color:#6b7280;">区域份额为估算值——GCC 没有统一的上牌统计机构（来源：罗兰贝格、AGBI、企业公告）。</p>` },
  { slug: 'saudi-arabia', name_en: 'Saudi Arabia', name_zh: '沙特阿拉伯',
    kw: /Saudi|Riyadh|Jeddah|KSA/i,
    intro_en: 'Saudi Arabia is the largest Gulf car market and a priority for Chinese brands, with rapid share gains in SUVs and growing EV ambitions tied to Vision 2030.',
    intro_zh: '沙特是海湾最大的汽车市场，也是中国品牌的优先目标：SUV 份额快速攀升，电动化雄心与 2030 愿景绑定。',
    body_en: `<h3>The Gulf's biggest prize</h3>
<p>Saudi Arabia is the largest car market in the Gulf and a priority target for Chinese brands, which collectively reached roughly 13.4% of the Saudi market in 2025 — with four Chinese names (Changan, MG, Geely and Jetour) in the top ten. But 2025 was a year of churn: even as the collective Chinese share rose, several established brands slipped. On local-market estimates, Changan led Chinese brands at about 11,600 units (down roughly 19% year on year), MG at about 10,200 (down about 34%) and Geely at about 9,500 (down about 31%), while Jetour surged around 63% to about 8,300 units on the strength of its T1 and T2 SUVs. Note that the broader Saudi market also contracted into 2026, so some of the decline is market-wide rather than brand-specific.</p>
<h3>Models and imports</h3>
<p>Best-sellers skew to SUVs and sedans: the Changan CS35/CS75 and Eado, MG RX5/ZS/5, Geely Coolray, Emgrand and Okavango, Jetour T1/T2 and Dashing, Haval H6 and Jolion, and BYD's Atto 3, Song and Han. Imports carry a 5% customs duty plus 15% VAT — an effective cost of roughly 20% of value — and vehicles must be manufactured within five years of import, with SASO conformity certification handled through the FASAH platform.</p>
<h3>Local production and Vision 2030</h3>
<p>Manufacturing is a national ambition under Vision 2030. The King Salman Automotive Cluster in King Abdullah Economic City (KAEC), formalised in 2025, is the anchor. So far the confirmed plants are non-Chinese — Lucid (kit assembly near Jeddah, full manufacturing targeted for end-2026), Hyundai (KAEC, around 50,000 units a year) and Saudi's own Ceer EV brand — while BYD has been running feasibility studies for a Saudi assembly plant via a local partner but has not committed. EV penetration is still low but is a state priority, backed by the sovereign PIF through Lucid, Ceer and the EVIQ charging network. Chinese brands' 2025 dip was partly blamed on thin hybrid and EV line-ups against shifting demand.</p>
<p style="font-size:13px;color:#6b7280;">Brand volumes are 2025 local-market estimates; the market contracted further in early 2026 (sources: local registration trackers, PIF, S&P Global).</p>`,
    body_zh: `<h3>海湾最大的战利品</h3>
<p>沙特是海湾最大的汽车市场，也是中国品牌的优先目标。2025 年中国品牌合计约占沙特市场 13.4%，长安、MG、吉利、捷途四个中国品牌进入前十。但 2025 年也是"洗牌之年"：尽管合计份额上升，多个老牌却在下滑。据当地市场估算，长安以约 1.16 万辆领跑中国品牌（同比约 -19%），MG 约 1.02 万辆（约 -34%），吉利约 9,500 辆（约 -31%），而捷途凭借 T1、T2 SUV 逆势增长约 63% 至约 8,300 辆。需要说明的是，沙特整体市场进入 2026 年也在收缩，因此部分下滑属于全市场现象，而非单一品牌问题。</p>
<h3>车型与进口</h3>
<p>畅销车型以 SUV 和轿车为主：长安 CS35/CS75 与 Eado、MG RX5/ZS/5、吉利 Coolray/Emgrand/Okavango、捷途 T1/T2 与 Dashing、哈弗 H6 与 Jolion，以及比亚迪 Atto 3、Song、Han。进口车需缴 5% 关税加 15% 增值税——综合成本约为车值的 20%——且车辆须在进口年份前五年内生产，SASO 合规认证通过 FASAH 平台办理。</p>
<h3>本地生产与 2030 愿景</h3>
<p>制造是 2030 愿景下的国家雄心。2025 年正式确立的阿卜杜拉国王经济城（KAEC）"萨勒曼国王汽车集群"是核心载体。目前已确认的工厂均非中国企业——Lucid（吉达附近的组件组装，完整制造目标为 2026 年底）、现代（KAEC，年产约 5 万辆）以及沙特自有的 Ceer 电动品牌——比亚迪则一直在通过本地伙伴开展沙特组装厂可行性研究，但尚未承诺落地。电动车渗透率仍低，但属国家优先事项，由主权基金 PIF 通过 Lucid、Ceer 及 EVIQ 充电网络支持。中国品牌 2025 年的回落，部分被归因于混动与电动产品线相对单薄、未能跟上需求变化。</p>
<p style="font-size:13px;color:#6b7280;">品牌销量为 2025 年当地市场估算；2026 年初市场进一步收缩（来源：当地上牌统计、PIF、S&P Global）。</p>` },
  { slug: 'uae', name_en: 'UAE', name_zh: '阿联酋',
    kw: /UAE|Dubai|Abu Dhabi|Emirates/i,
    intro_en: 'The UAE combines a wealthy domestic market with Dubai’s role as the region’s trading hub — many Chinese brands stage their Middle East entry, flagship showrooms and regional distribution here.',
    intro_zh: '阿联酋既有高消费本地市场，又有迪拜的区域贸易枢纽角色——许多中国品牌把中东首发、旗舰展厅与区域分销放在这里。',
    body_en: `<h3>Wealthy market, regional hub</h3>
<p>The UAE pairs a high-spending domestic market with Dubai's role as the Middle East's trading and re-export hub, making it the launchpad many Chinese brands use to stage their regional entry, flagship showrooms and distribution. The overall market grew about 5.3% to roughly 335,800 vehicles in 2025, with Toyota still firmly in front — but the story underneath was Chinese share gains.</p>
<h3>Jetour's breakout</h3>
<p>Jetour was the standout, jumping about 82% year on year to become the UAE's #4 brand overall and overtaking MG as the best-selling Chinese marque; its T2 SUV rose to the #3 model nationally — the first Chinese model to crack the overall top three. MG held a top-five position (up about 10%), and Geely leapt from #12 to #6 (up about 48%). Chery continued to grow with the Tiggo range. On EVs — around 8% of the market and growing over 26% in 2025 — Tesla leads, but BYD is the top Chinese EV brand and roughly tripled its sales. Typical models include the Jetour T2 and Dashing, MG ZS and MG5, Geely Coolray, Emgrand and Starray, Chery Tiggo 4/7/8, and the BYD Atto 3, Seal, Dolphin and Han.</p>
<h3>Policy and structure</h3>
<p>The UAE is an import and re-export market, not an assembly base — there is no local Chinese production. ICE vehicles carry the standard 5% GCC customs duty plus 5% VAT, while fully electric vehicles have benefited from duty and VAT relief (status beyond end-2025 should be checked). As US and EU tariffs redirect Chinese EVs, the Gulf — and Dubai in particular — has become a natural outlet, and Chinese-brand resilience showed in early 2026 when Jetour kept growing even as the overall market fell.</p>
<p style="font-size:13px;color:#6b7280;">Figures are 2025 full-year unless noted (sources: local registration trackers, company releases).</p>`,
    body_zh: `<h3>高消费市场，区域枢纽</h3>
<p>阿联酋既有高消费的本地市场，又依托迪拜作为中东贸易与转口枢纽的角色，成为许多中国品牌进入该区域、设立旗舰展厅与分销体系的跳板。2025 年整体市场增长约 5.3% 至约 33.58 万辆，丰田仍稳居第一——但水面之下是中国品牌份额的持续攀升。</p>
<h3>捷途的爆发</h3>
<p>捷途（Jetour）表现最抢眼，同比大涨约 82%，跃升为阿联酋整体第 4 大品牌，并超越 MG 成为销量最高的中国品牌；其 T2 SUV 升至全国第 3 畅销车型——这是首款进入整体前三的中国车型。MG 保持前五（增长约 10%），吉利则从第 12 位跃升至第 6 位（增长约 48%），奇瑞凭借 Tiggo 系列继续增长。在电动车领域（约占市场 8%，2025 年增长逾 26%），特斯拉领先，但比亚迪是最大的中国电动品牌，销量约增长两倍。典型车型包括捷途 T2 与 Dashing、MG ZS 与 MG5、吉利 Coolray/Emgrand/Starray、奇瑞 Tiggo 4/7/8，以及比亚迪 Atto 3、Seal、Dolphin、Han。</p>
<h3>政策与结构</h3>
<p>阿联酋是进口与转口市场，而非组装基地——没有本地中国产能。燃油车缴纳标准的 5% GCC 关税加 5% 增值税，纯电动车则曾享受关税与增值税减免（2025 年底之后的政策需核实）。随着美欧关税使中国电动车转向，海湾——尤其是迪拜——成为天然出口，中国品牌的韧性在 2026 年初已有体现：即便整体市场下滑，捷途仍在增长。</p>
<p style="font-size:13px;color:#6b7280;">除特别注明外为 2025 全年数据（来源：当地上牌统计、企业公告）。</p>` },
  { slug: 'africa', name_en: 'Africa', name_zh: '非洲',
    kw: /Africa|South Africa|Egypt|Nigeria|Morocco|Kenya|Algeria|Rosslyn/i,
    intro_en: 'Africa is a pickup, SUV and commercial-vehicle story for Chinese automakers, with South Africa as the anchor market and local assembly beginning to take root.',
    intro_zh: '在非洲，中国汽车的故事以皮卡、SUV 与商用车为主线，南非是锚点市场，本地组装也开始落地。',
    body_en: `<h3>South Africa: the anchor</h3>
<p>Africa is primarily a pickup, SUV and commercial-vehicle story, and South Africa is the anchor market with the best data. Some 15 Chinese brands were active there in 2025. GWM (including Haval, Tank and Ora) was the top-selling Chinese automaker at about 27,200 units and a 4.6% share (up from 3.7%), rising about 44% to become the #6 brand overall. Chery grew sharply — targeting roughly 39,000 units for the year and, with its Omoda, Jaecoo and Jetour sub-brands, ranking as high as #4 in some months — while BYD is small but now reports to the industry body NAAMSA and is expanding its dealer network.</p>
<h3>Egypt, Nigeria, Morocco</h3>
<p>Egypt is a fast-emerging volume market where Chinese cars topped passenger-car sales in January 2025, with Chery, MG and BYD in the top ten and Chinese OEMs supplying the bulk of EV sales; the government has signalled a shift toward tariffs that reward local assembly. Nigeria is earlier-stage, with GAC and others evaluating assembly to position the country as an ECOWAS hub. Morocco is the manufacturing and battery play: leveraging free-trade access to the EU, it has drawn billions in Chinese battery investment, including Gotion High-Tech's Kenitra gigafactory — Africa's first, with a first phase targeted for 2026.</p>
<h3>The localisation turn</h3>
<p>The through-line for 2025–2026 is a move from importing fully built vehicles toward local assembly. GWM and Chery both announced plans in late 2025 to assemble in South Africa, where the APDP programme rewards local content, and Jetour signed a roughly $123 million deal with Egypt's Kasrawy Group to assemble the T1 and T2 for the local market and export. Legacy manufacturers are lobbying for higher import tariffs on Chinese and Indian fully built units, adding pressure to build locally. Africa remains overwhelmingly ICE, with Chinese brands leading the small but growing EV and hybrid segment.</p>
<p style="font-size:13px;color:#6b7280;">South Africa figures via NAAMSA; other-country data from local media and company releases.</p>`,
    body_zh: `<h3>南非：锚点市场</h3>
<p>在非洲，中国汽车主要是皮卡、SUV 与商用车的故事，南非则是数据最完整的锚点市场。2025 年约有 15 个中国品牌在当地活跃。长城（含哈弗、坦克、欧拉）以约 2.72 万辆、4.6% 份额（此前为 3.7%）成为销量最高的中国车企，同比增长约 44%，升至整体第 6 大品牌。奇瑞增长迅猛——全年目标约 3.9 万辆，加上 Omoda、Jaecoo、Jetour 子品牌，个别月份排名高至第 4——比亚迪体量尚小，但已开始向行业机构 NAAMSA 报数，并在扩张经销网络。</p>
<h3>埃及、尼日利亚、摩洛哥</h3>
<p>埃及是快速崛起的走量市场，2025 年 1 月中国乘用车销量登顶，奇瑞、MG、比亚迪进入前十，中国车企供应了绝大部分电动车销量；埃及政府已释放信号，转向以关税鼓励本地组装。尼日利亚仍处早期阶段，广汽等正评估建厂，以将该国打造为西非（ECOWAS）枢纽。摩洛哥则是制造与电池的重头戏：凭借对欧盟的自由贸易通道，吸引了数十亿美元的中国电池投资，包括国轩高科在 Kenitra 的超级工厂——非洲首座，第一期目标 2026 年。</p>
<h3>本地化转向</h3>
<p>2025–2026 年的主线，是从整车进口转向本地组装。长城与奇瑞均在 2025 年底宣布在南非组装的计划（南非 APDP 计划奖励本地含量），捷途与埃及 Kasrawy 集团签署约 1.23 亿美元协议，在当地组装 T1、T2 以供本地销售与出口。传统车企正游说对中国和印度整车进口提高关税，进一步加大本地生产的压力。非洲仍以燃油车为绝对主体，中国品牌在小而快速增长的电动与混动细分市场领先。</p>
<p style="font-size:13px;color:#6b7280;">南非数据来自 NAAMSA；其他国家数据来自当地媒体与企业公告。</p>` },
  { slug: 'latin-america', name_en: 'Latin America', name_zh: '拉丁美洲',
    kw: /Latin America|LatAm|Mexico|Chile|Colombia|Peru|Uruguay|Argentina/i,
    intro_en: 'Latin America took Chinese brands early — Chery has deep roots here — and is now a localisation frontier, with plants and CKD assembly spreading from Brazil outward.',
    intro_zh: '拉美很早就接纳了中国品牌——奇瑞在此根基深厚——如今正成为本地化前线，工厂与 CKD 组装从巴西向外扩散。',
    body_en: `<h3>Mexico: the tariff turning point</h3>
<p>Latin America adopted Chinese brands early and is now a localisation frontier. Mexico is the largest market and the region's biggest inflection point: roughly 306,000 China-made light vehicles sold in 2025, about 19% of total sales, with BYD the largest Chinese participant. But under US pressure, Mexico imposed a 50% duty on cars from non-FTA countries — mainly China — from January 1, 2026. Imports fell sharply in early 2026, though Chinese-brand sales still rose in Q1 on stockpiled inventory, and BYD shelved its planned Mexican assembly plant in response.</p>
<h3>The open Pacific markets</h3>
<p>Chile has the region's highest Chinese penetration: Chinese brands topped 100,000 units in 2025 and, together with other Asian marques, accounted for roughly 72% of sales — surpassing Japanese and Korean brands for the first time. MG leads Chinese brands there, with BYD prominent in EVs. Colombia's market grew strongly in 2025, with BYD entering the top ten and taking more than half of EV and PHEV sales, while Chery, Changan/Deepal and MG posted triple-digit growth. Peru is being reshaped by the Chinese-built Port of Chancay, which is halving shipping times and turning the country into a regional distribution hub, with BYD driving an EV and hybrid surge.</p>
<h3>Argentina and the EV opening</h3>
<p>Argentina moved in 2025 to publish duty-free import quotas for electrified vehicles, with approved Chinese brands including BYD, Leapmotor, MG and Lynk & Co, while Chery, Changan, Haval and MG gain share on price and technology. Across the region, most Chinese volume is still ICE and hybrid SUVs, but BYD leads EVs in several markets. The dividing line is policy: Mexico's 50% wall stands in sharp contrast to the open, low-tariff markets of Chile, Peru and Colombia and Argentina's new EV quotas.</p>
<p style="font-size:13px;color:#6b7280;">Figures are 2025 full-year and early-2026 (sources: national registration data, local media). Brazil is covered on its own page.</p>`,
    body_zh: `<h3>墨西哥：关税转折点</h3>
<p>拉美很早就接纳了中国品牌，如今正成为本地化前线。墨西哥是最大市场，也是区域最大的转折点：2025 年中国制造的轻型车销量约 30.6 万辆，约占总销量的 19%，比亚迪是最大的中国参与者。但在美国压力下，墨西哥自 2026 年 1 月 1 日起对非自贸协定国家（主要是中国）整车征收 50% 关税。2026 年初进口量骤降，不过靠库存缓冲，中国品牌一季度销量仍在增长，比亚迪则据此搁置了原定的墨西哥组装厂计划。</p>
<h3>开放的太平洋沿岸市场</h3>
<p>智利的中国品牌渗透率为区域最高：2025 年中国品牌销量突破 10 万辆，连同其他亚洲品牌合计约占销量 72%，首次超越日系与韩系。MG 领跑当地中国品牌，比亚迪在电动车中表现突出。哥伦比亚市场 2025 年强劲增长，比亚迪进入前十并拿下电动与插混销量的过半份额，奇瑞、长安/深蓝、MG 均为三位数增长。秘鲁则因中国承建的钱凯港（Chancay）而重塑——航运时间缩短一半，使该国成为区域分销枢纽，比亚迪带动电动与混动车激增。</p>
<h3>阿根廷与电动化开口</h3>
<p>阿根廷在 2025 年出台电动化车辆的免税进口配额，获批的中国品牌包括比亚迪、零跑、MG 与领克，奇瑞、长安、哈弗、MG 则凭价格与技术扩大份额。整个区域，中国销量主体仍是燃油与混动 SUV，但比亚迪在多个市场领跑电动车。分水岭在于政策：墨西哥 50% 的高墙，与智利、秘鲁、哥伦比亚的开放低关税市场及阿根廷新设的电动车配额，形成鲜明对比。</p>
<p style="font-size:13px;color:#6b7280;">数据为 2025 全年及 2026 年初（来源：各国上牌数据、当地媒体）。巴西见其专属页面。</p>` },
  { slug: 'brazil', name_en: 'Brazil', name_zh: '巴西',
    kw: /Brazil|Bahia|Camaçari|São Paulo|Horizonte|Iracemápolis|Ayrton Senna/i,
    intro_en: 'Brazil is Latin America’s biggest market and the region’s manufacturing prize: BYD, GWM and SAIC are all investing in local production to serve the country and export across South America.',
    intro_zh: '巴西是拉美最大市场，也是区域制造高地：比亚迪、长城、上汽都在投资本地生产，既供应巴西也辐射南美。',
    body_en: `<h3>From importer to #1 brand</h3>
<p>Brazil is Latin America's biggest market and the region's manufacturing prize. Chinese brands reached around 10–11% of the passenger market in 2025, and BYD's rise has been extraordinary: roughly 112,900 units in 2025, up from about 76,700 in 2024 and just 260 in 2022. In April 2026 BYD became the first Chinese automaker to top Brazil's overall monthly retail brand chart, at nearly 15,000 units. GWM and Caoa Chery are the other two major players. BYD also leads Brazil's EV segment with well over half of it, and its Dolphin Mini (sold as the Seagull elsewhere) became Brazil's #1 retail model in February 2026.</p>
<h3>Local production comes online</h3>
<p>Two flagship plants opened in 2025. BYD's Camaçari complex in Bahia — a roughly $1 billion (R$5.5bn) conversion of a former Ford plant — began production on July 1, 2025, with 150,000 units a year of capacity, planned to double; the Dolphin Mini is its first local model. GWM's Iracemápolis plant in São Paulo state, a former Mercedes-Benz site, began production on August 15, 2025 with around 50,000 units a year of capacity, aiming to export across Mercosur by 2027.</p>
<h3>The tariff clock</h3>
<p>Local production is a direct response to a rising tariff schedule. Brazil is phasing out its EV tariff exemption: the BEV import duty rose to 25% in July 2025 and reaches the 35% Mercosur cap in July 2026, with hybrids and PHEVs climbing on similar tracks, and the preferential rate on assembly kits set to expire from January 2027. BYD front-loaded imports — shipping thousands of EVs ahead of tax deadlines — to bridge the gap. Chinese models supplied over 80% of Brazil's EV sales in early 2025, and the country started 2026 at roughly 9.8% electrified market share, with BYD targeting around 250,000 units and 10% of the total market.</p>
<p style="font-size:13px;color:#6b7280;">Figures are 2025 full-year and early-2026 (sources: company releases, local media, industry trackers).</p>`,
    body_zh: `<h3>从进口商到第一品牌</h3>
<p>巴西是拉美最大市场，也是区域制造高地。2025 年中国品牌约占乘用车市场 10–11%，而比亚迪的崛起堪称惊人：2025 年约 11.29 万辆，2024 年约 7.67 万辆，2022 年仅 260 辆。2026 年 4 月，比亚迪以近 1.5 万辆成为首个登顶巴西整体月度零售品牌榜的中国车企。长城与 Caoa 奇瑞是另外两大玩家。比亚迪还以过半份额领跑巴西电动车市场，其 Dolphin Mini（在他处即"海鸥"）于 2026 年 2 月成为巴西零售销量第一的车型。</p>
<h3>本地生产投产</h3>
<p>2025 年两座旗舰工厂投产。比亚迪位于巴伊亚州的 Camaçari 基地——由前福特工厂改造，投资约 10 亿美元（55 亿雷亚尔）——于 2025 年 7 月 1 日投产，年产能 15 万辆并计划翻倍，Dolphin Mini 为首款本地车型。长城位于圣保罗州的 Iracemápolis 工厂（前奔驰工厂）于 2025 年 8 月 15 日投产，年产能约 5 万辆，目标 2027 年向南方共同市场出口。</p>
<h3>关税倒计时</h3>
<p>本地生产是对关税上行时间表的直接回应。巴西正逐步取消电动车关税豁免：纯电进口关税 2025 年 7 月升至 25%，2026 年 7 月达到南方共同市场 35% 的上限，混动与插混沿类似路径攀升，组装件优惠税率也将于 2027 年 1 月起到期。比亚迪提前抢运——在加税节点前运入数千辆电动车——以过渡衔接。2025 年初中国车型供应了巴西逾 80% 的电动车销量，2026 年开年电动化份额约 9.8%，比亚迪目标约 25 万辆、占总市场约 10%。</p>
<p style="font-size:13px;color:#6b7280;">数据为 2025 全年及 2026 年初（来源：企业公告、当地媒体、行业统计）。</p>` },
  { slug: 'southeast-asia', name_en: 'Southeast Asia', name_zh: '东南亚',
    kw: /Southeast Asia|Thailand|Indonesia|Malaysia|Vietnam|Philippines|Singapore|ASEAN|Melaka|Proton/i,
    intro_en: 'Southeast Asia is China’s right-hand-drive EV workshop: Thailand and Indonesia host a cluster of Chinese plants that serve ASEAN and increasingly export onward — including to Europe.',
    intro_zh: '东南亚是中国车企的右舵电动车工坊：泰国与印尼聚集了一批中国工厂，供应东盟并日益向外出口——包括欧洲。',
    body_en: `<h3>Thailand: the EV assembly hub</h3>
<p>Southeast Asia is China's right-hand-drive EV workshop, and Thailand — the "Detroit of Southeast Asia" — is its centre. Chinese-made cars accounted for roughly 85% of Thailand's EV sales in 2024, and BYD sold about 24,000 units in H1 2025, roughly four times its nearest rival. BYD's Rayong plant (around 150,000 units a year) opened in 2024, GWM upgraded a former GM plant in Rayong, and MG/SAIC also assembles locally. Under the EV3.5 policy running to 2027, subsidies were trimmed and tied to local assembly, imported EVs lost benefits and face higher excise, and Chinese makers began raising 2026 prices as the incentives tapered.</p>
<h3>Indonesia and Malaysia</h3>
<p>Indonesia is the other manufacturing pillar: BYD went from nothing to a top-four automaker and commands close to half the country's EV market, with a roughly $1 billion plant in Subang, West Java. From January 2026, incentives apply only to locally produced EVs meeting a 40% local-content threshold that rises over the decade. Malaysia became the region's largest overall market in 2025 at over 820,000 vehicles, with 21 Chinese brands and 58 models on sale; Chery was the best-selling Chinese brand in H1 2025 (led by the Jaecoo J7) and BYD led the EV segment. BYD is building a CKD facility in Tanjung Malim (operational H2 2026) and Chery is investing in a Selangor industrial park, while Geely backs the national brand Proton.</p>
<h3>Vietnam and the wider region</h3>
<p>Vietnam is the exception: domestic champion VinFast dominates with around 175,000 units in 2025, and Chinese brands remain small there against a strong home player — though one Chinese automaker has committed an $800 million factory to challenge it. Regionally, Chinese-branded sales across the four main markets rose about 58% year on year in Q1 2025. The Philippines and Singapore see lighter penetration, with GAC, MG, Chery and BYD present. The strategic prize is that ASEAN plants increasingly export onward — including to Europe.</p>
<p style="font-size:13px;color:#6b7280;">Figures span 2024–2025 by market as noted (sources: local industry data, company releases).</p>`,
    body_zh: `<h3>泰国：电动车组装枢纽</h3>
<p>东南亚是中国车企的右舵电动车工坊，而有"东南亚底特律"之称的泰国是其中心。2024 年中国制造汽车约占泰国电动车销量的 85%，比亚迪 2025 上半年售出约 2.4 万辆，约为第二名的四倍。比亚迪罗勇（Rayong）工厂（年产能约 15 万辆）2024 年投产，长城升级了罗勇的前通用工厂，MG/上汽也在当地组装。在延续至 2027 年的 EV3.5 政策下，补贴被削减并与本地组装挂钩，进口电动车失去优惠并面临更高消费税，中国厂商也随补贴退坡开始上调 2026 年售价。</p>
<h3>印尼与马来西亚</h3>
<p>印尼是另一制造支柱：比亚迪从零起步跃升为前四大车企，占据当地电动车市场近半份额，并在西爪哇 Subang 建有约 10 亿美元工厂。自 2026 年 1 月起，激励仅适用于满足 40% 本地含量门槛（该门槛在本十年内逐步提高）的本地生产电动车。马来西亚 2025 年以逾 82 万辆成为区域最大整体市场，在售的中国品牌达 21 个、车型 58 款；奇瑞是 2025 上半年最畅销的中国品牌（由 Jaecoo J7 领衔），比亚迪领跑电动细分。比亚迪正在丹戎马林（Tanjung Malim）建设 CKD 工厂（2026 下半年投产），奇瑞在雪兰莪投资工业园，吉利则扶持国民品牌 Proton。</p>
<h3>越南与更广区域</h3>
<p>越南是例外：本土冠军 VinFast 以 2025 年约 17.5 万辆占据主导，中国品牌在强势本土玩家面前体量尚小——不过已有一家中国车企承诺投资 8 亿美元建厂发起挑战。区域层面，四大主要市场的中国品牌销量在 2025 年一季度同比增长约 58%。菲律宾与新加坡渗透较轻，广汽、MG、奇瑞、比亚迪均有布局。战略价值在于：东盟工厂正日益向外出口——包括欧洲。</p>
<p style="font-size:13px;color:#6b7280;">各市场数据涵盖 2024–2025 年（来源：当地行业数据、企业公告）。</p>` },
  { slug: 'australia', name_en: 'Australia', name_zh: '澳大利亚',
    kw: /Australia|New Zealand|Sydney|Melbourne/i,
    intro_en: 'Australia is one of the most open right-hand-drive markets, where GWM, MG and BYD already sit among the top-selling brands and PHEV utes are the new battleground.',
    intro_zh: '澳大利亚是最开放的右舵市场之一，长城、MG、比亚迪已跻身畅销品牌之列，插混皮卡是新战场。',
    body_en: `<h3>China becomes the #2 source</h3>
<p>Australia is one of the most open right-hand-drive markets, and Chinese automakers have surged into it. China-made vehicles reached about 221,700 units in 2025 (up roughly 26%) — over 252,000 including the China-built Tesla and Polestar — making China the #2 source of new cars after Japan, at around 17.5% of sales, up from 2.7% in 2020. In August 2025, four Chinese brands sat in the national top ten simultaneously for the first time: BYD, GWM, MG and Chery. GWM was the top-selling Chinese brand for the year, while Chery grew fastest (up around 177%) and BYD up around 156%.</p>
<h3>Models and the ute battleground</h3>
<p>Chinese brands compete across both EV and ICE. Best-sellers include the GWM Haval Jolion and H6, MG ZS, MG3 and MG4, Chery Tiggo 4 Pro (which hit a record #4 overall in November 2025) and Omoda E5. The breakout segment is PHEV utes: the BYD Shark 6 and GWM Cannon Alpha opened a new front against the traditional diesel ute establishment. A wave of cheap EVs — the BYD Atto 1, Geely EX2 and MG4 Urban — is landing in 2026, setting up a price war, with XPeng, Zeekr and Leapmotor also entering.</p>
<h3>Policy tailwinds and New Zealand</h3>
<p>Two policies help. Chinese cars enter duty-free under the China–Australia Free Trade Agreement (in force since 2015), and the New Vehicle Efficiency Standard, which began in January 2025 and tightens through 2029, favours the low-emission EVs and PHEVs that Chinese brands supply — analysts project China could become Australia's #1 car source. New Zealand mirrors the trend: Chinese-owned brands are around 13.5% of the market, with MG, GWM, BYD and Chery the main players and popular PHEV SUVs such as the BYD Sealion 6, GWM Haval H6 and Jaecoo J7.</p>
<p style="font-size:13px;color:#6b7280;">Figures are 2025 full-year via VFACTS/FCAI and local trackers.</p>`,
    body_zh: `<h3>中国成为第二大来源国</h3>
<p>澳大利亚是最开放的右舵市场之一，中国车企正涌入其中。2025 年中国制造汽车约 22.17 万辆（增长约 26%）——若计入中国产的特斯拉与极星则超过 25.2 万辆——使中国成为仅次于日本的第二大新车来源国，占销量约 17.5%，远高于 2020 年的 2.7%。2025 年 8 月，四个中国品牌首次同时进入全国前十：比亚迪、长城、MG、奇瑞。长城为当年最畅销中国品牌，奇瑞增速最快（约 +177%），比亚迪增长约 156%。</p>
<h3>车型与皮卡战场</h3>
<p>中国品牌在电动与燃油两条战线同时竞争。畅销车型包括长城哈弗 Jolion 与 H6、MG ZS/MG3/MG4、奇瑞 Tiggo 4 Pro（2025 年 11 月创下整体第 4 的纪录）与 Omoda E5。爆发的细分是插混皮卡：比亚迪 Shark 6 与长城 Cannon Alpha 向传统柴油皮卡阵营开辟了新战线。一批廉价电动车——比亚迪 Atto 1、吉利 EX2、MG4 Urban——正于 2026 年登陆，酝酿价格战，小鹏、极氪、零跑也在进入。</p>
<h3>政策顺风与新西兰</h3>
<p>两项政策助力。中国汽车凭《中澳自由贸易协定》（2015 年生效）零关税进入；2025 年 1 月启动、到 2029 年逐步收紧的《新车效率标准》（NVES）偏向中国品牌供应的低排放电动车与插混——分析师预计中国有望成为澳大利亚第一大汽车来源国。新西兰趋势相仿：中资品牌约占市场 13.5%，MG、长城、比亚迪、奇瑞为主力，比亚迪 Sealion 6、长城哈弗 H6、Jaecoo J7 等插混 SUV 广受欢迎。</p>
<p style="font-size:13px;color:#6b7280;">数据为 2025 全年（来源：VFACTS/FCAI 及当地统计）。</p>` }
];

function articleListHTML(list, emptyEn, emptyZh) {
  if (!list.length) {
    return `<p style="color:#6b7280;font-size:15px;">${langSpan(emptyEn, emptyZh)} <a href="/news" style="color:var(--accent, #d4302a);">${langSpan('Browse all news →', '浏览全部新闻 →')}</a></p>`;
  }
  return `<ul style="list-style:none;padding:0;margin:0;">
    ${list.map(a => `<li style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #f3f4f6;">
      <div style="font-family:var(--mono, monospace);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#dc2626;margin-bottom:6px;">${a.date}</div>
      <a href="/news/${a.slug}" style="color:inherit;text-decoration:none;"><strong style="font-family:var(--serif, Georgia, serif);font-size:19px;line-height:1.35;">${langSpan(a.title_en, a.title_zh || a.title_en)}</strong></a>
      <p style="margin:6px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">${langSpan(a.excerpt_en || '', a.excerpt_zh || a.excerpt_en || '')}</p>
    </li>`).join('\n    ')}
  </ul>`;
}

function sectionArticleText(a) {
  return `${a.title_en || ''} ${a.title_zh || ''} ${a.excerpt_en || ''} ${a.excerpt_zh || ''} ${a.tag_en || ''} ${a.tag_zh || ''} ${a.html_en || ''}`.toLowerCase();
}

function intelSignalText(a) {
  return `${a.title_en || ''} ${a.title_zh || ''} ${a.excerpt_en || ''} ${a.excerpt_zh || ''} ${a.tag_en || ''} ${a.tag_zh || ''}`.toLowerCase();
}

function articleMatchesSection(a, sec) {
  return sec.kw.test(sectionArticleText(a));
}

const INTEL_EVENT_RULES = [
  { type: 'tariff', label_en: 'Tariff', label_zh: '关税', impact: 8.8, re: /tariff|duties|anti-subsidy|minimum-price|trade wall/i },
  { type: 'policy', label_en: 'Policy', label_zh: '政策', impact: 8.2, re: /policy|regulat|restriction|subsid|homologation|sanction|rules?/i },
  { type: 'factory', label_en: 'Factory', label_zh: '工厂', impact: 8.4, re: /plant|factory|production|assembly|locali[sz]ation|locali[sz]e|built at/i },
  { type: 'export', label_en: 'Export', label_zh: '出口', impact: 7.7, re: /export|shipment|overseas|ro-ro|global expansion|global markets/i },
  { type: 'sales_update', label_en: 'Sales update', label_zh: '销量更新', impact: 6.7, re: /sales|deliver|units|market share|ranking|volume|record/i },
  { type: 'investment', label_en: 'Investment', label_zh: '投资', impact: 7.2, re: /invest|investment|funding|capital|stake/i },
  { type: 'partnership', label_en: 'Partnership', label_zh: '合作', impact: 6.6, re: /partnership|joint venture|\bJV\b|alliance|with stellantis/i },
  { type: 'dealer_expansion', label_en: 'Dealer expansion', label_zh: '渠道扩张', impact: 6.1, re: /dealer|showroom|retail|distribution|network/i },
  { type: 'pricing', label_en: 'Pricing', label_zh: '定价', impact: 5.8, re: /price|pricing|discount|minimum-price/i },
  { type: 'technology', label_en: 'Technology', label_zh: '技术', impact: 5.6, re: /battery|charging|smart driving|adas|software|800v|cockpit|autonomous/i },
  { type: 'launch', label_en: 'Launch', label_zh: '新车发布', impact: 5.4, re: /launch|premiere|debut|new model|unveil/i }
];

const INTEL_MARKET_RULES = [
  { market_en: 'Europe', market_zh: '欧洲', re: /europe|\beu\b|germany|france|spain|italy|uk\b|britain|norway|netherlands|hungary|munich|zaragoza|poland/i },
  { market_en: 'Middle East', market_zh: '中东', re: /middle east|gulf|saudi|uae|dubai|qatar|kuwait|oman|bahrain|gcc/i },
  { market_en: 'Africa', market_zh: '非洲', re: /africa|south africa|egypt|nigeria|morocco|kenya|algeria/i },
  { market_en: 'Latin America', market_zh: '拉丁美洲', re: /latin america|latam|brazil|mexico|chile|colombia|peru|uruguay|argentina/i },
  { market_en: 'Southeast Asia', market_zh: '东南亚', re: /southeast asia|thailand|indonesia|malaysia|vietnam|philippines|singapore|asean/i },
  { market_en: 'China', market_zh: '中国', re: /china|chinese market|domestic/i }
];

const INTEL_COMPANIES = ['BYD', 'Geely', 'Chery', 'Changan', 'SAIC', 'MG', 'FAW', 'Hongqi', 'GWM', 'Great Wall', 'GAC', 'Dongfeng', 'BAIC', 'XPeng', 'Xpeng', 'NIO', 'Li Auto', 'Leapmotor', 'Xiaomi', 'Zeekr', 'Tesla', 'CATL'];

function intelEventRule(a) {
  const text = intelSignalText(a);
  return INTEL_EVENT_RULES.find(rule => rule.re.test(text)) || { type: 'market_movement', label_en: 'Market movement', label_zh: '市场动向', impact: 4.8 };
}

function intelMarket(a) {
  const text = intelSignalText(a);
  return INTEL_MARKET_RULES.find(rule => rule.re.test(text)) || { market_en: 'Global markets', market_zh: '全球市场' };
}

function intelCompany(a) {
  const text = intelSignalText(a);
  const found = INTEL_COMPANIES.find(name => text.includes(name.toLowerCase()));
  return found || 'Chinese OEMs';
}

function intelConfidence(a, rule, market) {
  let confidence = 0.58;
  if (rule.type !== 'market_movement') confidence += 0.08;
  if (market.market_en !== 'Global markets') confidence += 0.06;
  if ((a.excerpt_en || '').length > 80) confidence += 0.04;
  if ((a.html_en || '').includes('href="http')) confidence += 0.06;
  return Math.min(0.9, Number(confidence.toFixed(2)));
}

function intelPriorityLabel(rank) {
  if (rank <= 3) return { key: 'high', en: 'HIGH PRIORITY', zh: '高优先级' };
  if (rank <= 10) return { key: 'medium', en: 'MEDIUM', zh: '中等优先级' };
  return { key: 'low', en: 'LOW IMPACT', zh: '低影响' };
}

function intelReaderAssessment(item) {
  const impactHigh = item.impact_score >= 7;
  const finalHigh = item.final_score >= 6;
  const confidenceHigh = item.confidence_score >= 0.8;
  const confidenceMedium = item.confidence_score >= 0.65;
  const sourceHigh = item.source_priority >= 8.5;
  const sourceMedium = item.source_priority >= 7;

  let signal = {
    en: 'Why it matters',
    zh: '为何重要',
    deck_en: 'Useful for context, but not yet a leading market signal.',
    deck_zh: '可作为背景观察，但暂未构成主导市场信号。'
  };
  if (impactHigh && confidenceMedium) {
    signal = {
      en: 'Why it matters',
      zh: '为何重要',
      deck_en: 'This may affect policy, production capacity, exports or overseas market entry.',
      deck_zh: '这可能影响政策、产能、出口或海外市场进入。'
    };
  } else if (finalHigh) {
    signal = {
      en: 'Why it matters',
      zh: '为何重要',
      deck_en: 'This is more relevant than a routine company update because it points to market or strategy movement.',
      deck_zh: '这不只是常规企业动态，而是指向市场或战略层面的变化。'
    };
  } else if (item.final_score >= 4.8) {
    signal = {
      en: 'Why it matters',
      zh: '为何重要',
      deck_en: 'This helps track how a company, region or distribution channel is changing.',
      deck_zh: '这有助于观察企业、区域或渠道层面的变化。'
    };
  }

  return {
    signal,
    tags: [
      impactHigh
        ? { en: 'Major industry move', zh: '行业重要变化' }
        : item.impact_score >= 5 ? { en: 'Market movement', zh: '市场动向' } : { en: 'Background update', zh: '背景更新' },
      confidenceMedium
        ? { en: 'Source-backed', zh: '有来源支撑' }
        : { en: 'Needs follow-up', zh: '仍需跟踪' }
    ],
    impact: {
      en: impactHigh ? 'Industry impact: high' : item.impact_score >= 5 ? 'Industry impact: medium' : 'Industry impact: low',
      zh: impactHigh ? '行业影响：高' : item.impact_score >= 5 ? '行业影响：中' : '行业影响：低',
      detail_en: impactHigh ? 'Policy, factory, export or market-access relevance.' : item.impact_score >= 5 ? 'Company or market-level movement.' : 'Background update with lower immediate impact.',
      detail_zh: impactHigh ? '涉及政策、工厂、出口或市场进入等核心变量。' : item.impact_score >= 5 ? '属于企业或市场层面的变化。' : '偏背景更新，短期影响较低。'
    },
    confidence: {
      en: confidenceHigh ? 'Evidence: strong' : confidenceMedium ? 'Evidence: medium' : 'Evidence: needs review',
      zh: confidenceHigh ? '证据：较强' : confidenceMedium ? '证据：中等' : '证据：待复核',
      detail_en: confidenceHigh ? 'Company, market or event signals are clear.' : confidenceMedium ? 'Some fields remain less explicit.' : 'Treat uncertain fields carefully.',
      detail_zh: confidenceHigh ? '公司、市场或事件类型信号较明确。' : confidenceMedium ? '部分字段仍存在不确定性。' : '请谨慎使用不确定字段。'
    },
    source: {
      en: sourceHigh ? 'Source strength: high' : sourceMedium ? 'Source strength: established' : 'Source strength: supplementary',
      zh: sourceHigh ? '信源强度：高' : sourceMedium ? '信源强度：稳定' : '信源强度：补充',
      detail_en: sourceHigh ? 'Higher-weight source in the system model.' : sourceMedium ? 'Tracked source with stable signal value.' : 'Supplementary source used for context.',
      detail_zh: sourceHigh ? '系统模型中的高权重来源。' : sourceMedium ? '稳定跟踪的有效信号来源。' : '用于补充背景的信号来源。'
    }
  };
}

function intelCompanyHTML(company) {
  return langSpan(company, company === 'Chinese OEMs' ? '中国车企' : company);
}

function enrichIntelligenceArticles(list) {
  return list.map((a, index) => {
    const eventRule = intelEventRule(a);
    const market = intelMarket(a);
    const confidence = intelConfidence(a, eventRule, market);
    const sourcePriority = 7.5;
    const impact = Math.max(1, Math.min(10, eventRule.impact - Math.min(index, 6) * 0.08));
    const finalScore = Number((impact * 0.5 + confidence * 0.3 + sourcePriority * 0.2).toFixed(1));
    return {
      article: a,
      company: intelCompany(a),
      event_type: eventRule.type,
      event_label_en: eventRule.label_en,
      event_label_zh: eventRule.label_zh,
      market_en: market.market_en,
      market_zh: market.market_zh,
      impact_score: Number(impact.toFixed(1)),
      confidence_score: confidence,
      source_priority: sourcePriority,
      final_score: finalScore
    };
  }).sort((a, b) =>
    b.final_score - a.final_score ||
    b.impact_score - a.impact_score ||
    b.article.date.localeCompare(a.article.date)
  ).map((item, index) => {
    const rank = index + 1;
    const tier = item.impact_score >= 7 && item.confidence_score >= 0.7
      ? 'high'
      : item.final_score >= 4.8 ? 'market' : 'low';
    return { ...item, rank, tier, priority: intelPriorityLabel(rank) };
  });
}

function topCluster(items, key) {
  const counts = new Map();
  for (const item of items) {
    const value = item[key];
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))[0] || [null, 0];
}

function intelligenceInsight(items) {
  const support = items.slice(0, 10);
  if (support.length < 3) {
    return {
      confidence: 0,
      core_en: 'Insufficient event density for a system-level interpretation.',
      core_zh: '事件密度不足，暂不生成系统级解读。',
      trend_en: 'The feed needs at least three ranked items before drawing a current trend.',
      trend_zh: '情报流至少需要三个已排序条目，才生成当前趋势判断。',
      risk_en: 'No risk signal is published without enough supporting events.',
      risk_zh: '没有足够事件支撑时，不发布风险信号。',
      basis_en: 'Waiting for more coverage.',
      basis_zh: '等待更多报道进入系统。'
    };
  }

  const [market, marketCount] = topCluster(support, 'market_en');
  const [eventType, eventTypeCount] = topCluster(support, 'event_type');
  const [company, companyCount] = topCluster(support, 'company');
  const marketZh = support.find(item => item.market_en === market)?.market_zh || market;
  const eventLabelZh = support.find(item => item.event_type === eventType)?.event_label_zh || eventType;
  const companyZh = company === 'Chinese OEMs' ? '中国车企' : company;
  const riskCount = support.filter(item => /tariff|policy|pricing|regulation/.test(item.event_type)).length;
  const localizationCount = support.filter(item => /factory|export|dealer_expansion|partnership/.test(item.event_type)).length;
  const avgConfidence = support.reduce((sum, item) => sum + item.confidence_score, 0) / support.length;
  const confidence = Math.min(0.91, Number((0.46 + avgConfidence * 0.28 + Math.min(marketCount, 4) * 0.035 + Math.min(eventTypeCount, 4) * 0.035).toFixed(2)));

  let core_en = `The current strongest signal is ${eventType.replace('_', ' ')} activity around ${market}.`;
  let core_zh = `当前最强信号是围绕${marketZh || '全球市场'}的${eventLabelZh}活动。`;
  if (localizationCount >= 3) {
    core_en = `Chinese automakers are shifting from pure export coverage toward localized production and market-entry structures.`;
    core_zh = `中国车企的出海叙事正在从单纯出口，转向本地化生产与市场进入结构。`;
  }
  if (riskCount >= 2) {
    core_en = `Policy and tariff pressure is a repeated signal in the current China auto feed.`;
    core_zh = `政策与关税压力是当前中国汽车情报流中的重复信号。`;
  }

  const trend_en = `${market} appears in ${marketCount} of the top ${support.length} ranked items, with ${company} present in ${companyCount}.`;
  const companyTrendZh = companyZh === '中国车企' ? `${companyZh}出现` : `${companyZh} 出现`;
  const trend_zh = `${marketZh || '全球市场'}出现在前 ${support.length} 个排序条目中的 ${marketCount} 个，${companyTrendZh} ${companyCount} 次。`;
  const risk_en = riskCount
    ? `Risk is concentrated in tariff, policy or pricing references across ${riskCount} top-ranked items.`
    : `No dominant tariff or pricing risk cluster is visible in the top-ranked items.`;
  const risk_zh = riskCount
    ? `风险集中在 ${riskCount} 个高排序条目中的关税、政策或定价压力。`
    : `高排序条目中暂未出现占主导的关税或定价风险簇。`;

  return {
    confidence,
    core_en,
    core_zh,
    trend_en,
    trend_zh,
    risk_en,
    risk_zh,
    basis_en: `Cluster basis: market=${market} (${marketCount}), event_type=${eventType} (${eventTypeCount}), company=${company} (${companyCount}).`,
    basis_zh: `聚类依据：市场=${marketZh || '全球市场'}（${marketCount}），事件类型=${eventLabelZh}（${eventTypeCount}），公司=${companyZh}（${companyCount}）。`
  };
}

function intelligenceStatusHTML(items) {
  const latestArticle = items.reduce(
    (latest, item) => !latest || articlePublishedTime(item.article) > articlePublishedTime(latest.article)
      ? item
      : latest,
    null
  )?.article || articles[0];
  const latestDate = latestArticle?.date || TODAY;
  const eventsToday = items.filter(item => item.article.date === latestDate).length || items.length;
  const sourceActiveEn = [...new Set(items.slice(0, 10).map(item => item.event_label_en))].slice(0, 4).join(' / ') || 'Editorial stream';
  const sourceActiveZh = [...new Set(items.slice(0, 10).map(item => item.event_label_zh))].slice(0, 4).join(' / ') || '编辑流';
  return `
      <div class="intel-status">
        <div class="intel-status-cell"><span>${langSpan('Feed channels', '情报通道')}</span><strong>${items.length ? Math.min(12, Math.max(4, items.length)) : 0} ${langSpan('active', '运行中')}</strong></div>
        <div class="intel-status-cell"><span>${langSpan('Ingestion status', '采集状态')}</span><strong>${langSpan('Daily briefing active', '日报管线运行中')}</strong></div>
        <div class="intel-status-cell"><span>${langSpan('Last update', '最后更新')}</span><strong>${latestDate}</strong></div>
        <div class="intel-status-cell"><span>${langSpan('Events in latest batch', '最新批次事件')}</span><strong>${eventsToday}</strong></div>
        <div class="intel-status-cell"><span>${langSpan('Sources active', '活跃信号')}</span><strong>${langSpan(sourceActiveEn, sourceActiveZh)}</strong></div>
      </div>`;
}

function intelligenceCardHTML(item) {
  const a = item.article;
  const assessment = intelReaderAssessment(item);
  return `
        <article class="intel-event-card">
          <div class="intel-card-top">
            <div class="intel-rank">${langSpan('Rank #' + item.rank, '排名 #' + item.rank)}</div>
            <div class="intel-card-tags">
              <span class="intel-chip intel-chip--${item.priority.key}">${langSpan(item.priority.en, item.priority.zh)}</span>
              <span class="intel-chip">${langSpan('LIVE INTELLIGENCE STREAM', '实时情报流')}</span>
            </div>
          </div>
          <h3 class="intel-card-title"><a href="/news/${a.slug}">${langSpan(a.title_en, a.title_zh || a.title_en)}</a></h3>
          <p class="intel-card-summary">${langSpan(a.excerpt_en || '', a.excerpt_zh || a.excerpt_en || '')}</p>
          <div class="intel-card-meta">
            <span>${langSpan('Company', '公司')}: ${intelCompanyHTML(item.company)}</span>
            <span>${langSpan('Market', '市场')}: ${langSpan(item.market_en, item.market_zh)}</span>
            <span>${langSpan('Event Type', '事件类型')}: ${langSpan(item.event_label_en, item.event_label_zh)}</span>
            <span>${a.date}</span>
          </div>
          <div class="intel-reader-panel">
            <div class="intel-reader-main">
              <strong>${langSpan(assessment.signal.en, assessment.signal.zh)}</strong>
              <p>${langSpan(assessment.signal.deck_en, assessment.signal.deck_zh)}</p>
            </div>
            <div class="intel-reader-tags">
              ${assessment.tags.map(tag => `<span>${langSpan(tag.en, tag.zh)}</span>`).join('')}
            </div>
          </div>
        </article>`;
}

function intelligenceSectionHTML(titleEn, titleZh, deckEn, deckZh, className, items, emptyEn, emptyZh) {
  return `
      <div class="intel-layer">
        <div class="intel-layer-head intel-layer-head--${className}">
          <h2>${langSpan(titleEn, titleZh)}</h2>
          <p>${langSpan(deckEn, deckZh)}</p>
        </div>
        ${items.length ? items.map(intelligenceCardHTML).join('\n') : `<p class="intel-empty">${langSpan(emptyEn, emptyZh)}</p>`}
      </div>`;
}

function intelligenceFeedHTML(items) {
  const ranked = enrichIntelligenceArticles(items);
  const insight = intelligenceInsight(ranked);
  const high = ranked.filter(item => item.impact_score >= 7 && item.confidence_score >= 0.7).slice(0, 3);
  const highSlugs = new Set(high.map(item => item.article.slug));
  const movement = ranked.filter(item => !highSlugs.has(item.article.slug) && item.final_score >= 5 && item.final_score < 7).slice(0, 8);
  const low = ranked.filter(item => item.tier === 'low');
  const all = ranked.slice(0, 20);

  return `
      <div class="intel-stack">
        <section class="intel-panel intel-panel--dark" aria-label="TopChinaCar Intelligence">
          <div class="intel-eyebrow">${langSpan('TOP CHINA AUTO INTELLIGENCE', '中国汽车全球化情报')}</div>
          <h2>${langSpan('System Interpretation', '系统解读')}</h2>
          <div class="intel-signals">
            <div class="intel-signal"><span>${langSpan('Core Signal', '核心信号')}</span><p>${langSpan(insight.core_en, insight.core_zh)}</p></div>
            <div class="intel-signal"><span>${langSpan('Market Trend', '市场趋势')}</span><p>${langSpan(insight.trend_en, insight.trend_zh)}</p></div>
            <div class="intel-signal"><span>${langSpan('Risk Signal', '风险信号')}</span><p>${langSpan(insight.risk_en, insight.risk_zh)}</p></div>
            <div class="intel-signal"><span>${langSpan('System Confidence', '系统置信度')}</span><p>${insight.confidence.toFixed(2)}</p></div>
          </div>
          <div class="intel-basis">${langSpan(insight.basis_en, insight.basis_zh)}</div>
        </section>
        <section class="intel-panel">
          <div class="intel-eyebrow">${langSpan('SYSTEM STATUS', '系统状态')}</div>
          ${intelligenceStatusHTML(ranked)}
        </section>
        ${intelligenceSectionHTML('HIGH IMPACT EVENTS', '高影响事件', 'Events likely to affect policy, capacity, exports or market entry.', '可能影响政策、产能、出口或市场进入的核心信号。', 'high', high, 'No high-impact cluster in this section yet.', '本栏目暂未形成高影响事件簇。')}
        ${intelligenceSectionHTML('MARKET MOVEMENTS', '市场动向', 'Mid-tier ranked items showing expansion, channel, sales or market-access movement.', '中层排序条目，反映扩张、渠道、销量或市场进入变化。', 'market', movement, 'No mid-tier market movement cluster yet.', '暂未形成中层市场动向簇。')}
        ${intelligenceSectionHTML('ALL EVENTS', '全部事件', 'Full stream with reader-facing context and source links.', '完整事件流，优先展示读者可理解的背景说明与来源链接。', 'all', all.length ? all : low, 'No events available for this section.', '本栏目暂无可展示事件。')}
      </div>`;
}

function dataLayerCardHTML(titleEn, titleZh, rows, href) {
  return `
        <a class="data-layer-card" href="${href}">
          <h3>${langSpan(titleEn, titleZh)}</h3>
          <div class="data-layer-rows">
            ${rows.map(([labelEn, labelZh, valueEn, valueZh]) => `
            <div>
              <span>${langSpan(labelEn, labelZh)}</span>
              <strong>${langSpan(valueEn, valueZh)}</strong>
            </div>`).join('')}
          </div>
        </a>`;
}

function dataEntityListHTML(items) {
  return `<div class="data-entity-list">
    ${items.map(item => `<a href="${item.href}"><span>${langSpan(item.labelEn, item.labelZh)}</span><strong>${langSpan(item.valueEn, item.valueZh)}</strong></a>`).join('\n    ')}
  </div>`;
}

function dataLayerBlockHTML(titleEn, titleZh, deckEn, deckZh, body) {
  return `
      <section class="intel-layer data-layer-section">
        <div class="intel-layer-head">
          <h2>${langSpan(titleEn, titleZh)}</h2>
          <p>${langSpan(deckEn, deckZh)}</p>
        </div>
        ${body}
      </section>`;
}

function dataLayerMain(sec) {
  const macroCards = [
    dataLayerCardHTML('China EV Export Volume', '中国新能源车出口量', [
      ['Entity', '实体', 'Export volume', '出口量'],
      ['Granularity', '粒度', 'Monthly / annual', '月度 / 年度'],
      ['System use', '系统用途', 'Trend and ranking inputs', '趋势与排序输入']
    ], '/china-car-export-news'),
    dataLayerCardHTML('Global Export Ranking', '全球出口排名', [
      ['Entity', '实体', 'Country / OEM rank', '国家 / 车企排名'],
      ['Granularity', '粒度', 'Market and company level', '市场与公司层级'],
      ['System use', '系统用途', 'Impact score context', '影响分上下文']
    ], '/data'),
    dataLayerCardHTML('Market Share Overview', '市场份额概览', [
      ['Entity', '实体', 'Brand and regional share', '品牌与区域份额'],
      ['Granularity', '粒度', 'Market level', '市场层级'],
      ['System use', '系统用途', 'Market movement detection', '市场动向识别']
    ], '/markets')
  ];

  const companyItems = [
    ['BYD', '比亚迪', 'OEM / NEV export anchor', '整车集团 / 新能源出口锚点', '/chinese-car-brands/byd'],
    ['Geely', '吉利', 'Multi-brand global portfolio', '多品牌全球组合', '/chinese-car-brands/geely'],
    ['Chery', '奇瑞', 'Export-led OEM', '出口驱动型车企', '/chinese-car-brands/chery'],
    ['Changan', '长安', 'State group NEV transition', '国有集团新能源转型', '/chinese-car-brands/changan'],
    ['SAIC', '上汽', 'MG and overseas volume base', 'MG 与海外销量基础', '/chinese-car-brands/saic'],
    ['FAW', '一汽', 'Hongqi and joint-venture system', '红旗与合资体系', '/chinese-car-brands/faw'],
    ['Great Wall', '长城', 'SUV, pickup and off-road export base', 'SUV、皮卡与越野出口基础', '/chinese-car-brands/gwm'],
    ['GAC', '广汽', 'Aion and state-group EV platform', '埃安与国有集团电动平台', '/chinese-car-brands/gac'],
    ['Dongfeng', '东风', 'Voyah, M-Hero and joint-venture system', '岚图、猛士与合资体系', '/chinese-car-brands/dongfeng'],
    ['BAIC', '北汽', 'Beijing Auto, Arcfox and commercial export', '北京汽车、极狐与商用车出口', '/chinese-car-brands/baic']
  ].map(([labelEn, labelZh, valueEn, valueZh, href]) => ({ labelEn, labelZh, valueEn, valueZh, href }));

  const marketItems = [
    ['Europe', '欧洲', 'Tariff, localization, pricing pressure', '关税、本地化、定价压力', '/markets/europe'],
    ['Southeast Asia', '东南亚', 'Right-hand-drive EV and assembly base', '右舵电动车与组装基地', '/markets/southeast-asia'],
    ['Middle East', '中东', 'Dealer expansion and brand adoption', '渠道扩张与品牌接受度', '/markets/middle-east'],
    ['Latin America', '拉丁美洲', 'Localization and emerging-market demand', '本地化与新兴市场需求', '/markets/latin-america']
  ].map(([labelEn, labelZh, valueEn, valueZh, href]) => ({ labelEn, labelZh, valueEn, valueZh, href }));

  const modelCards = [
    dataLayerCardHTML('42 Chinese EV Models Database', '42 款中国新能源车型数据库', [
      ['Entity', '实体', 'Model records', '车型记录'],
      ['Coverage', '覆盖', 'EV / PHEV / EREV', '纯电 / 插混 / 增程'],
      ['System use', '系统用途', 'Model linking and comparison', '车型关联与对比']
    ], '/models'),
    dataLayerCardHTML('Specs', '参数', [
      ['Fields', '字段', 'Range, acceleration, dimensions', '续航、加速、尺寸'],
      ['Format', '格式', 'Structured model attributes', '结构化车型属性'],
      ['System use', '系统用途', 'Model-level context', '车型级上下文']
    ], '/models'),
    dataLayerCardHTML('Pricing and Segment', '价格与级别', [
      ['Pricing', '价格', 'USD reference', '美元参考价'],
      ['Classification', '分类', 'Segment and body type', '级别与车身形式'],
      ['System use', '系统用途', 'Market positioning analysis', '市场定位分析']
    ], '/models')
  ];

  const linkItems = [
    ['Events', '事件', 'Live event intelligence', '实时事件情报', '/intelligence'],
    ['Companies', '公司', 'OEM entity database', '车企实体库', '/chinese-car-brands'],
    ['Markets', '市场', 'Regional market layer', '区域市场层', '/markets'],
    ['Models', '车型', 'Structured specs database', '结构化参数数据库', '/models']
  ].map(([labelEn, labelZh, valueEn, valueZh, href]) => ({ labelEn, labelZh, valueEn, valueZh, href }));

  return `
  <section class="page-header page-header--data">
    <div class="container">
      <div class="section-eyebrow">${langSpan('Data Layer', '数据层')}</div>
      <h1 class="page-title">${langSpan(sec.h1_en, sec.h1_zh)}</h1>
      <p class="page-deck">${langSpan(sec.deck_en, sec.deck_zh)}</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container" style="max-width:980px;">
      <div class="intel-stack data-intel-stack">
        <section class="intel-panel intel-panel--dark" aria-label="China Auto Data Intelligence Layer">
          <div class="intel-eyebrow">${langSpan('CHINA AUTO DATA INTELLIGENCE LAYER', '中国汽车数据情报层')}</div>
          <h2>${langSpan('This section powers the entire intelligence system.', '本页支撑整个情报系统。')}</h2>
          <div class="intel-signals">
            <div class="intel-signal"><span>${langSpan('Events', '事件')}</span><p>${langSpan('Structured event records for ranking and interpretation.', '用于排序与系统解读的结构化事件记录。')}</p></div>
            <div class="intel-signal"><span>${langSpan('Companies', '公司')}</span><p>${langSpan('OEM entities used for company-level timelines and filtering.', '用于公司时间线与筛选的车企实体。')}</p></div>
            <div class="intel-signal"><span>${langSpan('Markets', '市场')}</span><p>${langSpan('Regional entities used for market clustering and comparisons.', '用于市场聚类与对比的区域实体。')}</p></div>
            <div class="intel-signal"><span>${langSpan('Models', '车型')}</span><p>${langSpan('Model records used for specs, pricing and segment context.', '用于参数、价格与级别上下文的车型记录。')}</p></div>
          </div>
          <div class="intel-basis">${langSpan('All data is structured for real-time analysis.', '所有数据以实时分析为目标进行结构化。')}</div>
        </section>

        ${dataLayerBlockHTML('MACRO DATA', '宏观数据', 'Export, ranking and market-share structures used as system-level context.', '作为系统级上下文的出口、排名与市场份额结构。', `<div class="data-layer-grid">${macroCards.join('\n')}</div>`)}
        ${dataLayerBlockHTML('COMPANY DATA', '企业数据', 'OEM entities linked to events, markets and model records.', '与事件、市场和车型记录关联的车企实体。', dataEntityListHTML(companyItems))}
        ${dataLayerBlockHTML('MARKET DATA', '市场数据', 'Regional entities used for clustering, comparison and event filtering.', '用于聚类、对比与事件筛选的区域实体。', dataEntityListHTML(marketItems))}
        ${dataLayerBlockHTML('MODEL DATABASE', '车型数据库', 'Structured model records covering specs, USD reference pricing and segment classification.', '覆盖参数、美元参考价与级别分类的结构化车型记录。', `<div class="data-layer-grid">${modelCards.join('\n')}</div>`)}
        ${dataLayerBlockHTML('DATA TO SYSTEM LINKS', '数据到系统链接', 'Navigation paths from the data layer into events, companies, markets and models.', '从数据层进入事件、公司、市场与车型的系统路径。', dataEntityListHTML(linkItems))}
      </div>
      ${sectionNavHTML(sec.route)}
    </div>
  </section>`;
}

function sectionNavHTML(current) {
  return `<div style="margin-top:44px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:13px;font-family:var(--mono, monospace);">
    <span style="color:#9ca3af;letter-spacing:.12em;text-transform:uppercase;">${langSpan('Sections', '栏目')}:</span>
    ${SECTIONS.filter(s => s.route !== current).map(s => `<a href="${s.route}" style="color:var(--accent, #d4302a);text-decoration:none;margin-left:14px;">${langSpan(s.h1_en, s.h1_zh)}</a>`).join('')}
  </div>`;
}

function sectionMain(sec) {
  if (sec.isDataLayer) return dataLayerMain(sec);
  const matched = articles.filter(a => articleMatchesSection(a, sec)).slice(0, 20);
  const marketsGrid = sec.isMarketsIndex ? `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin:32px 0;">
      ${MARKETS.map(mk => `
      <a href="/markets/${mk.slug}" style="display:block;padding:20px 22px;border:1px solid #e5e7eb;border-radius:10px;color:inherit;text-decoration:none;background:#fff;">
        <strong style="font-family:var(--serif, Georgia, serif);font-size:19px;">${langSpan(mk.name_en, mk.name_zh)}</strong>
        <p style="margin:8px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">${langSpan(mk.intro_en.split('. ')[0].slice(0, 110) + '…', mk.intro_zh.split('。')[0].slice(0, 60) + '…')}</p>
      </a>`).join('')}
    </div>` : '';
  const storiesList = sec.showStories && SITE_STORIES.length ? `
    <h2 style="font-size:22px;margin:36px 0 18px;">${langSpan('Feature stories', '深度故事')}</h2>
    <ul style="list-style:none;padding:0;margin:0 0 36px;">
      ${SITE_STORIES.map(s => {
        const f = (SITE_DATA.features || []).find(x => x.slug === s.slug) || {};
        return `<li style="margin-bottom:16px;"><a href="/stories/${s.slug}" style="color:inherit;text-decoration:none;"><strong style="font-family:var(--serif, Georgia, serif);font-size:19px;">${langSpan(f.title_en || s.slug, f.title_zh || f.title_en || s.slug)}</strong></a><p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${langSpan(f.desc_en || '', f.desc_zh || '')}</p></li>`;
      }).join('\n      ')}
    </ul>` : '';
  return `
  <section class="page-header">
    <div class="container">
      <div class="section-eyebrow">${langSpan('Section', '栏目')}</div>
      <h1 class="page-title">${langSpan(sec.h1_en, sec.h1_zh)}</h1>
      <p class="page-deck">${langSpan(sec.deck_en, sec.deck_zh)}</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container" style="max-width:880px;">
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 28px;">${langSpan(sec.intro_en, sec.intro_zh)}</p>
      ${sec.extra_en ? langSpan(sec.extra_en, sec.extra_zh || sec.extra_en) : ''}
      ${marketsGrid}
      ${storiesList}
      ${matched.length ? intelligenceFeedHTML(matched) : `
      <h2 style="font-size:22px;margin:36px 0 18px;">${langSpan('Latest coverage', '最新报道')}</h2>
      ${articleListHTML(matched, 'Dedicated coverage for this section is ramping up — the Daily Briefing covers these topics every weekday.', '本栏目的专题报道正在积累中——每日简报每个工作日都覆盖相关主题。')}`}
      ${sectionNavHTML(sec.route)}
    </div>
  </section>`;
}

for (const sec of SECTIONS) {
  const main = sectionMain(sec);
  const sectionItems = articles
    .filter(a => articleMatchesSection(a, sec))
    .map(a => ({ route: `/news/${a.slug}`, name: a.title_en }));
  const meta = {
    title: sec.title_en,
    desc: sec.deck_en,
    extraHead: collectionJsonLd(sec.route, sec.h1_en, sec.deck_en, sec.isMarketsIndex
      ? MARKETS.map(m => ({ route: `/markets/${m.slug}`, name: m.name_en }))
      : sectionItems)
  };
  fs.writeFileSync(path.join(ROOT, sec.file),
    pageHTML(sec.route, meta, main));
  writeZh(sec.file, zhChrome(pageHTML(sec.route, {
    title: sec.title_zh,
    desc: sec.deck_zh,
    extraHead: collectionJsonLd(sec.route, sec.h1_zh, sec.deck_zh, sec.isMarketsIndex
      ? MARKETS.map(m => ({ route: `/markets/${m.slug}`, name: m.name_zh }))
      : sectionItems.map(item => {
        const found = articles.find(a => `/news/${a.slug}` === item.route);
        return { route: item.route, name: found ? (found.title_zh || found.title_en) : item.name };
      }), true)
  }, main, { zh: true })));
}
console.log(`✓ ${SECTIONS.length} section pages (+zh)`);

// ---- Market pages (/markets/<slug>) ----
const MARKETS_OUT = path.join(ROOT, 'markets');
if (!fs.existsSync(MARKETS_OUT)) fs.mkdirSync(MARKETS_OUT);
for (const mk of MARKETS) {
  const matched = articles.filter(a => mk.kw.test(`${a.title_en} ${a.excerpt_en || ''}`)).slice(0, 20);
  const main = `
  <section class="page-header">
    <div class="container">
      <div class="section-eyebrow"><a href="/markets" style="color:inherit;text-decoration:none;">${langSpan('Markets', '市场')}</a></div>
      <h1 class="page-title">${langSpan('Chinese Cars in ' + mk.name_en, mk.name_zh + '：中国汽车市场观察')}</h1>
      <p class="page-deck">${langSpan(mk.intro_en.split('. ')[0] + '.', mk.intro_zh.split('。')[0] + '。')}</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container" style="max-width:880px;">
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 28px;">${langSpan(mk.intro_en, mk.intro_zh)}</p>
      ${(mk.body_en || mk.body_zh) ? `<style>.market-body h3{font-family:var(--serif,Georgia,serif);font-size:20px;margin:34px 0 12px;color:#111827;}.market-body p{margin:0 0 18px;}</style><div class="market-body" style="font-size:16px;line-height:1.85;color:#374151;">
        <div data-lang="en">${mk.body_en || ''}</div><div data-lang="zh" hidden>${mk.body_zh || ''}</div>
      </div>` : ''}
      <h2 style="font-size:22px;margin:36px 0 18px;">${langSpan('Latest coverage', '最新报道')}</h2>
      ${articleListHTML(matched, `Market-specific coverage of ${mk.name_en} is ramping up.`, `${mk.name_zh}市场的专题报道正在积累中。`)}
      <p style="margin-top:36px;"><a href="/markets" style="color:var(--accent, #d4302a);font-family:var(--mono);font-size:13px;">← All markets</a></p>
    </div>
  </section>`;
  const metaEn = {
    title: `Chinese Cars in ${mk.name_en} — Brands, EVs & Market News | TopChinaCar`,
    desc: mk.intro_en,
    extraHead: collectionJsonLd(`/markets/${mk.slug}`, `Chinese Cars in ${mk.name_en}`, mk.intro_en,
      matched.map(a => ({ route: `/news/${a.slug}`, name: a.title_en })))
  };
  fs.writeFileSync(path.join(MARKETS_OUT, `${mk.slug}.html`),
    pageHTML(`/markets/${mk.slug}`, metaEn, main));
  writeZh(`markets/${mk.slug}.html`, zhChrome(pageHTML(`/markets/${mk.slug}`, {
    title: `${mk.name_zh}中国汽车市场 — 品牌、电动车与市场动态 | TopChinaCar`,
    desc: mk.intro_zh,
    extraHead: collectionJsonLd(`/markets/${mk.slug}`, `${mk.name_zh}中国汽车市场`, mk.intro_zh,
      matched.map(a => ({ route: `/news/${a.slug}`, name: a.title_zh || a.title_en })), true)
  }, main, { zh: true })));
}
console.log(`✓ ${MARKETS.length} market pages (+zh)`);

// ---- Feature story pages (/stories/<slug>) ----
const STORIES_OUT = path.join(ROOT, 'stories');
if (!fs.existsSync(STORIES_OUT)) fs.mkdirSync(STORIES_OUT);

function storyMain(f, s) {
  const langBlock = (lang, html) => `<div data-lang="${lang}"${lang === 'zh' ? ' hidden' : ''}>${linkifyBrands(html, lang)}</div>`;
  return `
  <section class="page-header">
    <div class="container">
      <div class="section-eyebrow">${langSpan(f.tag_en, f.tag_zh)} · ${langSpan(f.meta_en, f.meta_zh)}</div>
      <h1 class="page-title">${langSpan(f.title_en, f.title_zh)}</h1>
      <p class="page-deck">${langSpan(f.desc_en, f.desc_zh)}</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container" style="max-width:820px;">
      ${bylineHTML(new Date(s.date + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }), s.date)}
      ${f.image ? `<div style="margin:0 0 36px;border-radius:12px;overflow:hidden;position:relative;"><img src="/${f.image}" alt="${f.title_en}" style="width:100%;display:block;" />${f.imageCredit ? `<span class="img-credit">Photo: ${f.imageCredit}</span>` : ''}</div>` : ''}
      <article class="article-body" style="font-size:16px;line-height:1.8;">
        ${langBlock('en', s.html_en)}
        ${langBlock('zh', s.html_zh || s.html_en)}
      </article>
      <p style="margin-top:32px;"><a href="/news" style="color:var(--accent);font-family:var(--mono);font-size:13px;">← All news & features</a></p>
    </div>
  </section>`;
}

function storyJsonLd(f, s, isZh = false) {
  return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": ${JSON.stringify(isZh ? (f.title_zh || f.title_en) : f.title_en)},
  "description": ${JSON.stringify(isZh ? (f.desc_zh || f.desc_en) : f.desc_en)},
  "datePublished": "${s.date}",
  "dateModified": "${s.date}",
  "image": "${assetUrl(f.image)}",
  "inLanguage": "${isZh ? 'zh-CN' : 'en'}",
  "mainEntityOfPage": "${canonicalUrl(`/stories/${f.slug}`, isZh)}",
  "author": {"@type": "Organization", "name": "TopChinaCar", "url": "${SITE}/"},
  "publisher": {"@id": "${SITE}/#organization"}
}
</script>`;
}

let storyCount = 0;
for (const s of SITE_STORIES) {
  const f = (SITE_DATA.features || []).find(x => x.slug === s.slug);
  if (!f) { console.error(`✗ story ${s.slug} has no matching features[] entry — skipped`); continue; }
  const main = storyMain(f, s);
  const html = pageHTML(`/stories/${f.slug}`, {
    title: `${f.title_en} | TopChinaCar`,
    desc: f.desc_en,
    image: f.image,
    ogType: 'article',
    published: s.date
  }, main).replace('</head>', storyJsonLd(f, s) + '\n</head>');
  fs.writeFileSync(path.join(STORIES_OUT, `${f.slug}.html`), html);
  writeZh(`stories/${f.slug}.html`, zhChrome(pageHTML(`/stories/${f.slug}`, {
    title: `${f.title_zh} | TopChinaCar`,
    desc: f.desc_zh,
    image: f.image,
    ogType: 'article',
    published: s.date
  }, main, { zh: true }).replace('</head>', storyJsonLd(f, s, true) + '\n</head>')));
  storyCount++;
}
if (storyCount) console.log(`✓ ${storyCount} feature stories → stories/ + zh/stories/`);

// ---- Daily article pages (/news/<slug>) ----
const NEWS_OUT = path.join(ROOT, 'news');
if (!fs.existsSync(NEWS_OUT)) fs.mkdirSync(NEWS_OUT);
// Extract unique external sources (href + label) from article HTML
function extractSources(html) {
  const seen = new Set(); const out = [];
  for (const m of (html || '').matchAll(/<a href="(https?:\/\/[^"]+)">\[?([^<\]]+)\]?<\/a>/g)) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    let host = '';
    try { host = new URL(m[1]).hostname.replace(/^www\./, ''); } catch (e) {}
    out.push({ url: m[1], label: m[2].trim(), host });
  }
  return out.slice(0, 25);
}

function sourcesBlockHTML(sources) {
  if (!sources.length) return '';
  return `
      <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e5e7eb;">
        <h2 style="font-size:16px;margin:0 0 12px;">${langSpan('Sources', '信息来源')}</h2>
        <ul style="list-style:none;padding:0;margin:0;font-size:13px;line-height:1.9;color:#6b7280;">
          ${sources.map(s => `<li><a href="${s.url}" rel="noopener" target="_blank" style="color:inherit;">${s.label}</a> <span style="color:#9ca3af;">· ${s.host}</span></li>`).join('\n          ')}
        </ul>
      </div>`;
}

function articleSearchText(a) {
  return `${a.title_en || ''} ${a.title_zh || ''} ${a.excerpt_en || ''} ${a.excerpt_zh || ''} ${a.tag_en || ''} ${a.tag_zh || ''}`.toLowerCase();
}

function articleKeywords(a) {
  const text = articleSearchText(a);
  const brandNames = SITE_DATA.brands
    .filter(b => text.includes(String(b.name).toLowerCase()) || (b.cn && text.includes(String(b.cn).toLowerCase())))
    .map(b => b.name.toLowerCase());
  const topicWords = (text.match(/\b(export|exports|overseas|europe|tariff|policy|battery|ev|electric|plant|factory|africa|middle east|brazil|southeast asia|dealer|sales|market|strategy)\b/g) || []);
  return new Set(brandNames.concat(topicWords));
}

function relatedArticles(current, limit = 3) {
  const currentKeys = articleKeywords(current);
  const currentTag = String(current.tag_en || '').toLowerCase();
  return articles
    .filter(a => a.slug !== current.slug)
    .map(a => {
      const keys = articleKeywords(a);
      let score = 0;
      if (currentTag && String(a.tag_en || '').toLowerCase() === currentTag) score += 3;
      for (const key of currentKeys) if (keys.has(key)) score += key.length > 3 ? 2 : 1;
      return { article: a, score };
    })
    .sort((a, b) => b.score - a.score || b.article.date.localeCompare(a.article.date))
    .slice(0, limit)
    .map(x => x.article);
}

function relatedCoverageHTML(current) {
  const related = relatedArticles(current);
  if (!related.length) return '';
  return `
      <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e5e7eb;">
        <h2 style="font-size:18px;margin:0 0 16px;">${langSpan('Related coverage', '相关阅读')}</h2>
        <ul style="list-style:none;padding:0;margin:0;">
          ${related.map(a => `<li style="margin-bottom:16px;">
            <a href="/news/${a.slug}" style="color:inherit;text-decoration:none;"><strong style="font-family:var(--serif, Georgia, serif);font-size:17px;line-height:1.35;">${langSpan(a.title_en, a.title_zh || a.title_en)}</strong></a>
            <p style="margin:5px 0 0;font-size:13px;color:#6b7280;line-height:1.55;">${langSpan(a.excerpt_en || '', a.excerpt_zh || a.excerpt_en || '')}</p>
          </li>`).join('\n          ')}
        </ul>
      </div>`;
}

function bylineHTML(dateNice, dateIso) {
  return `
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 28px;font-family:var(--mono, monospace);font-size:12px;letter-spacing:.06em;color:#6b7280;">
        <span>${langSpan('By TopChinaCar Editorial', '作者：TopChinaCar 编辑部')}</span>
        <span>·</span>
        <span>${langSpan('Published ' + dateNice, '发布于 ' + dateIso)}</span>
        <span>·</span>
        <span>${langSpan('Compiled from the primary sources cited below', '基于文末所列一手信源编写')}</span>
      </div>`;
}

function articleMain(a, primaryLang = 'en') {
  const dateNice = new Date(a.date + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  const langBlock = (lang, html) => {
    const body = lang === primaryLang ? html : namespaceFragmentIds(html, lang);
    return `<div data-lang="${lang}"${lang === 'zh' ? ' hidden' : ''}>${linkifyBrands(body, lang)}</div>`;
  };
  const sources = extractSources(a.html_en);
  const seriesCallout = a.tag_en === 'Map Wars' ? `
      <aside style="display:flex;justify-content:space-between;gap:18px;align-items:center;flex-wrap:wrap;margin:0 0 28px;padding:16px 18px;border:1px solid #e5e7eb;border-left:4px solid #d4302a;background:#fafafa;">
        <div><strong>${langSpan('Map Wars · Eight-part series', '地图战争 · 八部曲')}</strong><br/><span style="font-size:13px;color:#6b7280;">${langSpan('How the global digital-map industry was built, consolidated and reopened by AI.', '全球数字地图产业如何形成、收敛，又如何被 AI 重新打开。')}</span></div>
        <a href="/series/map-wars" style="color:var(--accent);font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;">${langSpan('View the full series →', '查看完整专题 →')}</a>
      </aside>` : '';
  return `
  <section class="page-header">
    <div class="container">
      <div class="section-eyebrow"><span data-lang="en">${a.tag_en || 'Daily Briefing'} · ${dateNice}</span><span data-lang="zh" hidden>${a.tag_zh || '每日简报'} · ${a.date}</span></div>
      <h1 class="page-title"><span data-lang="en">${a.title_en}</span><span data-lang="zh" hidden>${a.title_zh || a.title_en}</span></h1>
      <p class="page-deck"><span data-lang="en">${a.excerpt_en || ''}</span><span data-lang="zh" hidden>${a.excerpt_zh || ''}</span></p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container" style="max-width:820px;">
      ${bylineHTML(dateNice, a.date)}
      ${seriesCallout}
      <article class="article-body" style="font-size:16px;line-height:1.8;">
        ${langBlock('en', a.html_en)}
        ${langBlock('zh', a.html_zh || a.html_en)}
      </article>
      ${sourcesBlockHTML(sources)}
      ${relatedCoverageHTML(a)}
      <p style="margin-top:32px;"><a href="/news" style="color:var(--accent);font-family:var(--mono);font-size:13px;">← All news</a></p>
    </div>
  </section>`;
}

function articleImage(a) {
  if (a.image) return a.image;
  if (a.tag_en === 'Map Wars') return DEFAULT_OG_IMAGE;
  const text = `${a.title_en || ''} ${a.excerpt_en || ''} ${a.title_zh || ''} ${a.excerpt_zh || ''}`.toLowerCase();
  const brand = SITE_DATA.brands.find(b => articleBrandRelevance(a, b) >= 3);
  if (brand && brand.image) return brand.image;
  if (/\bev\b|electric|battery|batteries|phev|hybrid/i.test(text)) return 'images/byd-seal.jpg';
  if (/\bafrica\b|\bpickups?\b|\bcommercial vehicles?\b/i.test(text)) return 'images/chery-brand.jpg';
  if (/middle east|gulf|saudi|uae|dubai/i.test(text)) return 'images/yangwang-u8.jpg';
  if (/europe|tariff/i.test(text)) return 'images/mg-mg4.jpg';
  return DEFAULT_OG_IMAGE;
}

function articleJsonLd(a, isZh = false) {
  const image = articleImage(a);
  const imageSize = imageDimensions(image);
  const route = `/news/${a.slug}`;
  const pageUrl = canonicalUrl(route, isZh);
  const published = a.published_at || a.date;
  const modified = a.modified_at || published;
  const articleNode = {
    '@type': 'NewsArticle',
    '@id': `${pageUrl}#article`,
    headline: isZh ? (a.title_zh || a.title_en) : a.title_en,
    description: isZh
      ? (a.excerpt_zh || a.excerpt_en || a.title_zh || a.title_en)
      : (a.excerpt_en || a.title_en),
    datePublished: published,
    dateModified: modified,
    image: {
      '@type': 'ImageObject',
      url: assetUrl(image),
      ...(imageSize || {})
    },
    articleSection: isZh ? (a.tag_zh || a.tag_en || '分析') : (a.tag_en || 'Analysis'),
    inLanguage: isZh ? 'zh-CN' : 'en',
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    author: { '@type': 'Organization', name: 'TopChinaCar Editorial', url: `${SITE}/about` },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'TopChinaCar',
      url: `${SITE}/`,
      logo: { '@type': 'ImageObject', url: assetUrl(SITE_LOGO), width: 512, height: 512 }
    }
  };
  if (a.tag_en === 'Map Wars') {
    articleNode.isPartOf = {
      '@type': 'CreativeWorkSeries',
      name: isZh ? '地图战争' : 'Map Wars',
      url: canonicalUrl('/series/map-wars', isZh)
    };
  }
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@graph': [
      articleNode,
      breadcrumbJsonLd(route, [
        { name: isZh ? '首页' : 'Home', route: '/' },
        { name: isZh ? '新闻' : 'News', route: '/news' },
        { name: isZh ? (a.title_zh || a.title_en) : a.title_en, route }
      ], isZh)
    ]
  });
}

for (const a of articles) {
  const route = `/news/${a.slug}`;
  const main = articleMain(a, 'en');
  const zhMain = articleMain(a, 'zh');
  const html = pageHTML(route, {
    title: `${a.title_en} | TopChinaCar`,
    desc: (a.excerpt_en || a.title_en),
    image: articleImage(a),
    ogType: 'article',
    published: a.published_at || a.date,
    modified: a.modified_at || a.published_at || a.date,
    section: a.tag_en || 'Analysis'
  }, main).replace('</head>', articleJsonLd(a) + '\n</head>');
  fs.writeFileSync(path.join(NEWS_OUT, `${a.slug}.html`), html);
  writeZh(`news/${a.slug}.html`, zhChrome(pageHTML(route, {
    title: `${a.title_zh || a.title_en} | TopChinaCar`,
    desc: (a.excerpt_zh || a.excerpt_en || a.title_zh || a.title_en),
    image: articleImage(a),
    ogType: 'article',
    published: a.published_at || a.date,
    modified: a.modified_at || a.published_at || a.date,
    section: a.tag_zh || a.tag_en || '分析'
  }, zhMain, { zh: true }).replace('</head>', articleJsonLd(a, true) + '\n</head>')));
}
if (articles.length) console.log(`✓ ${articles.length} article page(s) → news/ + zh/news/`);

// ---- 404 ----
const notFoundMain = `
  <section class="page-header">
    <div class="container">
      <div class="section-eyebrow">404</div>
      <h1 class="page-title">Page not found</h1>
      <p class="page-deck">The page you are looking for does not exist. <a href="/" style="color:var(--accent);">Back to the homepage</a> · <a href="/chinese-car-brands" style="color:var(--accent);">Brand Index</a> · <a href="/news" style="color:var(--accent);">News</a></p>
    </div>
  </section>`;
fs.writeFileSync(path.join(ROOT, '404.html'),
  pageHTML('/', {
    title: 'Page Not Found | TopChinaCar',
    desc: 'The page you are looking for does not exist.',
    robots: 'noindex,nofollow'
  }, notFoundMain, { noAlt: true, noCanonical: true }));
console.log('✓ 404.html');

// ---- sitemaps: sitemap.xml (index) → sitemap-pages / sitemap-posts / sitemap-news ----
function safeDate(date) {
  if (!date) return TODAY;
  return date > TODAY ? TODAY : date;
}

// lastmod 策略：
//  - 文章/故事：真实发布日期
//  - 栏目页 / 市场页 / 首页 / News 索引：随最新文章变化（列表内容确实更新了）
//  - 其余静态页、品牌页、车型页：固定的内容修改日 STATIC_LASTMOD——
//    只有真正改动这些页面的内容时才手动更新，避免"天天都是今天"让 Google 不信任 lastmod
const STATIC_LASTMOD = '2026-07-12';
const articleContentDate = article => safeDate(String(article.modified_at || article.published_at || article.date || TODAY).slice(0, 10));
const latestArticleDate = articles.length ? articleContentDate(articles[0]) : STATIC_LASTMOD;
const FRESH_ROUTES = new Set(['/', '/news']);

const staticUrls = Object.keys(PAGES).map(r =>
  PAGES[r].robots && PAGES[r].robots.includes('noindex')
    ? null
    : `  <url><loc>${r === '/' ? SITE + '/' : SITE + r}</loc><lastmod>${PAGES[r].lastmod || (FRESH_ROUTES.has(r) ? latestArticleDate : STATIC_LASTMOD)}</lastmod></url>`
).filter(Boolean);
const brandUrls = SITE_DATA.brands.map(b =>
  `  <url><loc>${SITE}/chinese-car-brands/${b.id}</loc><lastmod>${STATIC_LASTMOD}</lastmod></url>`);
const modelUrls = SITE_DATA.models.filter(m => m.id).map(m =>
  `  <url><loc>${SITE}/models/${m.id}</loc><lastmod>${STATIC_LASTMOD}</lastmod></url>`);
const sectionUrls = SECTIONS.map(s =>
  `  <url><loc>${SITE}${s.route}</loc><lastmod>${latestArticleDate}</lastmod></url>`);
const marketUrls = MARKETS.map(mk =>
  `  <url><loc>${SITE}/markets/${mk.slug}</loc><lastmod>${latestArticleDate}</lastmod></url>`);
const storyUrls = SITE_STORIES
  .filter(s => (SITE_DATA.features || []).some(f => f.slug === s.slug))
  .map(s => `  <url><loc>${SITE}/stories/${s.slug}</loc><lastmod>${safeDate(s.date)}</lastmod></url>`);
const articleUrls = articles.map(a =>
  `  <url><loc>${SITE}/news/${a.slug}</loc><lastmod>${articleContentDate(a)}</lastmod></url>`);

const zhMirror = lines => lines.map(l =>
  l.includes(`<loc>${SITE}/</loc>`)
    ? l.replace(`<loc>${SITE}/</loc>`, `<loc>${SITE}/zh/</loc>`)
    : l.replace(`<loc>${SITE}/`, `<loc>${SITE}/zh/`));

const urlset = lines => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join('\n')}
</urlset>
`;

// 子 sitemap 1：栏目/品牌/车型/市场等"页面"
const pageLines = staticUrls.concat(sectionUrls, marketUrls, brandUrls, modelUrls);
fs.writeFileSync(path.join(ROOT, 'sitemap-pages.xml'), urlset(pageLines.concat(zhMirror(pageLines))));

// 子 sitemap 2：全部文章 + 深度故事（发布即随构建自动更新）
const postLines = storyUrls.concat(articleUrls);
fs.writeFileSync(path.join(ROOT, 'sitemap-posts.xml'), urlset(postLines.concat(zhMirror(postLines))));

// 子 sitemap 3：Google News（仅最近 48 小时，含时间戳）
const newsPubDate = a => a.published_at || safeDate(a.date);
const newsDateCutoff = shiftIsoDate(TODAY, -2);
const newsTimestampCutoff = BUILD_NOW.getTime() - 2 * 24 * 60 * 60 * 1000;
const recentNews = articles
  .filter(a => {
    if (a.published_at) {
      const publishedAt = Date.parse(a.published_at);
      return Number.isFinite(publishedAt)
        && publishedAt <= BUILD_NOW.getTime()
        && publishedAt >= newsTimestampCutoff;
    }
    return a.date <= TODAY && a.date >= newsDateCutoff;
  })
  .slice(0, 1000);
const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentNews.map(a => `  <url>
    <loc>${SITE}/news/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>TopChinaCar</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${newsPubDate(a)}</news:publication_date>
      <news:title>${xmlEscape(a.title_en)}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap-news.xml'), newsSitemap);

// 索引：GSC 只需提交这一个
const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE}/sitemap-pages.xml</loc><lastmod>${STATIC_LASTMOD > latestArticleDate ? STATIC_LASTMOD : latestArticleDate}</lastmod></sitemap>
  <sitemap><loc>${SITE}/sitemap-posts.xml</loc><lastmod>${latestArticleDate}</lastmod></sitemap>
  <sitemap><loc>${SITE}/sitemap-news.xml</loc><lastmod>${latestArticleDate}</lastmod></sitemap>
</sitemapindex>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapIndex);
console.log(`✓ sitemap.xml (index) + pages(${pageLines.length * 2}) + posts(${postLines.length * 2}) + news(${recentNews.length})`);

function rssDate(article) {
  if (article.published_at && Number.isFinite(Date.parse(article.published_at))) {
    return new Date(article.published_at).toUTCString();
  }
  return new Date(`${safeDate(article.date)}T00:00:00Z`).toUTCString();
}

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TopChinaCar News</title>
    <link>${SITE}/news</link>
    <description>Chinese auto news, EVs, exports, policy and global market coverage from TopChinaCar.</description>
    <language>en</language>
    <lastBuildDate>${BUILD_NOW.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${articles.slice(0, 50).map(a => `    <item>
      <title>${xmlEscape(a.title_en)}</title>
      <link>${SITE}/news/${xmlEscape(a.slug)}</link>
      <guid isPermaLink="true">${SITE}/news/${xmlEscape(a.slug)}</guid>
      <pubDate>${rssDate(a)}</pubDate>
      <description>${xmlEscape(a.excerpt_en || plainText(a.html_en).slice(0, 240))}</description>
      <category>${xmlEscape(a.tag_en || 'Daily Briefing')}</category>
    </item>`).join('\n')}
  </channel>
</rss>
`;
fs.writeFileSync(path.join(ROOT, 'feed.xml'), feed);
console.log('✓ feed.xml');

console.log(`\nDone — ${count} pages + 404 + sitemap + feed.`);
