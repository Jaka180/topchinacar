'use strict';

// ============ 销量与排行（/sales、/zh/sales）============
// 数据来自 data/sales.json（遵循统筹 C2 接口），由 radar 每月导出推送。
// 数据文件不存在、或格式不对时，页面照常生成，只显示「数据整理中，首批数据即将发布」。
// 红线：绝不拿示例数据或假数据冒充真实数据；缺失值一律显示「—」，不写成 0。
//
// 调试用的示例放在 tests/fixtures/sales.sample.json，只有设置环境变量
// SALES_FILE 指向它时才会被读取，默认构建永远读 data/sales.json。

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.topchinacar.com';
const ROUTE = '/sales';
const REAL_DATA_FILE = path.join(ROOT, 'data', 'sales.json');

// URL 里不允许出现控制字符（和 build.js 的 sourceHref 一致）
const CONTROL_CHARS = new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + ']');

// 口径（basis）取值 → [英文, 中文]。数据里出现没有译名的取值时，原样显示。
const BASIS_LABELS = {
  company_report: ['Company report', '公司公告'],
  exchange_filing: ['Exchange filing', '交易所公告'],
  group_report: ['Group basis', '集团口径'],
  listed_company: ['Listed entity basis', '上市公司口径'],
  joint_venture: ['Joint venture basis', '合资公司口径'],
  retail: ['Domestic retail', '国内零售'],
  wholesale: ['Wholesale', '批发'],
  delivery: ['Deliveries', '交付'],
  export: ['Exports', '出口'],
  overseas_sales: ['Overseas sales', '海外销量'],
  production: ['Production', '产量'],
  insurance: ['Insurance registrations', '上险量'],
  customs: ['Customs', '海关'],
  association: ['Industry association', '行业协会'],
  cpca_retail: ['Passenger car retail (CPCA)', '乘用车零售（乘联分会）'],
  cpca_wholesale: ['Passenger car wholesale (CPCA)', '乘用车批发（乘联分会）'],
  estimate: ['Estimate', '测算 / 预估'],
  media: ['Media report', '媒体报道']
};

// 榜单（list）取值 → [英文, 中文]
const RANKING_LIST_LABELS = {
  model_retail: ['Model retail ranking', '车型零售榜'],
  model_wholesale: ['Model wholesale ranking', '车型批发榜'],
  model_export: ['Model export ranking', '车型出口榜'],
  model_delivery: ['Model delivery ranking', '车型交付榜'],
  model_nev: ['NEV model ranking', '新能源车型榜'],
  model_nev_retail: ['NEV model retail ranking', '新能源车型零售榜'],
  brand_retail: ['Brand retail ranking', '品牌零售榜'],
  suv: ['SUV ranking', 'SUV 榜'],
  sedan: ['Sedan ranking', '轿车榜']
};

