// Temporary shim: (1) provides the missing ./html-entities dependency and
// (2) prints exact word counts after validation. Deleted after use.
const Module = require('module');
const origLoad = Module._load;

function decodeHtmlEntities(value) {
  return String(value == null ? '' : value).replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[0-9a-f]+);/gi, function (entity) {
    const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
    const n = entity.charAt(2).toLowerCase() === 'x' ? parseInt(entity.slice(3), 16) : parseInt(entity.slice(2), 10);
    return n <= 0x10ffff ? String.fromCodePoint(n) : '';
  });
}
function plainText(value) {
  return decodeHtmlEntities(String(value == null ? '' : value).replace(/<\/?(?:p|h[34]|ul|ol|li|blockquote|table|thead|tbody|tr|th|td)\b[^>]*>/gi, ' ').replace(/<[^>]*>/g, ''));
}
function printCounts(data) {
  const counts = { en: [], zh: [] };
  function collect(v) {
    if (!v || typeof v !== 'object') return;
    for (const [k, value] of Object.entries(v)) {
      const lang = k === 'en' || k.endsWith('_en') ? 'en' : k === 'zh' || k.endsWith('_zh') ? 'zh' : null;
      if (lang && typeof value === 'string' && !k.startsWith('name_')) counts[lang].push(plainText(value));
      else if (typeof value === 'object') collect(value);
    }
  }
  collect({ sections: data.sections, key_facts: data.key_facts, history: data.history, brands: data.brands, financials: data.financials });
  const zh = (counts.zh.join(' ').match(/\p{Script=Han}/gu) || []).length;
  const en = (counts.en.join(' ').match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length;
  console.log(`[counts] zh=${zh} en=${en}`);
}

Module._load = function (request, parent, isMain) {
  if (request === './html-entities') {
    return { decodeHtmlEntities };
  }
  if (request === '../lib/research-validation') {
    const mod = origLoad.apply(this, arguments);
    const origCheckFile = mod.checkFile;
    mod.checkFile = function (file) {
      const result = origCheckFile(file);
      if (result && result.data) printCounts(result.data);
      return result;
    };
    return mod;
  }
  return origLoad.apply(this, arguments);
};
