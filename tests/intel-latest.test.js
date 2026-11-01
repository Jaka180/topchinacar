// 首页「人事变动」插槽：按公告日取最新 N 条，不足 N 条有几条显示几条，没有数据显示「暂无数据」。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function render(appointments, n = 3, language = 'zh') {
  const slot = { innerHTML: '', getAttribute: name => (name === 'data-intel-latest' ? String(n) : null) };
  const document = {
    readyState: 'complete', documentElement: {},
    getElementById: () => null,
    querySelectorAll: sel => (sel === '[data-intel-latest]' ? [slot] : []),
    addEventListener() {}
  };
  const context = vm.createContext({
    document, window: {}, location: { pathname: '/zh/', search: '' }, getLang: () => language,
    fetch: async () => ({ ok: true, json: async () => ({ appointments, analyses: [] }) })
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/intel.js'), 'utf8'), context);
  for (let i = 0; i < 10; i++) await Promise.resolve();
  return slot.innerHTML;
}

const item = (id, date, person) => ({ id, announced_on: date, company_id: 'saic', person_zh: person, person_en: person, change: 'appointed' });

test('超过 3 条时只显示最新 3 条，按公告日从新到旧', async () => {
  const html = await render([item('a', '2026-10-01', '甲'), item('b', '2026-10-28', '乙'), item('c', '2026-10-15', '丙'), item('d', '2026-10-20', '丁')]);
  assert.equal((html.match(/class="intel-move /g) || []).length, 3);
  assert.ok(html.indexOf('乙') < html.indexOf('丁') && html.indexOf('丁') < html.indexOf('丙'));
  assert.doesNotMatch(html, /甲/);
});

test('只有 1 条时显示 1 条', async () => {
  const html = await render([item('a', '2026-10-28', '葛大维')]);
  assert.equal((html.match(/class="intel-move /g) || []).length, 1);
  assert.match(html, /葛大维/);
});

test('没有数据时显示暂无数据', async () => {
  assert.match(await render([]), /暂无数据/);
});