const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---------- 通用小工具 ----------

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&(?!(?:#\d+|#x[0-9a-fA-F]+|amp|lt|gt|quot|apos);)/gi, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 双语文本块：英文页显示英文，中文页由 build.js 的 zhChrome 翻转
function tx(en, zh) {
  return `<span data-lang="en">${escapeHtml(en)}</span><span data-lang="zh" hidden>${escapeHtml(zh)}</span>`;
}

function safeHref(url) {
  const value = String(url ?? '').trim();
  if (!/^https?:\/\//i.test(value)) return '';
  if (CONTROL_CHARS.test(value)) return '';
  return value;
}

function sourceHtml(name, url, fallbackEn, fallbackZh) {
  const label = String(name ?? '').trim();
  const href = safeHref(url);
  const en = label || fallbackEn || '—';
  const zh = label || fallbackZh || fallbackEn || '—';
  if (!href) return tx(en, zh);
  return `<a href="${escapeHtml(href)}" rel="nofollow noopener">${tx(en, zh)}</a>`;
}

function numOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function fmtNumber(value) {
  const n = numOrNull(value);
  if (n === null) return '—';
  return Math.round(n).toLocaleString('en-US');
}

function isZhLang(lang) {
  return String(lang || '').toLowerCase().startsWith('zh');
}

function pick(lang, en, zh) {
  return isZhLang(lang) ? zh : en;
}

// YYYY-MM 归一化；不是合法月份返回 ''
function normalizePeriod(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value ?? '').trim());
  if (!match) return '';
  const month = Number(match[2]);
  if (month < 1 || month > 12) return '';
  return `${match[1]}-${match[2]}`;
}

function periodLabel(period, lang) {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return String(period || '—');
  const year = match[1];
  const month = Number(match[2]);
  if (isZhLang(lang)) return `${year} 年 ${month} 月`;
  return `${MONTH_NAMES_EN[month - 1] || match[2]} ${year}`;
}

// 以 anchor 月为终点，往前推 count 个自然月（含 anchor 本身）
function monthSlots(anchor, count) {
  const parts = anchor.split('-').map(Number);
  const base = parts[0] * 12 + (parts[1] - 1);
  const slots = [];
  for (let i = count - 1; i >= 0; i--) {
    const total = base - i;
    const y = Math.floor(total / 12);
    const m = (total % 12) + 1;
    slots.push(`${y}-${String(m).padStart(2, '0')}`);
  }
  return slots;
}

// ---------- 读取与校验 ----------

let cachedData;
let cachedDataLoaded = false;

// 返回归一化后的数据；文件缺失或格式不对返回 null（页面走空状态，不让构建失败）
function loadSalesData() {
  if (cachedDataLoaded) return cachedData;
  cachedDataLoaded = true;

  const override = String(process.env.SALES_FILE || '').trim();
  const file = override ? path.resolve(ROOT, override) : REAL_DATA_FILE;

  if (!fs.existsSync(file)) {
    if (override) console.warn(`! sales: SALES_FILE not found (${override}), page will show the empty state`);
    else console.warn('! sales: data/sales.json not found, page will show the empty state');
    cachedData = null;
    return null;
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    const message = String(error && error.message || error).replace(/\s+/g, ' ');
    console.warn(`! sales: ${path.relative(ROOT, file)} is not valid JSON (${message})`);
    cachedData = null;
    return null;
  }

  if (override) console.warn(`! sales: reading SALES_FILE override (${override}) — sample data, not the real dataset`);

  const data = normalize(raw);
  if (!data) {
    console.warn(`! sales: ${path.relative(ROOT, file)} has an unexpected shape, page will show the empty state`);
    cachedData = null;
    return null;
  }
  cachedData = data;
  return data;
}

function normalize(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const monthlyIn = Array.isArray(raw.monthly) ? raw.monthly : [];
  const rankingsIn = Array.isArray(raw.rankings) ? raw.rankings : [];
  const companiesIn = Array.isArray(raw.companies) ? raw.companies : [];
  const generatedAt = typeof raw.generated_at === 'string' && Number.isFinite(Date.parse(raw.generated_at))
    ? raw.generated_at
    : null;

  // 公司名表
  const companies = new Map();
  for (const item of companiesIn) {
    if (!item || typeof item !== 'object') continue;
    const id = String(item.id ?? '').trim();
    if (!id) continue;
    const en = String(item.en || item.zh || id).trim() || id;
    const zh = String(item.zh || item.en || id).trim() || id;
    companies.set(id, { id, en, zh });
  }

  // 月度行；(company_id, period) 重复时，后出现的覆盖先出现的
  const rowsByKey = new Map();
  for (const item of monthlyIn) {
    if (!item || typeof item !== 'object') continue;
    const companyId = String(item.company_id ?? '').trim();
    const period = normalizePeriod(item.period);
    if (!companyId || !period) continue;
    rowsByKey.set(`${companyId}|${period}`, {
      companyId,
      period,
      monthTotal: numOrNull(item.month_total),
      monthOverseas: numOrNull(item.month_overseas),
      ytdTotal: numOrNull(item.ytd_total),
      ytdOverseas: numOrNull(item.ytd_overseas),
      basis: String(item.basis ?? '').trim(),
      sourceName: String(item.source_name ?? '').trim(),
      sourceUrl: safeHref(item.source_url),
      preliminary: item.preliminary === true
    });
  }

  const rows = [...rowsByKey.values()];
  for (const row of rows) {
    if (!companies.has(row.companyId)) {
      companies.set(row.companyId, { id: row.companyId, en: row.companyId, zh: row.companyId });
    }
    row.name = companies.get(row.companyId);
  }

  // 月份（新 → 旧）
  const months = [...new Set(rows.map(r => r.period))].sort().reverse();

  // 先按月份分组；月度表默认按公司名展示，不生成名次。
  const byMonth = new Map();
  for (const period of months) {
    byMonth.set(period, rows.filter(r => r.period === period));
  }

  // 有月度数据的公司（按英文名排序）
  const companyIds = [...new Set(rows.map(r => r.companyId))].sort((a, b) => {
    const an = companies.get(a);
    const bn = companies.get(b);
    return String(an ? an.en : a).localeCompare(String(bn ? bn.en : b), 'en');
  });

  // 每家公司近 12 个自然月（以该公司最新月份为终点，缺月留空）
  const series = new Map();
  for (const companyId of companyIds) {
    const own = rows.filter(r => r.companyId === companyId).sort((a, b) => a.period.localeCompare(b.period));
    if (!own.length) continue;
    const anchor = own[own.length - 1].period;
    const slots = monthSlots(anchor, 12);
    const byPeriod = new Map(own.map(r => [r.period, r]));
    series.set(companyId, slots.map(period => {
      const row = byPeriod.get(period);
      return {
        period,
        total: row ? row.monthTotal : null,
        overseas: row ? row.monthOverseas : null,
        preliminary: row ? row.preliminary : false,
        basis: row ? row.basis : ''
      };
    }));
  }

  // 榜单
  const rankings = [];
  for (const item of rankingsIn) {
    if (!item || typeof item !== 'object') continue;
    const period = normalizePeriod(item.period);
    const list = String(item.list ?? '').trim();
    const rowsIn = Array.isArray(item.rows) ? item.rows : [];
    const rankRows = rowsIn
      .filter(r => r && typeof r === 'object')
      .map(r => ({
        rank: numOrNull(r.rank),
        modelEn: String(r.model_en ?? r.model_zh ?? '').trim(),
        modelZh: String(r.model_zh ?? r.model_en ?? '').trim(),
        makerEn: String(r.maker_en ?? r.maker_zh ?? '').trim(),
        makerZh: String(r.maker_zh ?? r.maker_en ?? '').trim(),
        units: numOrNull(r.units)
      }))
      .filter(r => r.modelEn || r.modelZh || r.units !== null)
      .sort((a, b) => {
        if (a.rank === null && b.rank === null) return 0;
        if (a.rank === null) return 1;
        if (b.rank === null) return -1;
        return a.rank - b.rank;
      });
    if (!period && !list && !rankRows.length) continue;
    rankings.push({
      period: period || '',
      list,
      basisEn: String(item.basis_en ?? '').trim(),
      basisZh: String(item.basis_zh ?? item.basis_en ?? '').trim(),
      sourceName: String(item.source_name ?? '').trim(),
      sourceUrl: safeHref(item.source_url),
      rows: rankRows
    });
  }
  // 新月份在前；同月按榜单名排序
  rankings.sort((a, b) => b.period.localeCompare(a.period) || String(a.list).localeCompare(String(b.list), 'en'));

  // 页尾来源清单（按出处去重）
  const sources = [];
  const seenSource = new Set();
  const addSource = (name, url) => {
    const href = safeHref(url);
    const label = String(name ?? '').trim();
    if (!href && !label) return;
    const key = href || `name:${label.toLowerCase()}`;
    if (seenSource.has(key)) return;
    seenSource.add(key);
    sources.push({ name: label, url: href });
  };
  for (const row of rows) addSource(row.sourceName, row.sourceUrl);
  for (const ranking of rankings) addSource(ranking.sourceName, ranking.sourceUrl);

  return { generatedAt, companies, months, byMonth, companyIds, series, rankings, sources, rows };
}

function hasData(data) {
  return !!data && (data.months.length > 0 || data.rankings.length > 0);
}

// 用于 sitemap 的 lastmod；没有数据返回 null
function salesGeneratedAt(data) {
  if (!data || !data.generatedAt) return null;
  return String(data.generatedAt).slice(0, 10);
}

// ---------- 表格 ----------

function basisText(basis) {
  const key = String(basis ?? '').trim();
  if (!key) return { en: '—', zh: '—', key: '' };
  const labels = BASIS_LABELS[key];
  return { en: labels ? labels[0] : key, zh: labels ? labels[1] : key, key };
}

function sortButton(labelEn, labelZh, key, initialDir) {
  const ariaSort = initialDir ? (initialDir === 'asc' ? 'ascending' : 'descending') : 'none';
  return `<th scope="col" data-sort="${escapeHtml(key)}" aria-sort="${ariaSort}"><button type="button" class="sales-sort-btn">${tx(labelEn, labelZh)}</button></th>`;
}

function sortValue(value) {
  return value === null || value === undefined ? '' : String(value);
}

function monthlyTable(rows) {
  const body = rows.map(row => {
    const basis = basisText(row.basis);
    return `<tr>
      <td data-sort-value="${escapeHtml(row.name.en)}">${tx(row.name.en, row.name.zh)}</td>
      <td class="sales-num" data-sort-value="${sortValue(row.monthTotal)}">${escapeHtml(fmtNumber(row.monthTotal))}</td>
      <td class="sales-num" data-sort-value="${sortValue(row.monthOverseas)}">${escapeHtml(fmtNumber(row.monthOverseas))}</td>
      <td class="sales-num" data-sort-value="${sortValue(row.ytdTotal)}">${escapeHtml(fmtNumber(row.ytdTotal))}</td>
      <td class="sales-num" data-sort-value="${sortValue(row.ytdOverseas)}">${escapeHtml(fmtNumber(row.ytdOverseas))}</td>
      <td data-sort-value="${escapeHtml(basis.key)}">${tx(basis.en, basis.zh)}</td>
      <td data-sort-value="${escapeHtml(row.sourceName)}">${sourceHtml(row.sourceName, row.sourceUrl, 'Source', '来源')}</td>
      <td data-sort-value="${row.preliminary ? '1' : '0'}">${row.preliminary
        ? `<span class="sales-tag">${tx('Preliminary', '初步数据')}</span>`
        : tx('No', '否')}</td>
    </tr>`;
  }).join('');

  return `<div class="sales-scroll"><table class="sales-table" data-sales-sortable>
    <thead><tr>
      ${sortButton('Company', '公司', 'company', 'asc')}
      ${sortButton('Month total', '当月总销量', 'month_total')}
      ${sortButton('Month overseas', '当月海外', 'month_overseas')}
      ${sortButton('YTD total', '年累计', 'ytd_total')}
      ${sortButton('YTD overseas', '年累计海外', 'ytd_overseas')}
      ${sortButton('Basis', '口径', 'basis')}
      ${sortButton('Source', '来源', 'source')}
      ${sortButton('Preliminary?', '是否初步数据', 'preliminary')}
    </tr></thead>
    <tbody>${body}</tbody>
  </table></div>`;
}

// basis 用于分表，不代表统计范围相同；所有月度表默认按公司名排列。
function monthlyTablesByBasis(rows) {
  const groups = new Map();
  for (const row of rows) {
    const key = row.basis || row;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.values()].sort((a, b) => a[0].basis.localeCompare(b[0].basis, 'en')).map(group => {
    const basis = basisText(group[0].basis);
    const sorted = [...group].sort((a, b) => a.name.en.localeCompare(b.name.en, 'en'));
    return `<div class="sales-basis-group" data-sales-basis="${escapeHtml(basis.key)}">
      <h3>${tx(basis.key ? basis.en : 'Basis not stated — comparison unavailable', basis.key ? basis.zh : '口径未注明，暂不比较')}</h3>
      ${basis.key === 'company_report' ? `<p class="sales-note">${tx(
        'Each company reports on its own announced basis (group, listed company or brand). The figures cannot be directly compared across companies; this table is not a ranking.',
        '各公司按自己公告的口径披露（集团、上市公司或品牌不一），数字不能直接横向比较，表格不是排名'
      )}</p>` : ''}
      ${monthlyTable(sorted)}
    </div>`;
  }).join('');
}

// 只有明确的统一销量口径可展示名次；来源类型（如 company_report）不是销量口径。
// 未识别或中英文口径冲突时保留数字，但退为按车型名排列的无名次表。
function comparableRankingBasis(ranking) {
  const keys = ['retail', 'wholesale', 'delivery', 'export', 'overseas_sales', 'insurance', 'cpca_retail', 'cpca_wholesale'];
  const values = [ranking.basisEn, ranking.basisZh].filter(Boolean);
  const matched = values.map(value => keys.find(key =>
    [key, ...BASIS_LABELS[key]].some(label => label.toLowerCase() === value.toLowerCase())
  ));
  return matched.length > 0 && !!matched[0] && matched.every(key => key === matched[0]);
}

function rankingTable(ranking, comparable) {
  const rows = comparable ? ranking.rows : [...ranking.rows].sort((a, b) =>
    (a.modelEn || a.modelZh).localeCompare(b.modelEn || b.modelZh, 'en'));
  const body = rows.map(row => `<tr>
    ${comparable ? `<td class="sales-num" data-sort-value="${sortValue(row.rank)}">${escapeHtml(row.rank === null ? '—' : String(row.rank))}</td>` : ''}
    <td data-sort-value="${escapeHtml(row.modelEn || row.modelZh)}">${tx(row.modelEn || row.modelZh || '—', row.modelZh || row.modelEn || '—')}</td>
    <td data-sort-value="${escapeHtml(row.makerEn || row.makerZh)}">${tx(row.makerEn || row.makerZh || '—', row.makerZh || row.makerEn || '—')}</td>
    <td class="sales-num" data-sort-value="${sortValue(row.units)}">${escapeHtml(fmtNumber(row.units))}</td>
  </tr>`).join('');

  return `<div class="sales-scroll"><table class="sales-table" data-sales-sortable>
    <thead><tr>
      ${comparable ? sortButton('Rank', '排名', 'rank', 'asc') : ''}
      ${sortButton('Model', '车型', 'model', comparable ? null : 'asc')}
      ${sortButton('Maker', '厂商', 'maker')}
      ${sortButton('Units', '销量', 'units')}
    </tr></thead>
    <tbody>${body}</tbody>
  </table></div>`;
}

// ---------- 柱状图（纯 CSS） ----------

function trendChart(slots, company) {
  const max = slots.reduce((acc, slot) => (slot.total !== null && slot.total > acc ? slot.total : acc), 0);
  const bars = slots.map(slot => {
    if (slot.total === null) {
      return `<div class="sales-bar sales-bar--missing" title="${escapeHtml(slot.period)} — no data / 暂无数据"><span class="sales-bar-x-gap"></span></div>`;
    }
    const height = slot.total === 0 || max <= 0 ? 0 : Math.max(3, Math.round((slot.total / max) * 100));
    const overseasUnknown = slot.overseas === null;
    const overseasRatio = !overseasUnknown && slot.total > 0
      ? Math.max(0, Math.min(100, Math.round((slot.overseas / slot.total) * 100)))
      : 0;
    const title = `${slot.period} · ${fmtNumber(slot.total)} units / ${fmtNumber(slot.total)} 辆` +
      (!overseasUnknown ? ` · overseas ${fmtNumber(slot.overseas)}` : ' · Overseas data unavailable / 海外暂无数据') +
      (slot.preliminary ? ' · preliminary' : '');
    return `<div class="sales-bar${overseasUnknown ? ' sales-bar--total-only' : ''}${slot.total === 0 ? ' sales-bar--zero' : ''}" style="height:${height}%" title="${escapeHtml(title)}">${
      overseasRatio > 0 ? `<span class="sales-bar-overseas" style="height:${overseasRatio}%"></span>` : ''
    }</div>`;
  }).join('');

  const axis = slots.map(slot => `<span>${escapeHtml(slot.period.slice(5))}</span>`).join('');
  let peak = null;
  for (const slot of slots) {
    if (slot.total === null) continue;
    if (!peak || slot.total > peak.total) peak = slot;
  }

  return `<div class="sales-chart-wrap">
    <div class="sales-chart" role="img" aria-label="${escapeHtml(`${company.en} — monthly totals, last 12 months`)}">${bars}</div>
    <div class="sales-chart-x">${axis}</div>
    <p class="sales-legend">
      <span class="sales-key sales-key--domestic"></span>${tx('Domestic', '国内')}
      <span class="sales-key sales-key--overseas"></span>${tx('Overseas', '海外')}
      <span class="sales-key sales-key--total"></span>${tx('Total (overseas data unavailable)', '总量（海外暂无数据）')}
      <span class="sales-key sales-key--missing"></span>${tx('No data (not zero)', '缺失（不是 0）')}
    </p>
    ${slots.some(slot => slot.total !== null && slot.overseas === null)
      ? `<p class="sales-note">${tx(
        `Overseas data unavailable: ${slots.filter(slot => slot.total !== null && slot.overseas === null).map(slot => slot.period).join(', ')}. Only totals are shown; no domestic volume is inferred.`,
        `海外暂无数据：${slots.filter(slot => slot.total !== null && slot.overseas === null).map(slot => slot.period).join('、')}。仅显示总量，不推算国内销量。`
      )}</p>` : ''}
    ${peak
      ? `<p class="sales-note">${tx(
        `Highest month in view: ${periodLabel(peak.period, 'en')}, ${fmtNumber(peak.total)} units.`,
        `区间内最高月份：${periodLabel(peak.period, 'zh')}，${fmtNumber(peak.total)} 辆。`
      )}</p>`
      : `<p class="sales-note">${tx('No monthly total in this window.', '这段时间没有月度总量数据。')}</p>`}
  </div>`;
}

// ---------- 页面主体 ----------

function basisNotice() {
  const items = [
    ['Monthly tables group the reported basis labels and default to company-name order, without ranks. Company reports may cover different scopes. Rankings require an explicitly shared sales basis, other than company reports.',
      '月度数据按公告口径标签分表，默认按公司名排序，不列名次。公司公告的统计范围可能不同；只有明确相同的销量口径、且不是公司公告的数据才展示排名。'],
    ['Domestic retail, wholesale, deliveries and exports are kept apart and are never added together.',
      '国内零售、批发、交付、出口分开列示，互不合并。'],
    ['A missing value shows “—”. Missing is not zero.', '缺失显示「—」。缺失不是零。'],
    ['Rows marked “Preliminary” may still be revised by the company later.',
      '标了「初步数据」的数字，公司后续可能修正。'],
    ['Every row carries its basis and a source link, so you can check the original.',
      '每行都带口径和来源链接，可以直接核对原文。']
  ];
  return `<ul class="sales-basis">${items.map(item => `<li>${tx(item[0], item[1])}</li>`).join('')}</ul>`;
}

function emptyState() {
  return `<div class="sales-empty">
    <p class="sales-empty-title">${tx('Sales data is being compiled. The first release is coming soon.', '数据整理中，首批数据即将发布。')}</p>
    <p class="sales-note">${tx(
      'This page will show monthly sales by company, a 12-month trend per company, and model rankings. Each number will carry its basis and a source link. Until the first export lands there is nothing to show here — we do not publish placeholder numbers.',
      '这个页面会给出各公司的月度销量、单家公司近 12 个月走势，以及车型排行。每个数字都会带口径和来源链接。首批数据导出之前这里不放任何占位数字。'
    )}</p>
  </div>`;
}

function salesMain(data) {
  const live = hasData(data);
  const updated = data && data.generatedAt ? String(data.generatedAt).slice(0, 10) : '';

  const intro = live
    ? tx(
      `Monthly sales and model rankings for Chinese automakers: ${data.companyIds.length} companies, ${data.months.length} month(s), ${data.rankings.length} ranking list(s)${updated ? `, updated ${updated}` : ''}. Every figure carries its basis and a source link, and missing values are never shown as zero.`,
      `中国车企月度销量与车型排行：${data.companyIds.length} 家公司、${data.months.length} 个月数据、${data.rankings.length} 个榜单${updated ? `，更新于 ${updated}` : ''}。每个数字都带口径和来源链接，缺失值一律不写成 0。`
    )
    : tx(
      'Monthly sales and model rankings for Chinese automakers. The dataset is being compiled — the first release is coming soon. Every figure will carry its basis and a source link.',
      '中国车企月度销量与车型排行。数据整理中，首批数据即将发布。每个数字都会带口径和来源链接。'
    );

  const stats = live
    ? [
      [String(data.companyIds.length), 'Companies', '公司数'],
      [String(data.months.length), 'Months', '月份数'],
      [String(data.rankings.length), 'Ranking lists', '榜单数'],
      [updated || '—', 'Updated', '更新时间']
    ].map(item => `<div class="sales-stat"><strong>${escapeHtml(item[0])}</strong><span>${tx(item[1], item[2])}</span></div>`).join('')
    : '';

  let body = '';

  if (!live) {
    body = emptyState();
  } else {
    // 1. 公司月度销量表
    if (data.months.length) {
      const options = data.months.map((period, index) =>
        `<option value="${escapeHtml(period)}"${index === 0 ? ' selected' : ''}>${escapeHtml(period)}</option>`).join('');
      const panels = data.months.map((period, index) =>
        `<div class="sales-panel" data-sales-month="${escapeHtml(period)}"${index === 0 ? '' : ' hidden'}>${monthlyTablesByBasis(data.byMonth.get(period) || [])}</div>`).join('');
      body += `<div class="sales-block">
        <h2>${tx('Monthly sales by company', '公司月度销量')}</h2>
        <p class="sales-note">${tx(
          'Pick a month. Tables default to company-name order and have no rank column. Click a column heading to sort within a table. Missing numbers show “—” and always sort last. Rows with no stated basis are shown individually.',
          '选择月份。各表默认按公司名排序，不列名次；点表头可在表内自行排序。缺失数字显示「—」，排序时恒排在最后。未注明口径的记录逐条列出。'
        )}</p>
        <div class="sales-control">
          <label class="sales-control-label" for="sales-month-select">${tx('Month', '月份')}</label>
          <select id="sales-month-select" class="sales-select">${options}</select>
        </div>
        <div class="sales-panels" data-sales-month-panels>${panels}</div>
      </div>`;
    }

    // 2. 单家公司近 12 个月走势
    const chartCompanies = data.companyIds.filter(id => (data.series.get(id) || []).length);
    if (chartCompanies.length) {
      const options = chartCompanies.map((id, index) => {
        const company = data.companies.get(id) || { en: id, zh: id };
        return `<option value="${escapeHtml(id)}"${index === 0 ? ' selected' : ''}>${escapeHtml(`${company.en} / ${company.zh}`)}</option>`;
      }).join('');
      const panels = chartCompanies.map((id, index) => {
        const company = data.companies.get(id) || { en: id, zh: id };
        return `<div class="sales-panel" data-sales-company="${escapeHtml(id)}"${index === 0 ? '' : ' hidden'}>${trendChart(data.series.get(id) || [], company)}</div>`;
      }).join('');
      body += `<div class="sales-block">
        <h2>${tx('12-month trend by company', '单家公司近 12 个月走势')}</h2>
        <p class="sales-note">${tx(
          'Monthly totals for one company over the last 12 months. Blue shows overseas volume when available. Gold shows totals with no overseas breakdown. Months without a report stay empty — they are not zero.',
          '单家公司近 12 个月的月度总量。海外量已知时用蓝色显示海外部分；海外量未知时用金色显示总量。没有上报的月份留空，不是零。'
        )}</p>
        <div class="sales-control">
          <label class="sales-control-label" for="sales-company-select">${tx('Company', '公司')}</label>
          <select id="sales-company-select" class="sales-select">${options}</select>
        </div>
        <div class="sales-panels" data-sales-company-panels>${panels}</div>
      </div>`;
    }

    // 3. 车型排行
    if (data.rankings.length) {
      const blocks = data.rankings.map(ranking => {
        const comparable = comparableRankingBasis(ranking);
        const listLabels = comparable
          ? RANKING_LIST_LABELS[ranking.list] || [ranking.list || 'Ranking', ranking.list || '榜单']
          : ['Model sales (unranked)', '车型销量（不排名）'];
        const headingEn = `${ranking.period ? `${periodLabel(ranking.period, 'en')} · ` : ''}${listLabels[0]}`;
        const headingZh = `${ranking.period ? `${periodLabel(ranking.period, 'zh')} · ` : ''}${listLabels[1]}`;
        const basis = ranking.basisEn || ranking.basisZh;
        return `<div class="sales-ranking">
          <h3>${tx(headingEn, headingZh)}</h3>
          <p class="sales-note">${tx(
            basis ? `Basis: ${basis}` : 'The source does not state a basis.',
            basis ? `口径：${ranking.basisZh || basis}` : '来源未写明口径。'
          )} ${tx('Source:', '来源：')} ${sourceHtml(ranking.sourceName, ranking.sourceUrl, '—', '—')}</p>
          ${comparable ? '' : `<p class="sales-note">${tx(
            'A shared sales basis could not be confirmed. Figures are shown in model-name order without ranks.',
            '无法确认统一的销量口径，按车型名展示数字，不列名次。'
          )}</p>`}
          ${ranking.rows.length
            ? rankingTable(ranking, comparable)
            : `<p class="sales-note">${tx('No rows in this list yet.', '这个榜单还没有数据。')}</p>`}
        </div>`;
      }).join('');
      body += `<div class="sales-block">
        <h2>${tx('Model rankings', '车型排行')}</h2>
        <p class="sales-note">${tx(
          'One table per list and period, each with the basis the source used. Ranks are shown as published only for an explicitly shared sales basis other than company reports; otherwise figures appear without ranks.',
          '每个榜单、每个月份一张表，都写明来源使用的口径。只有明确统一的销量口径、且不是公司公告的数据，才按原文照录排名；其余只展示数字，不列名次。'
        )}</p>
        ${blocks}
      </div>`;
    }
  }

  // 4. 页尾：数据来源与更正入口
  body += sourcesFooter(data);

  return `
  <section class="page-header">
    <div class="container">
      <div class="section-eyebrow">${tx('Data', '数据')}</div>
      <h1 class="page-title">${tx('Sales & Rankings', '销量与排行')}</h1>
      <p class="page-deck">${tx(
        'Monthly sales and model rankings for Chinese automakers, with the basis and source link on every number.',
        '中国车企月度销量与车型排行。每个数字都带口径和来源链接。'
      )}</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container sales-page">
      <p class="sales-lead">${intro}</p>
      ${stats ? `<div class="sales-stats">${stats}</div>` : ''}
      <div class="sales-block">
        <h2>${tx('How to read these numbers', '口径说明')}</h2>
        ${basisNotice()}
      </div>
      ${body}
    </div>
  </section>`;
}

function sourcesFooter(data) {
  const live = hasData(data);
  const list = live && data.sources.length
    ? `<ul class="sales-sources">${data.sources.map(source => {
      const label = source.name || source.url || '—';
      const href = safeHref(source.url);
      return `<li>${href
        ? `<a href="${escapeHtml(href)}" rel="nofollow noopener">${escapeHtml(label)}</a>`
        : escapeHtml(label)}</li>`;
    }).join('')}</ul>`
    : `<p class="sales-note">${tx(
      'Sources will be listed here with the first data release: company filings and announcements, CPCA, CAAM and customs data.',
      '首批数据发布时，这里会列出全部来源：公司公告与财报、乘联分会、中汽协和海关数据。'
    )}</p>`;

  return `<div class="sales-block sales-block--footer">
    <h2>${tx('Sources and corrections', '数据来源与更正')}</h2>
    <p class="sales-note">${tx(
      'Every number on this page comes from the source named on its row. Nothing here is modelled or estimated by us unless the basis column says so.',
      '本页每个数字都来自该行注明的来源。除「口径」列写明为测算/预估外，我们不自行建模或估算。'
    )}</p>
    ${list}
    <p class="sales-note">
      <a href="/sources">${tx('Source pool', '信源池')}</a> ·
      <a href="/editorial-policy">${tx('Editorial policy', '编辑方针')}</a> ·
      <a href="/tips?kind=correction">${tx('Report a correction', '提交更正')}</a>
    </p>
  </div>`;
}

// ---------- SEO ----------

function canonicalUrl(isZh) {
  return isZh ? `${SITE}/zh${ROUTE}` : `${SITE}${ROUTE}`;
}

function breadcrumbJsonLd(isZh) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isZh ? '首页' : 'Home',
        item: isZh ? `${SITE}/zh/` : `${SITE}/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isZh ? '销量与排行' : 'Sales & Rankings',
        item: canonicalUrl(isZh)
      }
    ]
  };
}

function jsonLdScript(value) {
  return `<script type="application/ld+json">\n${JSON.stringify(value, null, 2)}\n</script>`;
}

function webPageJsonLd(isZh) {
  const title = isZh ? '销量与排行' : 'Sales & Rankings';
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl(isZh)}#webpage`,
    url: canonicalUrl(isZh),
    name: title,
    inLanguage: isZh ? 'zh-CN' : 'en',
    isPartOf: { '@id': `${SITE}/#website` },
    publisher: { '@id': `${SITE}/#organization` },
    breadcrumb: breadcrumbJsonLd(isZh)
  });
}

