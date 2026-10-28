// C1：edition 缺省是 global。slug 以 -china-market-daily 结尾的也算 china。
function articleEdition(article) {
  const edition = String(article && article.edition || '').trim().toLowerCase();
  const slug = String(article && article.slug || '');
  if (edition === 'china' || slug.endsWith('-china-market-daily')) return 'china';
  return 'global';
}

// 上方两块日报只收「这一份日报」的期。
// 缺省 global 的分析、专题不能算进「中国汽车出海日报」。
// 出海日报按 C1：slug 以 -china-auto-daily 结尾，或 tag_en 为 Daily Briefing / China Auto Overseas Daily。
function dailyKind(article) {
  if (articleEdition(article) === 'china') return 'china';
  const slug = String(article && article.slug || '');
  const tag = String(article && article.tag_en || '').trim();
  if (
    slug.endsWith('-china-auto-daily')
    || tag === 'Daily Briefing'
    || tag === 'China Auto Overseas Daily'
  ) return 'global';
  return 'other';
}

module.exports = { articleEdition, dailyKind };
