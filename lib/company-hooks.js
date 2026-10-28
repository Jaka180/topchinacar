// 品牌页接人事情报和销量。lib/people.js、lib/sales.js 可能还没合进来，缺了不能让构建失败。
// 网站品牌 id 和 radar 公司 id（src/config/companies.ts）不完全一样：子品牌归到集团公司，对不上返回 null。

const BRAND_TO_COMPANY = {
  byd: 'byd',
  denza: 'byd',
  yangwang: 'byd',
  fangchengbao: 'byd',

  geely: 'geely',
  zeekr: 'geely',
  lynkco: 'geely',
  polestar: 'geely',
  volvo: 'geely',
  lotus: 'geely',

  chery: 'chery',
  omoda: 'chery',
  jaecoo: 'chery',
  exeed: 'chery',

  gwm: 'gwm',
  haval: 'gwm',
  wey: 'gwm',
  tank: 'gwm',
  ora: 'gwm',

  saic: 'saic',
  mg: 'saic',
  maxus: 'saic',
  im: 'saic',

  changan: 'changan',
  gac: 'gac',
  dongfeng: 'dongfeng',
  voyah: 'dongfeng',
  mhero: 'dongfeng',
  faw: 'faw',
  baic: 'baic',

  nio: 'nio',
  xpeng: 'xpeng',
  leapmotor: 'leapmotor',
  xiaomi: 'xiaomi',
  li: 'liauto'
};

const loaded = new Map();

function radarCompanyId(brandId) {
  const id = BRAND_TO_COMPANY[String(brandId || '')];
  return id || null;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadFunction(moduleName, exportName) {
  const key = `${moduleName}#${exportName}`;
  if (loaded.has(key)) return loaded.get(key);
  let fn = null;
  try {
    const mod = require(moduleName);
    if (mod && typeof mod[exportName] === 'function') fn = mod[exportName];
  } catch (error) {
    const missing = error && (error.code === 'MODULE_NOT_FOUND' || /Cannot find module/.test(String(error.message || error)));
    if (!missing) {
      console.warn(`! ${moduleName} 加载失败，公司页改用占位：${error.message}`);
    }
  }
  loaded.set(key, fn);
  return fn;
}

function callHook(fn, companyId, lang, label) {
  try {
    const value = fn(companyId, lang);
    return value == null ? '' : String(value);
  } catch (error) {
    console.warn(`! ${label}(${companyId}, ${lang}) 失败：${error.message}`);
    return '';
  }
}

function peoplePlaceholder(companyId) {
  const id = escapeHtml(companyId);
  return `<div data-intel-company="${id}"></div><p><span data-lang="en">People intel is loading / none yet</span><span data-lang="zh" hidden>人事情报加载中 / 暂无</span></p><noscript>人事情报加载中 / 暂无</noscript>`;
}

function bilingualBlock(companyId, attrName, en, zh) {
  return `<div ${attrName}="${escapeHtml(companyId)}"><div data-lang="en">${en}</div><div data-lang="zh" hidden>${zh}</div></div>`;
}

// 没有对应的 radar 公司时返回空字符串，详情页不渲染人事区。
// 模块或函数还不在时返回占位，合并进 lib/people.js 后自动改走正式函数。
function peopleBlockForBrand(brandId) {
  const companyId = radarCompanyId(brandId);
  if (!companyId) return '';
  const fn = loadFunction('./people', 'intelBlockForCompany');
  if (!fn) return peoplePlaceholder(companyId);
  const en = callHook(fn, companyId, 'en', 'intelBlockForCompany').trim();
  const zh = callHook(fn, companyId, 'zh', 'intelBlockForCompany').trim();
  if (!en && !zh) return peoplePlaceholder(companyId);
  return bilingualBlock(companyId, 'data-intel-company', en, zh);
}

// 销量模块不存在，或品牌没有 radar 公司 id 时，返回 show:false，详情页不渲染这一区。
function salesBlockForBrand(brandId) {
  const companyId = radarCompanyId(brandId);
  if (!companyId) return { show: false, html: '' };
  const fn = loadFunction('./sales', 'salesBlockForCompany');
  if (!fn) return { show: false, html: '' };
  const en = callHook(fn, companyId, 'en', 'salesBlockForCompany').trim();
  const zh = callHook(fn, companyId, 'zh', 'salesBlockForCompany').trim();
  if (!en && !zh) return { show: true, html: '' };
  return { show: true, html: bilingualBlock(companyId, 'data-sales-company', en, zh) };
}

module.exports = {
  BRAND_TO_COMPANY,
  radarCompanyId,
  peopleBlockForBrand,
  salesBlockForBrand
};
