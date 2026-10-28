'use strict';

const PEOPLE_META = {
  file: 'people.html',
  title: 'People Intelligence: China Auto Leadership Changes | TopChinaCar',
  desc: 'Track executive appointments, departures, role changes and organizational analysis across Chinese automakers, with dates and original sources.'
};

const PEOPLE_META_ZH = {
  title: '人事情报：中国汽车公司高管变动与组织解读 | TopChinaCar',
  desc: '追踪中国汽车公司高管任命、离任、调岗与董事会变动，并提供附原文出处的组织解读。'
};

const TIPS_META = {
  file: 'tips.html',
  title: 'Submit a Private Tip or Correction | TopChinaCar',
  desc: 'Privately send TopChinaCar an editorial tip or correction. Submissions guide reporting and are verified against public sources before publication.',
  robots: 'noindex,follow'
};

const TIPS_META_ZH = {
  title: '私密提供线索或申请更正 | TopChinaCar',
  desc: '私密向 TopChinaCar 编辑提供调查线索或申请更正。线索只作为调查方向，内容发布前必须由公开来源证实。',
  robots: 'noindex,follow'
};

const PEOPLE_STYLES = `
.people-hero-inner{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;}
.people-tip-cta{flex:none;}
.people-intro{padding:clamp(40px,6vw,72px) 0;border-bottom:1px solid var(--line);}
.people-intro-grid{display:grid;grid-template-columns:minmax(0,240px) minmax(0,1fr);gap:clamp(20px,4vw,56px);}
.people-intro-grid h2{font-family:var(--serif);font-size:clamp(22px,2.5vw,30px);margin:0;}
.people-intro-grid p{font-size:16px;line-height:1.8;color:var(--ink-soft);margin:0 0 14px;}
.people-intro-note{font-size:14px;color:var(--muted);}
.people-tips-strip{background:var(--paper);border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
.people-tips-strip-inner{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 0;flex-wrap:wrap;}
.people-tips-strip-inner strong{display:block;font-size:16px;margin-bottom:2px;}
.people-tips-strip-inner span{font-size:14px;color:var(--muted);}
.intel-filter-bar{padding:24px 0;border-bottom:1px solid var(--line);}
.intel-filter-grid{display:flex;gap:16px;flex-wrap:wrap;}
.intel-filter-field{display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--muted);min-width:180px;}
.intel-filter-field select{font:inherit;padding:10px 12px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--white);color:var(--ink);}
.people-content{padding:clamp(36px,5vw,64px) 0;}
.people-section{margin-bottom:clamp(40px,6vw,72px);}
.people-section-head{margin-bottom:24px;}
.people-section-head h2{font-family:var(--serif);font-size:clamp(24px,3vw,34px);margin:6px 0 0;}
.people-section-head>p{font-size:14px;color:var(--muted);margin:8px 0 0;}
.intel-list{display:grid;gap:16px;}
.intel-move{border:1px solid var(--line);border-radius:var(--r-md);padding:20px 22px;background:var(--white);}
.intel-move-top{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px;}
.intel-move-change{font-family:var(--mono);font-size:11px;letter-spacing:.05em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:var(--paper-2);color:var(--ink-soft);border:1px solid var(--line);}
.intel-move--departed .intel-move-change{color:var(--accent-deep);border-color:rgba(212,48,42,.35);background:rgba(212,48,42,.06);}
.intel-move-company{font-family:var(--mono);font-size:12px;color:var(--muted);}
.intel-move-person{font-size:20px;margin:0 0 8px;font-family:var(--serif);}
.intel-move-role{font-size:14px;color:var(--muted);font-family:var(--sans);font-weight:500;}
.intel-move-summary{font-size:15px;line-height:1.7;color:var(--ink-soft);margin:0 0 14px;}
.intel-move-meta{display:flex;gap:20px;flex-wrap:wrap;font-size:13px;color:var(--muted);margin-bottom:12px;}
.intel-move-source{margin-bottom:14px;font-size:14px;}
.intel-move-source a,.intel-move-source-link{color:var(--accent);text-decoration:none;}
.intel-move-source a:hover,.intel-move-source-link:hover{text-decoration:underline;}
.intel-move-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:12px;border-top:1px solid var(--line);font-size:12px;flex-wrap:wrap;}
.intel-ai-note{color:var(--muted);}
.intel-correct{color:var(--accent);text-decoration:none;font-weight:500;}
.intel-correct:hover{text-decoration:underline;}
.analysis-list{display:grid;gap:16px;}
.analysis-card{border:1px solid var(--line);border-radius:var(--r-md);padding:20px 22px;background:var(--white);}
.analysis-card--contested{border-color:rgba(176,138,62,.4);}
.analysis-card-head{display:flex;align-items:flex-start;gap:12px;justify-content:space-between;flex-wrap:wrap;}
.analysis-card-title{font-family:var(--serif);font-size:20px;margin:0;}
.analysis-tag{font-family:var(--mono);font-size:11px;padding:3px 8px;border-radius:999px;background:rgba(176,138,62,.12);color:#8a6a2e;border:1px solid rgba(176,138,62,.4);white-space:nowrap;}
.analysis-card-meta{font-size:13px;color:var(--muted);margin:6px 0 10px;}
.analysis-excerpt{font-size:15px;line-height:1.7;color:var(--ink-soft);margin:0 0 12px;}
.analysis-toggle{font:inherit;font-size:13px;color:var(--accent);background:none;border:none;padding:0;cursor:pointer;font-weight:600;}
.analysis-body{margin-top:14px;font-size:15px;line-height:1.8;color:var(--ink-soft);}
.analysis-body p{margin:0 0 14px;}
.analysis-body h2{font-size:20px;margin:22px 0 10px;font-family:var(--serif);}
.analysis-body h3{font-size:17px;margin:18px 0 8px;}
.analysis-body ul,.analysis-body ol{margin:0 0 14px;padding-left:22px;}
.analysis-body li{margin-bottom:6px;}
.analysis-body blockquote{border-left:3px solid var(--accent);margin:0 0 14px;padding:4px 0 4px 16px;color:var(--muted);}
.analysis-body a{color:var(--accent);}
.analysis-sources{font-size:13px;color:var(--muted);margin-top:14px;}
.analysis-sources a{color:var(--accent);text-decoration:none;}
.analysis-sources a:hover{text-decoration:underline;}
.analysis-sources-label{font-weight:600;color:var(--ink-soft);}
.analysis-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:12px;border-top:1px solid var(--line);margin-top:14px;font-size:12px;flex-wrap:wrap;}
.company-intel{border:1px solid var(--line);border-radius:var(--r-md);padding:20px 22px;background:var(--white);margin-top:32px;}
.company-intel-heading{font-family:var(--serif);font-size:22px;margin:0 0 16px;}
.company-intel .intel-list,.company-intel .analysis-list{display:grid;gap:14px;}
.tips-hero{border-bottom:1px solid var(--line);}
.tips-section{padding:clamp(36px,5vw,64px) 0;}
.tips-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,340px);gap:clamp(24px,4vw,56px);align-items:start;}
.tips-form{display:grid;gap:18px;}
.tips-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.tips-field{display:flex;flex-direction:column;gap:6px;font-size:14px;}
.tips-field>span,.tips-links legend{font-weight:600;font-size:13px;}
.tips-field input,.tips-field select,.tips-field textarea{font:inherit;font-size:15px;padding:11px 12px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--white);color:var(--ink);width:100%;}
.tips-field small{font-size:12px;color:var(--muted);}
.tips-count{text-align:right;}
.tips-links{border:0;margin:0;padding:0;}
.tips-links legend{padding:0;margin-bottom:6px;}
.tips-links p{font-size:12px;color:var(--muted);margin:0 0 10px;}
.tips-links-grid{display:grid;gap:10px;}
.tips-link-field{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--muted);}
.tips-link-field input{font:inherit;font-size:14px;padding:9px 12px;border:1px solid var(--line);border-radius:var(--r-sm);width:100%;}
.tips-consent{font-size:13px;color:var(--muted);margin:0;}
.tips-consent a{color:var(--accent);}
.tips-result{border-left:3px solid var(--line);padding:12px 14px;background:var(--paper);font-size:14px;border-radius:var(--r-sm);}
.tips-policy{background:var(--paper);border:1px solid var(--line);border-radius:var(--r-md);padding:22px;}
.tips-policy h2{font-family:var(--serif);font-size:20px;margin:0 0 14px;}
.tips-policy ul{margin:0;padding-left:18px;}
.tips-policy li{font-size:14px;color:var(--ink-soft);line-height:1.7;margin-bottom:10px;}
@media (max-width:820px){
  .people-intro-grid,.tips-layout{grid-template-columns:1fr;}
  .tips-field-grid{grid-template-columns:1fr;}
}
`;

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizedLang(lang) {
  return lang === 'zh' ? 'zh' : 'en';
}