function datasetJsonLd(data, isZh) {
  const url = canonicalUrl(isZh);
  const periods = data.months;
  const temporal = periods.length ? `${periods[periods.length - 1]}/${periods[0]}` : null;
  const variables = [
    ['Monthly total sales', '月度总销量'],
    ['Monthly overseas sales', '月度海外销量'],
    ['Year-to-date total sales', '年累计销量'],
    ['Year-to-date overseas sales', '年累计海外销量']
  ].map(item => ({
    '@type': 'PropertyValue',
    name: isZh ? item[1] : item[0],
    description: isZh
      ? '缺失值留空，不代表 0；口径见每行说明。'
      : 'Missing values are left blank and are not zero; see the basis column of each row.'
  }));

  const dataset = {
    '@type': 'Dataset',
    '@id': `${url}#dataset`,
    name: isZh ? '中国车企月度销量与车型排行' : 'China Auto Monthly Sales and Model Rankings',
    description: isZh
      ? `中国车企的月度销量、年累计销量、海外销量与车型排行。已收录 ${data.companyIds.length} 家公司、${data.months.length} 个月数据、${data.rankings.length} 个榜单；每个数字都带口径与来源链接。`
      : `Monthly sales, year-to-date sales, overseas sales and model rankings for Chinese automakers: ${data.companyIds.length} companies, ${data.months.length} month(s), ${data.rankings.length} ranking list(s). Every figure carries its basis and a source link.`,
    url,
    inLanguage: isZh ? 'zh-CN' : 'en',
    isAccessibleForFree: true,
    creator: { '@id': `${SITE}/#organization` },
    publisher: { '@id': `${SITE}/#organization` },
    license: `${SITE}/editorial-policy`,
    variableMeasured: variables
  };
  if (data.generatedAt) dataset.dateModified = String(data.generatedAt).slice(0, 10);
  if (temporal) dataset.temporalCoverage = temporal;

  return jsonLdScript({
    '@context': 'https://schema.org',
    '@graph': [dataset, breadcrumbJsonLd(isZh)]
  });
}

