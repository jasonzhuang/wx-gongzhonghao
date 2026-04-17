import type { ArticleData } from '../types.js';
export declare function articleToMarkdown(article: ArticleData, imageMap?: Map<string, string>): string;
export declare function articlesToMarkdown(articles: ArticleData[], imageMaps?: Map<string, string>[]): string;
