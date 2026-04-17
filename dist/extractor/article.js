import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
async function extractTitle(page) {
    const title = await page.evaluate(() => {
        const activityName = document.querySelector('#activity-name');
        if (activityName?.textContent?.trim()) {
            return activityName.textContent.trim();
        }
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            return ogTitle.getAttribute('content') || '';
        }
        return document.title || '';
    });
    return title;
}
async function extractAuthor(page) {
    return page.evaluate(() => {
        const nameEl = document.querySelector('#js_name');
        const accountName = nameEl?.textContent?.trim() || '';
        const authorEl = document.querySelector('#js_author_name') ||
            document.querySelector('.rich_media_meta_text');
        const author = authorEl?.textContent?.trim() || '';
        return { author, accountName };
    });
}
async function extractPublishTime(page) {
    return page.evaluate(() => {
        const timeEl = document.querySelector('#publish_time');
        if (timeEl?.textContent?.trim()) {
            return timeEl.textContent.trim();
        }
        // Try extracting from page scripts
        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
            const content = script.textContent || '';
            const match = content.match(/var\s+publish_time\s*=\s*["']([^"']+)["']/);
            if (match)
                return match[1];
            const match2 = content.match(/"publish_time"\s*:\s*"([^"]+)"/);
            if (match2)
                return match2[1];
        }
        return '';
    });
}
async function extractContent(page) {
    const result = await page.evaluate(() => {
        const container = document.querySelector('#js_content');
        if (container) {
            return {
                html: container.innerHTML || '',
                text: container.innerText || '',
            };
        }
        return null;
    });
    if (result) {
        return { html: result.html, text: result.text };
    }
    // Fallback: Readability.js
    try {
        const htmlContent = await page.content();
        const { document: doc } = parseHTML(htmlContent);
        const reader = new Readability(doc);
        const article = reader.parse();
        if (article) {
            return { html: article.content || '', text: article.textContent || '' };
        }
    }
    catch {
        // Readability fallback failed
    }
    return { html: '', text: '' };
}
async function extractCoverImage(page) {
    return page.evaluate(() => {
        const ogImage = document.querySelector('meta[property="og:image"]');
        return ogImage?.getAttribute('content') || '';
    });
}
export async function extractArticle(page, url) {
    const [title, { author, accountName }, publishTime, content, coverImage] = await Promise.all([
        extractTitle(page),
        extractAuthor(page),
        extractPublishTime(page),
        extractContent(page),
        extractCoverImage(page),
    ]);
    return {
        url,
        title,
        author,
        accountName,
        publishTime,
        coverImage,
        contentHtml: content.html,
        contentText: content.text,
    };
}
//# sourceMappingURL=article.js.map