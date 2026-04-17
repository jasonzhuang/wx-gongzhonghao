import type { Page } from 'playwright';
export declare function isArticleUrl(url: string): boolean;
export declare function discoverLinks(page: Page): Promise<string[]>;
export declare function printLinks(links: string[]): void;
