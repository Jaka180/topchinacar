// /people、/sales、/tips 的占位页。别人做完正式页后会整页替换。
// /methodology 由 lib/methodology.js 生成，不要再放回这里。
const fs = require('fs');
const path = require('path');

const PLACEHOLDERS = [
  {
    route: '/people',
    file: 'people.html',
    titleEn: 'People Intel | TopChinaCar',
    titleZh: '人事情报 | TopChinaCar',
    descEn: 'People Intel is not live yet.',
    descZh: '人事情报还未上线。',
    h1En: 'People Intel',
    h1Zh: '人事情报'
  },
  {
    route: '/sales',
    file: 'sales.html',
    titleEn: 'Sales & Rankings | TopChinaCar',
    titleZh: '销量与排行 | TopChinaCar',
    descEn: 'Sales and rankings are not live yet.',
    descZh: '销量与排行还未上线。',
    h1En: 'Sales & Rankings',
    h1Zh: '销量与排行'
  },
  {
    route: '/tips',
    file: 'tips.html',
    titleEn: 'Send a tip | TopChinaCar',
    titleZh: '提供线索 | TopChinaCar',
    descEn: 'The tip page is not live yet.',
    descZh: '提供线索页面还未上线。',
    h1En: 'Send a tip',
    h1Zh: '提供线索'
  }
];

function bi(en, zh) {
  return `<span data-lang="en">${en}</span><span data-lang="zh" hidden>${zh}</span>`;
}

function mainHTML(item) {
  return `<section class="page-header">
  <div class="container">
    <div class="section-eyebrow">TopChinaCar</div>
    <h1 class="page-title">${bi(item.h1En, item.h1Zh)}</h1>
    <p class="page-deck">${bi('Coming soon', '即将上线')}</p>
  </div>
</section>`;
}

function writePlaceholderPages({ root, pageHTML, writeZh, zhChrome }) {
  for (const item of PLACEHOLDERS) {
    const main = mainHTML(item);
    fs.writeFileSync(path.join(root, item.file), pageHTML(item.route, {
      title: item.titleEn,
      desc: item.descEn,
      robots: 'noindex,follow'
    }, main));
    writeZh(item.file, zhChrome(pageHTML(item.route, {
      title: item.titleZh,
      desc: item.descZh,
      robots: 'noindex,follow'
    }, main, { zh: true })));
    console.log(`✓ ${item.file} + zh (placeholder)`);
  }
}

module.exports = { writePlaceholderPages, PLACEHOLDERS };
