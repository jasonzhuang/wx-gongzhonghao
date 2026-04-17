const VERIFICATION_KEYWORDS = [
    '环境异常',
    '完成验证后即可继续访问',
    '去验证',
];
export async function detectVerification(page) {
    try {
        const bodyText = await page.evaluate(() => document.body?.innerText || '');
        return VERIFICATION_KEYWORDS.some((kw) => bodyText.includes(kw));
    }
    catch {
        return false;
    }
}
export async function waitForVerification(page, timeoutMs = 300000) {
    console.log('');
    console.log('⚠️  检测到验证页面，请在浏览器中手动完成验证...');
    console.log(`⏳ 等待中（超时时间: ${Math.round(timeoutMs / 60000)} 分钟）`);
    const startTime = Date.now();
    const checkInterval = 2000;
    while (Date.now() - startTime < timeoutMs) {
        await page.waitForTimeout(checkInterval);
        const stillBlocked = await detectVerification(page);
        if (!stillBlocked) {
            console.log('✅ 验证完成，继续执行');
            return true;
        }
    }
    console.log('⏰ 验证等待超时，退出当前任务');
    return false;
}
//# sourceMappingURL=interceptor.js.map