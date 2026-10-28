// 每个反例从合法虚构样本复制，避免无关错误掩盖被测规则。
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const fixture = require('./fixtures/company-research/fixture-motors.json');
const { validateResearch, sanitizeResearchHtml, checkFile, plainText } = require('../lib/research-validation');
const { decodeHtmlEntities } = require('../lib/html-entities');
const { NEW_COMPANIES, loadResearch, renderResearch, researchCompanies } = require('../lib/company-research');
const { companiesIndexHTML } = require('../lib/companies');
const copy = () => structuredClone(fixture);
const check = data => validateResearch(data, 'fixture-motors.json');
function invalid(name, mutate, pattern) {
  test(name, () => { const data = copy(); mutate(data); const result = check(data); assert.ok(result.errors.length); assert.match(result.errors.join('\n'), pattern); });
}
test('合法样本只有字数警告', () => {
  const result = check(fixture);
  assert.deepEqual(result.errors, []);
  assert.equal(result.warnings.length, 2);
});
for (const field of ['id', 'name_en', 'name_zh', 'as_of', 'ai_generated', 'key_facts', 'history', 'brands', 'financials', 'sections', 'sources']) {
  invalid(`必填根字段 ${field}`, d => delete d[field], /必须|格式|日期|不能为空/);
}
for (const field of ['revenue', 'gross_margin_pct', 'net_profit', 'rnd', 'fiscal_year']) {
  invalid(`财务必填数字 ${field}`, d => delete d.financials.rows[0][field], /数字或 null/);
  invalid(`财务数字不能是字符串 ${field}`, d => d.financials.rows[0][field] = '123', /数字或 null/);
}
invalid('文件名必须与 id 一致', d => d.id = 'another-id', /文件名/);
for (const date of ['2026-02-29', '2026-13-01', '2026-2-01', 'not-a-date', null]) {
  invalid(`截止日期非法 ${date}`, d => d.as_of = date, /as_of/);
}
test('闰年合法', () => { const d = copy(); d.as_of = '2024-02-29'; assert.deepEqual(check(d).errors, []); });
invalid('来源日期非法', d => d.sources[0].date = '2026-02-30', /date/);
invalid('来源不能重名', d => d.sources.push({ ...d.sources[0] }), /重复/);
for (const url of ['http://example.com', 'javascript:alert(1)', 'https://', 'https://user:pass@example.com', 'https://example.com/"']) {
  invalid(`来源 HTTPS ${url}`, d => d.sources[0].url = url, /url/);
}
invalid('来源 tier', d => d.sources[0].tier = 'D', /A\/B\/C/);
for (const field of ['key_facts', 'history', 'brands']) {
  invalid(`${field} 未知引用`, d => d[field][0].source_ids = ['missing'], /不存在/);
  invalid(`${field} 无出处`, d => delete d[field][0].source_ids, /source_ids/);
}
invalid('章节未知引用', d => d.sections.current.source_ids = ['missing'], /不存在/);
invalid('扩展结构也检查引用', d => d.extra = { source_ids: ['missing'] }, /不存在/);
invalid('财务必须是 A 级', d => d.sources[0].tier = 'B', /财务数据只能引用 A/);
invalid('事实不可仅靠 C 级', d => d.sources[0].tier = 'C', /不能仅/);
invalid('数字字段不接受字符串', d => d.brands[0].founded = '2020', /数字或 null/);
invalid('可选财务数字也校验', d => d.financials.rows[0].operating_cash_flow = '123', /数字或 null/);
invalid('缺少章节', d => delete d.sections.outlook, /sections.outlook/);
invalid('章节必须双语', d => delete d.sections.current.zh, /sections.current.zh/);
invalid('段落必须有出处', d => { delete d.sections.current.source_ids; }, /每段/);
invalid('每一段均须来源', d => { delete d.sections.current.source_ids; d.sections.current.en = '<p><a href="https://example.com/fixture-motors">Source</a></p><p>No source.</p>'; }, /每段/);
const paragraphLayouts = [
  ['引用块内多段', (a, b) => `<blockquote><p>${a}</p><p>${b}</p></blockquote>`],
  ['嵌套引用块', (a, b) => `<blockquote><p>${a}</p><blockquote><p>${b}</p></blockquote></blockquote>`],
  ['无序列表各项', (a, b) => `<ul><li>${a}</li><li>${b}</li></ul>`],
  ['有序列表项内多段', (a, b) => `<ol><li><p>${a}</p><p>${b}</p></li></ol>`],
  ['嵌套有序无序列表', (a, b) => `<ul><li><p>${a}</p><ol><li>${b}</li></ol></li></ul>`],
  ['列表项直接正文与子列表', (a, b) => `<ol><li>${a}<ul><li>${b}</li></ul></li></ol>`],
  ['列表内引用块', (a, b) => `<ul><li><blockquote><p>${a}</p><p>${b}</p></blockquote></li></ul>`],
  ['表格单元格', (a, b) => `<table><tbody><tr><td>${a}</td><td>${b}</td></tr></tbody></table>`],
  ['单元格内多段', (a, b) => `<table><tbody><tr><td><p>${a}</p><p>${b}</p></td></tr></tbody></table>`],
  ['引用块直接正文与段落', (a, b) => `<blockquote>${a}<p>${b}</p></blockquote>`],
];
for (const [name, layout] of paragraphLayouts) for (const lang of ['en', 'zh']) {
  test(`${name}逐段检查出处 ${lang}`, () => {
    const d = copy();
    delete d.sections.current.source_ids;
    d.sources.push({ id: 's2', name: 'Fictional tier C source', url: 'https://example.com/tier-c', date: '2026-10-01', tier: 'C' });
    const cited = '<strong>Fact</strong> <a href="https://example.com/fixture-motors"><em>Source</em></a>';
    const tierC = 'Fact <a href="https://example.com/tier-c">Source C</a>';
    d.sections.current.en = d.sections.current.zh = layout(cited, cited);
    // 容器本身不需额外引用，每个叶子段落已引用即通过。
    assert.deepEqual(check(d).errors, []);
    for (const index of [0, 1]) {
      const paragraphs = [cited, cited];
      paragraphs[index] = 'Unsourced fact';
      d.sections.current[lang] = layout(...paragraphs);
      assert.deepEqual(check(d).errors, [`sections.current.${lang} 每段必须有出处（source_ids 或来源链接）`], `第 ${index + 1} 段缺出处`);
      paragraphs[index] = tierC;
      d.sections.current[lang] = layout(...paragraphs);
      assert.deepEqual(check(d).errors, [`sections.current.${lang} 不能仅引用 C 级来源`], `第 ${index + 1} 段不能借用相邻段落的 A 级来源`);
    }
  });
}
test('章节级出处仍可覆盖嵌套段落', () => {
  const d = copy();
  for (const [, layout] of paragraphLayouts) {
    d.sections.current.en = d.sections.current.zh = layout('First fact', 'Second fact');
    assert.deepEqual(check(d).errors, []);
  }
});
test('标题无需单独引用，行内来源只覆盖所属正文段落', () => {
  const d = copy();
  delete d.sections.current.source_ids;
  d.sections.current.en = d.sections.current.zh = '<h3>Heading</h3><blockquote><h4>Subheading</h4><p>Fact <a href="https://example.com/fixture-motors">Source</a></p></blockquote>';
  assert.deepEqual(check(d).errors, []);
});
for (const html of ['<script>alert(1)</script>', '<style>p{}</style>', '<img src="x">', '<iframe></iframe>', '<!-- comment -->', '<p onclick="x()">text</p>', '<p style="color:red">text</p>', '<a href="https://example.com/fixture-motors" target="_blank">x</a>', '<a href="http://example.com">x</a>', '<a href="https://example.net">x</a>', '<a href="javascript:alert(1)">x</a>', '<a href=\'https://example.com/fixture-motors\'>x</a>', '<svg onload="x()"></svg>', '<p><strong>x</p>', '<P>x</P>', '<p>x</p><']) {
  invalid(`拒绝 HTML ${html}`, d => d.sections.current.en = html, /HTML|标签|属性|href|尖括号/);
}
test('全部允许标签可渲染，实体 URL 匹配', () => {
  const d = copy();
  d.sections.current.en = '<h3>Heading</h3><h4>Subheading</h4><p><strong>Bold</strong><em>Emphasis</em></p><ul><li>One</li></ul><ol><li>Two</li></ol><blockquote><p>Quote</p></blockquote><table><thead><tr><th>Column</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>';
  d.sources.push({ id: 's2', name: 'Query', url: 'https://example.com/?a=1&b=2', date: '2026-01-01', tier: 'B' });
  d.sections.current.en += '<p><a href="https://example.com/?a=1&amp;b=2">Query</a></p>';
  assert.deepEqual(check(d).errors, []);
  assert.match(renderResearch(d), /a=1&amp;b=2/);
});
for (const phrase of ['买入', '卖出', '目标价', '增持', '减持', '评级', '值得投资', 'buy rating', 'BUY RATING', 'target price', 'overweight', 'underweight', 'strong buy', '&#x4e70;&#x5165;']) {
  invalid(`投资措辞 ${phrase}`, d => d.sections.outlook.zh = `<p>${phrase}</p>`, /投资建议/);
}
for (const phrase of ['建议买<strong>入</strong>。', '卖<em>出</em>', '目<a href="https://example.com/fixture-motors">标</a>价', '值得<strong><em>投</em></strong>资', 'bu<strong>y</strong> rating', 'tar<em>get</em> price', 'strong&nbsp;<strong>buy</strong>', '&#x4e70;<em>&#20837;</em>']) {
  invalid(`行内标签不能绕过投资措辞 ${phrase}`, d => d.sections.outlook.zh = `<p>${phrase}</p>`, /投资建议/);
}
test('文本提取连接行内文字并保留块级边界', () => {
  assert.equal(plainText('<p>买<strong>入</strong></p><p>one<em>two</em></p>'), ' 买入  onetwo ');
  assert.equal(plainText('<p>one</p><p>two</p>').trim().replace(/\s+/g, ' '), 'one two');
});
test('完整 HTML 实体解码后仅转义一次，并保持文本安全', () => {
  const html = '<p>&nbsp; &mdash; &eacute; &Eacute; &copy; &trade; &NotEqualTilde; &#x1f680; &amp; &lt;strong&gt; &amp;lt; &unknown;</p>';
  assert.equal(sanitizeResearchHtml(html, fixture.sources), '<p>\u00a0 — é É © ™ ≂̸ 🚀 &amp; &lt;strong&gt; &amp;lt; &amp;unknown;</p>');
  assert.equal(decodeHtmlEntities('&#0; &#xD800; &#x110000; &#128;'), '� � � €');
  assert.equal(decodeHtmlEntities('&copy &notit;'), '© ¬it;');
  assert.equal(decodeHtmlEntities('&copy=1&notit;', true), '&copy=1&notit;');
  assert.equal(decodeHtmlEntities('&amp;lt;'), '&lt;');
  const d = copy();
  d.name_en = 'Soci&eacute;t&eacute; &amp; Motors';
  d.sections.overview.en = '<p>Soci&eacute;t&eacute;&nbsp;&mdash; motors &amp; research.</p>';
  d.sections.current.en = html;
  d.key_facts[0].value_en = '&eacute; &lt;img src=x&gt;';
  d.sources[0].name = 'Report &mdash; &copy;';
  assert.deepEqual(check(d).errors, []);
  const rendered = renderResearch(d);
  assert.match(rendered, /é &lt;img src=x&gt;/);
  assert.match(rendered, /Report — ©/);
  assert.doesNotMatch(rendered, /&amp;(?:nbsp|mdash|eacute|copy|trade);|<img/);
  const company = researchCompanies([], new Map([[d.id, d]])).find(c => c.id === d.id);
  assert.equal(company.name, 'Société & Motors');
  assert.equal(company.desc_en, 'Société\u00a0— motors & research.');
});
test('空财务表和 null 合法', () => { const d = copy(); d.financials.rows = []; d.brands[0].founded = null; assert.deepEqual(check(d).errors, []); });
test('正文长度上下限仅警告', () => {
  const d = copy();
  d.sections.current.zh = `<p>${'中'.repeat(4100)}</p>`;
  d.sections.current.en = `<p>${'word '.repeat(2600)}</p>`;
  assert.deepEqual(check(d).warnings, []);
  d.sections.current.zh = `<p>${'中'.repeat(8100)}</p>`;
  d.sections.current.en = `<p>${'word '.repeat(5100)}</p>`;
  assert.equal(check(d).warnings.length, 2);
  assert.deepEqual(check(d).errors, []);
});
test('渲染双语、完整目录、引用、财务口径与更正入口', () => {
  const html = renderResearch(fixture);
  for (const needle of ['data-lang="en"', 'data-lang="zh" hidden', 'AI 整理，截至 2026-10-29，附原文出处', '/tips?kind=correction', '币种', 'CNY', 'million', 'PRC GAAP', '未公开披露', 'Tier A', '级别 A', '2026-10-01', 'research-table-scroll', '创始人与管理层']) assert.ok(html.includes(needle), needle);
  assert.match(html, /<sup class="research-citation"><a href="#research-fixture-motors-en-source-1"/);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]));
  assert.equal(renderResearch(null), '');
});
test('渲染前防御性清洗，文本字段转义', () => {
  const d = copy(); d.sections.current.en = '<script>alert(1)</script><p onclick="x()">X</p>';
  d.key_facts[0].value_en = '<img src=x onerror=alert(1)>';
  const html = renderResearch(d);
  assert.doesNotMatch(html, /<script|<img|<p onclick/);
  assert.match(html, /&lt;img/);
  assert.doesNotMatch(sanitizeResearchHtml('<!-- x --><iframe src=x>bad</iframe>', d.sources), /<!--|<iframe/);
});
test('缺失目录、空目录、无效 JSON 与有效文件隔离；默认不读取示例', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'research-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const warnings = [];
  assert.equal(loadResearch({ root, dir: 'missing' }).size, 0);
  assert.equal(loadResearch({ root }).size, 0);
  fs.mkdirSync(path.join(root, 'samples'));
  assert.equal(loadResearch({ root, dir: 'samples' }).size, 0);
  fs.writeFileSync(path.join(root, 'samples/broken.json'), '{');
  fs.writeFileSync(path.join(root, 'samples/fixture-motors.json'), JSON.stringify(fixture));
  const result = loadResearch({ root, dir: 'samples', warn: w => warnings.push(w) });
  assert.equal(result.size, 1); assert.ok(warnings.some(w => w.includes('跳过研究')));
  assert.equal(loadResearch({ root }).size, 0);
  assert.ok(checkFile(path.join(root, 'missing.json')).errors.length);
});
test('列表合并去重并按其他组显示新公司；已有公司有标记', () => {
  const records = new Map([[fixture.id, fixture], ['byd', { ...fixture, id: 'byd' }]]);
  const companies = researchCompanies([{ id: 'byd', name: 'BYD', category: 'group' }], records);
  assert.equal(companies.length, NEW_COMPANIES.length + 2);
  assert.ok(companies.find(b => b.id === 'byd').hasResearch);
  assert.ok(companies.find(b => b.id === fixture.id).hasResearch);
  assert.ok(companies.filter(b => NEW_COMPANIES.some(([id]) => id === b.id)).every(b => !b.hasResearch));
  const html = companiesIndexHTML(companies, 'zh', b => `${b.id}:${b.hasResearch}`, '');
  assert.match(html, /group-other/); assert.match(html, /fixture-motors:true/);
});
test('CLI 成功与失败退出码、逐条错误输出', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'research-cli-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cli = path.resolve(__dirname, '../scripts/check-research.js');
  const ok = spawnSync(process.execPath, [cli, path.join(__dirname, 'fixtures/company-research/fixture-motors.json')], { encoding: 'utf8' });
  assert.equal(ok.status, 0);
  const file = path.join(root, 'bad.json'); fs.writeFileSync(file, JSON.stringify({}));
  const fail = spawnSync(process.execPath, [cli, file], { encoding: 'utf8' });
  assert.equal(fail.status, 1); assert.ok(fail.stderr.split('错误：').length > 5);
  const all = spawnSync(process.execPath, [cli], { env: { ...process.env, RESEARCH_DIR: root }, encoding: 'utf8' });
  assert.equal(all.status, 1);
});
test('只清理示例页，保留无数据的正式公司页及其他旧页', t => {
  const { removeStaleResearchPages } = require('../lib/company-research');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'research-cleanup-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const dir of ['chinese-car-brands', 'zh/chinese-car-brands']) {
    fs.mkdirSync(path.join(root, dir), { recursive: true });
    fs.writeFileSync(path.join(root, dir, 'old.html'), '<section data-research-only="true">old</section>');
    fs.writeFileSync(path.join(root, dir, 'jac.html'), '<section data-research-only="true">official</section>');
    fs.writeFileSync(path.join(root, dir, 'fixture-motors.html'), '<section data-research-only="true">current</section>');
    fs.writeFileSync(path.join(root, dir, 'byd.html'), '<section>brand</section>');
  }
  removeStaleResearchPages(root, [{ id: fixture.id, researchOnly: true }]);
  for (const dir of ['chinese-car-brands', 'zh/chinese-car-brands']) {
    assert.equal(fs.existsSync(path.join(root, dir, 'old.html')), true);
    assert.equal(fs.existsSync(path.join(root, dir, 'fixture-motors.html')), true);
    assert.equal(fs.existsSync(path.join(root, dir, 'byd.html')), true);
  }
  removeStaleResearchPages(root, []);
  for (const dir of ['chinese-car-brands', 'zh/chinese-car-brands']) {
    assert.equal(fs.existsSync(path.join(root, dir, 'fixture-motors.html')), false);
    for (const id of ['old', 'jac', 'byd']) assert.ok(fs.existsSync(path.join(root, dir, `${id}.html`)));
  }
});
test('固定新公司列表与规范一致，不依赖研究文件', () => {
  const vm = require('node:vm');
  const root = path.resolve(__dirname, '..');
  const brands = vm.runInNewContext(`${fs.readFileSync(path.join(root, 'js/data.js'), 'utf8')}; SITE_DATA.brands`);
  const spec = fs.readFileSync(path.join(root, 'docs/company-research-spec.md'), 'utf8').split('## 2.')[0];
  const ids = [...spec.matchAll(/^\| ([a-z]+(?:-[a-z]+)*) \|/gm)].map(m => m[1]).filter(id => id !== 'id');
  const newIds = ids.filter(id => !brands.some(b => b.id === id));
  assert.deepEqual(NEW_COMPANIES.map(([id]) => id), newIds);
  const companies = researchCompanies(brands, new Map());
  assert.equal(companies.length, brands.length + newIds.length);
  assert.equal(new Set(companies.map(c => c.id)).size, companies.length);
  for (const id of ids) assert.ok(companies.some(c => c.id === id), id);
});
test('构建保留正式双语路由、列表和 sitemap；缺失及失效研究显示占位，示例可清理', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'research-build-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.cpSync(path.resolve(__dirname, '..'), root, { recursive: true, filter: source => path.basename(source) !== '.git' });
  const researchDir = path.join(root, 'data/company-research');
  fs.rmSync(researchDir, { recursive: true, force: true });
  const read = file => fs.readFileSync(path.join(root, file), 'utf8');
  function build(dir = '') {
    const result = spawnSync(process.execPath, ['build.js'], { cwd: root, encoding: 'utf8', env: { ...process.env, RESEARCH_DIR: dir, BUILD_NOW: '2026-10-29T00:00:00Z' } });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  }
  function retained(id, placeholder) {
    for (const prefix of ['', 'zh/']) {
      const html = read(`${prefix}chinese-car-brands/${id}.html`);
      const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/);
      assert.equal(canonical?.[1], `https://www.topchinacar.com/${prefix}chinese-car-brands/${id}`);
      assert.match(html, /"@type":\s*"Organization"/);
      assert.match(html, /"@type":\s*"BreadcrumbList"/);
      if (placeholder) {
        assert.match(html, /深度研究整理中/);
        assert.match(html, /暂无数据/);
        assert.match(html, /Deep dive in preparation/);
        assert.doesNotMatch(html, new RegExp(`research-${id}-en-source`));
      } else assert.match(html, new RegExp(`research-${id}-en-source`));
      assert.ok(read(`${prefix}chinese-car-brands.html`).includes(`/chinese-car-brands/${id}`));
      assert.ok(read('sitemap-pages.xml').includes(`<loc>https://www.topchinacar.com/${prefix}chinese-car-brands/${id}</loc>`));
    }
  }
  build(); // 正式目录缺失时也生成完整固定路由。
  for (const [id] of NEW_COMPANIES) retained(id, true);
  fs.mkdirSync(researchDir, { recursive: true });
  const file = path.join(researchDir, 'jac.json');
  const data = { ...copy(), id: 'jac', name_en: 'Soci&eacute;t&eacute; &amp; Motors' };
  fs.writeFileSync(file, JSON.stringify(data));
  build(); retained('jac', false);
  assert.match(read('chinese-car-brands/jac.html'), /Société &amp; Motors/);
  assert.doesNotMatch(read('chinese-car-brands/jac.html'), /&amp;eacute;/);
  fs.unlinkSync(file);
  build(); retained('jac', true); // 有效研究被移除。
  for (const invalid of ['{', JSON.stringify({ ...data, ai_generated: false })]) {
    fs.writeFileSync(file, invalid);
    build(); retained('jac', true); // JSON 解析失败与校验失败。
  }
  build('tests/fixtures/company-research');
  retained('fixture-motors', false);
  retained('jac', true);
  build();
  retained('jac', true);
  for (const prefix of ['', 'zh/']) {
    assert.equal(fs.existsSync(path.join(root, `${prefix}chinese-car-brands/fixture-motors.html`)), false);
    assert.doesNotMatch(read(`${prefix}chinese-car-brands.html`), /fixture-motors/);
  }
  assert.doesNotMatch(read('sitemap-pages.xml'), /fixture-motors/);
});
test('可选财务列、数字零、空财务说明正常显示', () => {
  const d = copy(); d.financials.rows[0].operating_cash_flow = 0;
  const html = renderResearch(d);
  assert.match(html, /Operating cash flow/); assert.match(html, /经营现金流/);
  assert.match(html, /<td>0<\/td>/);
  d.financials.rows = [];
  assert.match(renderResearch(d), /金额均未公开披露/);
});
