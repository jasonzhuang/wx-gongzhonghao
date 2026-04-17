export interface ArticleData {
    url: string;
    title: string;
    author: string;
    accountName: string;
    publishTime: string;
    coverImage: string;
    contentHtml: string;
    contentText: string;
}
export interface ScraperOptions {
    headless: boolean;
    sessionDir: string;
    timeout: number;
    delay: {
        min: number;
        max: number;
    };
    output?: string;
}
export declare const DEFAULT_OPTIONS: ScraperOptions;
