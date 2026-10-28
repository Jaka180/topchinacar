// 全站表单共用一个加载 Promise；失败或超时后允许下次提交重新加载。
(function () {
  'use strict';

  window.tccLoadTurnstileApi = function () {
    if (window.turnstile && typeof window.turnstile.render === 'function') return Promise.resolve();
    if (window.tccTurnstilePromise) return window.tccTurnstilePromise;

    const promise = new Promise((resolve, reject) => {
      let script = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
      const created = !script;
      if (created) {
        script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
      }
      let settled = false;
      function finish(error) {
        if (settled) return;
        settled = true;
        clearInterval(poll);
        clearTimeout(timeout);
        script.removeEventListener('load', ready);
        script.removeEventListener('error', failed);
        if (error) {
          script.remove();
          reject(error);
        } else {
          resolve();
        }
      }
      function ready() {
        if (window.turnstile && typeof window.turnstile.render === 'function') finish();
      }
      function failed() { finish(new Error('Turnstile load failed')); }
      const poll = setInterval(ready, 50);
      const timeout = setTimeout(() => finish(new Error('Turnstile load timed out')), 8000);
      script.addEventListener('load', ready);
      script.addEventListener('error', failed);
      if (created) {
        try { document.head.appendChild(script); } catch (error) { finish(error); }
      }
    });
    window.tccTurnstilePromise = promise;
    promise.catch(() => {
      if (window.tccTurnstilePromise === promise) window.tccTurnstilePromise = null;
    });
    return promise;
  };
})();
