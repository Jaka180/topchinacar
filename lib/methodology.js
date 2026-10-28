// /methodology 与 /zh/methodology。
// 中英正文用 data-lang，中文页由 build.js 的 zhChrome 翻转。
// 两张图是内联 SVG，颜色只用 currentColor，跟页面文字走，深浅底都能看清。
const fs = require('fs');
const path = require('path');

const ROUTE = '/methodology';
const FILE = 'methodology.html';
const LASTMOD = '2026-10-28';

const COPY = {
  en: {
    title: 'Methodology and Transparency | TopChinaCar',
    name: 'Methodology and Transparency',
    desc: 'How TopChinaCar collects public sources, writes with AI, checks drafts, publishes, and corrects the record for international readers of the China auto industry.'
  },
  zh: {
    title: '方法论与透明度 | TopChinaCar',
    name: '方法论与透明度',
    desc: 'TopChinaCar 如何采集公开信源、用 AI 写稿、做程序质检、发布并更正。面向关注中国汽车产业的国际读者。'
  }
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bi(en, zh) {
  return `<span data-lang="en">${esc(en)}</span><span data-lang="zh" hidden>${esc(zh)}</span>`;
}

function biHtml(enHtml, zhHtml) {
  return `<span data-lang="en">${enHtml}</span><span data-lang="zh" hidden>${zhHtml}</span>`;
}

function readSourceCount(root) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'source-pool.json'), 'utf8'));
    const count = Number(data && data.totals && data.totals.sources);
    if (Number.isInteger(count) && count > 0) return count;
  } catch (error) {
    return null;
  }
  return null;
}

function svgBi(en, zh, x, y, opts = {}) {
  const anchor = opts.anchor || 'middle';
  const size = opts.size || 15;
  const weight = opts.weight || 400;
  const common = `x="${x}" y="${y}" text-anchor="${anchor}" fill="currentColor" font-size="${size}" font-weight="${weight}"`;
  return `<text ${common} data-lang="en">${esc(en)}</text><text ${common} data-lang="zh" hidden>${esc(zh)}</text>`;
}

