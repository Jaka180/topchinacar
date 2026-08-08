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

function intelligenceStatus(html) {
  return {
    lastUpdate: html.match(/Last update[\s\S]{0,180}?<strong>(\d{4}-\d{2}-\d{2})<\/strong>/)?.[1],
    eventsInLatestBatch: Number(html.match(/Events in latest batch[\s\S]{0,180}?<strong>(\d+)<\/strong>/)?.[1])
  };
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
    const newsIndex = read('news.html');
    const intelligence = read('intelligence.html');

    assert.match(posts, /2026-07-12-china-auto-daily<\/loc><lastmod>2026-07-12<\/lastmod>/);
    assert.match(news, /2026-07-12-china-auto-daily[\s\S]*?<news:publication_date>2026-07-12T06:28:44\+08:00<\/news:publication_date>/);
    assert.doesNotMatch(sitemapIndex, /<lastmod>2026-07-11<\/lastmod>/);
    assert.match(sitemapPages, /<loc>https:\/\/www\.topchinacar\.com\/zh\/<\/loc>/);
    assert.doesNotMatch(sitemapPages, /<loc>https:\/\/www\.topchinacar\.com\/zh<\/loc>/);
    assert.match(sitemapPages, /<loc>https:\/\/www\.topchinacar\.com\/series\/map-wars<\/loc><lastmod>2026-07-26<\/lastmod>/);
    assert.ok(new Set(Array.from(posts.matchAll(/<lastmod>([^<]+)<\/lastmod>/g), match => match[1])).size > 2,
      'post sitemap lastmod values should reflect per-page dates');

    assert.match(home, /<h3 class="news-title">/);
    assert.match(home, /<h2 class="footer-heading"/);
    assert.match(home, /<label class="sr-only" for="newsletterEmail"/);
    assert.match(home, /srcset="\/images\/hero-xiaomi-480\.jpg 480w,/);
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
    assert.match(newsIndex, /href="\/series\/map-wars"/);

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
    const bydNews = byd.slice(byd.indexOf('Latest BYD news'), byd.indexOf('All Chinese car brands'));
    const firstBydNews = bydNews.match(/href="\/news\/([^"]+)"/)?.[1];
    assert.ok(firstBydNews, 'BYD brand page should include brand-primary coverage');
    assert.notEqual(firstBydNews, 'google-oem-partnership-four-layer-stack-2026');
    assert.match(bydNews, /<strong>[^<]*BYD[^<]*<\/strong>/);

    for (const [brand, model, expected] of [
      ['xpeng', 'xpeng-g6', ['755 km', '3.9 s', 'US$27,600']],
      ['zeekr', 'zeekr-001', ['750 km', '3.3 s', 'US$37,100']],
      ['mg', 'mg-mg4', ['450 km (WLTP)', '7.7 s', 'US$34,600']]
    ]) {
      const brandPage = read(`chinese-car-brands/${brand}.html`);
      const modelPage = read(`models/${model}.html`);
      for (const value of expected) {
        assert.ok(brandPage.includes(value), `${brand} brand card is missing ${value}`);
        assert.ok(modelPage.includes(value), `${model} model page is missing ${value}`);
      }
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

    const acceptanceArticle = {
      slug: 'homepage-revalidation-acceptance-test',
      date: '2026-08-08',
      published_at: '2026-08-08T09:15:00+08:00',
      tag_en: 'Test Update',
      tag_zh: '测试更新',
      title_en: 'Homepage Revalidation Acceptance Post',
      title_zh: '首页更新验收测试文章',
      excerpt_en: 'A synthetic build fixture used to verify homepage publication updates.',
      excerpt_zh: '用于验证首页发文更新的构建测试数据。',
      html_en: '<p>Homepage publication acceptance fixture.</p>',
      html_zh: '<p>首页发布验收测试。</p>'
    };
    fs.writeFileSync(path.join(siteRoot, 'articles', `${acceptanceArticle.slug}.json`), JSON.stringify(acceptanceArticle, null, 2));
    const acceptanceBuild = spawnSync(process.execPath, ['build.js'], {
      cwd: siteRoot,
      encoding: 'utf8',
      env: { ...process.env, BUILD_NOW: '2026-08-08T04:00:00.000Z' }
    });
    assert.equal(acceptanceBuild.status, 0, acceptanceBuild.stderr || acceptanceBuild.stdout);
    const updatedHome = read('index.html');
    const updatedNews = read('sitemap-news.xml');
    assert.match(updatedHome, /Updated daily · August 8, 2026/);
    assert.match(updatedHome, /Top Story · 2026-08-08[\s\S]*Homepage Revalidation Acceptance Post/);
    assert.match(updatedNews, /google-maps-agentic-commerce[\s\S]*?<news:publication_date>2026-08-08T11:52:00\+08:00<\/news:publication_date>/);
    assert.match(updatedNews, /homepage-revalidation-acceptance-test[\s\S]*?<news:publication_date>2026-08-08T09:15:00\+08:00<\/news:publication_date>/);
    for (const file of [
      'analysis.html',
      'china-car-export-news.html',
      'markets.html',
      'policy.html',
      'zh/analysis.html',
      'zh/china-car-export-news.html',
      'zh/markets.html',
      'zh/policy.html'
    ]) {
      assert.deepEqual(
        intelligenceStatus(read(file)),
        { lastUpdate: '2026-08-08', eventsInLatestBatch: 1 },
        `${file} should derive freshness from the newest matched publication`
      );
    }
    const homeTags = Array.from(updatedHome.matchAll(/data-news-tag="([^"]+)"/g), match => match[1]);
    assert.equal(homeTags.length, 6, 'homepage should render one Top Story and five Latest News items');
    for (const tag of new Set(homeTags)) {
      assert.ok(homeTags.filter(value => value === tag).length <= 2, `homepage category cap exceeded for ${tag}`);
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
