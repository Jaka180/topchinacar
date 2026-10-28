// /models 列表：按品牌和动力筛选。没有脚本时车型全部可见。
function initModelsFilter() {
  const root = document.getElementById('modelsFilter');
  const grid = document.getElementById('modelsGrid');
  const empty = document.getElementById('modelsEmpty');
  if (!root || !grid || root.dataset.ready === '1') return;
  root.dataset.ready = '1';

  function items() {
    return Array.prototype.slice.call(grid.querySelectorAll('.models-grid-item'));
  }

  function selected(attr) {
    const button = root.querySelector('.chip.is-active[' + attr + ']');
    return button ? button.getAttribute(attr) : 'all';
  }

  function matches(item, brand, power) {
    const itemBrand = item.getAttribute('data-brand') || '';
    const powers = (item.getAttribute('data-powertrain') || '').split(/\s+/).filter(Boolean);
    const brandOk = brand === 'all' || itemBrand === brand;
    const powerOk = power === 'all' || powers.indexOf(power) !== -1;
    return brandOk && powerOk;
  }

  function setCount(button, count) {
    const el = button.querySelector('.chip-count');
    if (el) el.textContent = String(count);
  }

  function apply() {
    const brand = selected('data-brand');
    const power = selected('data-powertrain');
    const list = items();
    let visible = 0;
    list.forEach(item => {
      const show = matches(item, brand, power);
      item.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
    root.querySelectorAll('[data-brand]').forEach(button => {
      setCount(button, list.filter(item => matches(item, button.getAttribute('data-brand'), power)).length);
    });
    root.querySelectorAll('[data-powertrain]').forEach(button => {
      setCount(button, list.filter(item => matches(item, brand, button.getAttribute('data-powertrain'))).length);
    });
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-brand], [data-powertrain]');
    if (!button || !root.contains(button)) return;
    const attr = button.hasAttribute('data-brand') ? 'data-brand' : 'data-powertrain';
    root.querySelectorAll('[' + attr + ']').forEach(chip => {
      const on = chip === button;
      chip.classList.toggle('is-active', on);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    apply();
  });
}