function salesExtraHead(data, lang, version) {
  const isZh = isZhLang(lang);
  const ld = hasData(data) ? datasetJsonLd(data, isZh) : webPageJsonLd(isZh);
  const script = `<script src="/js/sales.js?v=${escapeHtml(version || '')}" defer></script>`;
  return `${ld}\n${script}`;
}

function salesDescription(data, isZh) {
  if (isZh) {
    return hasData(data)
      ? `中国车企月度销量与车型排行：${data.companyIds.length} 家公司、${data.months.length} 个月数据、${data.rankings.length} 个榜单。每个数字都带口径和来源链接，缺失值不写成 0。`
      : '中国车企月度销量与车型排行。数据整理中，首批数据即将发布。每个数字都会带口径和来源链接。';
  }
  return hasData(data)
    ? `Monthly sales and model rankings for Chinese automakers: ${data.companyIds.length} companies, ${data.months.length} month(s), ${data.rankings.length} ranking list(s). Every figure carries its basis and source link.`
    : 'Monthly sales and model rankings for Chinese automakers. The dataset is being compiled — the first release is coming soon.';
}

// ---------- 对外接口 ----------

// 生成 /sales 与 /zh/sales 两页。ctx 由 build.js 注入：{ pageHTML, zhChrome, version }
function renderSalesPages(data, ctx) {
  const options = ctx || {};
  if (typeof options.pageHTML !== 'function') throw new Error('lib/sales: renderSalesPages needs ctx.pageHTML');
  if (typeof options.zhChrome !== 'function') throw new Error('lib/sales: renderSalesPages needs ctx.zhChrome');

  const main = salesMain(data);
  const version = options.version || '';

  const en = options.pageHTML(ROUTE, {
    title: 'China Auto Sales & Model Rankings by Month | TopChinaCar',
    desc: salesDescription(data, false),
    extraHead: salesExtraHead(data, 'en', version)
  }, main);

  const zh = options.zhChrome(options.pageHTML(ROUTE, {
    title: '中国车企月度销量与车型排行 | TopChinaCar',
    desc: salesDescription(data, true),
    extraHead: salesExtraHead(data, 'zh', version)
  }, main, { zh: true }));

  return { en, zh };
}

