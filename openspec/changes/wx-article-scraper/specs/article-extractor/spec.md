## ADDED Requirements

### Requirement: 提取文章标题
系统 SHALL 从微信文章页面提取文章标题。

#### Scenario: 正常文章页
- **WHEN** 页面包含 `#activity-name` 元素
- **THEN** 系统提取该元素的文本内容作为文章标题，去除首尾空白

#### Scenario: 标题元素缺失
- **WHEN** 页面不包含 `#activity-name` 元素
- **THEN** 系统尝试从 `<title>` 标签或 `og:title` meta 标签提取，若均不可用则标题字段为空字符串

### Requirement: 提取作者和公众号信息
系统 SHALL 从微信文章页面提取作者名称和公众号名称。

#### Scenario: 包含作者和公众号信息
- **WHEN** 页面包含公众号名称元素（`#js_name`）和作者元素（`#js_author_name` 或 `.rich_media_meta_text`）
- **THEN** 系统分别提取公众号名称和作者名称

#### Scenario: 作者信息缺失
- **WHEN** 页面不包含作者元素
- **THEN** 系统将作者字段设为空字符串，公众号名称仍正常提取

### Requirement: 提取发布时间
系统 SHALL 从微信文章页面提取文章发布时间。

#### Scenario: 包含发布时间
- **WHEN** 页面包含发布时间元素（`#publish_time`）或页面脚本中包含 `publish_time` 变量
- **THEN** 系统提取发布时间并格式化为 ISO 8601 字符串

#### Scenario: 发布时间缺失
- **WHEN** 页面中无法找到发布时间信息
- **THEN** 系统将发布时间字段设为空字符串

### Requirement: 提取文章正文
系统 SHALL 从微信文章页面提取正文内容，同时提供 HTML 格式和纯文本格式。

#### Scenario: 正常文章正文
- **WHEN** 页面包含 `#js_content` 正文容器
- **THEN** 系统提取该容器的 innerHTML 作为 HTML 格式正文，并提取 innerText 作为纯文本格式正文

#### Scenario: 正文容器缺失
- **WHEN** 页面不包含 `#js_content` 元素
- **THEN** 系统使用 Readability.js 作为 fallback 提取页面主要内容，若仍失败则正文字段为空字符串

### Requirement: 提取封面图
系统 SHALL 从微信文章页面提取封面图 URL。

#### Scenario: 包含 og:image
- **WHEN** 页面 `<head>` 中包含 `og:image` meta 标签
- **THEN** 系统提取该标签的 `content` 属性值作为封面图 URL

#### Scenario: 无封面图信息
- **WHEN** 页面中无法找到封面图 meta 标签
- **THEN** 系统将封面图字段设为空字符串

### Requirement: 输出 JSON 格式
系统 SHALL 将提取的所有信息组装为结构化 JSON 输出。

#### Scenario: 成功提取完整信息
- **WHEN** 成功提取文章的标题、作者、公众号名称、发布时间、正文和封面图
- **THEN** 系统输出以下格式的 JSON：
  ```json
  {
    "url": "原始URL",
    "title": "文章标题",
    "author": "作者名称",
    "accountName": "公众号名称",
    "publishTime": "2024-01-01T00:00:00+08:00",
    "coverImage": "封面图URL",
    "contentHtml": "<p>正文HTML</p>",
    "contentText": "正文纯文本"
  }
  ```

#### Scenario: 部分信息缺失
- **WHEN** 部分字段提取失败
- **THEN** 系统仍输出完整 JSON 结构，缺失字段使用空字符串
