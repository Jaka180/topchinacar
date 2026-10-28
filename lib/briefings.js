// /news 日报总入口。同一份 HTML 用 data-lang，中文页由 build.js 的 zhChrome 翻转。
const { articleEdition, dailyKind } = require('./editions');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&(?!(?:#\d+|#x[0-9a-fA-F]+|amp|lt|gt|quot|apos);)/gi, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bi(en, zh) {
  return `<span data-lang="en">${en}</span><span data-lang="zh" hidden>${zh}</span>`;
}

function articleHref(article) {
  return `/news/${encodeURI(String(article.slug || ''))}`;
}

function leadHTML(article) {
  const href = articleHref(article);
  const titleEn = escapeHtml(article.title_en);
  const titleZh = escapeHtml(article.title_zh || article.title_en);
  const excerptEn = escapeHtml(article.excerpt_en || '');
  const excerptZh = escapeHtml(article.excerpt_zh || article.excerpt_en || '');
  const date = escapeHtml(article.date || '');
  const excerpt = (article.excerpt_en || article.excerpt_zh)
    ? `<p class="briefing-excerpt">${bi(excerptEn, excerptZh)}</p>`
    : '';
  return `<div class="briefing-lead">
      <p class="briefing-kicker">${bi('Latest issue', '最新一篇')}</p>
      <p class="briefing-date">${date}</p>
      <h3><a href="${href}">${bi(titleEn, titleZh)}</a></h3>
      ${excerpt}
      <a class="briefing-read" href="${href}">${bi('Read', '阅读')} →</a>
    </div>`;
}

// 最新一篇单独突出，下面最多再列 7 篇，不把最新一篇重复列进去。
function recentHTML(list) {
  if (!list.length) return '';
  const items = list.map(article => {
    const href = articleHref(article);
    const titleEn = escapeHtml(article.title_en);
    const titleZh = escapeHtml(article.title_zh || article.title_en);
    const date = escapeHtml(article.date || '');
    return `<li>
      <a href="${href}">
        <span class="briefing-date">${date}</span>
        <span class="briefing-recent-title">${bi(titleEn, titleZh)}</span>
      </a>
    </li>`;
  }).join('\n');
  return `<div class="briefing-recent-wrap">
      <h3 class="briefing-recent-label">${bi('Latest 7 issues', '最近 7 篇')}</h3>
      <ol class="briefing-recent">${items}</ol>
    </div>`;
}

function panelHTML(titleEn, titleZh, list, emptyEn, emptyZh) {
  const body = list.length
    ? leadHTML(list[0]) + recentHTML(list.slice(1, 8))
    : `<p class="briefing-empty">${bi(emptyEn, emptyZh)}</p>`;
  return `<article class="briefing-panel">
      <h2>${bi(titleEn, titleZh)}</h2>
      ${body}
    </article>`;
}

function archiveItem(article) {
  const kind = dailyKind(article);
  const edition = articleEdition(article);
  const href = articleHref(article);
  const titleEn = escapeHtml(article.title_en);
  const titleZh = escapeHtml(article.title_zh || article.title_en);
  const excerptEn = escapeHtml(article.excerpt_en || '');
  const excerptZh = escapeHtml(article.excerpt_zh || article.excerpt_en || '');
  const date = escapeHtml(article.date || '');
  const tagEn = escapeHtml(article.tag_en || '');
  const tagZh = escapeHtml(article.tag_zh || article.tag_en || '');
  const excerpt = (article.excerpt_en || article.excerpt_zh)
    ? `<p class="briefing-excerpt">${bi(excerptEn, excerptZh)}</p>`
    : '';
  const tag = (article.tag_en || article.tag_zh)
    ? `<span class="briefing-tag">${bi(tagEn, tagZh)}</span>`
    : '';
  return `<article class="briefing-archive-item" data-edition="${edition}" data-daily="${kind}">
      <p class="briefing-meta">${tag}<span class="briefing-date">${date}</span></p>
      <h3><a href="${href}">${bi(titleEn, titleZh)}</a></h3>
      ${excerpt}
    </article>`;
}

function briefingsMain(articles) {
  const list = Array.isArray(articles) ? articles : [];
  const china = list.filter(article => dailyKind(article) === 'china');
  const globalDaily = list.filter(article => dailyKind(article) === 'global');
  const archive = list.map(archiveItem).join('\n');
  return `<section class="page-header">
  <div class="container">
    <div class="section-eyebrow">${bi('Briefings', '日报')}</div>
    <h1 class="page-title">${bi('Briefings', '日报')}</h1>
    <p class="page-deck">${bi(
      'Two daily briefings — the China Market Daily and the China Auto Global Daily — and the full article archive.',
      '两份日报：中国汽车市场日报与中国汽车出海日报。下面是全部文章。'
    )}</p>
  </div>
</section>
<section class="briefing-boards">
  <div class="container">
    <div class="briefing-grid">
      ${panelHTML(
        'China Market Daily',
        '中国汽车市场日报',
        china,
        'The first issue is coming soon.',
        '首期即将发布'
      )}
      ${panelHTML(
        'China Auto Global Daily',
        '中国汽车出海日报',
        globalDaily,
        'No issues yet.',
        '还没有这一期。'
      )}
    </div>
  </div>
</section>
<section class="briefing-archive-section">
  <div class="container" id="briefingArchive">
    <h2 id="briefingArchiveTitle">${bi('All articles', '全部文章')}</h2>
    <div class="briefing-filters" role="group" aria-labelledby="briefingArchiveTitle">
      <button type="button" class="is-active" data-edition-filter="all" aria-pressed="true">${bi('All', '全部')}</button>
      <button type="button" data-edition-filter="china" aria-pressed="false">${bi('China Market Daily', '中国汽车市场日报')}</button>
      <button type="button" data-edition-filter="global" aria-pressed="false">${bi('China Auto Global Daily', '中国汽车出海日报')}</button>
    </div>
    <p id="briefingFilterEmpty" class="briefing-empty" hidden>
      <span data-edition-empty="china">${bi('The first issue is coming soon.', '首期即将发布')}</span>
      <span data-edition-empty="global" hidden>${bi('No issues yet.', '还没有这一期。')}</span>
    </p>
    <div class="briefing-archive">
      ${archive}
    </div>
  </div>
</section>`;
}

module.exports = { briefingsMain };
