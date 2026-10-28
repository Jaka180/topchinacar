const d = require('./gwm.json');
const { plainText } = require('../../lib/research-validation');
const c = { en: [], zh: [] };
function collect(v) {
  if (!v || typeof v !== 'object') return;
  for (const [k, val] of Object.entries(v)) {
    const lang = k === 'en' || k.endsWith('_en') ? 'en' : k === 'zh' || k.endsWith('_zh') ? 'zh' : null;
    if (lang && typeof val === 'string' && !k.startsWith('name_')) c[lang].push(plainText(val));
    else if (typeof val === 'object') collect(val);
  }
}
collect({ sections: d.sections, key_facts: d.key_facts, history: d.history, brands: d.brands, financials: d.financials });
const zh = (c.zh.join(' ').match(/\p{Script=Han}/gu) || []).length;
const en = (c.en.join(' ').match(/[A-Za-z0-9]+(?:['\u2019-][A-Za-z0-9]+)*/g) || []).length;
console.log('zh=' + zh + ' en=' + en);