function roundRect(x, y, w, h) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-width="1.5"/>`;
}

function boxHeight(lineCount) {
  return lineCount ? 34 + lineCount * 18 + 16 : 48;
}

function drawBox(parts, x, y, w, title, lines) {
  const h = boxHeight(lines.length);
  const textX = x + 16;
  parts.push(roundRect(x, y, w, h));
  parts.push(svgBi(title[0], title[1], textX, y + (lines.length ? 26 : 30), {
    anchor: 'start',
    size: 16,
    weight: 700
  }));
  lines.forEach((line, index) => {
    parts.push(svgBi(line[0], line[1], textX, y + 46 + index * 18, {
      anchor: 'start',
      size: 13,
      weight: 400
    }));
  });
  return { x, y, w, h };
}

function downArrow(cx, y, h, en, zh) {
  const top = y + 2;
  const bot = y + h - 2;
  const mid = y + h / 2;
  return [
    `<line x1="${cx}" y1="${top}" x2="${cx}" y2="${mid - 14}" stroke="currentColor" stroke-width="1.5"/>`,
    `<line x1="${cx}" y1="${mid + 14}" x2="${cx}" y2="${bot - 8}" stroke="currentColor" stroke-width="1.5"/>`,
    `<polygon points="${cx},${bot} ${cx - 5},${bot - 8} ${cx + 5},${bot - 8}" fill="currentColor"/>`,
    svgBi(en, zh, cx, mid + 4, { size: 13, weight: 600 })
  ].join('');
}

function flowSvg(count) {
  const width = 760;
  const boxW = 500;
  const boxX = 48;
  const cx = boxX + boxW / 2;
  const arrowH = 64;
  const parts = [];
  let y = 8;
  const countEn = count ? `${count} sources: RSS, Google News,` : 'RSS, Google News,';
  const countZh = count ? `${count} 个信源：RSS、Google News、` : 'RSS、Google News、';
  const steps = [
    {
      title: ['Source collection', '信源采集'],
      lines: [
        [countEn, countZh],
        ['exchange filings, WeChat accounts,', '交易所公告、公众号，'],
        ['public LinkedIn posts via Tavily', 'LinkedIn 公开内容经 Tavily 搜索']
      ]
    },
    { arrow: ['Hand off to AI', '交给 AI'] },
    {
      title: ['AI screening and writing', 'AI 筛选和写稿'],
      lines: []
    },
    { arrow: ['Send to checks', '送去质检'] },
    {
      title: ['Programmatic checks', '程序质检'],
      lines: []
    },
    { arrow: ['Publish if it passes', '通过后发布'] },
    {
      title: ['Publishing', '发布'],
      lines: [['Daily email and the website', '日报邮件和网站']]
    },
    { arrow: ['Readers send tips or corrections', '读者提交线索或更正'] },
    {
      title: ['Reader tips and corrections', '读者线索和更正'],
      lines: []
    },
    { arrow: ['Revise after a check', '核实后修订'] },
    {
      title: ['Revision', '修订'],
      lines: []
    }
  ];

  let publish = null;
  let revision = null;
  steps.forEach((step) => {
    if (step.arrow) {
      parts.push(downArrow(cx, y, arrowH, step.arrow[0], step.arrow[1]));
      y += arrowH;
      return;
    }
    const box = drawBox(parts, boxX, y, boxW, step.title, step.lines);
    y += box.h;
    if (step.title[1] === '发布') publish = box;
    if (step.title[1] === '修订') revision = box;
  });

  const rail = boxX + boxW + 28;
  const y0 = revision.y + revision.h / 2;
  const y1 = publish.y + publish.h / 2;
  const head = 8;
  parts.push(`<path d="M ${boxX + boxW} ${y0} H ${rail} V ${y1} H ${boxX + boxW + head}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>`);
  parts.push(`<polygon points="${boxX + boxW},${y1} ${boxX + boxW + head},${y1 - 5} ${boxX + boxW + head},${y1 + 5}" fill="currentColor"/>`);
  parts.push(svgBi('Update pages', '写回页面', rail + 10, (y0 + y1) / 2 + 4, {
    size: 12,
    weight: 600,
    anchor: 'start'
  }));

  return svg(width, y + 12, parts);
}

