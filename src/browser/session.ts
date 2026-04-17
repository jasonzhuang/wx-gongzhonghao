import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { ScraperOptions } from '../types.js';

export class BrowserSession {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private options: ScraperOptions;
  private storageStatePath: string;

  constructor(options: ScraperOptions) {
    this.options = options;
    this.storageStatePath = join(options.sessionDir, 'storage-state.json');
  }

  async launch(): Promise<BrowserContext> {
    const hasSession = existsSync(this.storageStatePath);

    const headless = hasSession ? this.options.headless : false;

    this.browser = await chromium.launch({
      headless,
      args: [
        '--disable-blink-features=AutomationControlled',
      ],
    });

    const contextOptions: Parameters<Browser['newContext']>[0] = {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      locale: 'zh-CN',
    };

    if (hasSession) {
      contextOptions.storageState = this.storageStatePath;
      console.log('📂 已加载保存的 session');
    } else {
      console.log('🆕 创建新的浏览器会话');
    }

    this.context = await this.browser.newContext(contextOptions);
    this.registerCleanup();
    return this.context;
  }

  async newPage(): Promise<Page> {
    if (!this.context) {
      throw new Error('浏览器会话未启动，请先调用 launch()');
    }
    return this.context.newPage();
  }

  async saveSession(): Promise<void> {
    if (!this.context) return;

    const dir = dirname(this.storageStatePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    await this.context.storageState({ path: this.storageStatePath });
    console.log('💾 Session 已保存');
  }

  async close(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch {
      // ignore cleanup errors
    }
  }

  private registerCleanup(): void {
    const cleanup = async () => {
      await this.close();
      process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('uncaughtException', async (err) => {
      console.error('❌ 未捕获异常:', err.message);
      await this.close();
      process.exit(1);
    });
  }
}
