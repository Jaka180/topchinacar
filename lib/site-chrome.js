// 新导航 6 栏。英文文案必须和 js/i18n.js 的 en 完全一致，中文页才翻译得动。
const NAV = [
  ['/news', 'nav.news', 'Briefings'],
  ['/people', 'nav.people', 'People Intel'],
  ['/chinese-car-brands', 'nav.companies', 'Companies'],
  ['/sales', 'nav.sales', 'Sales & Rankings'],
  ['/analysis', 'nav.analysis', 'Analysis'],
  ['/sources', 'nav.sources', 'Sources']
];

function footerHTML() {
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <div class="footer-logo">TopChinaCar</div>
      <p data-i18n="footer.tagline">An editorial guide to the new era of Chinese automobiles, written for the world.</p>
    </div>
    <div class="footer-col">
      <h2 class="footer-heading" data-i18n="footer.explore">Explore</h2>
      <a href="/news" data-i18n="nav.news">Briefings</a>
      <a href="/people" data-i18n="nav.people">People Intel</a>
      <a href="/chinese-car-brands" data-i18n="nav.companies">Companies</a>
      <a href="/sales" data-i18n="nav.sales">Sales & Rankings</a>
      <a href="/analysis" data-i18n="nav.analysis">Analysis</a>
      <a href="/sources" data-i18n="nav.sources">Sources</a>
    </div>
    <div class="footer-col">
      <h2 class="footer-heading" data-i18n="footer.topics">Topics</h2>
      <a href="/intelligence" data-i18n="nav.intelligence">Intelligence</a>
      <a href="/china-ev-news" data-i18n="nav.ev">EV</a>
      <a href="/china-car-export-news" data-i18n="nav.exports">Exports</a>
      <a href="/markets" data-i18n="nav.markets">Markets</a>
      <a href="/policy" data-i18n="nav.policy">Policy</a>
      <a href="/data" data-i18n="nav.data">Data</a>
      <a href="/models" data-i18n="nav.models">Models</a>
      <a href="/tech" data-i18n="nav.tech">Tech</a>
    </div>
    <div class="footer-col">
      <h2 class="footer-heading" data-i18n="footer.about">About</h2>
      <a href="/about" data-i18n="nav.about">Our story</a>
      <a href="/editorial-policy" data-i18n="footer.editorial">Editorial Policy</a>
      <a href="/methodology" data-i18n="nav.methodology">Methodology</a>
      <a href="/tips" data-i18n="nav.tips">Send a tip</a>
      <a href="/newsletter" data-i18n="footer.newsletter">Newsletter</a>
      <a href="/contact" data-i18n="footer.contact">Contact</a>
      <a href="/privacy" data-i18n="footer.privacy">Privacy Policy</a>
    </div>
    <div class="footer-col footer-meta">
      <h2 class="footer-heading" data-i18n="footer.status">Status</h2>
      <p>© 2026 TopChinaCar</p>
      <p data-i18n="footer.rights">Editorial, independent, worldwide.</p>
    </div>
  </div>
</footer>`;
}

module.exports = { NAV, footerHTML };
