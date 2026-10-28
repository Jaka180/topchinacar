// ============ PEOPLE INTEL & TIPS (client runtime) ============
// Renders /people and the company-detail intel blocks from the radar public
// API, and handles the private /tips form. Personnel data is fetched in the
// browser only — no personnel data ships in the site's Git repository.
// Language follows the page URL via getLang() (js/i18n.js), which reads
// document.documentElement.lang (set from the /zh/... path).
(function () {
  'use strict';

  const INTEL_URL = 'https://radar.topchinacar.com/public/intel.json';
  const TIP_URL = 'https://radar.topchinacar.com/public/tip';
  const TURNSTILE_SITE_KEY = '0x4AAAAAAFOeyqZP39w8eCOI';

  const CHANGE_LABELS = {
    appointed: { en: 'Appointment', zh: '任命' },
    departed: { en: 'Departure', zh: '离任' },
    role_change: { en: 'Role change', zh: '调岗' },
    interim: { en: 'Interim role', zh: '代理' },
    board: { en: 'Board change', zh: '董事会变动' }
  };

  function lang() {
    try { return (typeof getLang === 'function' && getLang()) === 'zh' ? 'zh' : 'en'; }
    catch (e) { return 'en'; }
  }
  function L(en, cn) { return lang() === 'zh' ? cn : en; }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---- Company display names (id → en/zh), from the site's own brand list ----
  // radar 公司 id（src/config/companies.ts）的中英文名；和网站品牌 id 不一样的（liauto、huawei_ads 等）以这里为准
  const RADAR_COMPANIES = {"saic": {"en": "SAIC Motor", "zh": "上汽"}, "changan": {"en": "Changan", "zh": "长安"}, "gwm": {"en": "Great Wall Motor", "zh": "长城"}, "geely": {"en": "Geely", "zh": "吉利"}, "chery": {"en": "Chery", "zh": "奇瑞"}, "byd": {"en": "BYD", "zh": "比亚迪"}, "faw": {"en": "FAW", "zh": "一汽"}, "gac": {"en": "GAC", "zh": "广汽"}, "dongfeng": {"en": "Dongfeng", "zh": "东风"}, "baic": {"en": "BAIC", "zh": "北汽"}, "nio": {"en": "NIO", "zh": "蔚来"}, "liauto": {"en": "Li Auto", "zh": "理想"}, "xpeng": {"en": "XPeng", "zh": "小鹏"}, "leapmotor": {"en": "Leapmotor", "zh": "零跑"}, "xiaomi": {"en": "Xiaomi EV", "zh": "小米汽车"}, "huawei_ads": {"en": "Huawei Qiankun ADS", "zh": "华为乾崑"}, "momenta": {"en": "Momenta", "zh": "Momenta"}, "horizon": {"en": "Horizon Robotics", "zh": "地平线"}, "pony": {"en": "Pony.ai", "zh": "小马智行"}, "weride": {"en": "WeRide", "zh": "文远知行"}, "apollo": {"en": "Baidu Apollo Go", "zh": "萝卜快跑"}, "zhuoyu": {"en": "Zhuoyu (DJI Automotive)", "zh": "卓驭"}, "deeproute": {"en": "DeepRoute.ai", "zh": "元戎启行"}, "hesai": {"en": "Hesai", "zh": "禾赛"}, "robosense": {"en": "RoboSense", "zh": "速腾聚创"}};
  function companyNameMap() {
    const map = {};
    try {
      if (typeof SITE_DATA !== 'undefined' && Array.isArray(SITE_DATA.brands)) {
        for (const b of SITE_DATA.brands) {
          map[b.id] = { en: b.name || b.id, zh: b.cn || b.name || b.id };
        }
      }
    } catch (e) { /* ignore */ }
    for (const id in RADAR_COMPANIES) map[id] = RADAR_COMPANIES[id];
    return map;
  }
  function companyLabel(map, id) {
    const entry = map[id];
    if (!entry) return id;
    return lang() === 'zh' ? entry.zh : entry.en;
  }

  // ---- HTML whitelist sanitizer (no third-party lib) ----
  // Allows only: p h2 h3 strong em ul ol li blockquote a.
  // <a> keeps only https:// href, and gets rel="nofollow noopener" target="_blank".
  const REMOVE_TAGS = {
    SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, LINK: 1, META: 1,
    NOSCRIPT: 1, TEMPLATE: 1, SVG: 1, MATH: 1, FORM: 1, INPUT: 1, BUTTON: 1,
    TEXTAREA: 1, SELECT: 1, OPTION: 1, VIDEO: 1, AUDIO: 1, CANVAS: 1,
    SOURCE: 1, TRACK: 1, HEAD: 1, BASE: 1, TITLE: 1
  };
  const ALLOWED_TAGS = {
    P: 1, H2: 1, H3: 1, STRONG: 1, EM: 1, UL: 1, OL: 1, LI: 1, BLOCKQUOTE: 1, A: 1
  };

  function sanitizeHtml(html) {
    let doc;
    try {
      doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    } catch (e) {
      return '';
    }
    function clean(node) {
      for (const child of Array.from(node.children)) {
        clean(child);
        const tag = child.tagName;
        if (REMOVE_TAGS[tag]) { node.removeChild(child); continue; }
        if (!ALLOWED_TAGS[tag]) {
          while (child.firstChild) node.insertBefore(child.firstChild, child);
          node.removeChild(child);
          continue;
        }
        const href = child.getAttribute('href');
        for (const attr of Array.from(child.attributes)) child.removeAttribute(attr.name);
        if (tag === 'A') {
          const safe = href && /^https:\/\//i.test(String(href).trim()) ? String(href).trim() : null;
          if (safe) {
            child.setAttribute('href', safe);
            child.setAttribute('rel', 'nofollow noopener');
            child.setAttribute('target', '_blank');
          } else {
            while (child.firstChild) node.insertBefore(child.firstChild, child);
            node.removeChild(child);
          }
        }
      }
    }
    clean(doc.body);
    return doc.body.innerHTML;
  }

  // ---- Fetch (never throws; empty result on any failure) ----
  let intelPromise = null;
  function fetchIntel() {
    if (intelPromise) return intelPromise;
    intelPromise = fetch(INTEL_URL, { headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error('intel http ' + r.status); return r.json(); })
      .then(data => {
        if (!data || typeof data !== 'object') return { appointments: [], analyses: [] };
        return {
          appointments: Array.isArray(data.appointments) ? data.appointments : [],
          analyses: Array.isArray(data.analyses) ? data.analyses : []
        };
      })
      .catch(() => ({ appointments: [], analyses: [] }));
    return intelPromise;
  }

  function emptyMessage() {
    return '<p class="intel-empty">' + L('No data yet', '暂无数据') + '</p>';
  }

  function correctionHref() {
    const base = lang() === 'zh' ? '/zh/tips' : '/tips';
    const page = (location.pathname || '') + (location.search || '');
    return base + '?kind=correction&page=' + encodeURIComponent(page);
  }

  function pick(item, enKey, zhKey) {
    const l = lang();
    return l === 'zh' ? (item[zhKey] || item[enKey]) : (item[enKey] || item[zhKey]);
  }

  function renderAppointment(item, names) {
    const person = pick(item, 'person_en', 'person_zh');
    const role = pick(item, 'role_en', 'role_zh');
    const summary = pick(item, 'summary_en', 'summary_zh');
    const change = CHANGE_LABELS[item.change] || { en: item.change || '', zh: item.change || '' };
    const effective = item.effective_on || null;
    const company = companyLabel(names, item.company_id);

    let source = '';
    if (item.source_url && /^https:\/\//i.test(String(item.source_url))) {
      source = '<a class="intel-move-source-link" href="' + esc(item.source_url) +
        '" rel="nofollow noopener" target="_blank">' + esc(item.source_name || L('Original source', '原文出处')) + '</a>';
    } else if (item.source_name) {
      source = '<span class="intel-move-source-text">' + esc(item.source_name) + '</span>';
    }

    return '<article class="intel-move intel-move--' + esc(item.change || 'other') + '">' +
      '<div class="intel-move-top">' +
        '<span class="intel-move-change">' + esc(change[lang()] || change.en) + '</span>' +
        (company ? '<span class="intel-move-company">' + esc(company) + '</span>' : '') +
      '</div>' +
      '<h3 class="intel-move-person">' + esc(person || '') +
        (role ? ' <span class="intel-move-role">' + esc(role) + '</span>' : '') +
      '</h3>' +
      (summary ? '<p class="intel-move-summary">' + esc(summary) + '</p>' : '') +
      '<div class="intel-move-meta">' +
        '<span>' + L('Announced', '公告日') + ' <time>' + esc(item.announced_on || '') + '</time></span>' +
        '<span>' + L('Effective', '生效日') + ' ' +
          (effective ? '<time>' + esc(effective) + '</time>' : L('Pending', '待定')) + '</span>' +
      '</div>' +
      (source ? '<div class="intel-move-source">' + source + '</div>' : '') +
      '<div class="intel-move-footer">' +
        '<span class="intel-ai-note">' + L('AI-organized, with original source attached', 'AI 整理，附原文出处') + '</span>' +
        '<a class="intel-correct" href="' + esc(correctionHref()) + '">' + L('Request correction', '申请更正') + '</a>' +
      '</div>' +
    '</article>';
  }

  function renderAnalysis(item) {
    const title = pick(item, 'title_en', 'title_zh');
    const excerpt = pick(item, 'excerpt_en', 'excerpt_zh');
    const bodyHtml = sanitizeHtml(pick(item, 'html_en', 'html_zh'));
    const contested = item.kind === 'contested';

    const sources = (Array.isArray(item.sources) ? item.sources : [])
      .filter(s => s && s.url && /^https:\/\//i.test(String(s.url)))
      .map(s => '<a href="' + esc(s.url) + '" rel="nofollow noopener" target="_blank">' + esc(s.name || s.url) + '</a>')
      .join('<span class="analysis-source-sep"> · </span>');

    return '<article class="analysis-card' + (contested ? ' analysis-card--contested' : '') + '">' +
      '<div class="analysis-card-head">' +
        '<h3 class="analysis-card-title">' + esc(title || '') + '</h3>' +
        (contested ? '<span class="analysis-tag">' + L('Contested interpretation · publisher-confirmed', '争议解读 · 经站长确认') + '</span>' : '') +
      '</div>' +
      '<p class="analysis-card-meta"><time>' + esc(item.published_at || '') + '</time></p>' +
      (excerpt ? '<p class="analysis-excerpt">' + esc(excerpt) + '</p>' : '') +
      '<button type="button" class="analysis-toggle" aria-expanded="false">' + L('Read full reading', '展开全文') + '</button>' +
      '<div class="analysis-body" hidden>' + bodyHtml + '</div>' +
      (sources ? '<div class="analysis-sources"><span class="analysis-sources-label">' + L('Sources', '出处') + ':</span> ' + sources + '</div>' : '') +
      '<div class="analysis-footer">' +
        '<span class="intel-ai-note">' + L('AI-organized, with original source attached', 'AI 整理，附原文出处') + '</span>' +
        '<a class="intel-correct" href="' + esc(correctionHref()) + '">' + L('Request correction', '申请更正') + '</a>' +
      '</div>' +
    '</article>';
  }

  // ---- /people page ----
  function renderPeoplePage() {
    const appointEl = document.getElementById('peopleAppointments');
    const analysisEl = document.getElementById('peopleAnalyses');
    if (!appointEl || !analysisEl) return;
    const companySel = document.getElementById('intelCompanyFilter');
    const changeSel = document.getElementById('intelChangeFilter');
    const names = companyNameMap();

    const state = { appointments: [], analyses: [] };

    function applyFilters() {
      const company = companySel ? companySel.value : '';
      const change = changeSel ? changeSel.value : '';
      const items = state.appointments.filter(a => {
        if (company && a.company_id !== company) return false;
        if (change && a.change !== change) return false;
        return true;
      });
      appointEl.innerHTML = items.length ? items.map(a => renderAppointment(a, names)).join('') : emptyMessage();
    }

    fetchIntel().then(data => {
      state.appointments = (data.appointments || []).slice().sort((a, b) => {
        const da = a.announced_on || '', db = b.announced_on || '';
        if (da !== db) return db.localeCompare(da);
        return String(b.id || '').localeCompare(String(a.id || ''));
      });
      state.analyses = (data.analyses || []).slice().sort((a, b) =>
        String(b.published_at || '').localeCompare(String(a.published_at || '')));

      const ids = [];
      state.appointments.forEach(a => { if (a.company_id) ids.push(a.company_id); });
      state.analyses.forEach(an => (an.company_ids || []).forEach(id => ids.push(id)));
      const unique = Array.from(new Set(ids)).sort();
      if (companySel) {
        for (const id of unique) {
          const opt = document.createElement('option');
          opt.value = id;
          opt.textContent = companyLabel(names, id);
          companySel.appendChild(opt);
        }
      }

      appointEl.innerHTML = state.appointments.length
        ? state.appointments.map(a => renderAppointment(a, names)).join('')
        : emptyMessage();
      analysisEl.innerHTML = state.analyses.length
        ? state.analyses.map(renderAnalysis).join('')
        : emptyMessage();

      if (companySel) companySel.addEventListener('change', applyFilters);
      if (changeSel) changeSel.addEventListener('change', applyFilters);
    });

    wireAnalysisToggle(analysisEl);
  }

  function wireAnalysisToggle(container) {
    container.addEventListener('click', e => {
      const btn = e.target && e.target.closest ? e.target.closest('.analysis-toggle') : null;
      if (!btn) return;
      const body = btn.parentElement ? btn.parentElement.querySelector('.analysis-body') : null;
      if (!body) return;
      const wasHidden = body.hidden;
      body.hidden = !wasHidden;
      btn.setAttribute('aria-expanded', String(wasHidden));
      btn.textContent = wasHidden ? L('Collapse', '收起全文') : L('Read full reading', '展开全文');
    });
  }

  // ---- Company-detail blocks (data-intel-company) ----
  function renderCompanyBlocks() {
    const blocks = Array.from(document.querySelectorAll('[data-intel-company]'));
    if (!blocks.length) return;
    const names = companyNameMap();
    fetchIntel().then(data => {
      const appointments = (data.appointments || []).slice().sort((a, b) => {
        const da = a.announced_on || '', db = b.announced_on || '';
        if (da !== db) return db.localeCompare(da);
        return String(b.id || '').localeCompare(String(a.id || ''));
      });
      const analyses = data.analyses || [];
      for (const block of blocks) {
        const id = block.getAttribute('data-intel-company');
        const matches = appointments.filter(a => a.company_id === id);
        const related = analyses.filter(an => (an.company_ids || []).indexOf(id) !== -1);
        renderCompanyBlock(block, matches, related, names);
      }
    });
  }

  function renderCompanyBlock(block, appointments, analyses, names) {
    let html = '<h2 class="company-intel-heading">' + L('People intelligence', '人事情报') + '</h2>';
    if (appointments.length) html += appointments.map(a => renderAppointment(a, names)).join('');
    if (analyses.length) html += analyses.map(renderAnalysis).join('');
    if (!appointments.length && !analyses.length) html += emptyMessage();
    block.innerHTML = html;
    wireAnalysisToggle(block);
  }

  // ---- /tips form ----
  function initTipsForm() {
    const form = document.getElementById('tipsForm');
    if (!form) return;

    const kindSel = document.getElementById('tipKind');
    const pageField = document.getElementById('tipPage');
    const textEl = document.getElementById('tipText');
    const countEl = document.getElementById('tipTextCount');
    const submitBtn = document.getElementById('tipsSubmit');
    const resultEl = document.getElementById('tipsResult');
    let captchaBox = document.getElementById('tipCaptcha');
    if (!captchaBox) {
      captchaBox = document.createElement('div');
      captchaBox.className = 'inquiry-captcha';
      form.appendChild(captchaBox);
    }

    // Pre-select kind + hidden page from URL (?kind=correction&page=/people).
    const params = new URLSearchParams(location.search);
    const kindParam = params.get('kind');
    if (kindSel && (kindParam === 'tip' || kindParam === 'correction')) kindSel.value = kindParam;
    if (pageField) pageField.value = params.get('page') || ((location.pathname || '') + (location.search || ''));

    function updateCount() {
      if (countEl) countEl.textContent = (textEl ? textEl.value.length : 0) + ' / 4000';
    }
    if (textEl) textEl.addEventListener('input', updateCount);
    updateCount();

    let widget = null, token = null;
    function renderTurnstile() {
      if (widget !== null || !window.turnstile) return;
      widget = window.turnstile.render(captchaBox, {
        sitekey: TURNSTILE_SITE_KEY,
        appearance: 'interaction-only',
        language: lang() === 'zh' ? 'zh-cn' : 'en',
        callback: t => { token = t; },
        'expired-callback': () => { token = null; },
        'error-callback': () => { token = null; }
      });
    }
    function loadTurnstile() {
      return window.tccLoadTurnstileApi().then(renderTurnstile);
    }
    function waitToken() {
      return new Promise(resolve => {
        const t0 = Date.now();
        (function poll() {
          if (token) return resolve(token);
          if (Date.now() - t0 > 8000) return resolve(null);
          setTimeout(poll, 200);
        })();
      });
    }
    form.addEventListener('focusin', () => { loadTurnstile().catch(() => {}); }, { once: true });

    function setResult(msg, ok) {
      if (!resultEl) return;
      resultEl.hidden = false;
      resultEl.textContent = msg;
      resultEl.style.borderLeftColor = ok ? '#16a34a' : '#d4302a';
    }
    function resetButton() {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = L('Send privately', '私密提交'); }
    }

    let submitting = false;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (submitting) return;
      const kind = kindSel ? kindSel.value : 'tip';
      const company = ((document.getElementById('tipCompany') || {}).value || '').trim();
      const text = (textEl ? textEl.value : '').trim();
      const contact = ((document.getElementById('tipContact') || {}).value || '').trim();
      const links = Array.from(form.querySelectorAll('.tip-link'))
        .map(i => i.value.trim())
        .filter(Boolean);

      if (text.length < 20 || text.length > 4000) {
        setResult(L('Please write 20–4,000 characters.', '请填写 20–4000 字的内容。'), false);
        return;
      }
      if (links.some(u => !/^https:\/\//i.test(u))) {
        setResult(L('Every link must begin with https://.', '每个链接都必须以 https:// 开头。'), false);
        return;
      }
      if (links.length > 5) {
        setResult(L('Please provide at most 5 links.', '最多提供 5 个链接。'), false);
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '…'; }
      submitting = true;
      let failureMessage = L('Submission failed — please try again.', '提交失败，请重试。');
      try {
        await loadTurnstile();
        const captcha = await waitToken();
        if (!captcha) {
          failureMessage = L('The bot check did not complete — please try again.', '人机验证未完成，请重试。');
          throw new Error('Missing Turnstile token');
        }
        const response = await fetch(TIP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind,
            company,
            text,
            links,
            contact,
            page: pageField ? pageField.value : '',
            turnstileToken: captcha
          })
        });
        // HTTP 失败也读取 C3 错误说明，仅通过 textContent 展示字符串。
        const data = await response.json().catch(() => null);
        if (!response.ok || !data || data.ok !== true) {
          if (data && typeof data.error === 'string' && data.error.trim()) {
            failureMessage = data.error;
          }
          throw new Error('Tip submission failed');
        }
        setResult(L('Received — thank you. Editors will review it privately.', '已收到，感谢。编辑将私密审阅。'), true);
        form.querySelectorAll('input, textarea, select, button').forEach(el => { el.disabled = true; });
      } catch (error) {
        // 令牌只能使用一次；网络、HTTP、JSON 和验证失败均走同一恢复路径。
        token = null;
        if (widget !== null && window.turnstile) {
          try { window.turnstile.reset(widget); }
          catch (resetError) { widget = null; captchaBox.textContent = ''; }
        }
        resetButton();
        setResult(failureMessage, false);
      } finally {
        submitting = false;
      }
    });
    // 只有提交处理器成功绑定后才开放提交，并撤下脚本不可用提示。
    resetButton();
    const scriptNotice = document.getElementById('tipsScriptNotice');
    if (scriptNotice) scriptNotice.hidden = true;
  }

  function init() {
    renderPeoplePage();
    renderCompanyBlocks();
    initTipsForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
