import { type BrowserContext, type Page } from 'playwright';
import type { ScraperOptions } from '../types.js';
export declare class BrowserSession {
    private browser;
    private context;
    private options;
    private storageStatePath;
    constructor(options: ScraperOptions);
    launch(): Promise<BrowserContext>;
    newPage(): Promise<Page>;
    saveSession(): Promise<void>;
    close(): Promise<void>;
    private registerCleanup;
}