function archSvg() {
  const width = 760;
  const parts = [];
  let y = 8;
  const boxW = 520;
  const boxX = (width - boxW) / 2;
  const cx = width / 2;
  const arrowH = 64;

  function addBox(title, lines) {
    const box = drawBox(parts, boxX, y, boxW, title, lines);
    y += box.h;
    return box;
  }

  addBox(['GitHub Actions', 'GitHub Actions'], [
    ['Scheduled jobs and drafting', '定时任务和写稿']
  ]);
  parts.push(downArrow(cx, y, arrowH, 'Draft on a schedule', '定时写稿'));
  y += arrowH;
  addBox(['AI writing', 'AI 写稿'], [
    ['Claude. Alternative: DeepSeek', 'Claude；备选 DeepSeek'],
    ['and Tencent CodeBuddy cross-review', '与腾讯 CodeBuddy 互审']
  ]);
  parts.push(downArrow(cx, y, arrowH, 'Save the draft', '保存稿件'));
  y += arrowH;
  const workers = addBox(['Cloudflare Workers + D1', 'Cloudflare Workers + D1'], [
    ['Daily briefing service and database', '日报服务和数据库']
  ]);

  const childW = 280;
  const gap = 48;
  const leftX = (width - (childW * 2 + gap)) / 2;
  const rightX = leftX + childW + gap;
  const leftCx = leftX + childW / 2;
  const rightCx = rightX + childW / 2;
  const busY = workers.y + workers.h + 20;
  const childY = busY + 58;
  parts.push(`<line x1="${cx}" y1="${workers.y + workers.h}" x2="${cx}" y2="${busY}" stroke="currentColor" stroke-width="1.5"/>`);
  parts.push(`<line x1="${leftCx}" y1="${busY}" x2="${rightCx}" y2="${busY}" stroke="currentColor" stroke-width="1.5"/>`);

  function drop(x, en, zh) {
    const mid = (busY + childY) / 2;
    parts.push(`<line x1="${x}" y1="${busY}" x2="${x}" y2="${mid - 14}" stroke="currentColor" stroke-width="1.5"/>`);
    parts.push(`<line x1="${x}" y1="${mid + 14}" x2="${x}" y2="${childY - 8}" stroke="currentColor" stroke-width="1.5"/>`);
    parts.push(`<polygon points="${x},${childY} ${x - 5},${childY - 8} ${x + 5},${childY - 8}" fill="currentColor"/>`);
    parts.push(svgBi(en, zh, x, mid + 4, { size: 13, weight: 600 }));
  }

  drop(leftCx, 'Send email', '发邮件');
  drop(rightCx, 'Publish the site', '发布网站');
  drawBox(parts, leftX, childY, childW, ['Resend', 'Resend'], [['Email', '邮件']]);
  const pages = drawBox(parts, rightX, childY, childW, ['Cloudflare Pages', 'Cloudflare Pages'], [['Website', '网站']]);

  return svg(width, childY + pages.h + 12, parts);
}

function svg(width, height, parts) {
  return `<svg class="method-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${parts.join('')}</svg>`;
}

function desk(href, name, how, when, human) {
  return `<article class="method-desk">
    <h3><a href="${href}">${bi(name[0], name[1])}</a></h3>
    <dl>
      <div><dt>${bi('How it is made', '怎么生产')}</dt><dd>${bi(how[0], how[1])}</dd></div>
      <div><dt>${bi('Updates', '更新')}</dt><dd>${bi(when[0], when[1])}</dd></div>
      <div><dt>${bi('Human check', '人工确认')}</dt><dd>${bi(human[0], human[1])}</dd></div>
    </dl>
  </article>`;
}

function principle(title, body) {
  return `<article class="method-desk">
    <h3>${bi(title[0], title[1])}</h3>
    <p>${bi(body[0], body[1])}</p>
  </article>`;
}

