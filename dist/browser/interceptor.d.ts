import type { Page } from 'playwright';
export declare function detectVerification(page: Page): Promise<boolean>;
export declare function waitForVerification(page: Page, timeoutMs?: number): Promise<boolean>;
