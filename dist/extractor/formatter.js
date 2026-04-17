import TurndownService from 'turndown';
const turndown = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
});
// 移除微信占位 SVG 图片，保留真实图片
turndown.addRule('wxImages', {
    filter: (node) => {
        if (node.nodeName !== 'IMG')
            return false;
        const src = node.getAttribute('src') || '';
        return src.startsWith('data:image/svg+xml');
    },
    replacement: (_content, node) => {
        const el = node;
        const dataSrc = el.getAttribute('data-src');
        if (dataSrc)
            return `![图片](${dataSrc})\n\n`;
        return '';
    },
});
// 处理微信的 section 嵌套为普通段落
turndown.addRule('wxSections', {
    filter: 'section',
    replacement: (content) => content,
});
// 移除微信公众号名片组件
turndown.addRule('wxProfile', {
    filter: (node) => node.nodeName === 'MP-COMMON-PROFILE',
    replacement: () => '',
});
export function articleToMarkdown(article, imageMap) {
    const title = `# ${article.title || '(无标题)'}`;
    let bodyMd = turndown.turndown(article.contentHtml || '');
    if (imageMap && imageMap.size > 0) {
        for (const [remoteUrl, localPath] of imageMap) {
            bodyMd = bodyMd.split(remoteUrl).join(localPath);
            // Also handle HTML-entity-encoded ampersands from turndown
            const decodedRemote = remoteUrl.replace(/&amp;/g, '&');
            bodyMd = bodyMd.split(decodedRemote).join(localPath);
        }
    }
    const cleaned = bodyMd.replace(/\n{3,}/g, '\n\n').trim();
    return `${title}\n\n${cleaned}\n`;
}
export function articlesToMarkdown(articles, imageMaps) {
    return articles
        .map((a, i) => articleToMarkdown(a, imageMaps?.[i]))
        .join('\n\n---\n\n');
}
//# sourceMappingURL=formatter.js.map