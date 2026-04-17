import type { Page } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export async function downloadImages(
  page: Page,
  contentHtml: string,
  outputDir: string,
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();

  const imgUrls = extractImageUrls(contentHtml);
  if (imgUrls.length === 0) return urlMap;

  const imgDir = join(outputDir, 'images');
  mkdirSync(imgDir, { recursive: true });

  const context = page.context();

  for (let i = 0; i < imgUrls.length; i++) {
    const remoteUrl = imgUrls[i];
    try {
      const response = await context.request.get(remoteUrl, {
        headers: {
          'Referer': 'https://mp.weixin.qq.com/',
        },
      });

      if (response.ok()) {
        const buffer = await response.body();
        if (buffer.length > 0) {
          const ext = guessExtension(remoteUrl);
          const filename = `img_${i + 1}${ext}`;
          const localPath = join(imgDir, filename);

          writeFileSync(localPath, buffer);
          urlMap.set(remoteUrl, join('images', filename));
        }
      }
    } catch {
      // skip failed downloads
    }
  }

  return urlMap;
}

function extractImageUrls(html: string): string[] {
  const urls: string[] = [];
  // Match real src URLs (not SVG placeholders)
  const srcRegex = /src="(https:\/\/mmbiz\.qpic\.cn\/[^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = srcRegex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  // Match data-src URLs (lazy-loaded images)
  const dataSrcRegex = /data-src="(https:\/\/mmbiz\.qpic\.cn\/[^"]+)"/g;
  while ((match = dataSrcRegex.exec(html)) !== null) {
    if (!urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }
  return urls;
}

function guessExtension(url: string): string {
  if (url.includes('wx_fmt=png')) return '.png';
  if (url.includes('wx_fmt=gif')) return '.gif';
  if (url.includes('wx_fmt=webp')) return '.webp';
  return '.jpg';
}
