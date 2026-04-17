## ADDED Requirements

### Requirement: 识别微信文章链接
系统 SHALL 从给定页面中识别所有微信公众号文章链接（匹配 `mp.weixin.qq.com/s/` 模式）。

#### Scenario: 页面包含文章链接
- **WHEN** 用户提供一个包含微信文章链接的页面 URL
- **THEN** 系统提取所有匹配 `https://mp.weixin.qq.com/s/` 或 `https://mp.weixin.qq.com/s?` 模式的链接，去重后返回链接列表

#### Scenario: 页面不包含文章链接
- **WHEN** 页面中没有匹配模式的链接
- **THEN** 系统返回空数组并输出提示信息

### Requirement: 支持单篇文章 URL 直接输入
系统 SHALL 支持用户直接输入单篇文章 URL，跳过链接发现阶段直接进入内容提取。

#### Scenario: 输入单篇文章 URL
- **WHEN** 用户输入的 URL 匹配 `mp.weixin.qq.com/s/` 模式
- **THEN** 系统识别为单篇文章 URL，直接调用文章提取模块

#### Scenario: 输入非文章 URL
- **WHEN** 用户输入的 URL 不匹配文章模式（如公众号主页或其他页面）
- **THEN** 系统进入链接发现模式，扫描页面中的文章链接

### Requirement: 批量链接输出
系统 SHALL 支持将发现的链接列表输出，供用户选择或批量处理。

#### Scenario: 发现多个链接
- **WHEN** 从页面发现多个文章链接
- **THEN** 系统输出带序号的链接列表，并提示用户可以选择全部提取或指定序号提取

#### Scenario: 批量提取
- **WHEN** 用户选择批量提取多个链接
- **THEN** 系统按顺序逐个访问并提取每篇文章，每篇之间添加 2-5 秒随机延迟，输出为 JSON 数组
