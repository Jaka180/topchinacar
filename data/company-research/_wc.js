const d = require('./gac.json');
const dec = s => String(s).replace(/&(amp|quot|apos|lt|gt|#\d+|#x[0-9a-f]+);/gi, e => ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[e.slice(1, -1).toLowerCase()] || ''));
const pt = v => dec(String(v ?? '').replace(/<\/?(?:p|h[34]|ul|ol|li|blockquote|table|thead|tbody|tr|th|td)\b[^>]*>/gi, ' ').replace(/<[^>]*>/g, ''));
const c = { en: [], zh: [] };
(function col(v) {
  if (!v || typeof v !== 'object') return;
  for (const [k, x] of Object.entries(v)) {
    const l = k === 'en' || k.endsWith('_en') ? 'en' : k === 'zh' || k.endsWith('_zh') ? 'zh' : null;
    if (l && typeof x === 'string' && !k.startsWith('name_')) c[l].push(pt(x));
    else if (typeof x === 'object') col(x);
  }
})({ sections: d.sections, key_facts: d.key_facts, history: d.history, brands: d.brands, financials: d.financials });
const zh = (c.zh.join(' ').match(/\p{Script=Han}/gu) || []).length;
const en = (c.en.join(' ').match(/[A-Za-z0-9]+(?:['\u2019-][A-Za-z0-9]+)*/g) || []).length;
console.log('zh=' + zh + ' en=' + en);
