## 1. 项目初始化

- [x] 1.1 创建 `package.json`，配置项目名称、入口、scripts（`build`、`start`）
- [x] 1.2 创建 `tsconfig.json`，配置 TypeScript 编译选项（target: ES2020, module: NodeNext）
- [x] 1.3 安装依赖：`playwright`、`typescript`、`@types/node`、`@mozilla/readability`、`linkedom`
- [x] 1.4 创建目录结构：`src/browser/`、`src/extractor/`、`src/discovery/`、`data/session/`

## 2. 类型定义

- [x] 2.1 创建 `src/types.ts`，定义 `ArticleData` 接口（url, title, author, accountName, publishTime, coverImage, contentHtml, contentText）
- [x] 2.2 定义 `ScraperOptions` 接口（headless, sessionDir, timeout, delay 等配置项）

## 3. 浏览器会话管理（browser-session）

- [x] 3.1 创建 `src/browser/session.ts`，实现 `BrowserSession` 类：启动浏览器、加载/保存 storage state
- [x] 3.2 实现 cookie 持久化逻辑：检查 `data/session/storage-state.json` 是否存在，存在则加载，不存在则创建新 context
- [x] 3.3 实现 `saveSession()` 方法：在成功访问后调用 `context.storageState()` 保存到文件
- [x] 3.4 实现 `close()` 方法：正确关闭 context 和 browser，注册 process 信号处理确保异常退出时清理

## 4. 验证拦截处理（browser-session）

- [x] 4.1 创建 `src/browser/interceptor.ts`，实现 `detectVerification(page)` 函数：检测页面是否为验证拦截页
- [x] 4.2 实现 `waitForVerification(page, timeout)` 函数：检测到验证页后输出提示，等待页面变化（URL 变化或验证元素消失），超时 5 分钟后退出

## 5. 文章内容提取（article-extractor）

- [x] 5.1 创建 `src/extractor/article.ts`，实现 `extractArticle(page): Promise<ArticleData>` 函数
- [x] 5.2 实现标题提取：优先 `#activity-name`，fallback 到 `<title>` 和 `og:title`
- [x] 5.3 实现作者/公众号名称提取：`#js_name`、`#js_author_name`、`.rich_media_meta_text`
- [x] 5.4 实现发布时间提取：`#publish_time` 元素或页面脚本中的 `publish_time` 变量，格式化为 ISO 8601
- [x] 5.5 实现正文提取：`#js_content` 的 innerHTML 和 innerText，fallback 到 Readability.js
- [x] 5.6 实现封面图提取：`og:image` meta 标签

## 6. 链接发现（link-discovery）

- [x] 6.1 创建 `src/discovery/links.ts`，实现 `isArticleUrl(url)` 函数：判断 URL 是否匹配 `mp.weixin.qq.com/s/` 模式
- [x] 6.2 实现 `discoverLinks(page): Promise<string[]>` 函数：扫描页面所有 `<a>` 标签，筛选并去重文章链接
- [x] 6.3 实现链接列表输出：带序号显示发现的链接

## 7. CLI 入口

- [x] 7.1 创建 `src/cli.ts`，使用 `process.argv` 解析命令行参数（url, --headless, --output, --all）
- [x] 7.2 实现主流程：判断输入是单篇文章 URL 还是需要链接发现 → 提取内容 → 输出 JSON
- [x] 7.3 实现批量提取逻辑：逐个访问文章链接，添加 2-5 秒随机延迟，输出 JSON 数组
- [x] 7.4 添加错误处理和友好的控制台输出（进度提示、错误信息）

## 8. 集成测试

- [x] 8.1 使用一个真实的微信文章 URL 进行端到端测试，验证完整的提取流程
- [x] 8.2 验证 session 持久化：第二次运行时确认能加载已保存的 cookie
- [x] 8.3 验证验证页检测：模拟或手动触发验证流程，确认等待逻辑正常工作
