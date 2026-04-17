import type { Page } from 'playwright';
export declare function downloadImages(page: Page, contentHtml: string, outputDir: string): Promise<Map<string, string>>;
