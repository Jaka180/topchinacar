'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const sales = require('../lib/sales');

// 示例只在当前测试进程里加载，不改生产数据或构建产物。
const previousFile = process.env.SALES_FILE;
let data;
try {
  process.env.SALES_FILE = 'tests/fixtures/sales.sample.json';
  data = sales.loadSalesData();
} finally {
  if (previousFile === undefined) delete process.env.SALES_FILE;
  else process.env.SALES_FILE = previousFile;
}

function render(sample = data) {
  return sales.renderSalesPages(sample, {
    pageHTML: (_route, _meta, main) => main,
    zhChrome: main => main
  }).en;
}
const html = render();

test('海外缺失只显示总量，明确说明缺失，不推算国内部分', () => {
  const geely = html.match(/data-sales-company="geely"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/)?.[1];
  assert.ok(geely);
  const august = geely.match(/<div class="sales-bar[^\"]*"[^>]*title="2026-08[^\"]*"[^>]*>[\s\S]*?<\/div>/)?.[0];
  assert.ok(august);
  assert.match(august, /sales-bar--total-only/);
  assert.match(august, /235,000/);
  assert.match(august, /海外暂无数据/);
  assert.doesNotMatch(august, /sales-bar-overseas/);
  assert.match(geely, /海外暂无数据：2026-08/);
  assert.match(geely, /不推算国内销量/);
});

