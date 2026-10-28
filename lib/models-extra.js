// 车型详情页上给海外读者看的补充块：名称对照、上市市场、国内指导价、续航口径、出处。
// 字段缺失就写「暂无数据」，不补数字。

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&(?!(?:#\d+|#x[0-9a-fA-F]+|amp|lt|gt|quot|apos);)/gi, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bi(en, zh) {
  return `<span data-lang="en">${en}</span><span data-lang="zh" hidden>${zh}</span>`;
}

function missing() {
  return bi('No verified figure', '暂无数据');
}

const MARKET_ZH = {
  Europe: '欧洲',
  Australia: '澳大利亚',
  Thailand: '泰国',
  Singapore: '新加坡',
  Brazil: '巴西',
  Mexico: '墨西哥',
  Philippines: '菲律宾',
  'South Africa': '南非',
  Argentina: '阿根廷',
  'New Zealand': '新西兰',
  Indonesia: '印度尼西亚',
  Nepal: '尼泊尔',
  Uruguay: '乌拉圭',
  Germany: '德国',
  Italy: '意大利',
  Belgium: '比利时',
  Spain: '西班牙',
  'Latin America': '拉丁美洲',
  Netherlands: '荷兰',
  Norway: '挪威',
  Sweden: '瑞典',
  Colombia: '哥伦比亚',
  Russia: '俄罗斯',
  Bahamas: '巴哈马',
  'Dominican Republic': '多米尼加',
  'Costa Rica': '哥斯达黎加',
  'United Kingdom': '英国'
};

function marketLabel(name) {
  const en = escapeHtml(name);
  const zh = escapeHtml(MARKET_ZH[name] || name);
  return bi(en, zh);
}

function formatCny(amount) {
  const digits = String(Math.round(Number(amount)));
  return '¥' + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function httpsUrl(url) {
  const value = String(url || '').trim();
  if (!/^https:\/\/\S+$/i.test(value)) return '';
  return value;
}

function namesHTML(names) {
  if (!names || (names.cn == null && !(Array.isArray(names.overseas) && names.overseas.length))) {
    return `<p class="model-extra-missing">${missing()}</p>`;
  }
  const rows = [];
  if (names.cn) {
    rows.push(`<tr><th scope="row">${bi('China', '中国')}</th><td>${escapeHtml(names.cn)}</td></tr>`);
  }
  (names.overseas || []).forEach(item => {
    if (!item || !item.name) return;
    const where = Array.isArray(item.markets) && item.markets.length
      ? item.markets.map(marketLabel).join(bi(', ', '、'))
      : missing();
    const status = item.status === 'planned-next'
      ? `<div class="model-extra-note">${bi('Next-generation model, planned export name.', '下一代车型、计划出口名。')}</div>`
      : '';
    rows.push(`<tr><th scope="row">${escapeHtml(item.name)}</th><td>${where}${status}</td></tr>`);
  });
  if (!rows.length) return `<p class="model-extra-missing">${missing()}</p>`;
  return `<table class="model-extra-table"><tbody>${rows.join('')}</tbody></table>`;
}

function marketsHTML(markets) {
  if (!Array.isArray(markets) || !markets.length) {
    return `<p class="model-extra-missing">${missing()}</p>`;
  }
  const items = markets.map(name => `<li>${marketLabel(name)}</li>`).join('');
  return `<ul class="model-extra-markets">${items}</ul>
    <p class="model-extra-note">${bi(
      'Listed markets are the ones named in the sources below. This is not a complete global census.',
      '下面只列出出处里核对到的市场，不是完整全球清单。')}</p>`;
}

function priceHTML(price) {
  if (!price || typeof price !== 'object') {
    return `<p class="model-extra-missing">${missing()}</p>`;
  }
  const min = Number.isFinite(price.min_cny) ? price.min_cny : null;
  const max = Number.isFinite(price.max_cny) ? price.max_cny : null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(price.as_of || '')) ? price.as_of : '';
  let figure = missing();
  if (min != null && max != null && min !== max) {
    const text = `${formatCny(min)}–${formatCny(max)}`;
    figure = bi(text, text);
  } else if (min != null && max != null) {
    const text = formatCny(min);
    figure = bi(text, text);
  } else if (min != null) {
    figure = bi(`${formatCny(min)} and up`, `${formatCny(min)} 起`);
  }
  const dateLine = date
    ? `<p class="model-extra-note">${bi('Price date: ' + escapeHtml(date), '价格日期：' + escapeHtml(date))}</p>`
    : '';
  const note = (price.note_en || price.note_zh)
    ? `<p class="model-extra-note">${bi(escapeHtml(price.note_en || price.note_zh), escapeHtml(price.note_zh || price.note_en))}</p>`
    : '';
  return `<p class="model-extra-price"><span class="spec-label">${bi('Official guide price', '官方指导价')}</span> <strong>${figure}</strong></p>
    ${dateLine}${note}`;
}

function rangeHTML(range) {
  const cycles = [
    ['cltc', 'CLTC', 'CLTC'],
    ['wltp', 'WLTP', 'WLTP'],
    ['epa', 'EPA', 'EPA']
  ];
  const rows = cycles.map(([key, en, zh]) => {
    const value = range && range[key];
    const cell = value && (value.en || value.zh)
      ? bi(escapeHtml(value.en || value.zh), escapeHtml(value.zh || value.en))
      : missing();
    return `<tr><th scope="row">${bi(en, zh)}</th><td>${cell}</td></tr>`;
  }).join('');
  return `<table class="model-extra-table"><tbody>${rows}</tbody></table>
    <p class="model-extra-note">${bi(
      'Cycles are listed separately and are not interchangeable.',
      '不同测试标准分开写，不能互相换算。')}</p>`;
}

function statusHTML(status) {
  if (!status || !(status.en || status.zh)) return '';
  const text = status.en && status.zh
    ? bi(escapeHtml(status.en), escapeHtml(status.zh))
    : escapeHtml(status.en || status.zh);
  return `<h2>${bi('Status', '状态')}</h2><p class="model-extra-note">${text}</p>`;
}

function sourcesHTML(sources) {
  if (!Array.isArray(sources) || !sources.length) {
    return `<p class="model-extra-missing">${missing()}</p>`;
  }
  const items = sources.map(source => {
    if (!source || !source.name) return '';
    const name = escapeHtml(source.name);
    const url = httpsUrl(source.url);
    const label = url
      ? `<a href="${escapeHtml(url)}" rel="noopener noreferrer">${name}</a>`
      : name;
    return `<li>${label}</li>`;
  }).filter(Boolean);
  if (!items.length) return `<p class="model-extra-missing">${missing()}</p>`;
  return `<ul class="model-extra-sources">${items.join('')}</ul>`;
}

function officialPriceParts(price) {
  if (!price || typeof price !== 'object') return null;
  const min = Number.isFinite(price.min_cny) ? price.min_cny : null;
  const max = Number.isFinite(price.max_cny) ? price.max_cny : null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(price.as_of || '')) ? price.as_of : '';
  if (min != null && max != null && min !== max) {
    const text = `${formatCny(min)}–${formatCny(max)}`;
    return { en: text, zh: text, date };
  }
  if (min != null && max != null) {
    const text = formatCny(min);
    return { en: text, zh: text, date };
  }
  if (min != null) {
    return { en: `${formatCny(min)} and up`, zh: `${formatCny(min)} 起`, date };
  }
  return null;
}

