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

export const DEFAULT_OPTIONS: ScraperOptions = {
  headless: false,
  sessionDir: 'data/session',
  timeout: 300_000, // 5 minutes for verification wait
  delay: {
    min: 2000,
    max: 5000,
  },
};