test('海外已知时仍显示国内与海外拆分', () => {
  const september = html.match(/<div class="sales-bar[^\"]*"[^>]*title="2026-09 · 250,000[^\"]*"[^>]*>[\s\S]*?<\/div>/)?.[0];
  assert.ok(september);
  assert.doesNotMatch(september, /sales-bar--total-only/);
  assert.match(september, /sales-bar-overseas" style="height:18%"/);
});

test('月度表按公司名排序，不显示名次，公司公告表上方明确提示不可横向比较', () => {
  // 让字母靠后的公司销量更高，避免字母序与销量序碰巧相同。
  const sample = structuredClone(data);
  const monthly = sample.byMonth.get('2026-09');
  monthly.find(row => row.companyId === 'byd').monthTotal = 0;
  monthly.find(row => row.companyId === 'chery').monthTotal = 500000;
  const rendered = render(sample);
  const september = rendered.split('data-sales-month="2026-09"')[1]?.split('data-sales-month="2026-08"')[0];
  assert.ok(september);
  const groups = [...september.matchAll(/data-sales-basis="([^"]*)"[^>]*>([\s\S]*?)<\/tbody>/g)];
  assert.equal(groups.length, 3);
  const expected = {
    company_report: ['BYD', 'Chery'],
    group_report: ['Geely'],
    listed_company: ['Sail Auto']
  };
  for (const [, basis, table] of groups) {
    const names = [...table.matchAll(/<tr>\s*<td data-sort-value="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(names, expected[basis]);
    assert.match(table, /data-sales-sortable/);
    assert.match(table, /data-sort="company" aria-sort="ascending"/);
    assert.match(table, /data-sort="month_total" aria-sort="none"/);
    assert.doesNotMatch(table, /data-sort="rank"|>排名<|>Rank</);
    if (basis === 'company_report') {
      const warning = '各公司按自己公告的口径披露（集团、上市公司或品牌不一），数字不能直接横向比较，表格不是排名';
      assert.ok(table.includes(warning));
      assert.ok(table.indexOf(warning) < table.indexOf('<thead>'));
      assert.match(table, /Each company reports on its own announced basis/);
      assert.match(table, /this table is not a ranking/);
    }
  }
});

test('真实零值保留 0、零高度和 0 辆提示，null 才是缺失', () => {
  const zeroRow = data.rows.find(row => row.companyId === 'byd' && row.period === '2026-07');
  const missingRow = data.rows.find(row => row.companyId === 'byd' && row.period === '2026-06');
  assert.equal(zeroRow.monthTotal, 0);
  assert.equal(zeroRow.monthOverseas, 0);
  assert.equal(missingRow.monthTotal, null);
  assert.match(html, /data-sort-value="0">0<\/td>/);
  assert.match(html, /data-sort-value="">—<\/td>/);
  const zero = html.match(/<div class="sales-bar[^\"]*"[^>]*title="2026-07[^\"]*"[^>]*>/)?.[0];
  assert.ok(zero);
  assert.match(zero, /sales-bar--zero/);
  assert.match(zero, /style="height:0%"/);
  assert.match(zero, /0 units \/ 0 辆/);
  assert.doesNotMatch(zero, /sales-bar--missing|no data|暂无数据/);
  const missing = html.match(/<div class="sales-bar[^\"]*"[^>]*title="2026-06[^\"]*"[^>]*>/)?.[0];
  assert.ok(missing);
  assert.match(missing, /sales-bar--missing/);
  assert.match(missing, /no data \/ 暂无数据/);
  assert.doesNotMatch(missing, /sales-bar--zero|0 辆/);

  // 窗口里全为零或缺失时，也不能把真实零值归为缺失。
  const sample = structuredClone(data);
  sample.series.set('byd', sample.series.get('byd').map(slot => ({
    ...slot, total: slot.period === '2026-07' ? 0 : null, overseas: null
  })));
  const zeroOnly = render(sample);
  assert.match(zeroOnly, /sales-bar--zero" style="height:0%" title="2026-07 · 0 units \/ 0 辆/);
  assert.match(zeroOnly, /区间内最高月份：2026 年 7 月，0 辆/);
});

test('车型榜只在口径明确且统一时保留名次', () => {
  assert.match(html, /data-sort="rank" aria-sort="ascending"/);
  for (const [en, zh] of [
    ['company_report', '公司公告'], ['Company report', '公司公告'], ['', ''],
    ['Exchange filing', '交易所公告'], ['Unknown basis', '未知口径'],
    ['Domestic retail', '批发']
  ]) {
    const sample = structuredClone(data);
    Object.assign(sample.rankings[0], { basisEn: en, basisZh: zh });
    const rendered = render(sample);
    assert.doesNotMatch(rendered, /data-sort="rank"/);
    assert.match(rendered, /车型销量（不排名）/);
    assert.match(rendered, /BYD Qin PLUS/);
  }
});

test('读者点击表头仍可升降序排序，零值参与排序，缺失值始终最后', () => {
  const rows = [
    { name: 'Missing', value: '' }, { name: 'Zero', value: '0' }, { name: 'Positive', value: '20' }
  ].map(({ name, value }) => ({ name, cells: [{ getAttribute: () => value }] }));
  const button = { addEventListener: (_event, listener) => { button.click = listener; } };
  const attrs = { 'data-sort': 'month_total', 'aria-sort': 'none' };
  const th = {
    getAttribute: key => attrs[key],
    setAttribute: (key, value) => { attrs[key] = value; },
    querySelector: () => button
  };
  th.parentNode = { children: [th] };
  const tbody = {
    rows,
    appendChild: row => { rows.splice(rows.indexOf(row), 1); rows.push(row); }
  };
  const table = { querySelector: () => tbody, querySelectorAll: () => [th] };
  vm.runInNewContext(fs.readFileSync(require.resolve('../js/sales.js'), 'utf8'), {
    document: {
      readyState: 'complete', querySelectorAll: () => [table],
      getElementById: () => null, querySelector: () => null
    }
  });
  button.click();
  assert.deepEqual(rows.map(row => row.name), ['Zero', 'Positive', 'Missing']);
  assert.equal(attrs['aria-sort'], 'ascending');
  button.click();
  assert.deepEqual(rows.map(row => row.name), ['Positive', 'Zero', 'Missing']);
  assert.equal(attrs['aria-sort'], 'descending');
});

test('更正入口固定指向约定表单', () => {
  assert.match(html, /href="\/tips\?kind=correction"/);
  assert.doesNotMatch(html, /\/contact\?kind=correction/);
});
