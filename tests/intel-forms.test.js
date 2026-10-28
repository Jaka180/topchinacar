// 回归审查中的隐私、并发加载和一次性令牌问题；全部使用本地模拟。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { tipsPage } = require('../lib/people.js');

class Element {
  constructor() {
    this.listeners = new Map();
    this.value = '';
    this.style = {};
    this.hidden = false;
    this.disabled = false;
    this.children = [];
    this.textContent = '';
    this.innerHTML = '';
    this.classList = { add() {}, remove() {} };
  }
  addEventListener(type, fn) {
    const list = this.listeners.get(type) || [];
    list.push(fn);
    this.listeners.set(type, list);
  }
  removeEventListener(type, fn) {
    this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item !== fn));
  }
  async emit(type) {
    const event = { preventDefault() { event.prevented = true; } };
    await Promise.all((this.listeners.get(type) || []).map(fn => fn(event)));
    return event;
  }
  appendChild(child) { this.children.push(child); }
  remove() { this.removed = true; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
}

function setup(language = 'en') {
  const ids = Object.fromEntries([
    'tipsForm', 'tipKind', 'tipPage', 'tipText', 'tipTextCount', 'tipsSubmit',
    'tipsResult', 'tipCaptcha', 'tipsScriptNotice', 'newsletterForm',
    'newsletterEmail', 'newsletterOk'
  ].map(id => [id, new Element()]));
  ids.tipText.value = 'A public source needs a factual correction.';
  ids.tipsSubmit.disabled = true;
  const newsletterButton = new Element();
  ids.newsletterForm.querySelector = () => newsletterButton;
  ids.tipsForm.querySelectorAll = selector => selector === '.tip-link' ? []
    : [ids.tipKind, ids.tipText, ids.tipsSubmit];
  const head = new Element();
  const document = {
    readyState: 'complete', documentElement: {}, head,
    getElementById: id => ids[id] || null,
    createElement: () => new Element(),
    querySelector: selector => selector.includes('challenges.cloudflare.com')
      ? head.children.find(script => !script.removed) || null : null,
    querySelectorAll: () => []
  };
  let now = 0, timerId = 0;
  const timers = new Map();
  function schedule(fn, delay, repeat = false) {
    timers.set(++timerId, { fn, delay, at: now + delay, repeat });
    return timerId;
  }
  const window = { addEventListener() {} };
  const requests = [], widgets = [], resets = [];
  const api = {
    render: (box, options) => { widgets.push({ box, options }); return widgets.length - 1; },
    reset: id => { resets.push(id); }
  };
  const context = vm.createContext({
    window, document, URLSearchParams, PAGE_ROUTES: {},
    getLang: () => language, t: key => key,
    location: { pathname: language === 'zh' ? '/zh/tips' : '/tips', search: '?kind=correction', hash: '' },
    Date: class extends Date { static now() { return now; } },
    setTimeout: (fn, delay) => schedule(fn, delay),
    setInterval: (fn, delay) => schedule(fn, delay, true),
    clearTimeout: id => timers.delete(id), clearInterval: id => timers.delete(id),
    fetch: async (url, options) => {
      requests.push(JSON.parse(options.body));
      return env.respond(url, options);
    }
  });
  const env = {
    ids, head, window, widgets, resets, requests, api, newsletterButton, timers,
    respond: async () => ({ ok: true, json: async () => ({ ok: true }) }),
    run(file) { vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context); },
    advance(ms) {
      now += ms;
      for (const [id, timer] of [...timers]) {
        if (!timers.has(id) || timer.at > now) continue;
        if (timer.repeat) timer.at = now + timer.delay;
        else timers.delete(id);
        timer.fn();
      }
    }
  };
  env.run('js/turnstile.js');
  env.run('js/app.js');
  env.run('js/intel.js');
  return env;
}

async function flush() { for (let i = 0; i < 8; i++) await Promise.resolve(); }

test('中英文静态表单默认 POST、禁用提交，并在绑定处理器后才启用', () => {
  for (const language of ['en', 'zh']) {
    const html = tipsPage(language);
    assert.match(html, /<form\b[^>]*id="tipsForm"[^>]*method="post"/);
    assert.match(html, /<button\b[^>]*id="tipsSubmit"[^>]*disabled/);
    assert.match(html, /id="tipsScriptNotice"/);
    const env = setup(language);
    assert.equal(env.ids.tipsSubmit.disabled, false);
    assert.equal(env.ids.tipsScriptNotice.hidden, true);
    assert.equal(env.ids.tipsForm.listeners.get('submit').length, 1);
    assert.equal(env.ids.tipKind.value, 'correction');
  }
});

