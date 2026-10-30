// 深度研究仅在构建时读取；无目录、空目录和单份坏数据均不影响整站。
const path = require('node:path');

/** 页头介绍：概览的前两句纯文字，去掉 [s6]、[2] 这类引用标记，最多 280 字符（不会在 Co.、Ltd. 这类缩写处断句） */
function leadText(html) {
  const t = plainText(html).replace(/\[\s*s?\d+\s*\]/gi, '').replace(/[ \t\r\n]+/g, ' ').replace(/ ([，。、；：,.;:])/g, '$1').trim();
  const ends = [];
  const re = /[。！？]|(?<!\b(?:Co|Ltd|Inc|Corp|No|St|Mr|Ms|Dr|vs|Jr|U\.S|e\.g|i\.e))[.!?](?= +[A-Z“"(]|$)/g;
  let m;
  while ((m = re.exec(t)) && ends.length < 2) ends.push(m.index + 1);
  const lead = (ends.length ? t.slice(0, ends[ends.length - 1]) : t).trim();
  return lead.length > 280 ? lead.slice(0, 277).replace(/ \S*$/, '') + '…' : lead;
}
const fs = require('node:fs');
const { checkFile, researchFiles, escapeHtml: esc, plainText, sanitizeResearchHtml } = require('./research-validation');
const { decodeHtmlEntities } = require('./html-entities');
const text = value => esc(decodeHtmlEntities(value));
// docs/company-research-spec.md 第 1 节：这八家没有已有品牌页。
// 正式路由独立于 JSON 生命周期；新增研究对象时显式更新此表。
// 没有品牌页、需要新建研究页的公司和品牌，来自总清单 data/company-inventory.json（lib/inventory.js）
const { NEW_COMPANIES } = require('./inventory');
const TITLES = [
  ['overview', 'Overview', '概览'], ['key-facts', 'Key facts', '关键数据卡'],
  ['history', 'History', '历史沿革'], ['current', 'Current operations', '现状'],
  ['brands', 'Brand portfolio', '品牌矩阵'], ['leadership', 'Founders and leadership', '创始人与管理层'],
  ['financials', 'Financials', '财务数据'], ['competition', 'Competition', '竞争格局'],
  ['outlook', 'Outlook', '未来展望'], ['risks', 'Risks', '风险'], ['sources', 'Sources', '资料来源']
];
function loadResearch({ root = path.resolve(__dirname, '..'), dir = process.env.RESEARCH_DIR, warn = console.warn } = {}) {
  const records = new Map();
  for (const file of researchFiles(dir ? path.resolve(root, dir) : path.join(root, 'data/company-research'))) {
    const result = checkFile(file);
    result.warnings.forEach(w => warn(`! 研究警告 ${file}: ${w}`));
    if (result.errors.length) { result.errors.forEach(e => warn(`! 跳过研究 ${file}: ${e}`)); continue; }
    records.set(result.data.id, result.data);
  }
  return records;
}
// 示例页不属于正式路由；只有它在离开示例构建后需要清理。
function removeStaleResearchPages(root, companies) {
  if (companies.some(c => c.id === 'fixture-motors')) return;
  for (const directory of ['chinese-car-brands', 'zh/chinese-car-brands']) {
    const file = path.join(root, directory, 'fixture-motors.html');
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes('data-research-only="true"')) fs.unlinkSync(file);
  }
}
function renderResearchLanguage(data, lang) {
  const zh = lang === 'zh', tx = (en, cn) => zh ? cn : en;
  const prefix = `research-${data.id}-${lang}`;
  const numbers = new Map(data.sources.map((source, i) => [source.id, i + 1]));
  const cite = ids => (ids || []).map(id => `<sup class="research-citation"><a href="#${prefix}-source-${numbers.get(id)}" aria-label="${tx('Source', '来源')} ${numbers.get(id)}">[${numbers.get(id)}]</a></sup>`).join('');
  const value = v => text(v === null || v === undefined ? tx('Not publicly disclosed', '未公开披露') : v);
  const body = key => {
    const section = data.sections[key];
    let html = sanitizeResearchHtml(section[lang], data.sources);
    // 已登记的原文链接保留，同时就地添加资料来源编号。
    // 作者写的「[s2]」「[2]」这类引用链接直接换成统一的上标编号，避免同一处显示两次。
    html = html.replace(/<a href="([^"]+)">([\s\S]*?)<\/a>/g, (all, href, label) => {
      const source = data.sources.find(s => esc(s.url) === href);
      if (!source) return all;
      return /^\s*\[\s*s?\d+\s*\]\s*$/i.test(label) ? cite([source.id]) : all + cite([source.id]);
    });
    if (section.source_ids?.length) {
      if (/<\/(p|li|blockquote)>/.test(html)) html = html.replace(/<\/(p|li|blockquote)>/g, (_, tag) => `${cite(section.source_ids)}</${tag}>`);
      else html += cite(section.source_ids);
    }
    // 正文中的表格也提供独立横向滚动区域。
    return html.replace(/<table>/g, '<div class="research-table-scroll" tabindex="0"><table>').replace(/<\/table>/g, '</table></div>');
  };
  const table = (headers, rows, caption) => `<div class="research-table-scroll" tabindex="0" role="region" aria-label="${esc(caption)}"><table><caption>${esc(caption)}</caption><thead><tr>${headers.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const financialColumns = [
    ['fiscal_year', 'Fiscal year', '财年'], ['revenue', 'Revenue', '营收'],
    ['gross_margin_pct', 'Gross margin (%)', '毛利率（%）'], ['net_profit', 'Net profit attributable to parent', '归母净利润'],
    ['rnd', 'R&D', '研发投入'], ['operating_cash_flow', 'Operating cash flow', '经营现金流'],
    ['cash_and_equivalents', 'Cash and equivalents', '现金及等价物'], ['debt_ratio_pct', 'Debt ratio (%)', '资产负债率（%）'],
    ['average_selling_price', 'Average selling price', '单车平均售价'], ['auto_revenue', 'Automotive revenue', '汽车业务收入']
  ].filter(([key], i) => i < 5 || data.financials.rows.some(r => Object.hasOwn(r, key)));
  const content = {
    'key-facts': `<dl class="research-facts">${data.key_facts.map(f => `<div><dt>${text(f[`label_${lang}`])}</dt><dd>${value(f[`value_${lang}`])}${cite(f.source_ids)}${f.period ? `<small>${text(f.period)}</small>` : ''}</dd></div>`).join('')}</dl>`,
    history: `<ol class="research-timeline">${data.history.map(h => `<li><time>${esc(h.date)}</time><p>${text(h[`event_${lang}`])}${cite(h.source_ids)}</p></li>`).join('')}</ol>`,
    brands: table(tx(['Brand', 'Positioning', 'Price band', 'Founded', 'Ownership', 'Status', 'Sources'], ['品牌', '定位', '价格带', '创立年份', '所属主体与持股', '状态', '出处']), data.brands.map(b => [text(`${b.name_zh} / ${b.name_en}`), text(b[`role_${lang}`]), value(b.price_band), value(b.founded), text(b[`owner_note_${lang}`]), text(b.status), cite(b.source_ids)]), tx('Brand portfolio', '品牌矩阵')),
    financials: `<p class="research-meta">${tx('Currency', '币种')}：${text(data.financials.currency)} · ${tx('Unit', '单位')}：${text(data.financials.unit)} · ${tx('Accounting standard', '会计准则')}：${text(data.financials.standard)}</p>${data.financials.rows.length ? table([...financialColumns.map(([, en, cn]) => tx(en, cn)), tx('Sources', '出处')], data.financials.rows.map(r => [...financialColumns.map(([key]) => value(key === 'fiscal_year' || typeof r[key] !== 'number' ? r[key] : r[key].toLocaleString('en-US'))), cite(r.source_ids)]), tx('Reported financial data', '报表财务数据')) : ''}<p>${text(data.financials[`note_${lang}`])}</p>`,
    sources: `<ol class="research-sources">${data.sources.map((s, i) => `<li id="${prefix}-source-${i + 1}"><a href="${esc(s.url)}" rel="noopener noreferrer">${text(s.name)}</a> <span>${tx('Tier', '级别')} ${esc(s.tier)} · <time datetime="${esc(s.date)}">${esc(s.date)}</time></span></li>`).join('')}</ol>`
  };
  return `<div data-lang="${lang}"${zh ? ' hidden' : ''}>
    <header><h2>${tx('Deep dive', '深度研究 Deep dive')}</h2><p class="research-meta">${tx(`AI compiled, as of ${data.as_of}, with original sources`, `AI 整理，截至 ${data.as_of}，附原文出处`)} · <a href="/tips?kind=correction">${tx('Request a correction', '申请更正')}</a></p></header>
    <nav class="research-toc" aria-label="${tx('Deep dive contents', '研究目录')}">${TITLES.map(([key, en, cn]) => `<a href="#${prefix}-${key}">${tx(en, cn)}</a>`).join('')}</nav>
    ${TITLES.map(([key, en, cn]) => `<section class="research-section" id="${prefix}-${key}"><h3>${tx(en, cn)}</h3>${content[key] ?? body(key)}</section>`).join('')}
  </div>`;
}
function renderResearch(data, { placeholder = false } = {}) {
  if (!data) return placeholder ? `<article class="company-research" id="deep-dive"><div data-lang="en"><h2>Deep dive in preparation</h2><p>No data yet</p></div><div data-lang="zh" hidden><h2>深度研究整理中</h2><p>暂无数据</p></div></article>` : '';
  return `<article class="company-research" id="deep-dive">${renderResearchLanguage(data, 'en')}${renderResearchLanguage(data, 'zh')}</article>`;
}
/** 页面标题用的简称：去掉括号里的补充说明，例如「上汽通用五菱（五菱、宝骏）」→「上汽通用五菱」 */
function shortLabel(name) {
  return String(name || '').replace(/\s*[（(][^（）()]*[）)]/g, '').trim() || name;
}

function researchCompanies(brands, records) {
  const result = brands.map(b => ({ ...b, hasResearch: records.has(b.id) }));
  const known = new Set(brands.map(b => b.id));
  const entries = [...NEW_COMPANIES];
  if (records.has('fixture-motors')) entries.push(['fixture-motors', 'Fixture Motors', '示例汽车']);
  for (const [id, name, cn] of entries) {
    if (known.has(id)) continue;
    const data = records.get(id);
    result.push({ id, shortName: shortLabel(name), shortCn: shortLabel(cn), name: data ? decodeHtmlEntities(data.name_en) : name, cn: data ? decodeHtmlEntities(data.name_zh) : cn, category: 'research', researchOnly: true, hasResearch: !!data,
      desc_en: data ? leadText(data.sections.overview.en) : 'Deep dive in preparation. No data yet.',
      desc_zh: data ? leadText(data.sections.overview.zh) : '深度研究整理中，暂无数据。',
      founded: '—', hq: '—', focus: '—', colorA: '#1a1a1a', colorB: '#3a3a3a' });
  }
  return result;
}
module.exports = { NEW_COMPANIES, removeStaleResearchPages, loadResearch, renderResearch, renderResearchLanguage, researchCompanies, leadText };
