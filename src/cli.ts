#!/usr/bin/env node

import { resolve, dirname } from 'node:path';
import { writeFileSync } from 'node:fs';
import { BrowserSession } from './browser/session.js';
import { detectVerification, waitForVerification } from './browser/interceptor.js';
import { extractArticle } from './extractor/article.js';
import { downloadImages } from './extractor/image-downloader.js';
import { isArticleUrl, discoverLinks, printLinks } from './discovery/links.js';
import { articleToMarkdown, articlesToMarkdown } from './extractor/formatter.js';
import { DEFAULT_OPTIONS, type ScraperOptions, type ArticleData } from './types.js';

interface ScrapeResult {
  article: ArticleData;
  imageMap: Map<string, string>;
}

function parseArgs(): { urls: string[]; options: ScraperOptions } {
  const args = process.argv.slice(2);
  const options: ScraperOptions = { ...DEFAULT_OPTIONS };
  const urls: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--headless':
        options.headless = true;
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
      default:
        if (!arg.startsWith('-')) {
          urls.push(arg);
        }
    }
  }

  if (urls.length === 0) {
    printUsage();
    process.exit(1);
  }

  options.sessionDir = resolve(options.sessionDir);
  return { urls, options };
}

function printUsage(): void {
  console.log(`
用法: wx-scraper <url> [options]

参数:
  url               微信文章或页面 URL（支持多个）

选项:
  --headless        使用无头模式（需已有保存的 session）
  --output, -o      输出文件路径（默认输出到控制台）
  --help, -h        显示帮助

示例:
  wx-scraper https://mp.weixin.qq.com/s/xxxxx
  wx-scraper https://mp.weixin.qq.com/s/xxxxx --output result.json
  wx-scraper https://mp.weixin.qq.com/ --headless
`);
}

function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((r) => setTimeout(r, ms));
}

async function scrapeArticle(
  session: BrowserSession,
  url: string,
  outputDir: string,
): Promise<ScrapeResult | null> {
  const page = await session.newPage();

  try {
    console.log(`🔗 正在访问: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(2000);

    if (await detectVerification(page)) {
      const passed = await waitForVerification(page);
      if (!passed) return null;
      await session.saveSession();
    }

    const article = await extractArticle(page, url);
    await session.saveSession();

    console.log(`📥 正在下载图片...`);
    const imageMap = await downloadImages(page, article.contentHtml, outputDir);
    console.log(`✅ 提取成功: ${article.title || '(无标题)'}（${imageMap.size} 张图片）`);

    return { article, imageMap };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ 提取失败: ${url} - ${message}`);
    return null;
  } finally {
    await page.close();
  }
}

async function main(): Promise<void> {
  const { urls, options } = parseArgs();
  const session = new BrowserSession(options);

  const outputDir = options.output ? resolve(dirname(options.output)) : resolve('.');

  try {
    await session.launch();
    const results: ScrapeResult[] = [];
    const allArticleUrls: string[] = [];

    for (const inputUrl of urls) {
      if (isArticleUrl(inputUrl)) {
        allArticleUrls.push(inputUrl);
      } else {
        console.log(`🔍 正在扫描页面链接: ${inputUrl}`);
        const page = await session.newPage();
        try {
          await page.goto(inputUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
          await page.waitForTimeout(3000);

          if (await detectVerification(page)) {
            const passed = await waitForVerification(page);
            if (!passed) continue;
            await session.saveSession();
          }

          const links = await discoverLinks(page);
          printLinks(links);
          allArticleUrls.push(...links);
        } finally {
          await page.close();
        }
      }
    }

    if (allArticleUrls.length === 0) {
      console.log('未找到可提取的文章链接');
      return;
    }

    console.log(`\n📄 共 ${allArticleUrls.length} 篇文章待提取\n`);

    for (let i = 0; i < allArticleUrls.length; i++) {
      if (i > 0) {
        await randomDelay(options.delay.min, options.delay.max);
      }

      console.log(`[${i + 1}/${allArticleUrls.length}]`);
      const result = await scrapeArticle(session, allArticleUrls[i], outputDir);
      if (result) {
        results.push(result);
      }
    }

    const markdown = results.length === 1
      ? articleToMarkdown(results[0].article, results[0].imageMap)
      : articlesToMarkdown(
          results.map((r) => r.article),
          results.map((r) => r.imageMap),
        );

    if (options.output) {
      writeFileSync(options.output, markdown, 'utf-8');
      console.log(`\n📁 结果已保存到: ${options.output}`);
    } else {
      console.log('\n--- 提取结果 ---\n');
      console.log(markdown);
    }

    console.log(`\n🎉 完成！成功提取 ${results.length}/${allArticleUrls.length} 篇文章`);
  } finally {
    await session.close();
  }
}

main().catch((err) => {
  console.error('❌ 程序异常:', err);
  process.exit(1);
});
