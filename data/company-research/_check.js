#!/usr/bin/env node
// Temporary standalone validator (replica of lib/research-validation.js with the
// missing decode() inlined). Deleted after use.
const fs = require('node:fs');
const path = require('node:path');

const decode = value => String(value ?? '').replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[0-9a-f]+);/gi, entity => {
  const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
  const n = entity[2].toLowerCase() === 'x' ? parseInt(entity.slice(3), 16) : parseInt(entity.slice(2), 10);
  return n <= 0x10ffff ? String.fromCodePoint(n) : '';
});

const SECTION_KEYS = ['overview', 'current', 'leadership', 'competition', 'outlook', 'risks'];
const TAGS = new Set('p h3 h4 strong em ul ol li blockquote table thead tbody tr th td a'.split(' '));
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plainText = value => decode(String(value ?? '').replace(/<\/?(?:p|h[34]|ul|ol|li|blockquote|table|thead|tbody|tr|th|td)\b[^>]*>/gi, ' ').replace(/<[^>]*>/g, ''));
function httpsUrl(value) {
  if (typeof value !== 'string' || !value.startsWith('https://') || /[\s<>"']/.test(value)) return false;
  try { const u = new URL(value); return u.protocol === 'https:' && !!u.hostname && !u.username && !u.password; } catch { return false; }
}
function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function inspectHtml(value, urls) {
  const errors = [], links = [], stack = [];
  const tokens = String(value).split(/(<[^>]*>)/g);
  let html = '';
  for (const token of tokens) {
    if (!token.startsWith('<')) { html += escapeHtml(decode(token)); continue; }
    const tag = token.match(/^<(\/)?([a-z][a-z0-9]*)([^>]*)>$/);
    if (!tag || !TAGS.has(tag[2])) { errors.push(`不允许的 HTML 标签：${token}`); continue; }
    const [, closing, name, attrs] = tag;
    if (closing) {
      if (attrs || stack.at(-1) !== name) { errors.push(`HTML 标签未正确闭合：${token}`); continue; }
      stack.pop(); html += `</${name}>`; continue;
    }
    if (name === 'a') {
      const match = attrs.match(/^ href="([^"]+)"$/);
      const href = match && decode(match[1], true);
      if (!href || !httpsUrl(href) || !urls.has(href)) { errors.push('a 只能包含 sources 中的 https href，且不能有其他属性'); continue; }
      links.push(href); html += `<a href="${escapeHtml(href)}">`;
    } else {
      if (attrs.trim()) { errors.push(`${name} 不允许属性（含 on*）`); continue; }
      html += `<${name}>`;
    }
    stack.push(name);
  }
  if (stack.length) errors.push(`HTML 标签未闭合：${stack.join(', ')}`);
  if (tokens.some((t, i) => i % 2 === 0 && /[<>]/.test(t))) errors.push('HTML 含有非法尖括号');
  return { errors, html, links };
}
function researchParagraphs(html) {
  const paragraphs = [];
  const frame = name => ({ name, content: '', hasContent: false, hasChildren: false });
  const stack = [frame('')];
  function flush(current) {
    if (current.content.trim()) {
      if (!/^h[34]$/.test(current.name)) paragraphs.push(current.content);
      current.hasContent = true;
    }
    current.content = '';
  }
  for (const token of html.split(/(<\/?(?:p|h[34]|ul|ol|li|blockquote|table|thead|tbody|tr|th|td)>)/g)) {
    const block = token.match(/^<(\/)?(p|h[34]|ul|ol|li|blockquote|table|thead|tbody|tr|th|td)>$/);
    const current = stack.at(-1);
    if (!block) { current.content += token; continue; }
    flush(current);
    if (block[1]) {
      if (!current.hasContent && !current.hasChildren && /^(?:p|li|th|td)$/.test(current.name)) paragraphs.push('');
      if (stack.length > 1) stack.pop();
    } else {
      current.hasChildren = true;
      stack.push(frame(block[2]));
    }
  }
  flush(stack.at(-1));
  return paragraphs.length ? paragraphs : [html];
}
function validateResearch(data, filename) {
  const errors = [], warnings = [];
  const object = v => v && typeof v === 'object' && !Array.isArray(v);
  if (!object(data)) return { errors: ['根节点必须是对象'], warnings };
  const string = (v, field, nullable = false) => { if (!(nullable && v === null) && (typeof v !== 'string' || !v.trim())) errors.push(`${field} 必须是非空字符串${nullable ? '或 null' : ''}`); };
  const array = (v, field) => { if (!Array.isArray(v)) { errors.push(`${field} 必须是数组`); return []; } return v; };
  const numeric = (v, field) => { if (v !== null && (typeof v !== 'number' || !Number.isFinite(v))) errors.push(`${field} 必须是数字或 null`); };
  for (const field of ['id', 'name_en', 'name_zh', 'as_of']) string(data[field], field);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.id)) errors.push('id 格式非法');
  if (filename && data.id !== path.basename(filename, '.json')) errors.push('id 必须与文件名一致');
  if (!validDate(data.as_of)) errors.push('as_of 必须是合法的 YYYY-MM-DD 日期');
  if (data.ai_generated !== true) errors.push('ai_generated 必须为 true');
  const sources = array(data.sources, 'sources'), sourceMap = new Map();
  if (!sources.length) errors.push('sources 不能为空');
  sources.forEach((s, i) => {
    if (!object(s)) { errors.push(`sources[${i}] 必须是对象`); return; }
    for (const key of ['id', 'name', 'url', 'date', 'tier']) string(s[key], `sources[${i}].${key}`);
    if (sourceMap.has(s.id)) errors.push(`重复的来源 id：${s.id}`);
    sourceMap.set(s.id, s);
    if (!httpsUrl(s.url)) errors.push(`sources[${i}].url 必须是 https URL`);
    if (!validDate(s.date)) errors.push(`sources[${i}].date 日期非法`);
    if (!['A', 'B', 'C'].includes(s.tier)) errors.push(`sources[${i}].tier 必须为 A/B/C`);
  });
  const urls = new Set(sources.filter(object).map(s => s.url));
  function refs(ids, field, required = true, financial = false) {
    if (ids === undefined && !required) return;
    const list = array(ids, field);
    if (!list.length) errors.push(`${field} 不能为空`);
    for (const id of list) {
      if (typeof id !== 'string' || !sourceMap.has(id)) errors.push(`${field} 引用了不存在的来源：${id}`);
      else if (financial && sourceMap.get(id).tier !== 'A') errors.push(`${field} 财务数据只能引用 A 级来源`);
    }
    if (list.length && list.every(id => sourceMap.get(id)?.tier === 'C')) errors.push(`${field} 不能仅以 C 级来源支持事实`);
  }
  function entries(key, fields, numbers = []) {
    array(data[key], key).forEach((item, i) => {
      if (!object(item)) { errors.push(`${key}[${i}] 必须是对象`); return; }
      const p = `${key}[${i}]`;
      fields.forEach(f => string(item[f], `${p}.${f}`, ['value_en', 'value_zh', 'period', 'price_band'].includes(f)));
      numbers.forEach(f => numeric(item[f], `${p}.${f}`));
      refs(item.source_ids, `${p}.source_ids`);
    });
  }
  entries('key_facts', ['label_en', 'label_zh', 'value_en', 'value_zh', 'period']);
  entries('history', ['date', 'event_en', 'event_zh']);
  entries('brands', ['name_en', 'name_zh', 'role_en', 'role_zh', 'price_band', 'owner_note_en', 'owner_note_zh', 'status'], ['founded']);
  for (const [i, h] of (Array.isArray(data.history) ? data.history : []).entries()) {
    if (object(h) && !(/^\d{4}$/.test(h.date) || (/^\d{4}-\d{2}$/.test(h.date) && validDate(`${h.date}-01`)) || validDate(h.date))) errors.push(`history[${i}].date 日期非法`);
  }
  const f = object(data.financials) ? data.financials : {};
  if (!object(data.financials)) errors.push('financials 必须是对象');
  ['currency', 'unit', 'standard', 'note_en', 'note_zh'].forEach(k => string(f[k], `financials.${k}`));
  array(f.rows, 'financials.rows').forEach((row, i) => {
    if (!object(row)) { errors.push(`financials.rows[${i}] 必须是对象`); return; }
    for (const k of ['fiscal_year', 'revenue', 'gross_margin_pct', 'net_profit', 'rnd']) numeric(row[k], `financials.rows[${i}].${k}`);
    for (const k of Object.keys(row).filter(k => !['source_ids', 'fiscal_year', 'revenue', 'gross_margin_pct', 'net_profit', 'rnd'].includes(k))) numeric(row[k], `financials.rows[${i}].${k}`);
    refs(row.source_ids, `financials.rows[${i}].source_ids`, true, true);
  });
  const sections = object(data.sections) ? data.sections : {};
  if (!object(data.sections)) errors.push('sections 必须是对象');
  for (const key of SECTION_KEYS) {
    const section = sections[key];
    if (!object(section)) { errors.push(`sections.${key} 必须是对象`); continue; }
    refs(section.source_ids, `sections.${key}.source_ids`, false);
    for (const lang of ['en', 'zh']) {
      string(section[lang], `sections.${key}.${lang}`);
      if (typeof section[lang] !== 'string') continue;
      const result = inspectHtml(section[lang], urls);
      result.errors.forEach(e => errors.push(`sections.${key}.${lang}: ${e}`));
      if (!section.source_ids?.length) for (const p of researchParagraphs(result.html)) {
        const links = inspectHtml(p, urls).links;
        if (!links.length) errors.push(`sections.${key}.${lang} 每段必须有出处（source_ids 或来源链接）`);
        else if (links.every(url => sources.filter(object).find(s => s.url === url)?.tier === 'C')) errors.push(`sections.${key}.${lang} 不能仅引用 C 级来源`);
      }
    }
  }
  function walk(value, key = '') {
    if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${key}[${i}]`));
    if (object(value)) return Object.entries(value).forEach(([k, v]) => {
      if (k === 'source_ids') refs(v, `${key}.source_ids`);
      else walk(v, `${key}.${k}`);
    });
    if (typeof value === 'string' && !/\.(?:url|id|date|as_of)$/.test(key)) {
      const text = plainText(value);
      const match = text.match(/买入|卖出|目标价|增持|减持|评级|值得投资|投资建议|\b(?:buy\s+rating|sell\s+rating|target\s+price|overweight|underweight|investment\s+advice|strong\s+buy)\b/i);
      if (match) errors.push(`${key} 含投资建议用语：${match[0]}`);
      if (/据悉|业内人士称|遥遥领先|颠覆|王者/.test(text)) errors.push(`${key} 含无出处或宣传用语`);
    }
  }
  walk(data);
  const counts = { en: [], zh: [] };
  function collect(v) {
    if (!v || typeof v !== 'object') return;
    for (const [k, value] of Object.entries(v)) {
      const lang = k === 'en' || k.endsWith('_en') ? 'en' : k === 'zh' || k.endsWith('_zh') ? 'zh' : null;
      if (lang && typeof value === 'string' && !k.startsWith('name_')) counts[lang].push(plainText(value));
      else if (typeof value === 'object') collect(value);
    }
  }
  collect({ sections, key_facts: data.key_facts, history: data.history, brands: data.brands, financials: f });
  const zh = (counts.zh.join(' ').match(/\p{Script=Han}/gu) || []).length;
  const en = (counts.en.join(' ').match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length;
  if (zh < 4000 || zh > 8000) warnings.push(`中文正文 ${zh} 字，建议 4000–8000 字`);
  if (en < 2500 || en > 5000) warnings.push(`英文正文 ${en} 词，建议 2500–5000 词`);
  return { errors: [...new Set(errors)], warnings };
}

const file = process.argv[2];
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const { errors, warnings } = validateResearch(data, file);
errors.forEach(m => console.error(`${file}: 错误：${m}`));
warnings.forEach(m => console.warn(`${file}: 警告：${m}`));
if (errors.length) process.exitCode = 1;
else console.log(`${file}: 校验通过`);
