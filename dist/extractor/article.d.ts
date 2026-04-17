import type { Page } from 'playwright';
import type { ArticleData } from '../types.js';
export declare function extractArticle(page: Page, url: string): Promise<ArticleData>;