function modelPricePlain(model) {
  const data = model || {};
  const official = officialPriceParts(data.price_cn);
  if (official) {
    const date = official.date ? `, ${official.date}` : '';
    return {
      en: `official guide price ${official.en}${date}`,
      zh: `官方指导价 ${official.zh}${date}`
    };
  }
  return {
    en: `reference price ${data.price || 'n/a'}`,
    zh: `参考价 ${data.price || '暂无'}`
  };
}

function modelHeaderPrice(model) {
  const data = model || {};
  const official = officialPriceParts(data.price_cn);
  if (official) {
    const date = official.date
      ? ` <span style="font-size:12px;color:#9ca3af;font-weight:400;">${bi(escapeHtml(official.date), escapeHtml(official.date))}</span>`
      : '';
    return {
      official: true,
      labelEn: 'Official guide price',
      labelZh: '官方指导价',
      value: `${bi(escapeHtml(official.en), escapeHtml(official.zh))}${date}`
    };
  }
  const oldPrice = escapeHtml(data.price || '');
  const local = data.priceLocal
    ? ` <span style="font-size:12px;color:#9ca3af;font-weight:400;">(${escapeHtml(data.priceLocal)})</span>`
    : '';
  const figure = oldPrice ? `${oldPrice}${local}` : missing();
  return {
    official: false,
    labelEn: 'Reference price',
    labelZh: '参考价',
    value: figure
  };
}

function modelExtraHTML(model) {
  const data = model || {};
  return `
      <section class="model-extra">
        ${statusHTML(data.status)}
        <h2>${bi('Names', '名称对照')}</h2>
        ${namesHTML(data.names)}
        <h2>${bi('Overseas markets on sale', '已上市的海外市场')}</h2>
        ${marketsHTML(data.markets)}
        <h2>${bi('China official guide price', '国内官方指导价')}</h2>
        ${priceHTML(data.price_cn)}
        <h2>${bi('Range by test cycle', '续航口径')}</h2>
        ${rangeHTML(data.range_note)}
        <h2>${bi('Sources', '出处')}</h2>
        ${sourcesHTML(data.sources)}
      </section>`;
}

module.exports = { modelExtraHTML, modelHeaderPrice, modelPricePlain };