function mainHTML(count) {
  const sourceSentence = count
    ? [`The collection stage watches ${count} sources.`, `采集这一步看着 ${count} 个信源。`]
    : ['The collection stage watches the public source pool.', '采集这一步看着公开信源池。'];

  return `
<style>
.method-wrap { padding: 8px 0 clamp(64px, 8vw, 96px); }
.method-page { max-width: 860px; }
.method-page h2 { font-size: clamp(28px, 3vw, 40px); margin: 56px 0 12px; }
.method-page p, .method-page li { color: var(--ink-soft); font-size: 16px; line-height: 1.75; }
.method-page a { color: var(--accent-deep); text-decoration: underline; text-underline-offset: 3px; }
.method-toc { display: flex; flex-wrap: wrap; gap: 8px 18px; margin: 8px 0 0; padding: 0; list-style: none; }
.method-toc a { font-size: 14px; }
.method-figure { margin: 20px 0 4px; color: inherit; }
.method-svg { width: 100%; height: auto; display: block; color: inherit; }
.method-svg text { font-family: var(--sans); }
.method-desks { display: grid; gap: 16px; margin-top: 8px; }
.method-desk { border: 1px solid var(--line); border-radius: 8px; padding: 16px 18px 18px; background: var(--paper-2); }
.method-desk h3 { font-size: 22px; margin: 0 0 8px; }
.method-desk p { margin: 0; }
.method-desk dl { margin: 0; }
.method-desk dt { margin-top: 10px; font-size: 12px; letter-spacing: 0.06em; color: var(--muted); }
.method-desk dd { margin: 2px 0 0; color: var(--ink-soft); font-size: 14.5px; line-height: 1.6; }
.method-links { margin: 8px 0 0; padding-left: 1.2em; }
@media (min-width: 800px) {
  .method-desks { grid-template-columns: 1fr 1fr; }
}
</style>
<section class="page-header">
  <div class="container">
    <div class="section-eyebrow">${bi('Transparency', '透明度')}</div>
    <h1 class="page-title">${bi('Methodology and Transparency', '方法论与透明度')}</h1>
    <p class="page-deck">${bi('How this site collects, writes, checks, publishes and corrects.', '这个站怎么采集、写稿、质检、发布和更正。')}</p>
  </div>
</section>
<section class="method-wrap">
  <div class="container method-page">
    <ul class="method-toc">
      <li><a href="#method-who">${bi('Who it is for', '我们是谁、给谁看')}</a></li>
      <li><a href="#method-flow">${bi('Business flow', '业务流程')}</a></li>
      <li><a href="#method-arch">${bi('Technical architecture', '技术架构')}</a></li>
      <li><a href="#method-desks">${bi('Each section', '各栏目')}</a></li>
      <li><a href="#method-ai">${bi('Use of AI', 'AI 使用说明')}</a></li>
      <li><a href="#method-corrections">${bi('Corrections', '更正政策')}</a></li>
      <li><a href="#method-principles">${bi('Editorial principles', '编辑原则')}</a></li>
    </ul>

    <h2 id="method-who">${bi('Who we are, and who this is for', '我们是谁、给谁看')}</h2>
    <p>${bi(
      'TopChinaCar is an industry information site for international readers who follow China\'s auto industry. We write about the companies, the people, the sales and the overseas business, using the public record.',
      'TopChinaCar 是面向关注中国汽车产业的国际读者的行业信息站。我们根据公开记录，写中国车企、相关人事、销量和海外业务。'
    )}</p>
    <p>${biHtml(
      sourceSentence[0] + ' The current list is on the <a href="/sources">sources</a> page. The rules for what we will and will not claim are in the <a href="/editorial-policy">editorial policy</a>.',
      sourceSentence[1] + '当前清单在<a href="/sources">信源池</a>。什么能写、什么不能写，写在<a href="/editorial-policy">编辑方针</a>里。'
    )}</p>

    <h2 id="method-flow">${bi('Business flow', '业务流程')}</h2>
    <p>${bi(
      'A piece moves through six stages. The words on the arrows are the action between stages. After a correction is accepted, it is written back to the related pages.',
      '一条内容经过六个环节。箭头上写的是这一步在做什么。更正采纳之后，会写回相关页面。'
    )}</p>
    <figure class="method-figure">
      <figcaption class="sr-only">${bi(
        'Business flow: source collection, hand off to AI, AI screening and writing, send to checks, programmatic checks, publish if it passes, publishing to the daily email and the website, readers send tips or corrections, reader tips and corrections, revise after a check, revision, then update the related pages.',
        '业务流程：信源采集，交给 AI，AI 筛选和写稿，送去质检，程序质检，通过后发布，发布到日报邮件和网站，读者提交线索或更正，读者线索和更正，核实后修订，修订，然后写回相关页面。'
      )}</figcaption>
      ${flowSvg(count)}
    </figure>

    <h2 id="method-arch">${bi('Technical architecture', '技术架构')}</h2>
    <p>${bi(
      'The website, the daily briefing service, the scheduled writing jobs, the models and the email each run on a public service named below.',
      '网站、日报服务、定时写稿、写稿用的模型和邮件，各自落在下面这些公开服务上。'
    )}</p>
    <figure class="method-figure">
      <figcaption class="sr-only">${bi(
        'Technical architecture: GitHub Actions runs scheduled jobs and drafting, then AI writing uses Claude, with DeepSeek and Tencent CodeBuddy cross-review as the alternative. The draft is saved to Cloudflare Workers and D1, the daily briefing service and database. Resend sends the email. Cloudflare Pages serves the website.',
        '技术架构：GitHub Actions 负责定时任务和写稿，AI 写稿使用 Claude，备选是 DeepSeek 与腾讯 CodeBuddy 互审。稿件保存到 Cloudflare Workers 和 D1，也就是日报服务和数据库。Resend 发送邮件。Cloudflare Pages 提供网站。'
      )}</figcaption>
      ${archSvg()}
    </figure>

    <h2 id="method-desks">${bi('How each section is produced', '各栏目怎么生产')}</h2>
    <p>${bi(
      'Frequency is how often a section is refreshed. Human check means whether a person has to approve it before it goes live.',
      '更新是这个栏目多久刷新一次。人工确认是指发布前要不要有人点头。'
    )}</p>
    <div class="method-desks">
      ${desk('/news', ['Briefings', '日报'],
        ['AI writes each briefing, including the China market daily and the overseas daily. A program checks the draft, then it publishes automatically.', '每份日报由 AI 撰写，包括中国汽车市场日报和中国汽车出海日报。程序质检通过后自动发布。'],
        ['Every day', '每天'],
        ['No editor confirmation. It publishes when the checks pass.', '不用人工确认。质检通过就发布。'])}
      ${desk('/people', ['People Intel', '人事情报'],
        ['Items are extracted from announcements and published automatically, with the original source attached.', '从公告里抽取，自动发布，并附上原文。'],
        ['When a public announcement appears', '有公开公告就更新'],
        ['Automatic. No item waits for an editor to click publish.', '自动发布，不逐条等人点发布。'])}
      ${desk('/people', ['Organization readings', '组织解读'],
        ['AI writes the reading. A second model checks each claim against its source. It then publishes automatically.', 'AI 撰写。另一个模型逐条核对出处。核对后自动发布。'],
        ['When a new reading passes the source check', '新稿核对出处通过后'],
        ['Automatic after that source check. The editor does not approve each one.', '出处核对后自动发布，不用站长逐篇确认。'])}
      ${desk('/people', ['Contested readings', '争议解读'],
        ['AI may draft it. It is published only after the editor confirms it.', '可以由 AI 起草。站长确认后才发布。'],
        ['Only after the editor confirms', '站长确认之后'],
        ['The editor must confirm it. It never publishes on its own.', '必须站长确认，不会自动发布。'])}
      ${desk('/sales', ['Sales and rankings', '销量与排行'],
        ['Figures come from company announcements and public CPCA data. A program calculates the rankings. A period with no public figure is shown as no data, not as zero.', '数字来自公司公告和乘联分会的公开数据，排名由程序计算。没有公开数字就显示暂无数据，不写成 0。'],
        ['Every month', '每月'],
        ['The program publishes the calculated rankings. A person does not rewrite each rank by hand.', '程序算出排名后发布，不逐条人工改排名。'])}
      ${desk('/sources', ['Sources', '信源池'],
        ['A list of the sources in use: RSS, Google News, exchange filings, WeChat accounts, and public LinkedIn posts found through Tavily search.', '正在使用的信源清单：RSS、Google News、交易所公告、公众号，以及经 Tavily 搜索到的 LinkedIn 公开内容。'],
        ['Every week', '每周'],
        ['Refreshed from the source pool. Entries are not rewritten by hand into articles.', '按信源池更新，不逐条手改成文章。'])}
    </div>

    <h2 id="method-ai">${bi('How we use AI', 'AI 使用说明')}</h2>
    <p>${bi(
      'Daily briefings, organization readings and contested readings are written by AI. Those pages are labeled AI-generated. People-intel items are extracted from announcements and keep a link to the original text. Sales rankings are calculated by a program from public figures, and the page names the data and the basis.',
      '日报、组织解读和争议解读由 AI 写成，页面上标明「AI 生成」。人事情报从公告抽取，并附上原文链接。销量排名由程序根据公开数字计算，页面写明数据和口径。'
    )}</p>
    <p>${bi(
      'AI can be wrong. Please check names, titles, dates and figures against the original source. Corrections are welcome.',
      'AI 会出错。人名、职务、日期和数字请以原文为准。欢迎来更正。'
    )}</p>

    <h2 id="method-corrections">${bi('Corrections', '更正政策')}</h2>
    <p>${biHtml(
      'To ask for a correction, open <a href="/tips?kind=correction">the tip form for a correction</a>. Say what is wrong, what the public record says, and include the source link. We reply within 48 hours, the same commitment as the <a href="/editorial-policy">editorial policy</a>.',
      '申请更正请打开<a href="/tips?kind=correction">更正表单</a>。写清哪里错了、公开记录怎么说，并附上出处链接。我们按<a href="/editorial-policy">编辑方针</a>，在 48 小时内回复。'
    )}</p>
    <p>${bi(
      'Once a correction is confirmed, it is applied on every related page, so the same fact is not left stale in a second place. The page keeps a note that it was corrected.',
      '核对成立后，更正会同步到所有相关页面，避免同一事实一处改了、另一处还是旧的。页面上会留下更正说明。'
    )}</p>

    <h2 id="method-principles">${bi('Editorial principles', '编辑原则')}</h2>
    <div class="method-desks">
      ${principle(
        ['Public sources only', '只写有公开出处的事实'],
        ['A factual sentence needs a public source a reader can open. We do not fill a gap with a made-up figure.', '事实句要有读者打得开的公开出处。空档不用编出来的数字去填。']
      )}
      ${principle(
        ['No rumors, factions or private lives', '不写传闻、派系、私生活'],
        ['We do not publish rumors, factional claims or details of private life.', '不刊登传闻，不写派系，不写私生活。']
      )}
      ${principle(
        ['Inference sits apart from fact', '推断和事实分开写'],
        ['A conclusion we draw is labeled as inference, separate from the sourced facts. A contested reading stays unpublished until the editor confirms it.', '我们自己做出的判断会标明是推断，和有出处的事实分开。争议解读在站长确认前不发布。']
      )}
    </div>

    <h2>${bi('Related pages', '相关页面')}</h2>
    <ul class="method-links">
      <li><a href="/editorial-policy">${bi('Editorial policy', '编辑方针')}</a></li>
      <li><a href="/sources">${bi('Sources', '信源池')}</a></li>
      <li><a href="/tips?kind=correction">${bi('Ask for a correction', '申请更正')}</a></li>
    </ul>
  </div>
</section>`;
}

function writeMethodologyPages({ root, pageHTML, writeZh, zhChrome, webPageJsonLd }) {
  const count = readSourceCount(root);
  const main = mainHTML(count);
  fs.writeFileSync(path.join(root, FILE), pageHTML(ROUTE, {
    title: COPY.en.title,
    desc: COPY.en.desc,
    extraHead: webPageJsonLd(ROUTE, COPY.en.name, COPY.en.desc, 'WebPage', false)
  }, main));
  writeZh(FILE, zhChrome(pageHTML(ROUTE, {
    title: COPY.zh.title,
    desc: COPY.zh.desc,
    extraHead: webPageJsonLd(ROUTE, COPY.zh.name, COPY.zh.desc, 'WebPage', true)
  }, main, { zh: true })));
  console.log('✓ methodology.html + zh');
}

function methodologySitemapLines(site) {
  return [`  <url><loc>${site}/methodology</loc><lastmod>${LASTMOD}</lastmod></url>`];
}

module.exports = { writeMethodologyPages, methodologySitemapLines };
