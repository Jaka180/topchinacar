// ============ PAGE RENDERERS (pure functions — also used by build.js for prerendering) ============
const LIVE_INTELLIGENCE_PATH = '/news';

// Same plain-text escape as build.js. Leaves existing entities (&amp; and friends) intact.
function escapeHtmlText(value) {
  return String(value ?? '')
    .replace(/&(?!(?:#\d+|#x[0-9a-fA-F]+|amp|lt|gt|quot|apos);)/gi, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// SVG car illustrations (stylised silhouettes)
function carSVG(shape, colorA = '#d4302a', colorB = '#1a1a1a') {
  const w = 400, h = 220;
  const bg = `<defs>
      <linearGradient id="g-${colorA.slice(1)}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${colorB}"/>
        <stop offset="100%" stop-color="#2a2a2a"/>
      </linearGradient>
      <radialGradient id="glow-${colorA.slice(1)}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${colorA}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${colorA}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g-${colorA.slice(1)})"/>
    <ellipse cx="200" cy="140" rx="180" ry="60" fill="url(#glow-${colorA.slice(1)})"/>`;

  let car = '';
  if (shape === 'sedan') {
    car = `<g transform="translate(60,80)">
      <path d="M10 80 Q15 60 50 55 L100 35 Q140 25 180 25 Q220 25 250 35 L270 50 L295 60 Q285 80 270 85 L25 85 Q12 85 10 80 Z" fill="${colorA}"/>
      <path d="M70 55 L100 38 Q140 30 180 30 Q210 30 235 38 L255 53 Z" fill="rgba(255,255,255,0.15)"/>
      <circle cx="70" cy="85" r="15" fill="${colorB}"/>
      <circle cx="70" cy="85" r="9" fill="#444"/>
      <circle cx="240" cy="85" r="15" fill="${colorB}"/>
      <circle cx="240" cy="85" r="9" fill="#444"/>
      <rect x="270" y="65" width="20" height="6" rx="3" fill="${colorA}" opacity="0.9"/>
    </g>`;
  } else if (shape === 'sedan-long') {
    car = `<g transform="translate(40,80)">
      <path d="M10 80 Q15 58 55 52 L110 30 Q160 22 220 22 Q270 22 305 35 L325 52 L335 65 Q325 85 305 85 L20 85 Q10 85 10 80 Z" fill="${colorA}"/>
      <path d="M80 52 L115 33 Q160 26 220 26 Q260 26 295 38 L315 53 Z" fill="rgba(255,255,255,0.15)"/>
      <circle cx="80" cy="85" r="16" fill="${colorB}"/><circle cx="80" cy="85" r="10" fill="#555"/>
      <circle cx="275" cy="85" r="16" fill="${colorB}"/><circle cx="275" cy="85" r="10" fill="#555"/>
    </g>`;
  } else if (shape === 'suv') {
    car = `<g transform="translate(60,70)">
      <path d="M10 90 Q12 50 50 45 L90 25 Q140 18 200 18 Q250 18 280 30 L295 50 Q295 70 285 90 Z" fill="${colorA}"/>
      <path d="M70 45 L95 27 Q140 22 200 22 Q240 22 270 32 L285 50 Z" fill="rgba(255,255,255,0.15)"/>
      <circle cx="75" cy="92" r="16" fill="${colorB}"/><circle cx="75" cy="92" r="10" fill="#444"/>
      <circle cx="245" cy="92" r="16" fill="${colorB}"/><circle cx="245" cy="92" r="10" fill="#444"/>
    </g>`;
  } else if (shape === 'mpv') {
    car = `<g transform="translate(45,60)">
      <path d="M10 100 Q12 35 55 30 L100 18 Q160 12 220 14 Q270 16 295 30 L308 55 Q310 80 305 100 Z" fill="${colorA}"/>
      <path d="M60 35 L100 22 Q160 18 220 20 Q260 22 285 32 L295 55 Z" fill="rgba(255,255,255,0.15)"/>
      <circle cx="80" cy="100" r="16" fill="${colorB}"/><circle cx="80" cy="100" r="10" fill="#444"/>
      <circle cx="260" cy="100" r="16" fill="${colorB}"/><circle cx="260" cy="100" r="10" fill="#444"/>
    </g>`;
  } else if (shape === 'wagon') {
    car = `<g transform="translate(40,80)">
      <path d="M10 80 Q15 55 50 50 L100 30 Q170 22 240 24 Q290 27 315 40 L325 60 Q320 82 305 85 L18 85 Q10 85 10 80 Z" fill="${colorA}"/>
      <path d="M75 50 L110 32 Q170 26 240 28 Q280 30 305 42 L317 58 Z" fill="rgba(255,255,255,0.15)"/>
      <circle cx="80" cy="85" r="15" fill="${colorB}"/><circle cx="80" cy="85" r="9" fill="#444"/>
      <circle cx="270" cy="85" r="15" fill="${colorB}"/><circle cx="270" cy="85" r="9" fill="#444"/>
    </g>`;
  } else {
    car = `<g transform="translate(60,80)"><circle cx="140" cy="60" r="40" fill="${colorA}"/></g>`;
  }

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${bg}${car}</svg>`;
}

function brandMarkSVG(brand) {
  const initials = brand.name.slice(0, 2).toUpperCase();
  return `<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bg-${brand.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${brand.colorB}"/>
        <stop offset="100%" stop-color="#2a2a2a"/>
      </linearGradient>
    </defs>
    <rect width="400" height="250" fill="url(#bg-${brand.id})"/>
    <circle cx="320" cy="60" r="80" fill="${brand.colorA}" opacity="0.15"/>
    <circle cx="80" cy="200" r="100" fill="${brand.colorA}" opacity="0.10"/>
    <text x="40" y="170" font-family="Playfair Display,serif" font-weight="900" font-size="120" fill="${brand.colorA}" letter-spacing="-4">${initials}</text>
    <text x="44" y="200" font-family="JetBrains Mono,monospace" font-size="13" fill="rgba(255,255,255,0.5)" letter-spacing="3">${brand.name.toUpperCase()}</text>
  </svg>`;
}

// 从价格字符串中提取首个 RMB 数字（支持 "¥529,900" / "¥529,900 起" / "¥529,900 - ¥1,036,000"）
function extractRmb(price) {
  if (!price) return null;
  const m = price.match(/¥\s*([\d,]+)/);
  if (!m) return null;
  const n = parseInt(m[1].replace(/,/g, ''), 10);
  return isNaN(n) ? null : n;
}

// 友好取整：万级显示 K
function formatThousand(n, symbol) {
  if (n >= 1000) {
    const k = Math.round(n / 1000);
    return symbol + k + 'K';
  }
  return symbol + n;
}

function priceDualLine(price) {
  const rmb = extractRmb(price);
  if (!rmb) return '';
  // 汇率参考 ¥1 ≈ $0.138 ≈ €0.128
  const usd = Math.round(rmb * 0.138);
  const eur = Math.round(rmb * 0.128);
  return `<span class="spec-price-dual">≈ ${formatThousand(usd, '$')} / ${formatThousand(eur, '€')}</span>`;
}

const PAGE_FAQS = {
  brands: [
    {
      q_en: 'Which Chinese car brands sell internationally?',
      q_zh: '哪些中国汽车品牌正在海外销售？',
      a_en: 'BYD, Geely, Chery, Changan, SAIC/MG, FAW/Hongqi, Great Wall, GAC, Dongfeng, BAIC and newer EV brands such as NIO, Xpeng, Li Auto, Xiaomi and Leapmotor all sell or prepare vehicles outside China.',
      a_zh: '比亚迪、吉利、奇瑞、长安、上汽/MG、一汽/红旗、长城、广汽、东风、北汽，以及蔚来、小鹏、理想、小米、零跑等新势力，都在海外销售或准备进入海外市场。'
    },
    {
      q_en: 'What is the difference between Chinese legacy groups and EV startups?',
      q_zh: '传统车企集团和造车新势力有什么区别？',
      a_en: 'Legacy groups such as BYD, Geely, Chery, Changan, SAIC, FAW, Great Wall, GAC, Dongfeng and BAIC have complete manufacturing systems and export networks. EV startups usually focus on newer electric, extended-range and smart-car platforms with faster software cycles.',
      a_zh: '传统整车集团包括比亚迪、吉利、奇瑞、长安、上汽、一汽、长城、广汽、东风、北汽，通常拥有完整制造体系和出口网络；新势力更多聚焦纯电、增程和智能化平台，软件迭代速度更快。'
    },
    {
      q_en: 'Which Chinese brands are strongest for export markets?',
      q_zh: '哪些中国品牌的出口能力最强？',
      a_en: 'BYD, Chery, Geely, SAIC/MG and Great Wall currently have the broadest overseas footprints. Changan, GAC, Dongfeng, FAW and BAIC remain important state-group systems to track as the export mix shifts toward new energy vehicles.',
      a_zh: '比亚迪、奇瑞、吉利、上汽/MG 和长城目前海外版图最广。随着出口结构转向新能源，长安、广汽、东风、一汽、北汽等国有集团体系也需要持续跟踪。'
    }
  ],
  models: [
    {
      q_en: 'Which Chinese EV models are most relevant internationally?',
      q_zh: '哪些中国电动车最值得国际读者关注？',
      a_en: 'BYD Seal, BYD Atto 3, MG4, Xiaomi SU7, Xpeng G6, Zeekr 001, NIO ET5 and Leapmotor C10 are among the models international readers often track.',
      a_zh: '比亚迪海豹、BYD Atto 3、MG4、小米 SU7、小鹏 G6、极氪 001、蔚来 ET5 和零跑 C10 是国际读者常关注的车型。'
    },
    {
      q_en: 'Are the prices listed on TopChinaCar transaction prices?',
      q_zh: 'TopChinaCar 上的价格是成交价吗？',
      a_en: 'No. Model pages use indicative local list prices and approximate USD conversions for editorial context. Actual market prices vary by country, trim, taxes, logistics and local incentives.',
      a_zh: '不是。车型页使用本地指导价和近似美元换算，仅作为编辑背景信息。实际市场价格会因国家、配置、税费、物流和本地激励而变化。'
    },
    {
      q_en: 'Do Chinese EV specs differ by country?',
      q_zh: '中国电动车在不同国家的配置会不同吗？',
      a_en: 'Yes. Battery size, charging standard, safety equipment, software, warranty and homologation package can differ between China-market vehicles and export-market versions.',
      a_zh: '会。电池容量、充电标准、安全配置、软件、质保和认证包可能因中国版与出口版不同而变化。'
    }
  ],
  news: [
    {
      q_en: 'What does TopChinaCar cover every day?',
      q_zh: 'TopChinaCar 每天报道什么？',
      a_en: 'TopChinaCar tracks Chinese automakers overseas, EV and battery news, export data, overseas plants, dealer networks, tariffs, regulations and market-entry stories.',
      a_zh: 'TopChinaCar 追踪中国车企出海、新能源与电池新闻、出口数据、海外工厂、经销网络、关税、监管和市场进入动态。'
    },
    {
      q_en: 'Are TopChinaCar articles sourced?',
      q_zh: 'TopChinaCar 的文章有信源吗？',
      a_en: 'Articles cite primary or reputable secondary sources inline and list source links where available, especially for data, policy and company announcements.',
      a_zh: '文章会在正文内引用一手或可信二手信源，尤其是涉及数据、政策和企业公告时，会尽量列出可核查链接。'
    },
    {
      q_en: 'Why focus on Chinese auto exports?',
      q_zh: '为什么重点关注中国汽车出口？',
      a_en: 'China has become the world’s largest car exporter, and export growth now shapes automaker strategy, global pricing, supply chains and policy debates.',
      a_zh: '中国已经成为全球第一大汽车出口国，出口增长正在影响车企战略、全球定价、供应链和政策讨论。'
    }
  ],
};

function faqSectionHTML(key) {
  const lang = getLang();
  const items = PAGE_FAQS[key] || [];
  if (!items.length) return '';
  return `
    <section class="faq-section">
      <div class="container" style="max-width:920px;">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">${lang === 'zh' ? '常见问题' : 'FAQ'}</div>
            <h2 class="section-title">${lang === 'zh' ? '搜索者常问的问题' : 'Common Search Questions'}</h2>
          </div>
        </div>
        <div style="display:grid;gap:14px;">
          ${items.map(item => `
            <article style="border:1px solid #e5e7eb;border-radius:8px;padding:18px 20px;background:#fff;">
              <h3 style="font-size:17px;margin:0 0 8px;font-family:var(--serif, Georgia, serif);">${item['q_' + lang]}</h3>
              <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.7;">${item['a_' + lang]}</p>
            </article>
          `).join('')}
        </div>
      </div>
    </section>`;
}

const LEGACY_GROUP_ORDER = ['byd', 'geely', 'chery', 'changan', 'saic', 'faw', 'gwm', 'gac', 'dongfeng', 'baic'];

function sortBrandsForSection(items) {
  const rank = id => {
    const i = LEGACY_GROUP_ORDER.indexOf(id);
    return i === -1 ? 999 : i;
  };
  return [...items].sort((a, b) => rank(a.id) - rank(b.id) || a.name.localeCompare(b.name));
}

// News 缩图统一渲染：有 image 用真实照片，否则 fallback 到 carSVG
function newsThumbHTML(n, variant) {
  // variant: 'main' 或 'side'
  const klass = variant === 'main' ? 'news-main-thumb' : 'news-thumb';
  const shape = variant === 'main' ? 'sedan-long' : 'sedan';
  if (n.image) {
    return `<div class="${klass} has-photo"><img src="/${n.image}" alt="${n.title_en || ''}" loading="lazy" decoding="async" />${n.imageCredit ? `<span class="img-credit">Photo: ${n.imageCredit}</span>` : ''}</div>`;
  }
  return `<div class="${klass}">${carSVG(shape, n.accent)}</div>`;
}

function modelCardHTML(m, lang) {
  const visual = m.image
    ? `<img src="/${m.image}" alt="${m.brand} ${m.name}" loading="lazy" decoding="async" />` + (m.imageCredit ? `<span class="img-credit">Photo: ${m.imageCredit}</span>` : '')
    : carSVG(m.shape, m.colorA);
  const dual = m.priceLocal
    ? `<span class="spec-price-dual">${m.priceLocal}</span>`
    : priceDualLine(m.price);
  const specNote = m['specNote_' + lang] || m.specNote_en || '';
  const detailHref = m.id ? `/models/${m.id}` : null;
  return `
    <article class="model-card">
      <div class="model-thumb${m.image ? ' has-photo' : ''}">${detailHref ? `<a href="${detailHref}">${visual}</a>` : visual}</div>
      <div class="model-body">
        <div class="model-brand">${m.brand}</div>
        <h3 class="model-name">${detailHref ? `<a href="${detailHref}" style="color:inherit;text-decoration:none;">${m.name}</a>` : m.name}</h3>
        <p class="model-tagline">${m['tag_' + lang]}</p>
        <div class="model-specs">
          <div><span class="spec-label">${t('models.spec.range')}</span><span class="spec-value">${m.range}</span></div>
          <div><span class="spec-label">${t('models.spec.accel')}</span><span class="spec-value">${m.accel}</span></div>
          <div class="spec-price-row"><span class="spec-label">${t('models.spec.price')}</span><span class="spec-value">${m.price}</span>${dual}</div>
        </div>
        ${specNote ? `<p class="model-spec-note">${specNote}</p>` : ''}
        ${detailHref ? `<a href="${detailHref}" style="display:inline-block;margin-top:14px;color:var(--accent, #d4302a);font-family:var(--mono, monospace);font-size:12px;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;">${lang === 'zh' ? '详情 →' : 'Full profile →'}</a>` : ''}
      </div>
    </article>
  `;
}

function brandCardHTML(b, lang) {
  const parentBadge = b.category === 'subbrand'
    ? `<div class="brand-card-parent">${lang === 'zh' ? '隶属于' : 'Part of'} <strong>${b['parent_' + lang] || b.parent_en}</strong></div>`
    : '';
  const subBrands = b['subBrands_' + lang];
  const subBrandsLine = subBrands
    ? `<div class="brand-card-sublist"><span class="spec-label">${lang === 'zh' ? '旗下品牌' : 'Sub-brands'}</span><span class="brand-card-sublist-val">${subBrands}</span></div>`
    : '';
  return `
    <article class="brand-card" id="brand-${b.id}" data-brand-id="${b.id}">
      <div class="brand-card-thumb${b.image ? ' has-photo' : ''}">${b.image ? `<img src="/${b.image}" alt="${b.name}" loading="lazy" decoding="async" />` : brandMarkSVG(b)}</div>
      <div class="brand-card-body">
        ${parentBadge}
        <h3 class="brand-card-name"><a href="/chinese-car-brands/${b.id}" style="color:inherit;text-decoration:none;">${b.name}</a></h3>
        <div class="brand-card-cn">${b.cn}</div>
        <p class="brand-card-desc">${b['desc_' + lang]}</p>
        ${subBrandsLine}
        <div class="brand-facts">
          <div class="brand-fact"><span class="spec-label">${t('brands.fact.founded')}</span><span class="spec-value">${b.founded}</span></div>
          <div class="brand-fact"><span class="spec-label">${t('brands.fact.hq')}</span><span class="spec-value">${b.hq}</span></div>
          <div class="brand-fact"><span class="spec-label">${t('brands.fact.focus')}</span><span class="spec-value" style="font-size:12px;">${b.focus}</span></div>
        </div>
        <a href="/chinese-car-brands/${b.id}" style="display:inline-block;margin-top:12px;color:var(--accent, #d4302a);font-family:var(--mono, monospace);font-size:12px;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;">${lang === 'zh' ? '品牌详情 →' : 'Full profile →'}</a>
      </div>
    </article>
  `;
}

// ============ PAGES ============

function articleDateValue(article) {
  return String(article && (article.published_at || article.date) || '').slice(0, 10);
}

function formatPublicationDate(article, lang) {
  const value = articleDateValue(article);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const date = new Date(`${value}T00:00:00Z`);
  return lang === 'zh'
    ? `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`
    : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function homepageNews(items, limit = 5, perCategory = 2) {
  if (!items || !items.length) return { top: null, latest: [] };
  const top = items[0];
  const counts = new Map();
  const tagKey = article => String(article.tag_en || 'News').trim().toLowerCase();
  counts.set(tagKey(top), 1);
  const latest = [];
  for (const article of items.slice(1)) {
    const key = tagKey(article);
    const count = counts.get(key) || 0;
    if (count >= perCategory) continue;
    latest.push(article);
    counts.set(key, count + 1);
    if (latest.length === limit) break;
  }
  return { top, latest };
}

function pageHome() {
  const D = SITE_DATA;
  const lang = getLang();
  const features = SITE_DATA.features;
  const homeModelIds = ['byd-seal', 'xiaomi-su7', 'xpeng-g6', 'zeekr-001', 'mg-mg4', 'leapmotor-c10'];
  const homeModels = homeModelIds
    .map(id => D.models.find(m => m.id === id))
    .filter(Boolean);
  const availableArticles = typeof SITE_ARTICLES !== 'undefined' ? SITE_ARTICLES : [];
  const homeNews = homepageNews(availableArticles);
  const newestDate = formatPublicationDate(homeNews.top, lang);

  return `
  <!-- HERO -->
  <section class="hero">
    <div class="container">
      <div class="hero-grid">
        <div>
          <div class="hero-eyebrow">${(() => {
            if (newestDate) return lang === 'zh' ? `每日更新 · ${newestDate}` : `Updated daily · ${newestDate}`;
            return lang === 'zh' ? '持续更新' : 'Updated regularly';
          })()}</div>
          <h1 class="hero-title">${t('hero.title')}</h1>
          <p class="hero-deck">${t('hero.deck')}</p>
          <div class="hero-cta">
            <a href="/news" class="btn btn-primary" data-i18n="hero.cta.primary">${t('hero.cta.primary')}</a>
            <a href="/chinese-car-brands" class="btn btn-ghost" data-i18n="hero.cta.secondary">${t('hero.cta.secondary')}</a>
          </div>
          <div class="hero-meta">
            <span><strong>${lang === 'zh' ? '中国车企出海日报' : 'CHINA AUTO OVERSEAS DAILY'}</strong></span>
            <span>${lang === 'zh' ? `追踪 ${D.brands.length} 个品牌` : `${D.brands.length} BRANDS TRACKED`}</span>
            <span>${lang === 'zh' ? '中英双语' : 'EN · 中文'}</span>
          </div>
        </div>
        <div class="hero-visual">
          <picture>
            <source type="image/avif"
                    srcset="/images/hero-xiaomi-480.avif 480w, /images/hero-xiaomi-800.avif 800w"
                    sizes="(max-width: 960px) calc(100vw - 40px), min(50vw, 620px)" />
            <img src="/images/hero-xiaomi.jpg"
                 srcset="/images/hero-xiaomi-480.jpg 480w, /images/hero-xiaomi-800.jpg 800w, /images/hero-xiaomi.jpg 1400w"
                 sizes="(max-width: 960px) calc(100vw - 40px), min(50vw, 620px)"
                 alt="Xiaomi SU7 Ultra Prototype"
                 loading="eager"
                 fetchpriority="high" />
          </picture>
          <span class="img-credit">Photo: Daniel Lu / CC BY-SA 4.0</span>
        </div>
      </div>
    </div>
  </section>

  <!-- TOP STORY + LATEST -->
  ${homeNews.top ? (() => {
    const top = homeNews.top;
    const rest = homeNews.latest;
    const topTag = String(top.tag_en || 'News').replace(/"/g, '&quot;');
    return `
  <section>
    <div class="container">
      <div class="news-grid">
        <article class="news-main-article" data-news-tag="${topTag}">
          <div class="news-main-body">
            <div class="news-meta" style="color:#dc2626;">${lang === 'zh' ? '头条' : 'Top Story'} · ${top.date}</div>
            <h2 style="font-family:var(--serif);font-size:34px;font-weight:700;line-height:1.2;margin:10px 0 14px;"><a href="/news/${top.slug}" style="color:inherit;text-decoration:none;">${escapeHtmlText(top['title_' + lang] || top.title_en)}</a></h2>
            <p class="feature-desc" style="font-size:16px;">${escapeHtmlText(top['excerpt_' + lang] || top.excerpt_en || '')}</p>
            <a href="/news/${top.slug}" style="display:inline-block;margin-top:14px;color:var(--accent, #d4302a);font-family:var(--mono);font-size:12px;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;">${lang === 'zh' ? '阅读全文 →' : 'Read the story →'}</a>
          </div>
        </article>
        <div class="news-side">
          <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;">${lang === 'zh' ? '最新' : 'Latest'}</div>
          ${rest.length ? rest.map(a => `
          <article class="news-item" data-news-tag="${String(a.tag_en || 'News').replace(/"/g, '&quot;')}" style="grid-template-columns:1fr;">
            <div>
              <h3 class="news-title"><a href="/news/${a.slug}" style="color:inherit;text-decoration:none;">${escapeHtmlText(a['title_' + lang] || a.title_en)}</a></h3>
              <div class="news-date">${a.date}</div>
            </div>
          </article>`).join('') : `<p style="font-size:14px;color:#6b7280;">${lang === 'zh' ? '每个工作日更新。' : 'Updated every weekday.'}</p>`}
          <a href="/news" style="display:inline-block;margin-top:10px;color:var(--accent, #d4302a);font-family:var(--mono);font-size:12px;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;">${lang === 'zh' ? '全部日报 →' : 'All briefings →'}</a>
        </div>
      </div>
    </div>
  </section>`;
  })() : ''}

  <!-- SECTIONS -->
  <section style="padding-top:0;">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-eyebrow">${lang === 'zh' ? '栏目' : 'Sections'}</div>
          <h2 class="section-title">${lang === 'zh' ? '六个栏目' : 'Six sections'}</h2>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;">
        ${[
          ['/news', 'Briefings', '日报', 'China Market Daily and China Auto Global Daily', '中国汽车市场日报与中国汽车出海日报'],
          ['/people', 'People Intel', '人事情报', 'Appointments and organizational readings', '人事变动与组织解读'],
          ['/chinese-car-brands', 'Companies', '汽车公司', 'Chinese automakers, profiled', '中国车企档案'],
          ['/sales', 'Sales & Rankings', '销量与排行', 'Monthly sales and model rankings', '月度销量与车型排行'],
          ['/analysis', 'Analysis', '深度分析', 'Longer reads on how Chinese automakers go global', '中国车企出海的长篇解读'],
          ['/sources', 'Sources', '信源池', 'Feeds, sites and keywords we monitor', '监测的信源、网站与关键词']
        ].map(([href, en, zh2, den, dzh]) => `
        <a href="${href}" style="display:block;padding:20px 22px;border:1px solid #e5e7eb;border-radius:10px;color:inherit;text-decoration:none;background:#fff;">
          <strong style="font-family:var(--serif, Georgia, serif);font-size:19px;">${lang === 'zh' ? zh2 : en}</strong>
          <p style="margin:8px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">${lang === 'zh' ? dzh : den}</p>
        </a>`).join('')}
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section>
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-eyebrow">${t('home.features.eyebrow')}</div>
          <h2 class="section-title">${t('home.features.title')}</h2>
        </div>
        <p class="section-deck">${t('home.features.deck')}</p>
      </div>

      <div class="feature-grid">
        ${features.map((f, i) => `
          <article class="feature-card${f.large ? ' large' : ''}">
            <div class="feature-thumb${f.image ? ' has-photo' : ''}"><a href="/stories/${f.slug}">${f.image ? `<img src="/${f.image}" alt="${f['title_' + lang]}" loading="lazy" decoding="async" />${f.imageCredit ? `<span class="img-credit">Photo: ${f.imageCredit}</span>` : ''}` : carSVG(f.shape, f.accent)}</a></div>
            <div class="feature-body">
              <div class="feature-tag">${f['tag_' + lang]}</div>
              <h3 class="feature-title"><a href="/stories/${f.slug}" style="color:inherit;text-decoration:none;">${f['title_' + lang]}</a></h3>
              <p class="feature-desc">${f['desc_' + lang]}</p>
              <div class="feature-meta">${f['meta_' + lang]} · <a href="/stories/${f.slug}" style="color:var(--accent, #d4302a);text-decoration:none;">${lang === 'zh' ? '阅读 →' : 'READ →'}</a></div>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- BRAND STRIP -->
  <section class="brand-strip">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-eyebrow">${t('home.brands.eyebrow')}</div>
          <h2 class="section-title">${t('home.brands.title')}</h2>
        </div>
        <p class="section-deck">${t('home.brands.deck')}</p>
      </div>
      <div class="home-brands-cols">
        <div class="home-brands-col">
          <div class="home-brands-col-head">
            <span class="home-brands-col-label">${t('home.brands.col.groups')}</span>
            <span class="home-brands-col-count">${D.brands.filter(b=>b.category==='group').length}</span>
          </div>
          <div class="home-brands-col-list">
            ${sortBrandsForSection(D.brands.filter(b=>b.category==='group')).map(b => `
              <a href="/chinese-car-brands/${b.id}" class="brand-cell">
                <div class="brand-name">${b.name}</div>
                <div class="brand-cell-sub">${b.cn}</div>
              </a>
            `).join('')}
          </div>
        </div>
        <div class="home-brands-col">
          <div class="home-brands-col-head">
            <span class="home-brands-col-label">${t('home.brands.col.startups')}</span>
            <span class="home-brands-col-count">${D.brands.filter(b=>b.category==='startup').length}</span>
          </div>
          <div class="home-brands-col-list">
            ${D.brands.filter(b=>b.category==='startup').map(b => `
              <a href="/chinese-car-brands/${b.id}" class="brand-cell">
                <div class="brand-name">${b.name}</div>
                <div class="brand-cell-sub">${b.cn}</div>
              </a>
            `).join('')}
          </div>
        </div>
        <div class="home-brands-col home-brands-col-subs">
          <div class="home-brands-col-head">
            <span class="home-brands-col-label">${t('home.brands.col.subs')}</span>
            <span class="home-brands-col-count">${D.brands.filter(b=>b.category==='subbrand').length}</span>
          </div>
          <div class="home-brands-col-list home-brands-col-list-compact">
            ${D.brands.filter(b=>b.category==='subbrand').map(b => `
              <a href="/chinese-car-brands/${b.id}" class="brand-pill">${b.name}</a>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="home-brands-viewall">
        <a href="/chinese-car-brands" class="home-brands-viewall-link">${t('home.brands.viewall')} →</a>
      </div>
    </div>
  </section>

  <!-- MODELS -->
  <section>
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-eyebrow">${t('home.models.eyebrow')}</div>
          <h2 class="section-title">${t('home.models.title')}</h2>
        </div>
        <a href="/models" class="section-link" style="font-family:var(--mono);font-size:12px;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);">${lang === 'zh' ? '查看全部 →' : 'View all →'}</a>
      </div>
      <div class="models-grid">
        ${homeModels.map(m => modelCardHTML(m, lang)).join('')}
      </div>
    </div>
  </section>

  <!-- PULL QUOTE -->
  <section class="pullquote">
    <div class="container">
      <p class="pullquote-text">${t('pullquote.text')}</p>
      <div class="pullquote-attr">— ${t('pullquote.attr')}</div>
    </div>
  </section>

  <!-- TECH -->
  <section class="tech-section">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-eyebrow">${t('home.tech.eyebrow')}</div>
          <h2 class="section-title">${t('home.tech.title')}</h2>
        </div>
        <p class="section-deck">${t('home.tech.deck')}</p>
      </div>
      <div class="tech-grid">
        ${D.tech.map(tech => `
          <article class="tech-card">
            <div class="tech-num" aria-hidden="true">${tech.num}</div>
            <h3>${tech['title_' + lang]}</h3>
            <p>${tech['desc_' + lang]}</p>
            <div class="tech-tags">
              ${tech.tags.map(tg => `<span class="tech-tag">${tg}</span>`).join('')}
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  </section>
  `;
}

function pageBrands() {
  const lang = getLang();
  const all = SITE_DATA.brands;
  const groups = sortBrandsForSection(all.filter(b => b.category === 'group'));
  const startups = all.filter(b => b.category === 'startup');
  const subs = all.filter(b => b.category === 'subbrand');

  const sections = [
    {
      id: 'legacy',
      eyebrow_en: 'Section 01 · Legacy Groups',
      eyebrow_zh: '第一章 · 传统车企集团',
      title_en: 'Legacy Groups',
      title_zh: '传统车企集团',
      deck_en: 'State giants and decades-old private conglomerates. Multi-brand portfolios, deep manufacturing, global export footprints.',
      deck_zh: '国有巨头与老牌民营车企。多品牌矩阵、深厚制造能力、全球出口版图。',
      items: groups
    },
    {
      id: 'startups',
      eyebrow_en: 'Section 02 · New-Energy Startups',
      eyebrow_zh: '第二章 · 造车新势力',
      title_en: 'New-Energy Startups',
      title_zh: '造车新势力',
      deck_en: 'Born after 2014. Pure-play EV companies redefining design, software and ownership experience.',
      deck_zh: '2014 年后诞生。专注纯电的新一代车企，重定义设计、软件与用车体验。',
      items: startups
    },
    {
      id: 'subs',
      eyebrow_en: 'Section 03 · Group Sub-Brands',
      eyebrow_zh: '第三章 · 集团子品牌',
      title_en: 'Group Sub-Brands',
      title_zh: '集团子品牌',
      deck_en: 'Independent marques operating under legacy groups. Built to chase specific segments, often with separate teams and brand identities.',
      deck_zh: '隶属传统集团、独立运营的子品牌。面向细分市场，多有独立团队与识别体系。',
      items: subs
    }
  ];

  return `
    <section class="page-header">
      <div class="container">
        <div class="section-eyebrow">${t('nav.brands')}</div>
        <h1 class="page-title">${t('brands.page.title')}</h1>
        <p class="page-deck">${t('brands.page.deck')}</p>
      </div>
    </section>
    <nav class="brand-sticky-nav" aria-label="Brand sections">
      <div class="container brand-sticky-inner">
        <span class="brand-sticky-label">${lang === 'zh' ? '快速跳转' : 'Jump to'}</span>
        <button type="button" class="brand-sticky-link" data-target="legacy" onclick="scrollToBrandSection('legacy')">${lang === 'zh' ? '传统集团' : 'Legacy'} <span class="brand-sticky-count">${groups.length}</span></button>
        <button type="button" class="brand-sticky-link" data-target="startups" onclick="scrollToBrandSection('startups')">${lang === 'zh' ? '新势力' : 'Startups'} <span class="brand-sticky-count">${startups.length}</span></button>
        <button type="button" class="brand-sticky-link" data-target="subs" onclick="scrollToBrandSection('subs')">${lang === 'zh' ? '子品牌' : 'Sub-brands'} <span class="brand-sticky-count">${subs.length}</span></button>
      </div>
    </nav>
    <section class="brand-index-stats-wrap">
      <div class="container">
        <div class="brand-index-stats">
          <div class="brand-stat">
            <div class="brand-stat-num">${groups.length}</div>
            <div class="brand-stat-label">${lang === 'zh' ? '传统车企集团' : 'Legacy Groups'}</div>
          </div>
          <div class="brand-stat">
            <div class="brand-stat-num">${startups.length}</div>
            <div class="brand-stat-label">${lang === 'zh' ? '造车新势力' : 'New-Energy Startups'}</div>
          </div>
          <div class="brand-stat">
            <div class="brand-stat-num">${subs.length}</div>
            <div class="brand-stat-label">${lang === 'zh' ? '集团子品牌' : 'Group Sub-Brands'}</div>
          </div>
          <div class="brand-stat brand-stat-total">
            <div class="brand-stat-num">${all.length}</div>
            <div class="brand-stat-label">${lang === 'zh' ? '品牌总数' : 'Brands Total'}</div>
          </div>
        </div>
      </div>
    </section>
    ${sections.map(s => {
      // 子品牌区：按母公司分组渲染
      let bodyHTML;
      if (s.items === subs) {
        // 以出现顺序收集母公司，保证顺序可预测
        const parentOrder = [];
        const grouped = {};
        subs.forEach(b => {
          const key = b.parent_en;
          if (!grouped[key]) { grouped[key] = []; parentOrder.push(key); }
          grouped[key].push(b);
        });
        bodyHTML = parentOrder.map(p => {
          const items = grouped[p];
          const parentZh = items[0].parent_zh;
          const headingEn = p + ' Family';
          const headingZh = parentZh + ' 旗下';
          return `
            <div class="brand-subgroup">
              <div class="brand-subgroup-head">
                <span class="brand-subgroup-label">${lang === 'zh' ? '母公司' : 'Parent'}</span>
                <h3 class="brand-subgroup-title">${lang === 'zh' ? headingZh : headingEn}</h3>
                <span class="brand-subgroup-count">${items.length} ${lang === 'zh' ? '个品牌' : items.length === 1 ? 'brand' : 'brands'}</span>
              </div>
              <div class="brands-grid">
                ${items.map(b => brandCardHTML(b, lang)).join('')}
              </div>
            </div>
          `;
        }).join('');
      } else {
        bodyHTML = `<div class="brands-grid">${s.items.map(b => brandCardHTML(b, lang)).join('')}</div>`;
      }
      return `
      <section class="brand-section" id="${s.id}">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="section-eyebrow">${s['eyebrow_' + lang]}</div>
              <h2 class="section-title">${s['title_' + lang]}</h2>
            </div>
            <p class="section-deck">${s['deck_' + lang]}</p>
          </div>
          ${bodyHTML}
        </div>
      </section>
      `;
    }).join('')}
    ${faqSectionHTML('brands')}
  `;
}

function pageModels() {
  const lang = getLang();
  const seenBrands = [];
  SITE_DATA.models.forEach(m => { if (m.brand && !seenBrands.includes(m.brand)) seenBrands.push(m.brand); });
  const allLabel = lang === 'zh' ? '全部' : 'All';
  const powertrains = [
    { id: 'bev', en: 'EV', zh: '纯电' },
    { id: 'phev', en: 'PHEV', zh: '插混' },
    { id: 'erev', en: 'EREV', zh: '增程' },
    { id: 'hev', en: 'HEV', zh: '油电混动' },
    { id: 'ice', en: 'ICE', zh: '燃油' }
  ];
  const modelPowers = m => Array.isArray(m.powertrain) ? m.powertrain : [];
  const powerCount = id => SITE_DATA.models.filter(m => modelPowers(m).indexOf(id) !== -1).length;
  return `
    <section class="page-header">
      <div class="container">
        <div class="section-eyebrow">${t('nav.models')}</div>
        <h1 class="page-title">${t('models.page.title')}</h1>
        <p class="page-deck">${t('models.page.deck')}</p>
      </div>
    </section>
    <div class="models-filter-wrap" id="modelsFilter">
      <div class="container models-filter-stack">
        <div class="models-filter-inner">
          <span class="models-filter-label">${lang === 'zh' ? '品牌' : 'Brand'}</span>
          <div class="models-filter-chips" id="modelsBrandChips">
            <button type="button" class="chip is-active" data-brand="all" aria-pressed="true">${allLabel} <span class="chip-count">${SITE_DATA.models.length}</span></button>
            ${seenBrands.map(b => {
              const count = SITE_DATA.models.filter(m => m.brand === b).length;
              return `<button type="button" class="chip" data-brand="${escapeHtmlText(b)}" aria-pressed="false">${escapeHtmlText(b)} <span class="chip-count">${count}</span></button>`;
            }).join('')}
          </div>
        </div>
        <div class="models-filter-inner">
          <span class="models-filter-label">${lang === 'zh' ? '动力' : 'Powertrain'}</span>
          <div class="models-filter-chips" id="modelsPowertrainChips">
            <button type="button" class="chip is-active" data-powertrain="all" aria-pressed="true">${allLabel} <span class="chip-count">${SITE_DATA.models.length}</span></button>
            ${powertrains.map(p => `<button type="button" class="chip" data-powertrain="${p.id}" aria-pressed="false">${lang === 'zh' ? p.zh : p.en} <span class="chip-count">${powerCount(p.id)}</span></button>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <section style="padding-top:24px;">
      <div class="container">
        <div class="models-grid" id="modelsGrid">
          ${SITE_DATA.models.map(m => `<div class="models-grid-item" data-brand="${escapeHtmlText(m.brand || '')}" data-powertrain="${modelPowers(m).join(' ')}">${modelCardHTML(m, lang)}</div>`).join('')}
        </div>
        <div class="models-empty" id="modelsEmpty" hidden>${lang === 'zh' ? '没有符合当前筛选的车型。' : 'No models match these filters.'}</div>
      </div>
    </section>
    ${faqSectionHTML('models')}
  `;
}

function dailyArticlesHTML(lang) {
  if (typeof SITE_ARTICLES === 'undefined' || !SITE_ARTICLES.length) return '';
  const items = SITE_ARTICLES.slice(0, 30).map(a => `<article style="border:1px solid #e5e7eb;border-radius:10px;padding:22px 24px;background:#ffffff;display:flex;flex-direction:column;gap:10px;">
      <div style="font-family:var(--mono, monospace);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#dc2626;">${a['tag_' + lang] || a.tag_en} · ${a.date}</div>
      <h3 style="font-family:var(--serif, Georgia, serif);font-size:21px;font-weight:700;line-height:1.3;margin:0;">
        <a href="/news/${a.slug}" style="color:inherit;text-decoration:none;">${escapeHtmlText(a['title_' + lang] || a.title_en)}</a>
      </h3>
      <p style="font-size:14px;color:#6b7280;line-height:1.65;margin:0;">${escapeHtmlText(a['excerpt_' + lang] || a.excerpt_en || '')}</p>
      <a href="/news/${a.slug}" style="margin-top:auto;color:#dc2626;font-family:var(--mono, monospace);font-size:12px;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;">${lang === 'zh' ? '阅读全文 →' : 'Read dispatch →'}</a>
    </article>`).join('\n');
  return `
    <section style="padding-top:0;">
      <div class="container">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">${lang === 'zh' ? '中国车企出海日报' : 'China Auto Overseas Daily'}</div>
            <h2 class="section-title">${lang === 'zh' ? '最新出海动态' : 'Latest Dispatches'}</h2>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;">
          ${items}
        </div>
      </div>
    </section>`;
}

const MAP_WARS_SLUG_ORDER = [
  'no-new-stories-in-the-map-industry',
  'navteq-first-company-to-drive-every-street-in-america',
  'tomtom-here-forty-years-mapmaking-convergence',
  'here-wont-go-bankrupt-it-will-disappear',
  'here-tomtom-one-waits-for-a-buyer-one-waits-for-orders',
  'overture-anti-google-alliance-now-ai-infrastructure',
  'gers-a-registry-for-places-ai-agents',
  'google-maps-the-king-who-never-sold-maps'
];

function mapWarsArticles() {
  if (typeof SITE_ARTICLES === 'undefined') return [];
  const bySlug = new Map(SITE_ARTICLES
    .filter(article => article.tag_en === 'Map Wars')
    .map(article => [article.slug, article]));
  return MAP_WARS_SLUG_ORDER.map(slug => bySlug.get(slug)).filter(Boolean);
}

function mapWarsCallout(lang) {
  const count = mapWarsArticles().length;
  if (!count) return '';
  return `
    <section style="padding:0 0 48px;">
      <div class="container">
        <a href="/series/map-wars" style="display:block;padding:24px 26px;border:1px solid #e5e7eb;border-left:5px solid #d4302a;background:#fafafa;color:inherit;text-decoration:none;">
          <div class="section-eyebrow">${lang === 'zh' ? '专题 · 八部曲' : 'Series · Eight Essays'}</div>
          <h2 style="font-family:var(--serif);font-size:26px;margin:8px 0;">${lang === 'zh' ? '地图战争：数字地图产业的四十年' : 'Map Wars: Forty Years of the Digital Map Industry'}</h2>
          <p style="max-width:780px;margin:0;color:#6b7280;line-height:1.7;">${lang === 'zh' ? '从 Navteq、HERE 与 TomTom，到 Google、Overture 和 AI Agent 的地理基础设施。按顺序阅读全部八篇。' : 'From Navteq, HERE and TomTom to Google, Overture and geographic infrastructure for AI agents. Read all eight essays in order.'}</p>
        </a>
      </div>
    </section>`;
}

function pageMapWars() {
  const lang = getLang();
  const items = mapWarsArticles();
  return `
    <section class="page-header page-header--dark">
      <div class="container">
        <div class="section-eyebrow">${lang === 'zh' ? 'TopChinaCar 专题' : 'TopChinaCar Series'}</div>
        <h1 class="page-title">${lang === 'zh' ? '地图战争' : 'Map Wars'}</h1>
        <p class="page-deck">${lang === 'zh' ? '八篇连续深度文章，梳理全球数字地图产业从外业采集、车载导航、平台垄断到 AI Agent 基础设施的四十年。' : 'Eight connected essays tracing the global digital-map industry from field collection and in-car navigation to platform power and infrastructure for AI agents.'}</p>
      </div>
    </section>
    <section style="padding-top:48px;">
      <div class="container" style="max-width:980px;">
        <div style="display:grid;gap:18px;">
          ${items.map((article, index) => `
            <article style="display:grid;grid-template-columns:minmax(72px,100px) 1fr;gap:22px;padding:24px 0;border-bottom:1px solid #e5e7eb;">
              <div style="font-family:var(--mono);font-size:12px;letter-spacing:.12em;color:#d4302a;text-transform:uppercase;">${lang === 'zh' ? `第 ${index + 1} 篇` : `Essay ${index + 1}`}</div>
              <div>
                <h2 style="font-family:var(--serif);font-size:26px;line-height:1.25;margin:0 0 10px;"><a href="/news/${article.slug}" style="color:inherit;text-decoration:none;">${escapeHtmlText(article['title_' + lang] || article.title_en)}</a></h2>
                <p style="margin:0 0 12px;color:#6b7280;line-height:1.7;">${escapeHtmlText(article['excerpt_' + lang] || article.excerpt_en || '')}</p>
                <a href="/news/${article.slug}" style="color:#d4302a;font-family:var(--mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;">${lang === 'zh' ? '阅读全文 →' : 'Read essay →'}</a>
              </div>
            </article>`).join('')}
        </div>
      </div>
    </section>`;
}

function pageNews() {
  const lang = getLang();
  // Latest daily dispatch auto-fills the column card so it never goes stale.
  const latestA = (typeof SITE_ARTICLES !== 'undefined' && SITE_ARTICLES.length) ? SITE_ARTICLES[0] : null;
  const colHref = latestA ? `/news/${latestA.slug}` : '/news';
  const colDate = latestA ? latestA.date : t('news.column.date');
  const colHeadline = latestA ? escapeHtmlText(latestA['title_' + lang] || latestA.title_en) : t('news.column.headline');
  return `
    <section class="page-header">
      <div class="container">
        <div class="section-eyebrow">${t('nav.news')}</div>
        <h1 class="page-title">${t('news.page.title')}</h1>
        <p class="page-deck">${t('news.page.deck')}</p>
      </div>
    </section>
    ${mapWarsCallout(lang)}
    ${dailyArticlesHTML(lang)}
    <section class="news-column-wrap">
      <div class="container">
        <div class="news-column">
          <div class="news-column-left">
            <div class="news-column-eyebrow">${t('news.column.eyebrow')}</div>
            <h2 class="news-column-title">${t('news.column.title')}</h2>
            <p class="news-column-deck">${t('news.column.deck')}</p>
            <a href="${colHref}" class="news-column-cta">${t('news.column.cta')} →</a>
          </div>
          <div class="news-column-right">
            <div class="news-column-latest-label">${t('news.column.latest')}</div>
            <div class="news-column-date">${colDate}</div>
            <h3 class="news-column-headline"><a href="${colHref}" style="color:inherit;text-decoration:none;">${colHeadline}</a></h3>
          </div>
        </div>
      </div>
    </section>
    <section style="padding-top:0;">
      <div class="container">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">${lang === 'zh' ? '深度' : 'Features'}</div>
            <h2 class="section-title">${lang === 'zh' ? '深度与分析' : 'Features & Analysis'}</h2>
          </div>
        </div>
        <div class="feature-grid">
          ${SITE_DATA.features.map(f => `
            <article class="feature-card${f.large ? ' large' : ''}">
              <div class="feature-thumb${f.image ? ' has-photo' : ''}"><a href="/stories/${f.slug}">${f.image ? `<img src="/${f.image}" alt="${f['title_' + lang]}" loading="lazy" decoding="async" />${f.imageCredit ? `<span class="img-credit">Photo: ${f.imageCredit}</span>` : ''}` : carSVG(f.shape, f.accent)}</a></div>
              <div class="feature-body">
                <div class="feature-tag">${f['tag_' + lang]}</div>
                <h3 class="feature-title"><a href="/stories/${f.slug}" style="color:inherit;text-decoration:none;">${f['title_' + lang]}</a></h3>
                <p class="feature-desc">${f['desc_' + lang]}</p>
                <div class="feature-meta">${f['meta_' + lang]} · <a href="/stories/${f.slug}" style="color:var(--accent, #d4302a);text-decoration:none;">${lang === 'zh' ? '阅读 →' : 'READ →'}</a></div>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
    ${faqSectionHTML('news')}
  `;
}

function pageTech() {
  const lang = getLang();
  return `
    <section class="page-header page-header--dark">
      <div class="container">
        <div class="section-eyebrow">${t('nav.tech')}</div>
        <h1 class="page-title">${t('tech.page.title')}</h1>
        <p class="page-deck">${t('tech.page.deck')}</p>
      </div>
    </section>
    <section class="tech-section tech-section--continuous">
      <div class="container">
        <div class="tech-grid">
          ${SITE_DATA.tech.map(tech => `
            <article class="tech-card">
              <div class="tech-num" aria-hidden="true">${tech.num}</div>
              <h3>${tech['title_' + lang]}</h3>
              <p>${tech['desc_' + lang]}</p>
              <div class="tech-tags">
                ${tech.tags.map(tg => `<span class="tech-tag">${tg}</span>`).join('')}
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function pageAbout() {
  return `
    <section class="page-header">
      <div class="container">
        <div class="section-eyebrow">${t('nav.about')}</div>
        <h1 class="page-title">${t('about.page.title')}</h1>
        <p class="page-deck">${t('about.page.deck')}</p>
      </div>
    </section>
    <section style="padding-top:0;">
      <div class="container">
        <div class="about-content">
          <aside class="about-sidebar">
            <div>
              <h4>${t('about.sidebar.founded')}</h4>
              <p>${t('about.sidebar.founded.val')}</p>
            </div>
            <div>
              <h4>${t('about.sidebar.based')}</h4>
              <p>${t('about.sidebar.based.val')}</p>
            </div>
            <div>
              <h4>${t('about.sidebar.contact')}</h4>
              <p><a href="mailto:hello@topchinacar.com" style="color:var(--accent);">${t('about.sidebar.contact.val')}</a></p>
            </div>
          </aside>
          <div class="about-main">
            <p>${t('about.main.p1')}</p>
            <p>${t('about.main.p2')}</p>
            <p>${t('about.main.p3')}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission -->
    <section class="about-block about-block--mission">
      <div class="container about-block-inner">
        <div class="section-eyebrow">${t('about.mission.eyebrow')}</div>
        <h2 class="about-block-title">${t('about.mission.title')}</h2>
        <p class="about-block-body">${t('about.mission.body')}</p>
      </div>
    </section>

    <!-- Editorial Principles -->
    <section class="about-block about-block--principles">
      <div class="container">
        <div class="section-eyebrow">${t('about.principles.eyebrow')}</div>
        <div class="principles-grid">
          ${[1,2,3,4].map(n => `
            <article class="principle-card">
              <div class="principle-num">0${n}</div>
              <h3>${t('about.principles.'+n+'.title')}</h3>
              <p>${t('about.principles.'+n+'.body')}</p>
            </article>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Coverage -->
    <section class="about-block about-block--coverage">
      <div class="container about-block-inner">
        <div class="section-eyebrow">${t('about.coverage.eyebrow')}</div>
        <h2 class="about-block-title">${t('about.coverage.title')}</h2>
        <p class="about-block-body">${t('about.coverage.body')}</p>
      </div>
    </section>

    <!-- Contact -->
    <section class="about-block about-block--contact">
      <div class="container about-block-inner">
        <div class="section-eyebrow">${t('about.contact.eyebrow')}</div>
        <h2 class="about-block-title">${t('about.contact.title')}</h2>
        <p class="about-block-body">${t('about.contact.body')}</p>
        <a href="mailto:hello@topchinacar.com" class="btn btn-primary" style="margin-top:24px;">${t('about.contact.cta')}</a>
      </div>
    </section>
  `;
}

function pageQuote() {
  const lang = getLang();
  const field = (id, key, type, extra) => `
    <div style="margin-bottom:16px;">
      <label for="${id}" style="display:block;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">${t(key)}</label>
      ${type === 'textarea'
        ? `<textarea id="${id}" rows="4" style="width:100%;padding:12px 14px;border:1px solid #d1d5db;border-radius:6px;font-family:inherit;font-size:15px;"></textarea>`
        : `<input id="${id}" type="${type}" ${extra || ''} style="width:100%;padding:12px 14px;border:1px solid #d1d5db;border-radius:6px;font-family:inherit;font-size:15px;" />`}
    </div>`;
  return `
    <section class="page-header">
      <div class="container">
        <div class="section-eyebrow">${t('nav.quote')}</div>
        <h1 class="page-title">${t('quote.page.title')}</h1>
        <p class="page-deck">${t('quote.page.deck')}</p>
      </div>
    </section>
    <section style="padding-top:0;">
      <div class="container" style="max-width:820px;">
        <form id="quoteForm" novalidate>
          <div class="inquiry-hp" aria-hidden="true">
            <label for="qHp">Leave this field empty</label>
            <input id="qHp" name="hp_note" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 20px;">
            ${field('qName', 'quote.form.name', 'text', 'required')}
            ${field('qCompany', 'quote.form.company', 'text')}
            ${field('qEmail', 'quote.form.email', 'email', 'required')}
            ${field('qWhatsapp', 'quote.form.whatsapp', 'text')}
            ${field('qMarket', 'quote.form.market', 'text', 'required')}
            ${field('qQty', 'quote.form.qty', 'text')}
          </div>
          ${field('qModel', 'quote.form.model', 'text', 'required')}
          ${field('qMessage', 'quote.form.message', 'textarea')}
          <p style="margin:0 0 16px;font-size:13px;line-height:1.7;color:#6b7280;">${t('quote.form.privacy')}</p>
          <button type="submit" class="btn btn-primary" id="quoteSubmit">${t('quote.form.submit')}</button>
          <div id="quoteResult" hidden style="margin-top:16px;padding:14px 16px;background:#f9fafb;border-left:3px solid #16a34a;font-size:15px;"></div>
        </form>
        <div style="margin-top:48px;padding:24px;background:#f9fafb;border-left:3px solid var(--accent, #d4302a);">
          <h3 style="margin:0 0 10px;font-size:16px;">${t('quote.note.title')}</h3>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563;">${t('quote.note.body')}</p>
        </div>
      </div>
    </section>
  `;
}

function pagePrivacy() {
  const lang = getLang();
  const zh = lang === 'zh';
  const S = (en, zhTxt) => zh ? zhTxt : en;
  const sec = (h, body) => `<h2 style="font-size:20px;margin:36px 0 12px;">${h}</h2>${body}`;
  const p = t2 => `<p style="margin:0 0 14px;">${t2}</p>`;
  return `
    <section class="page-header">
      <div class="container">
        <div class="section-eyebrow">${S('Legal', '法律条款')}</div>
        <h1 class="page-title">${S('Privacy Policy', '隐私政策')}</h1>
        <p class="page-deck">${S('Effective July 5, 2026 · How we collect, use and protect your information.', '生效日期：2026 年 7 月 5 日 · 我们如何收集、使用与保护您的信息。')}</p>
      </div>
    </section>
    <section style="padding-top:0;">
      <div class="container" style="max-width:820px;font-size:15px;line-height:1.8;color:#374151;">
        ${p(S('TopChinaCar ("we") is an independent editorial publication about Chinese automobiles. This policy explains what information we collect through this website, why, and the choices you have. Contact: <a href="mailto:hello@topchinacar.com">hello@topchinacar.com</a>.',
                'TopChinaCar（下称"我们"）是一家关于中国汽车的独立编辑出版物。本政策说明我们通过本网站收集哪些信息、原因，以及您可行使的选择。联系方式：<a href="mailto:hello@topchinacar.com">hello@topchinacar.com</a>。'))}

        ${sec(S('What we collect', '我们收集的信息'),
          p(S('<strong>Contact forms</strong>: name, company (optional), email, phone or messaging contact (optional), region or market, topic, scope and your message.',
              '<strong>联系表单</strong>：姓名、公司（选填）、邮箱、电话或即时通讯联系方式（选填）、地区或市场、主题、范围及留言。'))
        + p(S('<strong>Newsletter</strong>: your email address only.',
              '<strong>邮件订阅</strong>：仅收集您的邮箱地址。'))
        + p(S('<strong>Analytics</strong>: we use Cloudflare Web Analytics, which is cookie-less and aggregates anonymous performance data (page views, country, browser). We do not run advertising trackers and we do not build visitor profiles.',
              '<strong>网站分析</strong>：我们使用 Cloudflare Web Analytics——无 Cookie、仅汇总匿名性能数据（页面访问量、国家、浏览器）。我们不投放广告追踪器，也不建立访客画像。'))
        + p(S('<strong>Local storage</strong>: your language preference (EN/中文) is stored in your browser only.',
              '<strong>本地存储</strong>：您的语言偏好（EN/中文）仅保存在您自己的浏览器中。')))}

        ${sec(S('How we use it', '信息的用途'),
          p(S('Contact-form details are used only to review and respond to your message, route it to the right editorial or commercial contact, and maintain a record of the conversation. We never sell your data.',
              '联系表单信息仅用于审核并回复您的留言、转交给合适的编辑或商业联系人，并保留沟通记录。我们绝不出售您的数据。'))
        + p(S('Newsletter addresses are used only to send the briefing you subscribed to. Every email includes an unsubscribe link.',
              '订阅邮箱仅用于发送您订阅的简报。每封邮件都附退订链接。')))}

        ${sec(S('Service providers', '服务提供商'),
          p(S('The site is hosted on Cloudflare Pages; form submissions and email are processed via Resend. Both act as processors on our behalf. Your data may be transferred to and processed in countries other than your own, protected by the standard safeguards those providers offer.',
              '本站托管于 Cloudflare Pages；表单与邮件经由 Resend 处理。两者均作为受托处理方运作。您的数据可能被传输至您所在国家/地区之外处理，并受上述服务商的标准保障条款保护。')))}

        ${sec(S('Retention', '保存期限'),
          p(S('Contact-form messages are kept for up to 24 months so we can follow up on your request, then deleted. Newsletter addresses are kept until you unsubscribe.',
              '联系表单信息最长保存 24 个月以便跟进，到期删除。订阅邮箱保存至您退订为止。')))}

        ${sec(S('Your rights', '您的权利'),
          p(S('You may request a copy of the personal data we hold about you, ask us to correct or delete it, or withdraw consent at any time by emailing <a href="mailto:hello@topchinacar.com">hello@topchinacar.com</a>. We respond within 30 days. Depending on where you live (e.g. the EU/EEA or UK under GDPR), you may also have the right to lodge a complaint with your local data protection authority.',
              '您可随时发邮件至 <a href="mailto:hello@topchinacar.com">hello@topchinacar.com</a>，索取我们持有的您的个人数据副本、要求更正或删除，或撤回同意。我们将在 30 天内回复。依据您所在地法律（如欧盟/英国 GDPR），您还有权向当地数据保护机构投诉。')))}

        ${sec(S('Cookies', 'Cookie 说明'),
          p(S('We set no advertising or profiling cookies. Cloudflare may set strictly-necessary cookies for security (e.g. bot protection). Your language choice lives in localStorage, not a cookie.',
              '我们不设置任何广告或画像类 Cookie。Cloudflare 可能出于安全需要（如机器人防护）设置必要 Cookie。语言偏好保存在 localStorage 而非 Cookie 中。')))}

        ${sec(S('Changes', '政策更新'),
          p(S('We will post any changes to this policy on this page with a new effective date.',
              '政策如有变更，将在本页发布并更新生效日期。')))}
      </div>
    </section>
  `;
}

function pageEditorialPolicy() {
  const zh = getLang() === 'zh';
  const S = (en, zhTxt) => zh ? zhTxt : en;
  const sec = (h, b) => `<h2 style="font-size:20px;margin:36px 0 12px;">${h}</h2><p style="margin:0 0 14px;">${b}</p>`;
  return `
    <section class="page-header">
      <div class="container">
        <div class="section-eyebrow">${S('Editorial', '编辑')}</div>
        <h1 class="page-title">${S('Editorial Policy', '编辑方针')}</h1>
        <p class="page-deck">${S('How TopChinaCar reports on China auto globalization.', 'TopChinaCar 如何报道中国汽车全球化。')}</p>
      </div>
    </section>
    <section style="padding-top:0;">
      <div class="container" style="max-width:820px;font-size:15px;line-height:1.8;color:#374151;">
        ${sec(S('Mission', '使命'),
          S('TopChinaCar helps international readers understand why, how and where Chinese automakers are going global. We are not a general car-news site: our beat is Chinese brands overseas, vehicle exports, EVs and smart cars, global markets, and the policy and data that shape them.',
            'TopChinaCar 帮助国际读者理解中国车企为什么、如何、在哪里全球化。我们不是泛汽车新闻站：我们的报道范围是中国品牌出海、整车出口、新能源与智能汽车、全球市场，以及塑造这一切的政策与数据。'))}
        ${sec(S('Coverage pillars', '五条内容主线'),
          S('1) Chinese automakers overseas — brand-by-brand expansion. 2) China car exports — volumes, plants, dealer networks, logistics and certification. 3) EVs and smart cars — EV, PHEV, EREV, driving software, batteries and charging. 4) Global markets — Europe, the Middle East, Africa, Latin America, Southeast Asia, Australia, Russia/CIS and Central Asia. 5) Policy and data — tariffs, restrictions, homologation, subsidies, rankings and market share.',
            '1）品牌出海——逐个品牌追踪扩张；2）中国汽车出口——出口量、海外工厂、经销网络、物流与认证；3）新能源与智能汽车——纯电、插混、增程、智驾、电池与补能；4）全球市场——欧洲、中东、非洲、拉美、东南亚、澳洲、俄罗斯/独联体与中亚；5）政策与数据——关税、限制、认证、补贴、排名与市场份额。'))}
        ${sec(S('Sourcing', '信源标准'),
          S('Every factual claim traces to a primary or reputable secondary source, linked inline and listed in the Sources block at the end of each article. We do not invent numbers. Where figures are estimates or approximations, we mark them as such.',
            '每一个事实性表述都可追溯到一手或可信的二手信源，正文内联引用并在文末 Sources 区块列出。我们不编造数字；估算或近似值会明确标注。'))}
        ${sec(S('How our articles are produced', '文章的生产方式'),
          S('Daily coverage is compiled by TopChinaCar’s editorial system with AI assistance, from the primary sources cited in every story, and follows a fixed structure: what happened, why it matters, market context, impact on Chinese automakers, and what to watch next. Feature analysis is written and edited independently of any automaker.',
            '每日报道由 TopChinaCar 的编辑系统在 AI 辅助下，基于每篇文章所引用的一手信源编写，并遵循固定结构：发生了什么、为什么重要、市场背景、对中国车企的影响、下一步看什么。深度分析独立于任何车企撰写与编辑。'))}
        ${sec(S('Independence', '独立性'),
          S('No automaker, exporter or supplier pays for coverage or reviews stories before publication. Commercial relationships, if any, are disclosed on the page they touch.',
            '任何车企、出口商或供应商都不能付费获得报道，也不能在发布前审阅稿件。如存在商业合作，会在相关页面披露。'))}
        ${sec(S('Corrections', '更正'),
          S('When we get something wrong, we correct it in place with a note. Spotted an error? Email <a href="mailto:hello@topchinacar.com">hello@topchinacar.com</a> — we respond within 48 hours.',
            '如有错误，我们会在原文位置更正并加注说明。发现问题请发邮件至 <a href="mailto:hello@topchinacar.com">hello@topchinacar.com</a>——我们会在 48 小时内回复。'))}
      </div>
    </section>
  `;
}

function pageContact() {
  const zh = getLang() === 'zh';
  const S = (en, zhTxt) => zh ? zhTxt : en;
  return `
    <section class="page-header">
      <div class="container">
        <div class="section-eyebrow">${S('Contact', '联系')}</div>
        <h1 class="page-title">${S('Contact TopChinaCar', '联系 TopChinaCar')}</h1>
        <p class="page-deck">${S('For editorial tips, corrections, media, market intelligence and partnerships, contact TopChinaCar.', '如有报道线索、勘误、媒体、市场情报与合作事宜，请联系 TopChinaCar。')}</p>
      </div>
    </section>
    <section style="padding-top:0;">
      <div class="container" style="max-width:820px;font-size:15px;line-height:1.9;color:#374151;">
        <p><strong>${S('Editorial & general', '编辑与一般事务')}</strong> — ${S('tips, corrections, story ideas, media requests:', '线索、更正、选题、媒体请求：')} <a href="mailto:hello@topchinacar.com">hello@topchinacar.com</a></p>
        <p><strong>${S('Market intelligence & partnerships', '市场情报与合作')}</strong> — ${S('research, data, sponsorship and partnership conversations:', '研究、数据、赞助与合作洽谈：')} <a href="mailto:hello@topchinacar.com">hello@topchinacar.com</a></p>
        <p><strong>${S('Structured commercial requests', '结构化商务请求')}</strong> — ${S('for detailed commercial or partnership briefs, you can also use the', '需要提交详细商务或合作需求，也可使用')} <a href="/quote" style="color:var(--accent, #d4302a);">${S('commercial contact form', '商务联系表单')}</a>${S('.', '。')}</p>
        <p style="font-size:13px;color:#9ca3af;margin-top:28px;">${S('We read everything. Please allow up to 48 hours for a reply.', '所有来信我们都会阅读，请预留最多 48 小时的回复时间。')}</p>
      </div>
    </section>
  `;
}

function pageNewsletterLanding() {
  const zh = getLang() === 'zh';
  const S = (en, zhTxt) => zh ? zhTxt : en;
  const issueItems = [
    [S('Overseas Expansion', '车企出海'), S('Factories, export volume, dealer networks and market entry moves.', '海外工厂、出口量、经销网络与市场进入动作。')],
    [S('Europe Policy', '欧洲政策'), S('Tariffs, incentives, homologation, cybersecurity and compliance signals.', '关税、补贴、认证、网络安全与合规信号。')],
    [S('Smart Mobility', '智能汽车'), S('ADAS, connected services, cockpit software, maps and data partnerships.', 'ADAS、车联网、智能座舱、地图与数据合作。')],
    [S('Market Watch', '市场观察'), S('One concise read on what changed, why it matters and what to watch next.', '一封邮件讲清发生了什么、为什么重要、下一步看什么。')]
  ];
  const audienceItems = [
    S('Automotive executives tracking Chinese OEMs overseas', '关注中国车企出海的汽车行业管理者'),
    S('Dealers, importers and mobility operators evaluating Chinese EV brands', '评估中国新能源品牌的经销商、进口商与出行运营商'),
    S('Analysts, investors and policy teams watching Europe-China auto flows', '跟踪中欧汽车产业流动的分析师、投资人与政策团队'),
    S('Product, ADAS, mapping and connected-service teams working on smart mobility', '从事智能驾驶、地图、车联网与智能出行业务的产品团队')
  ];
  return `
    <section class="newsletter-hero">
      <div class="container">
        <div class="newsletter-hero-grid">
          <div>
            <div class="section-eyebrow">${S('Newsletter', '邮件简报')}</div>
            <h1 class="page-title">${S('China Auto Overseas Daily', '中国车企出海日报')}</h1>
            <p class="page-deck">${S('Daily intelligence on Chinese automakers overseas, EV exports, smart mobility, policy risk and market-entry signals.', '每天提供中国车企出海、新能源出口、智能汽车、政策风险与市场进入信号。')}</p>
            <div class="newsletter-hero-meta">
              <span>${S('Every morning', '每天早晨')}</span>
              <span>${S('5-minute read', '5 分钟读完')}</span>
              <span>${S('Bilingual coverage', '中英文内容')}</span>
            </div>
          </div>
          <aside class="newsletter-signup-card">
            <div class="newsletter-card-label">Resend</div>
            <h2>${S('Subscribe by email', '邮箱订阅日报')}</h2>
            <p>${S('No generic updates. One focused daily brief on the China auto globalization signals global operators need to understand.', '不是泛泛更新，而是一封聚焦全球从业者需要理解的中国汽车全球化信号日报。')}</p>
            <form class="newsletter-form" id="newsletterForm">
              <label class="sr-only" for="newsletterEmail">${S('Email address', '邮箱地址')}</label>
              <input class="newsletter-input" id="newsletterEmail" type="email" name="email" placeholder="${S('your@email.com', '你的邮箱')}" required />
              <button class="newsletter-btn" type="submit">${S('Subscribe', '订阅日报')}</button>
            </form>
            <div class="newsletter-ok" id="newsletterOk" hidden>${S('Thanks — you are on the list for the next China Auto Overseas Daily.', '谢谢——你已加入中国车企出海日报订阅名单。')}</div>
            <p class="newsletter-privacy">${S('Subscription is stored in Resend Contacts and every daily email includes an unsubscribe link.', '订阅邮箱将存入 Resend 联系人列表；每封日报都会包含退订链接。')}</p>
          </aside>
        </div>
      </div>
    </section>
    <section style="padding-top:0;">
      <div class="container">
        <div class="newsletter-product-grid">
          ${issueItems.map(([title, body]) => `
            <article class="newsletter-product-card">
              <h2>${title}</h2>
              <p>${body}</p>
            </article>
          `).join('')}
        </div>

        <div class="newsletter-issue-layout">
          <section class="newsletter-issue-block">
            <div class="section-eyebrow">${S('What you get', '你会收到什么')}</div>
            <h2>${S('A focused daily read, not an inbox dump.', '一封有主题的日报，不是信息堆砌。')}</h2>
            <ul>
              <li>${S('The day’s most important China auto globalization signals', '当天最重要的中国汽车全球化信号')}</li>
              <li>${S('One market or policy shift explained in plain language when it matters', '重要市场或政策变化会用清晰语言解释')}</li>
              <li>${S('Company moves from BYD, Geely, Chery, SAIC, Changan, GWM, NIO, Xpeng, Li Auto and others', '覆盖比亚迪、吉利、奇瑞、上汽、长安、长城、蔚来、小鹏、理想等公司的关键动作')}</li>
              <li>${S('Source links for numbers, policies and company announcements', '涉及数据、政策与企业公告时附信源链接')}</li>
            </ul>
          </section>
          <section class="newsletter-issue-block">
            <div class="section-eyebrow">${S('Who it is for', '适合谁订阅')}</div>
            <h2>${S('Built for people who need signal, not noise.', '为需要信号而不是噪音的人准备。')}</h2>
            <ul>
              ${audienceItems.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </section>
        </div>

        <div class="newsletter-sample">
          <div class="section-eyebrow">${S('Sample issue structure', '样例结构')}</div>
          <h2>${S('China Auto Overseas Daily', '中国车企出海日报')}</h2>
          <ol>
            <li>${S('Core signal of the day', '当天核心信号')}</li>
            <li>${S('Market movement: Europe, Southeast Asia, Middle East or Latin America', '市场变化：欧洲、东南亚、中东或拉美')}</li>
            <li>${S('Company moves: launches, plants, exports, partnerships', '企业动作：上市、建厂、出口、合作')}</li>
            <li>${S('Smart mobility: ADAS, cockpit, maps, connected services', '智能汽车：ADAS、座舱、地图、车联网')}</li>
            <li>${S('What to watch next', '下一步看什么')}</li>
          </ol>
          <p>${S('The same daily dispatch is published on', '同一份日报也会发布在')} <a href="/news">${S('/news', '/news')}</a>${S('; Resend is the delivery mechanism for readers who want it sent directly to their inbox.', '；Resend 是把这份日报直接送到读者邮箱的触达机制。')}</p>
        </div>
      </div>
    </section>
  `;
}

function pageIntelligence() {
  const zh = getLang() === 'zh';
  const S = (en, zhTxt) => zh ? zhTxt : en;
  const liveUrl = LIVE_INTELLIGENCE_PATH;
  return `
    <section class="system-intel-hero">
      <div class="container">
        <div class="system-intel-hero-grid">
          <div>
            <div class="section-eyebrow">${S('China Auto Intelligence', '中国汽车全球化情报')}</div>
            <h1 class="system-intel-title">${S('Understand China auto globalization as it happens.', '看懂中国汽车全球化正在发生什么。')}</h1>
            <p class="system-intel-deck">${S('TopChinaCar tracks Chinese automakers, overseas markets, factories, exports, pricing and policy risk, then turns fragmented news into structured market signals.', 'TopChinaCar 追踪中国车企、海外市场、工厂、出口、价格与政策风险，把分散新闻转化为可判断的结构化市场信号。')}</p>
            <div class="system-intel-actions">
              <a class="btn btn-primary" href="${liveUrl}">${S('Read Latest Coverage', '阅读最新报道')}</a>
              <a class="btn btn-ghost" href="/data">${S('Explore Data Layer', '浏览数据层')}</a>
            </div>
          </div>
          <aside class="system-intel-status" aria-label="${S('Intelligence coverage', '情报覆盖')}">
            <div class="system-status-row">
              <span>${S('OEM Expansion', '车企出海')}</span>
              <strong>${S('Brands, plants, channels', '品牌、工厂、渠道')}</strong>
            </div>
            <div class="system-status-row">
              <span>${S('Market Movement', '市场动向')}</span>
              <strong>${S('Exports, sales, pricing', '出口、销量、价格')}</strong>
            </div>
            <div class="system-status-row">
              <span>${S('Risk Signals', '风险信号')}</span>
              <strong>${S('Tariffs, policy, regulation', '关税、政策、监管')}</strong>
            </div>
            <div class="system-status-row">
              <span>${S('Update Flow', '更新方式')}</span>
              <strong>${S('News, filings, data sources', '新闻、公告、数据源')}</strong>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="system-intel-main">
      <div class="container">
        <div class="system-intel-grid">
          <section class="system-intel-card system-intel-card--primary">
            <div class="system-intel-kicker">${S('WHAT YOU CAN READ', '你能读到什么')}</div>
            <h2>${S('Market signals, not just headlines.', '不是新闻标题，而是市场信号。')}</h2>
            <p>${S('The intelligence layer helps readers see which Chinese automakers are expanding, which markets are changing, and where policy or pricing pressure is affecting strategy.', '情报层帮助读者判断：哪些中国车企正在扩张，哪些海外市场正在变化，政策或价格压力正在怎样影响企业策略。')}</p>
            <div class="system-intel-flow">
              <div><span>01</span><strong>${S('Overseas Expansion', '海外扩张')}</strong><p>${S('Factories, localization, distributors and new market entries.', '工厂、本地化、经销网络与新市场进入。')}</p></div>
              <div><span>02</span><strong>${S('Market Momentum', '市场动能')}</strong><p>${S('Export shifts, sales updates, pricing moves and demand changes.', '出口变化、销量更新、价格调整与需求变化。')}</p></div>
              <div><span>03</span><strong>${S('Policy Pressure', '政策压力')}</strong><p>${S('Tariffs, regulation, subsidies and trade restrictions.', '关税、监管、补贴与贸易限制。')}</p></div>
              <div><span>04</span><strong>${S('Company Strategy', '企业策略')}</strong><p>${S('Launches, partnerships, investment and technology direction.', '新车、合作、投资与技术方向。')}</p></div>
            </div>
            <div class="system-runtime">${S('Latest editorial coverage:', '最新编辑报道：')} <a href="${liveUrl}">${S('TopChinaCar News', 'TopChinaCar 新闻')}</a></div>
          </section>

          <aside class="system-intel-panel">
            <div class="system-intel-kicker">${S('WATCHLIST', '重点追踪')}</div>
            <h2>${S('The system focuses on decisions that move markets.', '系统关注会改变市场判断的事件。')}</h2>
            <ul class="system-intel-list">
              <li><span>${S('Chinese OEM globalization', '中国车企全球化')}</span><strong>${S('Core', '核心')}</strong></li>
              <li><span>${S('Europe tariffs and localization', '欧洲关税与本地化')}</span><strong>${S('Risk', '风险')}</strong></li>
              <li><span>${S('Southeast Asia factory shifts', '东南亚工厂布局')}</span><strong>${S('Growth', '增长')}</strong></li>
              <li><span>${S('Exports, pricing and sales', '出口、价格与销量')}</span><strong>${S('Trend', '趋势')}</strong></li>
              <li><span>${S('Models, technology and channels', '车型、技术与渠道')}</span><strong>${S('Context', '背景')}</strong></li>
            </ul>
          </aside>
        </div>

        <section class="system-intel-section">
          <div class="system-intel-section-head">
            <div class="system-intel-kicker">${S('START HERE', '从这里开始')}</div>
            <h2>${S('Choose the view that matches your question.', '根据你的问题进入对应视图。')}</h2>
          </div>
          <div class="system-intel-entry-grid">
            <a class="system-intel-entry" href="${liveUrl}">
              <span>${S('Today', '今天')}</span>
              <h3>${S('What changed now?', '现在发生了什么？')}</h3>
              <p>${S('Read the latest reporting and analysis, with sources and market context.', '阅读附有信源与市场背景的最新报道和分析。')}</p>
            </a>
            <a class="system-intel-entry" href="/data">
              <span>${S('Reference', '查询')}</span>
              <h3>${S('Which companies and markets matter?', '哪些公司和市场值得看？')}</h3>
              <p>${S('Use the data layer for company, market, model and macro context.', '使用数据层查看公司、市场、车型与宏观背景。')}</p>
            </a>
            <a class="system-intel-entry" href="/news">
              <span>${S('Reading', '阅读')}</span>
              <h3>${S('Why does it matter?', '为什么重要？')}</h3>
              <p>${S('Read editorial reporting and explainers connected to the intelligence system.', '阅读与情报系统相连接的新闻报道和解释性内容。')}</p>
            </a>
          </div>
        </section>

        <section class="system-intel-section">
          <div class="system-intel-section-head">
            <div class="system-intel-kicker">${S('METHODOLOGY', '方法论')}</div>
            <h2>${S('How the system keeps intelligence traceable.', '系统如何保持情报可追溯。')}</h2>
          </div>
          <div class="system-intel-pipeline">
            <div><span>${S('Sources', '来源')}</span><strong>${S('News, filings and data', '新闻、公告与数据')}</strong><p>${S('Incoming items come from media, official releases, policy sources and structured datasets.', '输入信息来自媒体、官方公告、政策来源与结构化数据集。')}</p></div>
            <div><span>${S('Signals', '信号')}</span><strong>${S('Normalized evidence', '规范化证据')}</strong><p>${S('Items are classified by company, market, event type and source strength.', '信息按公司、市场、事件类型与信源强度进行分类。')}</p></div>
            <div><span>${S('Events', '事件')}</span><strong>${S('Traceable facts', '可追溯事实')}</strong><p>${S('Important claims retain source references and publication context.', '重要判断保留来源引用与发布时间背景。')}</p></div>
            <div><span>${S('Insights', '洞察')}</span><strong>${S('Editorial analysis', '编辑分析')}</strong><p>${S('Reporting explains why a development matters without presenting an automated score as fact.', '报道解释事件为何重要，不把自动评分包装成既定事实。')}</p></div>
          </div>
        </section>
      </div>
    </section>
  `;
}

// Route table (shared by client router and build.js)
const PAGE_ROUTES = {
  '/':       pageHome,
  '/chinese-car-brands': pageBrands,
  '/models': pageModels,
  '/news':   pageNews,
  '/series/map-wars': pageMapWars,
  '/tech':   pageTech,
  '/about':  pageAbout,
  '/quote':  pageQuote,
  '/privacy': pagePrivacy,
  '/editorial-policy': pageEditorialPolicy,
  '/contact': pageContact,
  '/newsletter': pageNewsletterLanding,
  '/intelligence': pageIntelligence
};

// Node (build.js) support — no effect in the browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PAGE_ROUTES };
}