function peoplePage(lang = 'en') {
  const zh = normalizedLang(lang) === 'zh';
  const S = (en, cn) => zh ? cn : en;
  const tipsPath = zh ? '/zh/tips' : '/tips';

  return `
    <style>${PEOPLE_STYLES}</style>
    <section class="page-header page-header--dark people-hero">
      <div class="container people-hero-inner">
        <div>
          <div class="section-eyebrow">${S('People Intelligence', '人事情报')}</div>
          <h1 class="page-title">${S('Leadership moves, with the source attached.', '追踪人事变动，每条都附原文出处。')}</h1>
          <p class="page-deck">${S(
            'A sourced timeline of appointments, departures and role changes across Chinese automakers, plus clearly labeled organizational analysis.',
            '追踪中国汽车公司的任命、离任与调岗，并提供明确标注、可追溯来源的组织解读。'
          )}</p>
        </div>
        <a class="btn btn-primary people-tip-cta" href="${tipsPath}">${S('Provide a tip', '提供线索')}</a>
      </div>
    </section>

    <section class="people-intro">
      <div class="container people-intro-grid">
        <h2>${S('What this page tracks', '这里追踪什么')}</h2>
        <div>
          <p>${S(
            'Leadership changes can signal shifts in product strategy, overseas expansion and organizational priorities. This page organizes public announcements into a searchable timeline without adding unverified claims.',
            '管理层变动可能反映产品战略、海外扩张和组织重点的变化。本页把公开公告整理成可筛选的时间线，不添加未经证实的说法。'
          )}</p>
          <p>${S(
            'Every item links to its original source. Organizational readings are AI-organized research, not statements by the companies concerned.',
            '每条信息均链接原始出处。组织解读由 AI 整理，不代表相关公司的官方表述。'
          )}</p>
          <p class="people-intro-note">${S(
            'Records load from TopChinaCar’s intelligence API (radar.topchinacar.com) when the page opens. Nothing on this page asks for your identity.',
            '页面打开时由 TopChinaCar 情报接口（radar.topchinacar.com）读取记录。本页不会索取您的身份信息。'
          )}</p>
        </div>
      </div>
    </section>

    <section class="people-tips-strip" aria-label="${S('Provide a tip', '提供线索')}">
      <div class="container people-tips-strip-inner">
        <div>
          <strong>${S('Do you know a personnel change we should verify?', '你知道我们该核实的人事变动吗？')}</strong>
          <span>${S('Send it privately — only editors can read it.', '私密提交——只有编辑能看到。')}</span>
        </div>
        <a class="btn btn-ghost" href="${tipsPath}">${S('Provide a tip', '提供线索')}</a>
      </div>
    </section>

    <section class="intel-filter-bar" aria-label="${S('People intelligence filters', '人事情报筛选')}">
      <div class="container intel-filter-grid">
        <label class="intel-filter-field" for="intelCompanyFilter">
          <span>${S('Company', '公司')}</span>
          <select id="intelCompanyFilter">
            <option value="">${S('All companies', '全部公司')}</option>
          </select>
        </label>
        <label class="intel-filter-field" for="intelChangeFilter">
          <span>${S('Change type', '变动类型')}</span>
          <select id="intelChangeFilter">
            <option value="">${S('All changes', '全部变动')}</option>
            <option value="appointed">${S('Appointment', '任命')}</option>
            <option value="departed">${S('Departure', '离任')}</option>
            <option value="role_change">${S('Role change', '调岗')}</option>
            <option value="interim">${S('Interim role', '代理')}</option>
            <option value="board">${S('Board change', '董事会变动')}</option>
          </select>
        </label>
      </div>
    </section>

    <div class="container people-content" id="peopleIntelRoot" data-intel-page data-intel-lang="${zh ? 'zh' : 'en'}">
      <section class="people-section" aria-labelledby="appointmentsTitle">
        <div class="people-section-head">
          <div>
            <div class="section-eyebrow">${S('Timeline', '时间线')}</div>
            <h2 id="appointmentsTitle">${S('People moves', '人事变动')}</h2>
          </div>
        </div>
        <div id="peopleAppointments" class="intel-list" aria-live="polite">
          <p class="intel-empty">${S('Loading…', '加载中…')}</p>
        </div>
      </section>

      <section class="people-section" aria-labelledby="analysesTitle">
        <div class="people-section-head">
          <div>
            <div class="section-eyebrow">${S('Organizational readings', '组织解读')}</div>
            <h2 id="analysesTitle">${S('What the public record may indicate', '公开信息反映了什么')}</h2>
          </div>
          <p>${S(
            'AI-organized analysis with original sources. Contested interpretations appear only after publisher approval.',
            'AI 整理并附原文出处；争议解读仅在站长确认后展示。'
          )}</p>
        </div>
        <div id="peopleAnalyses" class="analysis-list" aria-live="polite">
          <p class="intel-empty">${S('Loading…', '加载中…')}</p>
        </div>
      </section>
    </div>
  `;
}

