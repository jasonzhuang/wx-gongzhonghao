## Context

微信公众号文章托管在 `mp.weixin.qq.com` 上，页面采用客户端渲染，包含反爬机制（环境检测、频率限制、验证码拦截）。传统的 HTTP 抓取方案（如 axios + cheerio）无法可靠获取内容。项目从零开始，没有现有代码基础。

目标用户是开发者，通过命令行工具输入文章 URL，获取结构化的文章内容（JSON 格式）。

## Goals / Non-Goals

**Goals:**
- 使用 Playwright 模拟真实浏览器访问微信文章，绕过基本的反爬检测
- 支持 cookie/session 持久化，避免每次都需要验证
- 当遇到"环境异常"验证页时，暂停等待用户手动完成验证，然后继续
- 提取文章结构化信息：标题、作者、公众号名称、发布时间、正文（HTML + 纯文本）、封面图 URL
- 支持从公众号历史消息页识别文章链接
- 输出为 JSON 格式

**Non-Goals:**
- 不做大规模爬虫/批量抓取优化（不做 IP 池、代理轮换）
- 不做微信登录自动化（验证需用户手动完成）
- 不做文章内嵌视频的下载/转码
- 不做公众号搜索功能
- 不做 GUI 界面

## Decisions

### 1. 使用 Playwright 而非 Puppeteer

**选择**: Playwright  
**理由**: Playwright 对多浏览器支持更好，API 更现代，自动等待机制更可靠，且对反检测的支持更好。Puppeteer 虽然也可行，但 Playwright 的 `browserContext.storageState()` 对 cookie 持久化支持更优雅。

### 2. 使用 headed 模式处理验证

**选择**: 默认 headed 模式，遇到验证页时暂停等待用户操作  
**理由**: 微信的验证机制（滑块验证、扫码等）无法自动化绕过。headed 模式让用户可以看到并手动完成验证。首次运行后 cookie 会持久化，后续运行可切换为 headless。  
**备选**: 全程 headless + 失败重试 —— 放弃，因为验证无法自动完成。

### 3. 项目结构 — 单一 CLI 工具 + 模块化内核

**选择**: 一个 `src/` 目录，按职责拆分模块（browser、extractor、discovery），入口为 CLI  
**理由**: 项目规模较小，不需要 monorepo。模块化设计便于单独测试和复用。

```
wx-article-scraper/
├── src/
│   ├── cli.ts              # CLI 入口，参数解析
│   ├── browser/
│   │   ├── session.ts       # 浏览器会话管理，cookie 持久化
│   │   └── interceptor.ts   # 验证页检测与等待逻辑
│   ├── extractor/
│   │   └── article.ts       # 文章内容提取
│   ├── discovery/
│   │   └── links.ts         # 链接发现与收集
│   └── types.ts             # 共享类型定义
├── data/
│   └── session/             # cookie/session 持久化目录
├── package.json
└── tsconfig.json
```

### 4. 内容提取策略 — DOM 选择器 + 结构化解析

**选择**: 使用 Playwright 的 `page.evaluate()` 在页面内执行 DOM 查询  
**理由**: 微信文章有相对稳定的 DOM 结构（`#activity-name` 标题、`#js_content` 正文等），直接用选择器提取比用正则匹配 HTML 更可靠。  
**备选**: 用 Readability.js 提取 —— 作为 fallback 方案保留，当选择器失效时使用。

## Risks / Trade-offs

- **[微信反爬升级]** → 微信可能随时调整反爬策略导致工具失效。**缓解**: 模块化设计使得调整提取逻辑的成本低，cookie 持久化减少触发频率。
- **[DOM 结构变化]** → 微信改版可能导致选择器失效。**缓解**: 将选择器集中管理，搭配 Readability.js 作为 fallback。
- **[验证频率过高]** → 频繁访问可能导致每次都需验证。**缓解**: 持久化 cookie，添加请求间隔，支持用户设置延迟。
- **[headless 检测]** → 微信可能检测 headless 浏览器。**缓解**: 使用 Playwright 的 stealth 插件（`playwright-extra` + `puppeteer-extra-plugin-stealth`），必要时默认 headed 模式。
