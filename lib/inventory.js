// 中国汽车公司与品牌总清单（data/company-inventory.json）：决定「汽车公司」列表怎么分组、哪些公司要单独建研究页。
// 已有网站品牌页（js/data.js）的条目在清单里不写 en/zh，只用来分组；写了 en/zh 的是没有品牌页、需要新建研究页的公司或品牌。
const fs = require('node:fs');
const path = require('node:path');

const INVENTORY = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data', 'company-inventory.json'), 'utf8'));

/** 分组定义：[{ id, en, zh, ids }]，组内顺序与清单一致 */
const GROUP_DEFS = INVENTORY.groups.map(g => ({ id: g.id, en: g.en, zh: g.zh, ids: INVENTORY.entities.filter(e => e.group === g.id).map(e => e.id) }));

/** 需要新建研究页的条目：[id, 英文名, 中文名] */
const NEW_COMPANIES = INVENTORY.entities.filter(e => e.en && e.zh).map(e => [e.id, e.en, e.zh]);

module.exports = { INVENTORY, GROUP_DEFS, NEW_COMPANIES };
