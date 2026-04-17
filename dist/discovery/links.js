const ARTICLE_URL_PATTERN = /^https?:\/\/mp\.weixin\.qq\.com\/s[\/?]/;
export function isArticleUrl(url) {
    return ARTICLE_URL_PATTERN.test(url);
}
export async function discoverLinks(page) {
    const links = await page.evaluate(() => {
        const anchors = document.querySelectorAll('a[href]');
        const urls = [];
        for (const a of anchors) {
            const href = a.getAttribute('href');
            if (href) {
                try {
                    const resolved = new URL(href, window.location.href).href;
                    urls.push(resolved);
                }
                catch {
                    // skip invalid URLs
                }
            }
        }
        return urls;
    });
    const articleLinks = links.filter((url) => isArticleUrl(url));
    const unique = [...new Set(articleLinks)];
    return unique;
}
export function printLinks(links) {
    if (links.length === 0) {
        console.log('未发现文章链接');
        return;
    }
    console.log(`\n发现 ${links.length} 个文章链接:\n`);
    links.forEach((link, i) => {
        console.log(`  ${(i + 1).toString().padStart(3)}. ${link}`);
    });
    console.log('');
}
//# sourceMappingURL=links.js.map