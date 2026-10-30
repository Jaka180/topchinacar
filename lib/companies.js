// 汽车公司列表（按集团）和详情页里的公司关系、人事、销量。事实只读 js/data.js 的 entity，这里不改数据。
const { peopleBlockForBrand, salesBlockForBrand } = require('./company-hooks');

// 分组和组内顺序来自总清单 data/company-inventory.json（lib/inventory.js）
const { GROUP_DEFS } = require('./inventory');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bi(en, zh) {
  return `<span data-lang="en">${en}</span><span data-lang="zh" hidden>${zh}</span>`;
}

function tx(lang, en, zh) {
  return lang === 'zh' ? zh : en;
}

function clean(value) {
  if (value == null) return '';
  return String(value).trim();
}

function heading(en, zh) {
  return `<h2 style="font-size:22px;margin:40px 0 20px;">${bi(escapeHtml(en), escapeHtml(zh))}</h2>`;
}

function structureRow(labelEn, labelZh, valueHtml) {
  return `<div class="company-structure-row" style="margin:0 0 16px;">
      <div class="spec-label">${bi(escapeHtml(labelEn), escapeHtml(labelZh))}</div>
      <div style="font-family:var(--sans);font-weight:500;font-size:15px;line-height:1.65;margin-top:4px;">${valueHtml}</div>
    </div>`;
}

function nameHtml(en, zh) {
  const enText = clean(en);
  const zhText = clean(zh);
  if (!enText && !zhText) return '';
  return bi(escapeHtml(enText || zhText), escapeHtml(zhText || enText));
}

function jointVentureHtml(item) {
  if (!item || typeof item !== 'object') return '';
  const name = nameHtml(item.name_en, item.name_zh);
  const partners = Array.isArray(item.partners) ? item.partners.map(clean).filter(Boolean) : [];
  const note = clean(item.stake_note);
  if (!name && !partners.length && !note) return '';
  const partnerLine = partners.length
    ? `<div>${bi('Partners', '伙伴')}: ${escapeHtml(partners.join('; '))}</div>`
    : '';
  const noteLine = note ? `<div>${escapeHtml(note)}</div>` : '';
  const title = name ? `<strong>${name}</strong>` : '';
  return `<div class="company-jv" style="margin-top:10px;">${title}${partnerLine}${noteLine}</div>`;
}

function companyStructureHTML(brand) {
  const entity = (brand && brand.entity) || {};
  const rows = [];
  if (clean(entity.group_en) || clean(entity.group_zh)) {
    rows.push(structureRow('Group', '所属集团', nameHtml(entity.group_en, entity.group_zh)));
  }
  if (clean(entity.parent_en) || clean(entity.parent_zh)) {
    rows.push(structureRow('Parent company', '母公司', nameHtml(entity.parent_en, entity.parent_zh)));
  }
  const listed = Array.isArray(entity.listed)
    ? entity.listed.filter(item => item && (clean(item.exchange) || clean(item.code)))
    : [];
  if (listed.length) {
    const text = listed
      .map(item => [clean(item.exchange), clean(item.code)].filter(Boolean).join(' '))
      .filter(Boolean)
      .join(', ');
    if (text) rows.push(structureRow('Listing', '上市地点和代码', escapeHtml(text)));
  }
  const ventures = (Array.isArray(entity.jv) ? entity.jv : []).map(jointVentureHtml).filter(Boolean);
  if (ventures.length) {
    rows.push(structureRow('Joint ventures', '合资公司', ventures.join('')));
  }
  if (!rows.length) return '';
  return `<div class="company-structure" id="company-structure">
    ${heading('Corporate structure', '公司关系')}
    ${rows.join('')}
  </div>`;
}

function companyPeopleHTML(brand) {
  const inner = peopleBlockForBrand(brand && brand.id);
  if (!inner) return '';
  return `<div class="company-people" id="company-people">
    ${heading('Organization and people', '组织与人事')}
    ${inner}
  </div>`;
}

function companySalesHTML(brand) {
  const block = salesBlockForBrand(brand && brand.id);
  if (!block.show) return '';
  const body = block.html || `<p>${bi('No data yet', '暂无数据')}</p>`;
  return `<div class="company-sales" id="company-sales">
    ${heading('Sales', '销量')}
    ${body}
  </div>`;
}

