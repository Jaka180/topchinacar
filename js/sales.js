// ============ SALES & RANKINGS PAGE RUNTIME ============
// /sales and /zh/sales are fully prerendered by build.js (via lib/sales.js).
// This script only wires up client behaviour on the prerendered page:
//   1. column sorting on tables marked [data-sales-sortable]
//   2. month selector (data-sales-month-panels) and company selector
//      (data-sales-company-panels) that toggle the matching hidden panel
// No third-party libraries. No dependency on the SPA pages.js runtime.

(function () {
  'use strict';

  // Columns whose data-sort-value is a number. Text columns sort as strings.
  var NUMERIC_KEYS = {
    month_total: true,
    month_overseas: true,
    ytd_total: true,
    ytd_overseas: true,
    rank: true,
    units: true,
    preliminary: true
  };

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // Sort the <tbody> rows of a table by the clicked header's column.
  // Rows whose cell has an empty data-sort-value ("—") always sort last,
  // in both directions, so "missing" is never mistaken for a small number.
  function sortTable(table, th) {
    var tbody = table.querySelector('tbody');
    if (!tbody) return;

    var key = th.getAttribute('data-sort');
    var numeric = !!NUMERIC_KEYS[key];
    var previous = th.getAttribute('aria-sort');
    // none/descending → ascending; ascending → descending
    var dir = previous === 'ascending' ? -1 : 1;

    var headerCells = Array.prototype.slice.call(th.parentNode.children);
    var colIndex = headerCells.indexOf(th);
    if (colIndex < 0) return;

    var rows = Array.prototype.slice.call(tbody.rows);
    rows.sort(function (a, b) {
      var ac = a.cells[colIndex];
      var bc = b.cells[colIndex];
      var av = ac ? (ac.getAttribute('data-sort-value') || '') : '';
      var bv = bc ? (bc.getAttribute('data-sort-value') || '') : '';
      var aEmpty = av === '';
      var bEmpty = bv === '';

      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;   // missing always last
      if (bEmpty) return -1;

      var cmp;
      if (numeric) {
        var an = parseFloat(av);
        var bn = parseFloat(bv);
        cmp = an - bn;
        if (!cmp) cmp = av < bv ? -1 : (av > bv ? 1 : 0);
      } else {
        cmp = av.localeCompare(bv, 'en', { numeric: true, sensitivity: 'base' });
      }
      return cmp * dir;
    });

    rows.forEach(function (row) { tbody.appendChild(row); });

    headerCells.forEach(function (cell) {
      if (cell.getAttribute('data-sort')) cell.setAttribute('aria-sort', 'none');
    });
    th.setAttribute('aria-sort', dir === 1 ? 'ascending' : 'descending');
  }

  function wireSorting() {
    Array.prototype.forEach.call(document.querySelectorAll('table[data-sales-sortable]'), function (table) {
      Array.prototype.forEach.call(table.querySelectorAll('th[data-sort]'), function (th) {
        var button = th.querySelector('.sales-sort-btn');
        (button || th).addEventListener('click', function () {
          sortTable(table, th);
        });
      });
    });
  }

  // Toggle the panel matching the select value; every other panel is hidden.
  function wireSelector(selectId, containerSelector, panelAttr) {
    var select = document.getElementById(selectId);
    var container = document.querySelector(containerSelector);
    if (!select || !container) return;

    var panels = Array.prototype.slice.call(container.querySelectorAll('.sales-panel'));
    var show = function () {
      var value = select.value;
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute(panelAttr) !== value;
      });
    };
    select.addEventListener('change', show);
    show();
  }

  ready(function () {
    wireSorting();
    wireSelector('sales-month-select', '[data-sales-month-panels]', 'data-sales-month');
    wireSelector('sales-company-select', '[data-sales-company-panels]', 'data-sales-company');
  });
})();