// 公司详情页用：返回该公司最近 12 个月销量的小表；没有数据返回空字符串。
// lang: 'en' | 'zh'。返回的 HTML 不含 id，可直接插进公司页。
function salesBlockForCompany(companyId, lang) {
  const data = loadSalesData();
  if (!hasData(data)) return '';
  const id = String(companyId ?? '').trim();
  if (!id) return '';
  const slots = data.series.get(id);
  if (!slots || !slots.length) return '';

  const isZh = isZhLang(lang);
  const company = data.companies.get(id) || { en: id, zh: id };
  const name = isZh ? company.zh : company.en;
  const rows = slots.map(slot => {
    const basis = basisText(slot.basis);
    return `<tr>
      <td>${escapeHtml(periodLabel(slot.period, lang))}</td>
      <td class="sales-num">${escapeHtml(fmtNumber(slot.total))}</td>
      <td class="sales-num">${escapeHtml(fmtNumber(slot.overseas))}</td>
      <td>${escapeHtml(isZh ? basis.zh : basis.en)}</td>
    </tr>`;
  }).join('');

  const sourceRow = data.rows.find(row => row.companyId === id && (row.sourceName || row.sourceUrl));
  let sourceText = '';
  if (sourceRow) {
    const label = sourceRow.sourceName || 'Source';
    const href = safeHref(sourceRow.sourceUrl);
    sourceText = href
      ? ` ${pick(lang, 'Source:', '来源：')} <a href="${escapeHtml(href)}" rel="nofollow noopener">${escapeHtml(label)}</a>`
      : ` ${pick(lang, 'Source:', '来源：')} ${escapeHtml(label)}`;
  }
  const salesHref = isZh ? `/zh${ROUTE}` : ROUTE;

  return `<section class="sales-company-block">
    <h3>${escapeHtml(isZh ? `${name} · 近 12 个月销量` : `${name} · last 12 months`)}</h3>
    <div class="sales-scroll"><table class="sales-table sales-table--compact">
      <thead><tr>
        <th scope="col">${escapeHtml(pick(lang, 'Month', '月份'))}</th>
        <th scope="col" class="sales-num">${escapeHtml(pick(lang, 'Month total', '当月总销量'))}</th>
        <th scope="col" class="sales-num">${escapeHtml(pick(lang, 'Month overseas', '当月海外'))}</th>
        <th scope="col">${escapeHtml(pick(lang, 'Basis', '口径'))}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p class="sales-note">
      ${escapeHtml(pick(lang, 'Missing months stay blank — missing is not zero.', '缺失月份留空，缺失不是零。'))}${sourceText}
      · <a href="${escapeHtml(salesHref)}">${escapeHtml(pick(lang, 'Sales & Rankings', '销量与排行'))}</a>
    </p>
  </section>`;
}

module.exports = {
  ROUTE,
  loadSalesData,
  renderSalesPages,
  salesBlockForCompany,
  salesGeneratedAt,
  hasData
};