function tipsPage(lang = 'en') {
  const zh = normalizedLang(lang) === 'zh';
  const S = (en, cn) => zh ? cn : en;
  const privacyPath = zh ? '/zh/privacy' : '/privacy';
  const linkInputs = Array.from({ length: 5 }, (_, index) => `
    <label class="tips-link-field" for="tipLink${index + 1}">
      <span>${S(`Public link ${index + 1}${index === 0 ? '' : ' (optional)'}`, `公开链接 ${index + 1}${index === 0 ? '' : '（选填）'}`)}</span>
      <input id="tipLink${index + 1}" class="tip-link" type="url" inputmode="url" placeholder="https://" />
    </label>`).join('');

  return `
    <style>${PEOPLE_STYLES}</style>
    <section class="page-header tips-hero">
      <div class="container">
        <div class="section-eyebrow">${S('Private editorial channel', '私密编辑通道')}</div>
        <h1 class="page-title">${S('Provide a tip or request a correction.', '提供线索或申请更正。')}</h1>
        <p class="page-deck">${S(
          'Only TopChinaCar editors can access your submission. It will not be published as a public comment or attributed without further verification.',
          '只有 TopChinaCar 编辑能看到您的提交。它不会作为公开评论发布；未经进一步核实，也不会据此直接署名引用。'
        )}</p>
      </div>
    </section>

    <section class="tips-section">
      <div class="container tips-layout">
        <form id="tipsForm" class="tips-form" method="post" novalidate>
          <input id="tipPage" name="page" type="hidden" />

          <div class="tips-field-grid">
            <label class="tips-field" for="tipKind">
              <span>${S('Type', '类型')}</span>
              <select id="tipKind" name="kind" required>
                <option value="tip">${S('Tip', '线索')}</option>
                <option value="correction">${S('Correction', '更正')}</option>
              </select>
            </label>
            <label class="tips-field" for="tipCompany">
              <span>${S('Related company (optional)', '相关公司（选填）')}</span>
              <input id="tipCompany" name="company" type="text" maxlength="200" autocomplete="organization" />
            </label>
          </div>

          <label class="tips-field" for="tipText">
            <span>${S('Details', '内容')}</span>
            <textarea id="tipText" name="text" rows="9" minlength="20" maxlength="4000" required aria-describedby="tipTextHelp tipTextCount"></textarea>
            <small id="tipTextHelp">${S('Required, 20–4,000 characters. Explain what should be investigated or corrected.', '必填，20–4000 字。请说明需要调查或更正的内容。')}</small>
            <small id="tipTextCount" class="tips-count" aria-live="polite">0 / 4000</small>
          </label>

          <fieldset class="tips-links">
            <legend>${S('Public supporting links (optional, up to 5)', '公开来源链接（选填，最多 5 个）')}</legend>
            <p>${S('Every link must begin with https://. Do not upload or link to internal files.', '每个链接必须以 https:// 开头。不要上传或链接内部文件。')}</p>
            <div class="tips-links-grid">${linkInputs}</div>
          </fieldset>

          <label class="tips-field" for="tipContact">
            <span>${S('Contact details (optional)', '联系方式（选填）')}</span>
            <input id="tipContact" name="contact" type="text" maxlength="500" autocomplete="email" />
            <small>${S('Add an email or other contact only if you are willing to receive follow-up questions.', '如愿意接收编辑的后续问题，可留下邮箱或其他联系方式。')}</small>
          </label>

          <p class="tips-consent">${S(
            `By submitting, you agree to our <a href="${privacyPath}">Privacy Policy</a>. Do not provide another person’s private information.`,
            `提交即表示您同意我们的<a href="${privacyPath}">隐私政策</a>。请勿提供他人的隐私信息。`
          )}</p>
          <div id="tipCaptcha" class="inquiry-captcha"></div>
          <button id="tipsSubmit" class="btn btn-primary" type="submit" disabled>${S('Send privately', '私密提交')}</button>
          <p id="tipsScriptNotice" role="status">${S('This private form requires JavaScript. If it remains unavailable, enable JavaScript and reload the page.', '私密表单需要 JavaScript。如表单一直不可用，请启用 JavaScript 并刷新页面。')}</p>
          <div id="tipsResult" class="tips-result" hidden role="status" aria-live="polite"></div>
        </form>

        <aside class="tips-policy" aria-labelledby="tipsPolicyTitle">
          <h2 id="tipsPolicyTitle">${S('How submissions are used', '线索如何使用')}</h2>
          <ul>
            <li>${S('Only the editorial team can access the submission; it is not posted publicly.', '只有编辑团队能看到提交内容，不会公开展示。')}</li>
            <li>${S('A tip is an investigation lead, not evidence ready for publication.', '线索只作为调查方向，不等于可直接发布的证据。')}</li>
            <li>${S('Nothing is added to coverage until public sources independently confirm it.', '必须有公开来源独立证实，才会写进内容。')}</li>
            <li>${S('Do not upload, paste or link to internal company files.', '不要上传、粘贴或链接公司内部文件。')}</li>
            <li>${S('Do not provide another person’s address, phone number, identity document or other private information.', '不要提供他人的住址、电话、证件信息或其他隐私。')}</li>
          </ul>
        </aside>
      </div>
    </section>
  `;
}

function intelBlockForCompany(companyId, lang = 'en') {
  const safeCompany = escapeAttr(companyId);
  const safeLang = normalizedLang(lang);
  const loading = safeLang === 'zh' ? '人事情报加载中…' : 'Loading people intelligence…';
  return `<div class="company-intel" data-intel-company="${safeCompany}" data-intel-lang="${safeLang}"><p class="intel-empty" data-intel-status>${loading}</p></div>`;
}

function registerPeoplePages({ pages, pagesZh, pageRoutes, getLang }) {
  pages['/people'] = { ...PEOPLE_META };
  pages['/tips'] = { ...TIPS_META };
  pagesZh['/people'] = { ...PEOPLE_META_ZH };
  pagesZh['/tips'] = { ...TIPS_META_ZH };
  pageRoutes['/people'] = () => peoplePage(typeof getLang === 'function' ? getLang() : 'en');
  pageRoutes['/tips'] = () => tipsPage(typeof getLang === 'function' ? getLang() : 'en');
}

module.exports = {
  peoplePage,
  tipsPage,
  intelBlockForCompany,
  registerPeoplePages
};