for (const first of ['tips', 'newsletter']) {
  test(`先聚焦 ${first} 再聚焦另一表单，共用加载 Promise 且两个组件均能提交`, async () => {
    const env = setup();
    const focusTips = () => env.ids.tipsForm.emit('focusin');
    const focusNewsletter = () => env.ids.newsletterEmail.emit('focus');
    await (first === 'tips' ? focusTips() : focusNewsletter());
    const pending = env.window.tccTurnstilePromise;
    await (first === 'tips' ? focusNewsletter() : focusTips());
    assert.equal(env.window.tccTurnstilePromise, pending);
    assert.equal(env.head.children.length, 1);
    assert.equal(env.window.tccTurnstileReady, undefined);
    env.window.turnstile = env.api;
    await env.head.children[0].emit('load');
    await flush();
    assert.equal(env.widgets.length, 2);
    for (const widget of env.widgets) widget.options.callback('token-' + env.widgets.indexOf(widget));
    env.ids.newsletterEmail.value = 'reader@example.com';
    const event = await env.ids.tipsForm.emit('submit');
    await env.ids.newsletterForm.emit('submit');
    assert.equal(event.prevented, true);
    assert.equal(env.requests.length, 2);
    assert.equal(env.ids.tipsSubmit.disabled, true);
    assert.equal(env.ids.newsletterForm.style.display, 'none');
    assert.equal(env.timers.size, 0);
  });
}

for (const failure of ['timeout', 'error']) {
  test(`Turnstile ${failure} 后按钮恢复、Promise 清理，下次提交可重新加载`, async () => {
    const env = setup();
    const submission = env.ids.tipsForm.emit('submit');
    await flush();
    if (failure === 'timeout') env.advance(8000);
    else await env.head.children[0].emit('error');
    await submission;
    assert.equal(env.window.tccTurnstilePromise, null);
    assert.equal(env.ids.tipsSubmit.disabled, false);
    assert.equal(env.requests.length, 0);
    assert.equal(env.timers.size, 0);
    const retry = env.ids.tipsForm.emit('submit');
    assert.equal(env.head.children.length, 2);
    env.window.turnstile = env.api;
    await env.head.children[1].emit('load');
    await flush();
    env.widgets[0].options.callback('fresh-token');
    env.advance(200);
    await retry;
    assert.equal(env.requests[0].turnstileToken, 'fresh-token');
    assert.equal(env.ids.tipsSubmit.disabled, true);
  });
}

for (const failure of ['http', 'api', 'network', 'json']) {
  test(`${failure} 失败后重置令牌，显示安全错误文本，重试只发送新令牌`, async () => {
    const env = setup();
    env.window.turnstile = env.api;
    await env.ids.tipsForm.emit('focusin');
    await flush();
    env.widgets[0].options.callback('used-token');
    const errorText = '<img src=x onerror=alert(1)> 请稍后重试';
    env.respond = async () => {
      if (failure === 'network') throw new Error('offline');
      return {
        ok: failure !== 'http',
        json: async () => {
          if (failure === 'json') throw new SyntaxError('invalid json');
          return { ok: false, error: errorText };
        }
      };
    };
    await env.ids.tipsForm.emit('submit');
    assert.equal(env.resets.length, 1);
    assert.equal(env.ids.tipsSubmit.disabled, false);
    if (failure === 'http' || failure === 'api') assert.equal(env.ids.tipsResult.textContent, errorText);
    assert.equal(env.ids.tipsResult.innerHTML, '');
    // 没有新验证令牌时重试不能再次发送旧令牌。
    const withoutToken = env.ids.tipsForm.emit('submit');
    await flush();
    env.advance(8200);
    await withoutToken;
    assert.equal(env.requests.length, 1);
    assert.equal(env.resets.length, 2);
    env.respond = async () => ({ ok: true, json: async () => ({ ok: true }) });
    env.widgets[0].options.callback('new-token');
    await env.ids.tipsForm.emit('submit');
    assert.deepEqual(env.requests.map(item => item.turnstileToken), ['used-token', 'new-token']);
    assert.equal(env.ids.tipsSubmit.disabled, true);
  });
}
