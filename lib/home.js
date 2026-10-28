// 首页正文（/ 与 /zh/ 共用一份 HTML，中文页由 build.js 的 zhChrome 翻转 data-lang）。
const fs = require('fs');
const path = require('path');
const { dailyKind } = require('./editions');

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BASIS_LABEL = {
  company_report: ['Company report', '公司公告']
};

const POOL_STATS = [
  ['sources', 'Sources', '信源'],
  ['active', 'Active', '在监测'],
  ['domains', 'Rated websites', '评级网站'],
  ['keywords', 'Keywords', '关键词']
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&(?!(?:#\d+|#x[0-9a-fA-F]+|amp|lt|gt|quot|apos);)/gi, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bi(en, zh) {
  const enText = escapeHtml(en);
  const zhText = escapeHtml(zh || en);
  return `<span data-lang="en">${enText}</span><span data-lang="zh" hidden>${zhText}</span>`;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function readJson(file) {
  if (!fs.existsSync(file)) return { missing: true, data: null };
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { missing: false, data: null };
    return { missing: false, data };
  } catch (error) {
    return { missing: false, data: null };
  }
}

function httpsUrl(value) {
  const url = String(value || '').trim();
  return /^https:\/\//i.test(url) ? url : '';
}

function salesNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatNumber(value) {
  const number = salesNumber(value);
  if (number === null) return null;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(number);
}

function numberCell(value) {
  const text = formatNumber(value);
  return text === null ? '—' : escapeHtml(text);
}

function periodOk(value) {
  return /^\d{4}-\d{2}$/.test(String(value || ''));
}

function latestPeriod(rows) {
  const periods = asArray(rows).map(row => row && row.period).filter(periodOk).sort();
  return periods.length ? periods[periods.length - 1] : '';
}

function periodLabel(period) {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return { en: String(period || ''), zh: String(period || '') };
  const month = Number(match[2]);
  return {
    en: `${MONTHS_EN[month - 1] || match[2]} ${match[1]}`,
    zh: `${match[1]}年${month}月`
  };
}

function articleHref(article) {
  return `/news/${encodeURI(String(article.slug || ''))}`;
}

function brandHref(brand) {
  return `/chinese-car-brands/${encodeURIComponent(String(brand.id || ''))}`;
}

function latestOf(articles, kind) {
  return asArray(articles).find(article => dailyKind(article) === kind) || null;
}

function scriptTag(root, buildVersion) {
  if (!fs.existsSync(path.join(root, 'js', 'intel.js'))) return '';
  const version = String(buildVersion || '').trim();
  const query = /^[A-Za-z0-9._-]+$/.test(version) ? `?v=${version}` : '';
  return `<script src="/js/intel.js${query}"></script>`;
}

function sectionHead(id, eyebrowEn, eyebrowZh, titleEn, titleZh, linkHref, linkEn, linkZh) {
  const link = linkHref
    ? `<a class="home-section-link" href="${linkHref}">${bi(linkEn, linkZh)} →</a>`
    : '';
  return `<div class="section-head">
      <div>
        <div class="section-eyebrow">${bi(eyebrowEn, eyebrowZh)}</div>
        <h2 class="section-title" id="${id}">${bi(titleEn, titleZh)}</h2>
      </div>
      ${link}
    </div>`;
}

function dailyCard(article) {
  const href = articleHref(article);
  const titleEn = article.title_en || '';
  const titleZh = article.title_zh || article.title_en || '';
  const excerptEn = article.excerpt_en || '';
  const excerptZh = article.excerpt_zh || article.excerpt_en || '';
  const date = escapeHtml(article.date || '');
  const excerpt = (excerptEn || excerptZh)
    ? `<p class="briefing-excerpt">${bi(excerptEn, excerptZh)}</p>`
    : '';
  return `<p class="briefing-kicker">${bi('Latest issue', '最新一篇')}</p>
      <p class="briefing-date">${date}</p>
      <h4 class="home-daily-title"><a href="${href}">${bi(titleEn, titleZh)}</a></h4>
      ${excerpt}
      <a class="briefing-read" href="${href}">${bi('Read', '阅读')} →</a>`;
}

function dailyPanel(titleEn, titleZh, article, emptyEn, emptyZh) {
  const body = article
    ? dailyCard(article)
    : `<p class="briefing-empty">${bi(emptyEn, emptyZh)}</p>`;
  return `<article class="briefing-panel home-daily-panel">
      <h3>${bi(titleEn, titleZh)}</h3>
      ${body}
    </article>`;
}

function briefingsSection(articles) {
  const china = latestOf(articles, 'china');
  const globalDaily = latestOf(articles, 'global');
  return `<section class="home-block" aria-labelledby="home-briefings-title">
  <div class="container">
    ${sectionHead('home-briefings-title', 'Briefings', '日报', "Today's briefings", '今日日报', '/news', 'All briefings', '全部日报')}
    <div class="briefing-grid">
      ${dailyPanel(
        'China Market Daily',
        '中国汽车市场日报',
        china,
        'The first issue is coming soon.',
        '首期即将发布'
      )}
      ${dailyPanel(
        'China Auto Global Daily',
        '中国汽车出海日报',
        globalDaily,
        'No issues yet.',
        '还没有这一期。'
      )}
    </div>
  </div>
</section>`;
}

function peopleSection(root, buildVersion) {
  return `<section class="home-block" aria-labelledby="home-people-title">
  <div class="container">
    ${sectionHead('home-people-title', 'People Intel', '人事情报', 'People moves', '人事变动', '/people', 'People Intel', '人事情报')}
    <p class="home-deck">${bi(
      'Appointments, departures and role changes at Chinese automakers. The latest five load in the browser and are not stored in the page.',
      '中国车企的任命、离任和调岗。最新 5 条由浏览器读取，不写进页面文件。'
    )}</p>
    <div class="home-intel-slot">
      <div data-intel-latest="5"></div>
    </div>
    <noscript>
      <p class="home-note">${bi(
        'JavaScript is off, so this list stays empty.',
        '浏览器没有运行脚本，所以这里是空的。'
      )}</p>
    </noscript>
    ${scriptTag(root, buildVersion)}
  </div>
</section>`;
}

function basisText(code) {
  const key = String(code || '').trim();
  if (!key) return '';
  const known = BASIS_LABEL[key];
  if (known) return bi(known[0], known[1]);
  return escapeHtml(key);
}

function sourceLinks(rows) {
  const seen = new Set();
  const parts = [];
  for (const row of asArray(rows)) {
    const name = String(row && row.source_name || '').trim();
    const url = httpsUrl(row && row.source_url);
    const key = `${name}|${url}`;
    if ((!name && !url) || seen.has(key)) continue;
    seen.add(key);
    parts.push(url
      ? `<a href="${escapeHtml(url)}">${escapeHtml(name || url)}</a>`
      : escapeHtml(name));
  }
  return parts.join(', ');
}

function footnote(rows, extraParts) {
  const parts = [];
  const sources = sourceLinks(rows);
  if (sources) parts.push(`${bi('Source:', '来源：')} ${sources}`);
  const bases = [];
  const seenBasis = new Set();
  for (const row of asArray(rows)) {
    const key = String(row && row.basis || '').trim();
    if (!key || seenBasis.has(key)) continue;
    seenBasis.add(key);
    bases.push(basisText(key));
  }
  if (bases.length) parts.push(`${bi('Basis:', '口径：')} ${bases.join(', ')}`);
  if (asArray(rows).some(row => row && row.preliminary === true)) {
    parts.push(bi('Includes preliminary figures.', '含初步数据。'));
  }
  for (const extra of extraParts || []) {
    if (extra) parts.push(extra);
  }
  if (!parts.length) return '';
  return `<p class="home-note">${parts.join(' ')}</p>`;
}

function companyName(companies, companyId) {
  const id = String(companyId || '');
  const found = asArray(companies).find(company => company && String(company.id) === id);
  if (!found) return { en: id, zh: id };
  const en = String(found.en || id);
  const zh = String(found.zh || found.en || id);
  return { en, zh };
}

function topCompanies(monthly) {
  const period = latestPeriod(monthly);
  if (!period) return { period: '', rows: [] };
  const best = new Map();
  for (const row of asArray(monthly)) {
    if (!row || row.period !== period) continue;
    const id = String(row.company_id || '').trim();
    if (!id || salesNumber(row.month_total) === null) continue;
    const prev = best.get(id);
    if (!prev || salesNumber(row.month_total) > salesNumber(prev.month_total)) best.set(id, row);
  }
  const rows = [...best.values()].sort((a, b) => {
    const delta = salesNumber(b.month_total) - salesNumber(a.month_total);
    if (delta) return delta;
    return String(a.company_id).localeCompare(String(b.company_id));
  }).slice(0, 10);
  return { period, rows };
}

function latestRanking(rankings) {
  const list = asArray(rankings).filter(item => item && periodOk(item.period) && Array.isArray(item.rows));
  if (!list.length) return null;
  const period = latestPeriod(list);
  const same = list.filter(item => item.period === period);
  return same.find(item => item.list === 'model_retail') || same[0];
}

function topModels(ranking) {
  if (!ranking) return [];
  return asArray(ranking.rows)
    .filter(row => row && (String(row.model_en || '').trim() || String(row.model_zh || '').trim()))
    .slice()
    .sort((a, b) => {
      const ar = salesNumber(a.rank);
      const br = salesNumber(b.rank);
      if (ar === null && br === null) return 0;
      if (ar === null) return 1;
      if (br === null) return -1;
      return ar - br;
    })
    .slice(0, 10);
}

function companyTable(companies, picked) {
  const when = periodLabel(picked.period);
  const showOverseas = picked.rows.some(row => salesNumber(row.month_overseas) !== null);
  const headOverseas = showOverseas ? `<th scope="col">${bi('Overseas', '出海')}</th>` : '';
  const body = picked.rows.map((row, index) => {
    const name = companyName(companies, row.company_id);
    const overseas = showOverseas ? `<td class="home-num">${numberCell(row.month_overseas)}</td>` : '';
    return `<tr>
      <td class="home-num">${index + 1}</td>
      <td>${bi(name.en, name.zh)}</td>
      <td class="home-num">${numberCell(row.month_total)}</td>
      ${overseas}
    </tr>`;
  }).join('');
  return `<div class="home-sales-block">
    <h3>${bi(`Company sales · ${when.en}`, `公司销量 · ${when.zh}`)}</h3>
    <div class="home-table-wrap">
      <table class="home-table">
        <thead><tr>
          <th scope="col">#</th>
          <th scope="col">${bi('Company', '公司')}</th>
          <th scope="col">${bi('Month', '当月')}</th>
          ${headOverseas}
        </tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
    ${footnote(picked.rows)}
  </div>`;
}

function modelTable(ranking, rows) {
  const when = periodLabel(ranking.period);
  const titleEn = ranking.basis_en || 'Model ranking';
  const titleZh = ranking.basis_zh || '车型榜';
  const body = rows.map(row => {
    const rank = salesNumber(row.rank);
    const modelEn = String(row.model_en || row.model_zh || '');
    const modelZh = String(row.model_zh || row.model_en || '');
    const makerEn = String(row.maker_en || '');
    const makerZh = String(row.maker_zh || row.maker_en || '');
    const maker = (makerEn || makerZh) ? bi(makerEn, makerZh) : '—';
    return `<tr>
      <td class="home-num">${rank === null ? '—' : escapeHtml(String(rank))}</td>
      <td>${bi(modelEn, modelZh)}</td>
      <td>${maker}</td>
      <td class="home-num">${numberCell(row.units)}</td>
    </tr>`;
  }).join('');
  const sourceRows = rows.map(row => ({
    source_name: ranking.source_name,
    source_url: ranking.source_url
  }));
  return `<div class="home-sales-block">
    <h3>${bi(`${titleEn} · ${when.en}`, `${titleZh} · ${when.zh}`)}</h3>
    <div class="home-table-wrap">
      <table class="home-table">
        <thead><tr>
          <th scope="col">#</th>
          <th scope="col">${bi('Model', '车型')}</th>
          <th scope="col">${bi('Maker', '车企')}</th>
          <th scope="col">${bi('Units', '销量')}</th>
        </tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
    ${footnote(sourceRows)}
  </div>`;
}

function salesSection(root) {
  const loaded = readJson(path.join(root, 'data', 'sales.json'));
  let body;
  if (loaded.missing) {
    body = `<p class="home-deck">${bi(
      'The first batch of figures is still being compiled.',
      '首批数据整理中'
    )}</p>`;
  } else if (!loaded.data) {
    body = `<p class="home-deck">${bi('No figures yet.', '暂无数据')}</p>`;
  } else {
    const companies = topCompanies(loaded.data.monthly);
    const ranking = latestRanking(loaded.data.rankings);
    const models = topModels(ranking);
    const blocks = [];
    if (companies.rows.length) blocks.push(companyTable(loaded.data.companies, companies));
    if (models.length) blocks.push(modelTable(ranking, models));
    if (!blocks.length) {
      body = `<p class="home-deck">${bi('No figures yet.', '暂无数据')}</p>`;
    } else {
      const notes = [];
      if (!companies.rows.length) notes.push(`<p class="home-note">${bi('No company sales for the latest month.', '最新月份还没有公司销量。')}</p>`);
      if (!models.length) notes.push(`<p class="home-note">${bi('No model ranking yet.', '车型榜暂无数据。')}</p>`);
      body = `${notes.join('')}<div class="home-sales-grid">${blocks.join('')}</div>`;
    }
  }
  return `<section class="home-block" aria-labelledby="home-sales-title">
  <div class="container">
    ${sectionHead('home-sales-title', 'Sales & Rankings', '销量与排行', 'Sales and rankings', '销量与排行', '/sales', 'Sales & Rankings', '销量与排行')}
    ${body}
  </div>
</section>`;
}

function companyCard(brand, kickerEn, kickerZh, children) {
  const nameEn = String(brand.name || brand.id || '');
  const nameZh = String(brand.cn || brand.name || brand.id || '');
  const descEn = String(brand.desc_en || '');
  const descZh = String(brand.desc_zh || brand.desc_en || '');
  const blurb = (descEn || descZh) ? `<p class="home-company-blurb">${bi(descEn, descZh)}</p>` : '';
  const pills = asArray(children).filter(child => child && child.id).map(child => {
    const childEn = String(child.name || child.id);
    const childZh = String(child.cn || child.name || child.id);
    return `<a class="home-pill" href="${brandHref(child)}">${bi(childEn, childZh)}</a>`;
  }).join('');
  const pillRow = pills ? `<div class="home-company-pills">${pills}</div>` : '';
  return `<article class="home-company-card">
      <p class="home-kicker">${bi(kickerEn, kickerZh)}</p>
      <h3><a href="${brandHref(brand)}">${bi(nameEn, nameZh)}</a></h3>
      ${blurb}
      ${pillRow}
    </article>`;
}

function childrenOf(group, brands) {
  return brands.filter(brand =>
    brand
    && brand.category === 'subbrand'
    && brand.id
    && (brand.parent_en === group.name || (group.cn && brand.parent_zh === group.cn))
  );
}

function companiesSection(brands) {
  const list = asArray(brands).filter(brand => brand && brand.id);
  const groups = list.filter(brand => brand.category === 'group');
  const startups = list.filter(brand => brand.category === 'startup');
  const groupCards = groups.map(group => companyCard(group, 'Group', '集团', childrenOf(group, list))).join('');
  const startupCards = startups.map(brand => companyCard(brand, 'Startup', '新势力')).join('');
  const startupBlock = startupCards
    ? `<h3 class="home-subhead">${bi('New-energy startups', '造车新势力')}</h3>
      <div class="home-company-grid">${startupCards}</div>`
    : '';
  const empty = (!groupCards && !startupCards)
    ? `<p class="home-deck">${bi('No companies to show yet.', '暂无公司卡片。')}</p>`
    : '';
  return `<section class="home-block" aria-labelledby="home-companies-title">
  <div class="container">
    ${sectionHead('home-companies-title', 'Companies', '汽车公司', 'Automakers', '汽车公司', '/chinese-car-brands', 'All companies', '全部公司')}
    <p class="home-deck">${bi(
      'Key automakers by group. Sub-brands sit on the group card. The full list is on Companies.',
      '按集团看重点车企，子品牌写在集团卡片上。完整名单在汽车公司。'
    )}</p>
    ${empty}
    <div class="home-company-grid">${groupCards}</div>
    ${startupBlock}
  </div>
</section>`;
}

function analysisSection(articles) {
  const items = asArray(articles).filter(article => article && article.slug && dailyKind(article) === 'other').slice(0, 3);
  const body = items.length
    ? `<div class="home-analysis-list">${items.map(article => {
      const tagEn = String(article.tag_en || '').trim();
      const tagZh = String(article.tag_zh || article.tag_en || '').trim();
      const tag = tagEn ? `<span class="briefing-tag">${bi(tagEn, tagZh)}</span>` : '';
      const excerptEn = article.excerpt_en || '';
      const excerptZh = article.excerpt_zh || article.excerpt_en || '';
      const excerpt = (excerptEn || excerptZh) ? `<p class="briefing-excerpt">${bi(excerptEn, excerptZh)}</p>` : '';
      return `<article class="home-analysis-item">
        <p class="briefing-meta">${tag}<span class="briefing-date">${escapeHtml(article.date || '')}</span></p>
        <h3><a href="${articleHref(article)}">${bi(article.title_en || '', article.title_zh || article.title_en || '')}</a></h3>
        ${excerpt}
      </article>`;
    }).join('')}</div>`
    : `<p class="home-deck">${bi('No pieces yet.', '暂无数据')}</p>`;
  return `<section class="home-block" aria-labelledby="home-analysis-title">
  <div class="container">
    ${sectionHead('home-analysis-title', 'Analysis', '深度分析', 'Latest analysis', '最新深度分析', '/analysis', 'Analysis', '深度分析')}
    ${body}
  </div>
</section>`;
}

function poolSection(root) {
  const loaded = readJson(path.join(root, 'data', 'source-pool.json'));
  const totals = loaded.data && loaded.data.totals;
  const totalsOk = totals && typeof totals === 'object' && !Array.isArray(totals);
  const windowDays = loaded.data && Number.isFinite(Number(loaded.data.window_days)) && Number(loaded.data.window_days) > 0
    ? Number(loaded.data.window_days)
    : 7;
  const specs = POOL_STATS.concat([['new_items_7d', `New in ${windowDays} days`, `近 ${windowDays} 天新内容`]]);
  const stats = totalsOk
    ? specs.filter(([key]) => Number.isFinite(Number(totals[key]))).map(([key, en, zh]) => {
      return `<div class="source-pool-stat"><strong>${escapeHtml(formatNumber(totals[key]))}</strong><span>${bi(en, zh)}</span></div>`;
    }).join('')
    : '';
  const body = stats
    ? `<div class="source-pool-stats home-pool-stats">${stats}</div>`
    : `<p class="home-deck">${bi('No source-pool figures yet.', '暂无数据')}</p>`;
  return `<section class="home-block" aria-labelledby="home-sources-title">
  <div class="container">
    ${sectionHead('home-sources-title', 'Sources', '信源池', 'Source pool', '信源池', '/sources', 'Source pool', '信源池')}
    ${body}
  </div>
</section>`;
}

function homeMain({ articles, brands, buildVersion, root } = {}) {
  const siteRoot = root || path.join(__dirname, '..');
  return `<section class="hero home-hero">
  <div class="container">
    <h1 class="hero-title">${bi(
      'China auto industry intelligence: two daily briefings, people moves, sales and rankings.',
      '中国汽车产业情报：每天两份日报、人事变动、销量与排行'
    )}</h1>
    <div class="hero-cta">
      <a class="btn btn-primary" href="/newsletter">${bi('Subscribe to the daily', '订阅日报')}</a>
      <a class="btn btn-ghost" href="/news">${bi("Today's briefings", '看今天的日报')}</a>
    </div>
  </div>
</section>
${briefingsSection(articles)}
${peopleSection(siteRoot, buildVersion)}
${salesSection(siteRoot)}
${companiesSection(brands)}
${analysisSection(articles)}
${poolSection(siteRoot)}`;
}

module.exports = { homeMain };
