const Module = require('module');
function decodeHtmlEntities(value) {
  const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  return String(value).replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[0-9a-f]+);/gi, entity => {
    if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
    const n = entity[2].toLowerCase() === 'x' ? parseInt(entity.slice(3), 16) : parseInt(entity.slice(2), 10);
    return Number.isFinite(n) && n <= 0x10ffff ? String.fromCodePoint(n) : '';
  });
}
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === './html-entities') return { decodeHtmlEntities };
  return origLoad.call(this, request, parent, isMain);
};
const { checkFile } = require('../lib/research-validation.js');
const r = checkFile('data/company-research/saic.json');
r.errors.forEach(e => console.error('错误：' + e));
r.warnings.forEach(w => console.warn('警告：' + w));
if (r.errors.length) { console.log('FAIL: ' + r.errors.length + ' errors'); process.exitCode = 1; }
else console.log('校验通过');
