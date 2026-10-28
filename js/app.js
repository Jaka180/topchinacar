// ============ CLIENT RUNTIME ============
// Pages are prerendered at build time (see build.js). This script:
//  1. redirects legacy hash URLs (#/brands) to real paths (/brands)
//  2. re-renders the current page client-side when the language is toggled
//  3. wires up the models filter, brand focus scroll, sticky nav, mobile menu
//  4. keeps legacy newsletter forms functional if old cached pages are loaded

(function () {
  'use strict';

  // ---- 1. Legacy hash-route redirect (#/brands?focus=byd → /brands?focus=byd) ----
  if (location.hash.startsWith('#/')) {
    const raw = location.hash.slice(1);            // "/brands?focus=byd"
    const path = raw.split('?')[0].replace(/\/$/, '') || '/';
    const query = raw.includes('?') ? '?' + raw.split('?')[1] : '';
    if (PAGE_ROUTES[path]) {
      location.replace(path === '/' ? '/' + query : path + query);
      return;
    }
  }

  // ---- /zh mirror: the URL is the single source of truth for language ----
  const IS_ZH_PATH = location.pathname === '/zh' || location.pathname.startsWith('/zh/');

  // ---- Current route from pathname (null = static page like /news/<slug>) ----
  function currentRoute() {
    let p = location.pathname.replace(/\/+$/, '') || '/';
    p = p.replace(/\.html$/, '');
    if (p === '/zh') p = '/';
    else if (p.startsWith('/zh/')) p = p.slice(3);
    if (p === '/index' || p === '') p = '/';
    return PAGE_ROUTES[p] ? p : null;
  }

  // ---- Bilingual blocks on static article pages ----
  function toggleLangBlocks() {
    const lang = getLang();
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.hidden = el.getAttribute('data-lang') !== lang;
    });
  }

  // ---- Language: derived from the URL (/zh/... = Chinese), not from storage ----
  document.documentElement.lang = IS_ZH_PATH ? 'zh' : 'en';

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const [attr, key] = el.getAttribute('data-i18n-attr').split(':');
      if (attr && key) el.setAttribute(attr, t(key));
    });
  }

  // ---- Render (only needed on lang change; initial HTML is prerendered in EN) ----
  function render() {
    const route = currentRoute();
    if (route) {
      const app = document.getElementById('app');
      if (app) app.innerHTML = PAGE_ROUTES[route]();
    } else {
      toggleLangBlocks(); // static article page: swap language blocks instead
    }
    applyI18n();
    initPage(route);
  }

  // ---- Page-specific init ----
  function initModelsFilter() {
    const wrap = document.getElementById('modelsFilterChips');
    const grid = document.getElementById('modelsGrid');
    const empty = document.getElementById('modelsEmpty');
    if (!wrap || !grid) return;
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-brand]');
      if (!btn) return;
      const brand = btn.getAttribute('data-brand');
      wrap.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c === btn));
      let visible = 0;
      grid.querySelectorAll('.models-grid-item').forEach(item => {
        const match = brand === 'all' || item.getAttribute('data-brand') === brand;
        item.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  }

  function focusBrandCard(brandId) {
    requestAnimationFrame(() => {
      const card = document.getElementById('brand-' + brandId);
      if (!card) return;
      const headerEl = document.getElementById('siteHeader');
      const stickyEl = document.querySelector('.brand-sticky-nav');
      const offset = (headerEl ? headerEl.offsetHeight : 0) + (stickyEl ? stickyEl.offsetHeight : 0) + 16;
      const top = card.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      card.classList.add('is-focused');
      setTimeout(() => card.classList.remove('is-focused'), 2400);
    });
  }

  function initPage(route) {
    if (route === '/models') initModelsFilter();
    if (route === '/quote') initQuoteForm();
    if (route === '/brands') {
      const focus = new URLSearchParams(location.search).get('focus');
      if (focus) focusBrandCard(focus);
    }
    // nav active state (article pages highlight News)
    const bareNavPath = (value) => {
      let path = String(value || '');
      const absolute = path.match(/^https?:\/\/[^/]+(\/[^?#]*)?/i);
      if (absolute) path = absolute[1] || '/';
      path = path.split('?')[0].split('#')[0].replace(/\.html$/, '').replace(/\/+$/, '') || '/';
      if (path === '/zh') path = '/';
      else if (path.startsWith('/zh/')) path = path.slice(3);
      return path;
    };
    let here = bareNavPath(location.pathname);
    if (here.startsWith('/news/')) here = '/news';
    else if (here.startsWith('/brands/')) here = '/brands';
    const navRoute = route || here;
    document.querySelectorAll('.main-nav a').forEach(a => {
      a.classList.toggle('active', bareNavPath(a.getAttribute('href')) === navRoute);
    });
  }

  // ---- Brand sticky nav ----
  window.scrollToBrandSection = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    const headerEl = document.getElementById('siteHeader');
    const stickyEl = document.querySelector('.brand-sticky-nav');
    const offset = (headerEl ? headerEl.offsetHeight : 0) + (stickyEl ? stickyEl.offsetHeight : 0) + 12;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  };

  function setBrandStickyOffset() {
    const header = document.getElementById('siteHeader');
    const nav = document.querySelector('.brand-sticky-nav');
    if (header && nav) nav.style.top = header.offsetHeight + 'px';
  }

  function updateBrandStickyActive() {
    const nav = document.querySelector('.brand-sticky-nav');
    if (!nav) return;
    const links = nav.querySelectorAll('[data-target]');
    const ids = Array.from(links).map(l => l.getAttribute('data-target'));
    const sentinel = (document.getElementById('siteHeader')?.offsetHeight || 0) + nav.offsetHeight + 24;
    let active = ids[0];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top - sentinel <= 0) active = id;
    }
    links.forEach(l => l.classList.toggle('is-active', l.getAttribute('data-target') === active));
  }

  // ---- Export quote form → /api/inquiry ----
  function initQuoteForm() {
    const form = document.getElementById('quoteForm');
    if (!form) return;
    // prefill model from ?model=
    const preModel = new URLSearchParams(location.search).get('model');
    const modelInput = document.getElementById('qModel');
    if (preModel && modelInput && !modelInput.value) modelInput.value = preModel;

    const box = document.createElement('div');
    box.className = 'inquiry-captcha';
    form.appendChild(box);
    let widget = null, token = null;
    const zh = () => getLang() === 'zh';
    function renderQuoteTurnstile() {
      if (widget !== null || !window.turnstile) return;
      widget = window.turnstile.render(box, {
        sitekey: TURNSTILE_SITE_KEY, appearance: 'interaction-only', language: zh() ? 'zh-cn' : 'en',
        callback: (t) => { token = t; }, 'expired-callback': () => { token = null; }, 'error-callback': () => { token = null; }
      });
    }
    function loadQuoteTurnstile() {
      return window.tccLoadTurnstileApi().then(renderQuoteTurnstile);
    }
    form.addEventListener('focusin', () => { loadQuoteTurnstile().catch(() => {}); }, { once: true });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = id => (document.getElementById(id) || {}).value || '';
      const result = document.getElementById('quoteResult');
      const btn = document.getElementById('quoteSubmit');
      const payload = {
        name: val('qName').trim(), company: val('qCompany').trim(),
        email: val('qEmail').trim(), whatsapp: val('qWhatsapp').trim(),
        market: val('qMarket').trim(), model: val('qModel').trim(),
        quantity: val('qQty').trim(), message: val('qMessage').trim(),
        hp_note: val('qHp').trim(), turnstileToken: token || ''
      };
      if (!payload.name || !payload.market || !payload.model
          || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        if (result) {
          result.hidden = false;
          result.style.borderLeftColor = '#d4302a';
          result.textContent = getLang() === 'zh' ? '请填写姓名、邮箱、市场与车型。' : 'Please fill in name, a valid email, market and model.';
        }
        return;
      }
      if (btn) { btn.disabled = true; btn.textContent = '…'; }
      try {
        await loadQuoteTurnstile();
        const captcha = await waitTurnstileToken(() => token, 8000);
        payload.turnstileToken = captcha || '';
        const r = await fetch('/api/inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (r.status === 403) {
          if (btn) { btn.disabled = false; btn.textContent = t('quote.form.submit'); }
          if (widget !== null && window.turnstile) { window.turnstile.reset(widget); token = null; }
          if (result) {
            result.hidden = false;
            result.style.borderLeftColor = '#d4302a';
            result.textContent = zh() ? '人机验证没有通过，请再提交一次。' : 'The bot check did not pass — please submit again.';
          }
          return;
        }
        if (!r.ok) throw new Error('inquiry failed: ' + r.status);
        form.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);
        if (result) {
          result.hidden = false;
          result.style.borderLeftColor = '#16a34a';
          result.textContent = t('quote.form.success');
        }
      } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = t('quote.form.submit'); }
        if (result) {
          result.hidden = false;
          result.style.borderLeftColor = '#d4302a';
          result.textContent = t('quote.form.error');
        }
      }
    });
  }

  // ---- Newsletter → China Auto Overseas Daily (radar.topchinacar.com/api/subscribe) ----
  // Same double opt-in flow as join.topchinacar.com: a confirmation email is sent, the reader clicks it to subscribe.
  // Turnstile (bot check) loads only when the reader focuses the email field; interaction-only, so most readers never see it.
  const RADAR_SUBSCRIBE = 'https://radar.topchinacar.com/api/subscribe';
  const TURNSTILE_SITE_KEY = '0x4AAAAAAFOeyqZP39w8eCOI';
  const waitTurnstileToken = async (readToken, ms) => {
    const t0 = Date.now();
    let value = readToken();
    while (!value && Date.now() - t0 < ms) {
      await new Promise(r => setTimeout(r, 200));
      value = readToken();
    }
    return value;
  };
  function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    const input = document.getElementById('newsletterEmail');
    const btn = form.querySelector('.newsletter-btn');
    const ok = document.getElementById('newsletterOk');
    const zh = () => getLang() === 'zh';
    let widget = null, token = null;
    const box = document.createElement('div');
    box.className = 'newsletter-captcha';
    form.appendChild(box);
    function renderNewsletterTurnstile() {
      if (widget !== null || !window.turnstile) return;
      widget = window.turnstile.render(box, {
        sitekey: TURNSTILE_SITE_KEY, appearance: 'interaction-only', language: zh() ? 'zh-cn' : 'en',
        callback: (t) => { token = t; }, 'expired-callback': () => { token = null; }, 'error-callback': () => { token = null; }
      });
    }
    function loadTurnstile() {
      return window.tccLoadTurnstileApi().then(renderNewsletterTurnstile);
    }
    if (input) input.addEventListener('focus', () => { loadTurnstile().catch(() => {}); }, { once: true });
    function message(text) { if (ok) { ok.hidden = false; ok.textContent = text; } }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (input && input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (input) { input.classList.add('newsletter-input-error'); input.focus(); }
        return;
      }
      if (input) input.classList.remove('newsletter-input-error');
      if (btn) { btn.disabled = true; btn.textContent = '…'; }
      try {
        await loadTurnstile();
        const captcha = await waitTurnstileToken(() => token, 8000);
        const r = await fetch(RADAR_SUBSCRIBE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, captcha })
        });
        const data = await r.json().catch(() => ({}));
        if (data.ok) {
          form.style.display = 'none';
          message(t('newsletter.success'));
          return;
        }
        const err = data.error;
        if (btn) { btn.disabled = false; btn.textContent = t('newsletter.cta'); }
        if (widget !== null && window.turnstile) { window.turnstile.reset(widget); token = null; }
        if (err === 'invalid_email') { if (input) { input.classList.add('newsletter-input-error'); input.focus(); } message(zh() ? '邮箱格式不对，请检查一下。' : 'That email address does not look right.'); }
        else if (err === 'captcha') message(zh() ? '人机验证没有通过，请再点一次订阅。' : 'The bot check did not pass — please press Subscribe again.');
        else if (err === 'rate_limited') message(zh() ? '操作太频繁，请稍后再试。' : 'Too many attempts — please try again in a little while.');
        else throw new Error('subscribe failed: ' + r.status);
      } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = t('newsletter.cta'); }
        message(zh()
          ? '订阅暂时不可用，请稍后再试，或直接打开 join.topchinacar.com 订阅。'
          : 'Subscription is temporarily unavailable — please try again later, or subscribe at join.topchinacar.com.');
      }
    });
  }

  // ---- Init ----
  function init() {
    // Pages are fully prerendered in the URL's language; just wire up behaviour.
    initPage(currentRoute());
    initNewsletter();

    // Language toggle navigates to the counterpart URL (/foo ↔ /zh/foo)
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
      langToggle.addEventListener('click', () => {
        try { localStorage.setItem('tcc-lang', IS_ZH_PATH ? 'en' : 'zh'); } catch (e) {}
        const target = IS_ZH_PATH
          ? (location.pathname.replace(/^\/zh(\/|$)/, '/').replace(/^\/\//, '/') || '/')
          : (location.pathname === '/' ? '/zh' : '/zh' + location.pathname);
        location.href = target + location.search;
      });
    }

    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
      const nav = document.querySelector('.main-nav');
      const setMenuOpen = (open) => {
        nav?.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      };
      menuBtn.addEventListener('click', () => {
        setMenuOpen(!nav?.classList.contains('open'));
      });
      nav?.addEventListener('click', (e) => {
        if (e.target.closest('a')) setMenuOpen(false);
      });
    }

    setBrandStickyOffset();
    window.addEventListener('resize', setBrandStickyOffset);
    window.addEventListener('scroll', () => {
      if (document.querySelector('.brand-sticky-nav')) updateBrandStickyActive();
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
