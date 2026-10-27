# TopChinaCar — 改进版（2026-07-04）

预渲染多页面版本，替换原来的 hash 路由 SPA。部署平台：**Cloudflare Pages**（项目 tochinacar，连接 GitHub Jaka180/tochinacar，push 到 main 自动部署）。

**css/ 与 images/ 目录不在此文件夹内——保留仓库里原有的，不要动。**

## 本次改了什么

| 问题（原版） | 修复 |
|---|---|
| `#/brands` hash 路由，Google 只能收录 1 个 URL | 真实路径 `/brands` `/models` `/news` `/tech` `/about`，每页独立 HTML（Cloudflare Pages 原生把 `brands.html` 服务在 `/brands`） |
| 正文全靠 JS 渲染，爬虫看到空页面 | `build.js` 预渲染，每页 HTML 里有完整内容 |
| 所有页面共用同一个 title/description | 每页独立 title、description、canonical、og 标签 |
| 无 sitemap.xml / robots.txt | 已生成 |
| 订阅表单是假的（点了只显示成功，邮箱没存） | 2026-10-27 起直接接中国汽车出海日报的订阅（`radar.topchinacar.com/api/subscribe`：确认邮件 + Turnstile + 限流），见 china-auto-global-radar 的 ADR-0026 |
| 底部残留 Perplexity 编辑器脚本（约 10KB） | 已移除 |
| 旧链接 `#/brands?focus=byd` | app.js 自动跳转到 `/brands?focus=byd` |
| 无安全/缓存响应头 | `_headers` 文件 |

## 部署步骤

```bash
git clone https://github.com/Jaka180/tochinacar.git
cd tochinacar
# 把本文件夹里的所有文件复制进去（覆盖 index.html 和 js/，css/ images/ 不受影响）
cp -r /path/to/topchinacar-site/* .
git add -A && git commit -m "Prerendered multi-page + SEO + real newsletter signup"
git push
```

Cloudflare Pages 会自动部署。然后做三件事：

1. **询盘接通**（订阅已改接中国汽车出海日报，不再需要 Resend 联系人列表）：Cloudflare 后台 → Workers & Pages → tochinacar → Settings → Variables and Secrets（Production 环境），加：
   - `RESEND_API_KEY`（resend.com → API Keys，类型选 **Secret**）
   - `INQUIRY_TO`（询盘接收邮箱，不设则发到 hello@topchinacar.com——注意该地址需真实可收信，建议直接设成你的常用邮箱，或在 Cloudflare Email Routing 里把 hello@ 转发到你邮箱）

   加完 Retry deployment 一次让变量生效。没配好之前表单会显示「暂时不可用」，不会假装成功。
2. **Google Search Console**：添加 www.topchinacar.com，提交 `https://www.topchinacar.com/sitemap.xml`。
3. **域名归一**：现在 topchinacar.com 和 www 都直接返回页面，canonical 指向 www。建议在 Cloudflare 加一条 Redirect Rule：`topchinacar.com/*` → 301 → `https://www.topchinacar.com/$1`（Rules → Redirect Rules）。

## 每日文章系统（阶段一核心）

GCP 上的日报 pipeline 每天生成一篇英文编辑文章，自动 push 到本仓库，Cloudflare 自动部署：

```
GCP run_daily.sh 第7步 site_publish.py
  → 日报转英文文章 JSON（含 events[] 结构化数据，为将来数据产品积累）
  → 写入 articles/<日期>-china-auto-daily.json
  → node build.js（生成 news/<slug>.html、更新 News 索引与 sitemap）
  → git push → Cloudflare Pages 部署
```

文章 JSON 可选用 `primary_brands` 和 `secondary_brands` 数组标注品牌（值可用品牌 ID 或英文名）。品牌页优先展示主标签文章，并最多补入 1 篇仅提及该品牌的文章；未提供标签时，构建器以标题为主标签、摘要/正文提及为次标签。这样新文章不会仅因顺带提到某品牌而压过品牌主线内容。

**VM 上一次性配置**（在 GCP 服务器执行）：

```bash
# 1. 生成 SSH key，公钥加到 GitHub 仓库 Settings → Deploy keys（勾选 Allow write access）
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub

# 2. 克隆网站仓库 + 装 Node
git clone git@github.com:Jaka180/tochinacar.git ~/tochinacar
sudo apt install -y nodejs
cd ~/tochinacar && git config user.name briefing-bot && git config user.email bot@topchinacar.com

# 3. server/.env 里加一行（也是默认值，可省略）
# SITE_REPO_DIR=/home/<你的用户名>/tochinacar
```

`SITE_REPO_DIR` 不存在时第 7 步自动跳过，不影响其余步骤。

## 以后改内容

品牌/车型/新闻数据都在 `js/data.js`，文案在 `js/i18n.js`。改完跑一遍：

```bash
node build.js   # 重新生成 6 个 HTML + sitemap
node --test tests/build-output.test.js  # 日期边界、无障碍与图片尺寸回归
node scripts/site-health.js             # 全站链接、SEO、结构化数据与重复 ID 检查
node scripts/site-health.js --live      # 部署后检查 Sitemap 中的全部线上页面
```

再 commit + push 即可。

## 文件说明

- `build.js` — 预渲染脚本（Node，无依赖）
- `js/pages.js` — 页面渲染函数（浏览器与 build.js 共用）
- `js/app.js` — 客户端运行时：语言切换、车型筛选、订阅表单、旧链接跳转
- `js/data.js` / `js/i18n.js` — 数据与文案（内容与原版一致，未改）
- 订阅表单（`js/app.js` 的 initNewsletter）→ `https://radar.topchinacar.com/api/subscribe`；旧的 `functions/api/subscribe.js`（Resend 联系人列表）已删除
- `functions/api/inquiry.js` — 出口询盘接口（/quote 页表单 → 邮件到 INQUIRY_TO）
- `_headers` — 安全与缓存响应头
- `*.html` — build.js 生成，勿手改
