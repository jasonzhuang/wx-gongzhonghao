## ADDED Requirements

### Requirement: 启动浏览器会话
系统 SHALL 使用 Playwright 启动 Chromium 浏览器实例，支持 headed 和 headless 两种模式。默认使用 headed 模式以便用户处理验证。

#### Scenario: 首次启动（无已保存 session）
- **WHEN** 用户首次运行工具，本地不存在 session 文件
- **THEN** 系统启动 headed 模式的 Chromium 浏览器，创建新的浏览器上下文

#### Scenario: 使用已保存的 session 启动
- **WHEN** 用户运行工具，本地存在有效的 session 文件
- **THEN** 系统加载已保存的 cookie/storage state 到浏览器上下文，可选择 headless 模式

### Requirement: Session 持久化
系统 SHALL 在每次成功访问文章后，将浏览器的 cookie 和 storage state 保存到本地文件 `data/session/storage-state.json`。

#### Scenario: 成功访问后保存 session
- **WHEN** 成功加载一篇文章页面（非验证拦截页）
- **THEN** 系统将当前浏览器上下文的 storage state 保存到 `data/session/storage-state.json`

#### Scenario: Session 文件目录不存在
- **WHEN** `data/session/` 目录不存在
- **THEN** 系统自动创建该目录后保存 session

### Requirement: 验证拦截页检测与处理
系统 SHALL 检测微信的"环境异常"验证拦截页面，暂停执行并提示用户手动完成验证。

#### Scenario: 遇到验证拦截页
- **WHEN** 页面加载后检测到"环境异常"或"完成验证后即可继续访问"文本
- **THEN** 系统在控制台输出提示"检测到验证页面，请在浏览器中手动完成验证..."，并等待页面 URL 变化或验证元素消失

#### Scenario: 用户完成验证
- **WHEN** 用户在浏览器中完成验证，页面跳转到正常内容
- **THEN** 系统检测到页面变化后，保存新的 session 并继续执行提取任务

#### Scenario: 验证超时
- **WHEN** 等待验证超过 5 分钟用户仍未完成
- **THEN** 系统输出超时提示并退出当前任务，已保存的 session 保持不变

### Requirement: 浏览器会话关闭
系统 SHALL 在任务完成或异常退出时正确关闭浏览器实例，释放资源。

#### Scenario: 正常关闭
- **WHEN** 所有提取任务完成
- **THEN** 系统关闭浏览器上下文和浏览器实例，进程正常退出

#### Scenario: 异常退出
- **WHEN** 执行过程中发生未捕获异常
- **THEN** 系统在退出前尝试关闭浏览器实例，避免残留进程
