const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const REPO_ROOT = path.resolve(__dirname, '..');

function collectHtmlFiles(root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...collectHtmlFiles(fullPath));
    else if (entry.name.endsWith('.html')) files.push(fullPath);
  }
  return files;
}

function jsonLdBlocks(html) {
  return Array.from(
    html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    match => JSON.parse(match[1])
  );
}

test('build keeps Shanghai publication dates and emits accessible, stable markup', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'topchinacar-build-'));
  const siteRoot = path.join(tempRoot, 'site');
  try {
    fs.cpSync(REPO_ROOT, siteRoot, {
      recursive: true,
      filter: source => path.basename(source) !== '.git'
    });

    const build = spawnSync(process.execPath, ['build.js'], {
      cwd: siteRoot,
      encoding: 'utf8',
      env: { ...process.env, BUILD_NOW: '2026-07-11T22:28:44.000Z' }
    });
    assert.equal(build.status, 0, build.stderr || build.stdout);

    const read = file => fs.readFileSync(path.join(siteRoot, file), 'utf8');
    const posts = read('sitemap-posts.xml');
    const news = read('sitemap-news.xml');
    const sitemapIndex = read('sitemap.xml');
    const sitemapPages = read('sitemap-pages.xml');
    const home = read('index.html');
    const zhHome = read('zh/index.html');
    const notFound = read('404.html');
    const mapWars = read('news/tomtom-here-forty-years-mapmaking-convergence.html');
    const zhMapWars = read('zh/news/tomtom-here-forty-years-mapmaking-convergence.html');
    const mapWarsHub = read('series/map-wars.html');
    const intelligence = read('intelligence.html');

    assert.match(posts, /2026-07-12-china-auto-daily<\/loc><lastmod>2026-07-12<\/lastmod>/);
    assert.match(news, /2026-07-12-china-auto-daily[\s\S]*?<news:publication_date>2026-07-12T06:28:44\+08:00<\/news:publication_date>/);
    assert.doesNotMatch(sitemapIndex, /<lastmod>2026-07-11<\/lastmod>/);
    assert.match(sitemapPages, /<loc>https:\/\/www\.topchinacar\.com\/zh\/<\/loc>/);
    assert.doesNotMatch(sitemapPages, /<loc>https:\/\/www\.topchinacar\.com\/zh<\/loc>/);
    assert.match(sitemapPages, /<loc>https:\/\/www\.topchinacar\.com\/series\/map-wars<\/loc><lastmod>2026-07-26<\/lastmod>/);
    assert.ok(new Set(Array.from(posts.matchAll(/<lastmod>([^<]+)<\/lastmod>/g), match => match[1])).size > 2,
      'post sitemap lastmod values should reflect per-page dates');

    // 首页改版（2026-10-28）后没有新闻列表和头图了：改查日报区块的标题层级
    assert.match(home, /<h1 class="hero-title">/);
    assert.match(home, /<h2 class="section-title" id="home-briefings-title">/);
    assert.match(home, /<h4 class="home-daily-title">/);
    assert.match(home, /<h2 class="footer-heading"/);
    assert.match(home, /<label class="sr-only" for="newsletterEmail"/);
    assert.doesNotMatch(home.match(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^>]+>/)?.[0] || '', /Noto/);
    assert.match(zhHome.match(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^>]+>/)?.[0] || '', /Noto\+Sans\+SC/);
    assert.match(notFound, /<meta name="robots" content="noindex,nofollow" \/>/);
    assert.doesNotMatch(notFound, /rel="canonical"/);

    const fullMapWarsTitle = 'Forty Years of Two Mapmakers: The Technology Converged. One Question Remains. | TopChinaCar';
    assert.match(mapWars, new RegExp(`<title>${fullMapWarsTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/title>`));
    assert.match(mapWars, new RegExp(`<meta property="og:title" content="${fullMapWarsTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" \\/>`));
    assert.doesNotMatch(mapWars, /og:image" content="[^"]*chery-brand\.jpg/);
    assert.match(mapWars, /<meta property="article:section" content="Map Wars" \/>/);
    assert.match(mapWars, /href="\/series\/map-wars"/);
    assert.match(mapWars, /hreflang="zh-CN" href="https:\/\/www\.topchinacar\.com\/zh\/news\/tomtom-here-forty-years-mapmaking-convergence"/);
    assert.match(zhMapWars, /hreflang="en" href="https:\/\/www\.topchinacar\.com\/news\/tomtom-here-forty-years-mapmaking-convergence"/);
    assert.match(mapWars, /id="langToggle" href="\/zh\/news\/tomtom-here-forty-years-mapmaking-convergence"/);
    assert.match(zhMapWars, /id="langToggle" href="https:\/\/www\.topchinacar\.com\/news\/tomtom-here-forty-years-mapmaking-convergence"/);
    assert.match(mapWarsHub, /Essay 1[\s\S]*Essay 8/);
    assert.equal((mapWarsHub.match(/href="\/news\/[^"]+"/g) || []).length, 16,
      'each of eight Map Wars essays should have title and CTA links');
    // 改版（#13）后日报页不再放专题入口；专题页由 8 篇文章的专题框链接，并在 sitemap 里
    assert.match(sitemapPages, /<loc>https:\/\/www\.topchinacar\.com\/series\/map-wars<\/loc>/);

    const mapWarsGraph = jsonLdBlocks(mapWars)
      .flatMap(block => block['@graph'] || [block])
      .find(node => node['@type'] === 'NewsArticle');
    assert.ok(mapWarsGraph, 'Map Wars article should emit NewsArticle JSON-LD');
    assert.equal(mapWarsGraph.headline, 'Forty Years of Two Mapmakers: The Technology Converged. One Question Remains.');
    assert.equal(mapWarsGraph.articleSection, 'Map Wars');
    assert.equal(mapWarsGraph.publisher.name, 'TopChinaCar');
    assert.ok(mapWarsGraph.publisher.logo.url.endsWith('/images/topchinacar-logo.svg'));
    assert.equal(mapWarsGraph.isPartOf.url, 'https://www.topchinacar.com/series/map-wars');

    assert.doesNotMatch(intelligence, /View Live Intelligence|ranked live feed|Live intelligence feed|scoring context|Ranked events support/);
    assert.match(intelligence, /Read Latest Coverage/);

    const byd = read('chinese-car-brands/byd.html');
    const bydNews = byd.slice(byd.indexOf('Related briefings and analysis'), byd.indexOf('Featured BYD models'))  // 改版（#13）后的栏目名;
    const firstBydNews = bydNews.match(/href="\/news\/([^"]+)"/)?.[1];
    assert.ok(firstBydNews, 'BYD brand page should include brand-primary coverage');
    assert.notEqual(firstBydNews, 'google-oem-partnership-four-layer-stack-2026');
    assert.match(bydNews, /<strong><span data-lang="en">[^<]*BYD[^<]*<\/span>/);  // 标题现在分中英文两个 span

    for (const [brand, model, expected] of [
      ['xpeng', 'xpeng-g6', ['625–725 km CLTC', '6.3–6.4 s', 'US$27,600']],  // #16 按官方数据改正
      ['zeekr', 'zeekr-001', ['750 km', '3.3 s', 'US$37,100']],
      ['mg', 'mg-mg4', ['450 km (WLTP)', '7.7 s', 'US$34,600']]
    ]) {
      const brandPage = read(`chinese-car-brands/${brand}.html`);
      const modelPage = read(`models/${model}.html`);
      for (const value of expected) assert.ok(brandPage.includes(value), `${brand} brand card is missing ${value}`);
      // #16 起车型页页头显示中国官方指导价（不是美元价），所以车型页只核对续航和加速
      for (const value of expected.slice(0, 2)) assert.ok(modelPage.includes(value), `${model} model page is missing ${value}`);
    }

    for (const htmlFile of collectHtmlFiles(siteRoot)) {
      const html = fs.readFileSync(htmlFile, 'utf8');
      assert.doesNotMatch(html, /\\u[0-9a-f]{4}/i, `${htmlFile} contains an escaped Unicode literal`);
      assert.doesNotMatch(html, /class="spec-label">\s*From\s*<\/span>\s*<span class="spec-value">\s*from\b/i,
        `${htmlFile} contains a duplicated From prefix`);
      assert.doesNotMatch(html, /topchinacar-event-intelligence\.vercel\.app\/admin\/login/i,
        `${htmlFile} exposes the admin login URL`);

      const ids = Array.from(html.matchAll(/<[^>]+\bid=["']([^"']+)["'][^>]*>/gi), match => match[1]);
      const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
      assert.deepEqual(duplicates, [], `${htmlFile} contains duplicate IDs: ${duplicates.join(', ')}`);

      for (const [index, tag] of Array.from(html.matchAll(/<img\b[^>]*>/g), match => match[0]).entries()) {
        assert.match(tag, /\bwidth="\d+"/, `${htmlFile} image ${index + 1} has no width`);
        assert.match(tag, /\bheight="\d+"/, `${htmlFile} image ${index + 1} has no height`);
      }
    }

    // 首页改版（#13）后：上方两块是两份日报的最新一期，下方「最新深度分析」放非日报文章。
    // 加一期出海日报和一篇分析，重新构建，两边都应该换成新的。
    const fixtures = [
      { slug: '2027-01-05-china-auto-daily', date: '2027-01-05', published_at: '2027-01-05T06:00:00+08:00',
        tag_en: 'China Auto Overseas Daily', tag_zh: '中国汽车出海日报',
        title_en: 'Homepage Daily Acceptance Issue', title_zh: '首页日报验收测试',
        excerpt_en: 'A synthetic daily issue used to verify homepage updates.', excerpt_zh: '用于验证首页更新的测试日报。',
        html_en: '<p>Daily acceptance fixture.</p>', html_zh: '<p>日报验收测试。</p>' },
      { slug: 'homepage-revalidation-acceptance-test', date: '2027-01-05', published_at: '2027-01-05T09:15:00+08:00',
        tag_en: 'Test Update', tag_zh: '测试更新',
        title_en: 'Homepage Revalidation Acceptance Post', title_zh: '首页更新验收测试文章',
        excerpt_en: 'A synthetic build fixture used to verify homepage publication updates.', excerpt_zh: '用于验证首页发文更新的构建测试数据。',
        html_en: '<p>Homepage publication acceptance fixture.</p>', html_zh: '<p>首页发布验收测试。</p>' }
    ];
    for (const article of fixtures) {
      fs.writeFileSync(path.join(siteRoot, 'articles', `${article.slug}.json`), JSON.stringify(article, null, 2));
    }
    const acceptanceBuild = spawnSync(process.execPath, ['build.js'], {
      cwd: siteRoot,
      encoding: 'utf8',
      env: { ...process.env, BUILD_NOW: '2027-01-05T02:00:00.000Z' }
    });
    assert.equal(acceptanceBuild.status, 0, acceptanceBuild.stderr || acceptanceBuild.stdout);
    const updatedHome = read('index.html');
    const briefings = updatedHome.slice(updatedHome.indexOf('id="home-briefings-title"'), updatedHome.indexOf('id="home-people-title"'));
    assert.match(briefings, /China Auto Global Daily[\s\S]*2027-01-05[\s\S]*href="\/news\/2027-01-05-china-auto-daily"[\s\S]*Homepage Daily Acceptance Issue/);
    assert.doesNotMatch(briefings, /Homepage Revalidation Acceptance Post/, 'analysis pieces must not appear as a daily issue');
    const analysis = updatedHome.slice(updatedHome.indexOf('id="home-analysis-title"'));
    assert.match(analysis, /<h3><a href="\/news\/homepage-revalidation-acceptance-test">/);
    assert.ok((analysis.match(/class="home-analysis-item"/g) || []).length <= 3, 'homepage shows at most three analysis pieces');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