function organizationLdNode(brand, pageUrl) {
  const entity = (brand && brand.entity) || {};
  const node = {
    '@type': 'Organization',
    name: brand.name,
    url: pageUrl
  };
  if (clean(brand.cn)) node.alternateName = brand.cn;
  const parentEn = clean(entity.parent_en);
  const parentZh = clean(entity.parent_zh);
  if (parentEn || parentZh) {
    const parent = { '@type': 'Organization', name: parentEn || parentZh };
    if (parentEn && parentZh && parentZh !== parentEn) parent.alternateName = parentZh;
    node.parentOrganization = parent;
  }
  return node;
}

function groupSections(brands) {
  const list = Array.isArray(brands) ? brands : [];
  const byId = new Map(list.map(brand => [brand && brand.id, brand]));
  const used = new Set();
  const sections = [];
  for (const def of GROUP_DEFS) {
    const items = [];
    for (const id of def.ids) {
      const brand = byId.get(id);
      if (!brand || used.has(id)) continue;
      used.add(id);
      items.push(brand);
    }
    if (items.length) sections.push({ ...def, items });
  }
  const rest = list.filter(brand => brand && brand.id && !used.has(brand.id));
  if (rest.length) sections.push({ id: 'other', en: 'Other', zh: '其他', items: rest });
  return sections;
}

function companiesIndexHTML(brands, lang, renderCard, faqHTML) {
  const list = Array.isArray(brands) ? brands : [];
  const sections = groupSections(list);
  const legacyCount = list.filter(brand => brand.category === 'group').length;
  const startupCount = list.filter(brand => brand.category === 'startup').length;
  const subCount = list.filter(brand => brand.category === 'subbrand').length;
  const sticky = sections.map(section => {
    const label = tx(lang, section.en, section.zh);
    return `<button type="button" class="brand-sticky-link" data-target="group-${section.id}" onclick="scrollToBrandSection('group-${section.id}')">${escapeHtml(label)} <span class="brand-sticky-count">${section.items.length}</span></button>`;
  }).join('\n        ');
  const body = sections.map(section => {
    const title = tx(lang, section.en, section.zh);
    const count = section.items.length;
    const countLabel = tx(lang, count === 1 ? 'brand' : 'brands', '个品牌');
    return `
      <section class="brand-section" id="group-${section.id}">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="section-eyebrow">${tx(lang, 'Companies', '汽车公司')}</div>
              <h2 class="section-title">${escapeHtml(title)}</h2>
            </div>
            <p class="section-deck">${count} ${countLabel}</p>
          </div>
          <div class="brands-grid">
            ${section.items.map(brand => renderCard(brand, lang)).join('')}
          </div>
        </div>
      </section>`;
  }).join('');

  return `
    <section class="page-header">
      <div class="container">
        <div class="section-eyebrow">${tx(lang, 'Companies', '汽车公司')}</div>
        <h1 class="page-title">${tx(lang, 'Companies', '汽车公司')}</h1>
        <p class="page-deck">${tx(lang,
    'A field guide to the Chinese automakers shaping the next decade — from century-old state giants to startups born in the EV era.',
    '一份关于塑造未来十年中国车企的实地指南——从百年国企到诞生于电动时代的新势力。')}</p>
      </div>
    </section>
    <nav class="brand-sticky-nav" aria-label="${tx(lang, 'Company groups', '公司分组')}">
      <div class="container brand-sticky-inner">
        <span class="brand-sticky-label">${tx(lang, 'Jump to', '快速跳转')}</span>
        ${sticky}
      </div>
    </nav>
    <section class="brand-index-stats-wrap">
      <div class="container">
        <div class="brand-index-stats">
          <div class="brand-stat">
            <div class="brand-stat-num">${legacyCount}</div>
            <div class="brand-stat-label">${tx(lang, 'Legacy Groups', '传统车企集团')}</div>
          </div>
          <div class="brand-stat">
            <div class="brand-stat-num">${startupCount}</div>
            <div class="brand-stat-label">${tx(lang, 'New-Energy Startups', '造车新势力')}</div>
          </div>
          <div class="brand-stat">
            <div class="brand-stat-num">${subCount}</div>
            <div class="brand-stat-label">${tx(lang, 'Group Sub-Brands', '集团子品牌')}</div>
          </div>
          <div class="brand-stat brand-stat-total">
            <div class="brand-stat-num">${list.length}</div>
            <div class="brand-stat-label">${tx(lang, 'Brands Total', '品牌总数')}</div>
          </div>
        </div>
      </div>
    </section>
    ${body}
    ${faqHTML || ''}
  `;
}

module.exports = {
  GROUP_DEFS,
  companyStructureHTML,
  companyPeopleHTML,
  companySalesHTML,
  organizationLdNode,
  companiesIndexHTML
};
