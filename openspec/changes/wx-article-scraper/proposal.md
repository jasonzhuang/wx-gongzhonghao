## Why

微信公众号文章（`mp.weixin.qq.com/s/...`）是中文互联网重要的内容载体，但其页面依赖客户端渲染、反爬机制和验证码拦截，传统 HTTP 请求无法可靠获取正文内容。需要一个基于 Playwright 的自动化工具，能够像真实浏览器一样加载页面、绑定 cookie/验证，并提取文章正文、标题、作者等结构化信息。

## What Changes

- 新增一个 Node.js/TypeScript 命令行工具，使用 Playwright 访问微信公众号文章页面
- 支持输入单个文章 URL 或从公众号主页批量识别文章链接
- 自动处理微信的环境异常验证页（如 "当前环境异常，完成验证后即可继续访问"），支持等待用户手动完成验证后继续
- 提取文章的结构化内容：标题、作者/公众号名称、发布时间、正文（HTML 与纯文本）、封面图
- 输出为 JSON 格式，便于后续处理

## Capabilities

### New Capabilities
- `browser-session`: 管理 Playwright 浏览器会话，包括启动、cookie 持久化、处理验证拦截页面
- `article-extractor`: 从单篇微信文章页面提取结构化内容（标题、作者、正文、时间等）
- `link-discovery`: 从微信公众号相关页面识别并收集文章链接列表

### Modified Capabilities

（无现有能力需要修改）

## Impact

- **依赖**: 新增 `playwright` 作为核心依赖，`typescript` 作为开发依赖
- **运行环境**: 需要 Node.js >= 18，首次运行需安装 Playwright 浏览器（`npx playwright install chromium`）
- **网络**: 需要能访问 `mp.weixin.qq.com` 的网络环境
- **存储**: 需要本地目录存放浏览器 cookie/session 数据和输出结果
