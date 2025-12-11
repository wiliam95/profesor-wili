import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export class DeepAIScraper {
    constructor(config = {}) {
        this.config = config;
        this.onLog = config.onLog;
        this.browser = null;
        this.page = null;
    }

    _log(level, message) {
        if (this.onLog) {
            this.onLog({
                level,
                message,
                provider: 'deepai-scraper',
                timestamp: new Date().toISOString()
            });
        } else {
            console.log(`[${level.toUpperCase()}] [deepai-scraper] ${message}`);
        }
    }

    async initialize() {
        if (!this.browser) {
            this._log('info', 'Launching browser for DeepAI...');
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled'
                ],
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
            });
            this._log('info', 'Browser launched');
        }
        return this.browser;
    }

    async getResponse(message) {
        try {
            await this.initialize();

            // Create new page for each request to ensure fresh state or reuse if possible
            // Reusing page might be faster but risky for bans. Let's use new page.
            this.page = await this.browser.newPage();

            this._log('info', 'Navigating to deepai.org/chat...');
            await this.page.goto('https://deepai.org/chat', { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Wait for input textarea
            // Based on standard visual inspection of such sites, usually textarea or [contenteditable]
            const inputSelector = 'textarea';
            await this.page.waitForSelector(inputSelector, { timeout: 10000 });

            this._log('info', 'Typing message...');
            await this.page.type(inputSelector, message);

            // Press Enter or Click Send
            // Usually Enter works. Let's try pressing Enter.
            await this.page.keyboard.press('Enter');

            this._log('info', 'Waiting for response...');

            // DeepAI usually streams response. We wait for the stream to stop or a container to stabilize.
            // The response typically appears in a markdown-body or similar class.
            // We need to wait until the "stop generation" button disappears or content stops changing.
            // For MVP, we wait a static time or for specific selector.

            // Let's rely on a simple race condition: wait for text to appear and be stable-ish.
            await this.page.waitForSelector('.chat-message-assistant', { timeout: 15000 });

            // Wait a bit for generation to finish (rough heuristic)
            await new Promise(r => setTimeout(r, 5000));

            // Extract last message
            const response = await this.page.evaluate(() => {
                const msgs = document.querySelectorAll('.chat-message-assistant');
                if (msgs.length === 0) return null;
                return msgs[msgs.length - 1].innerText;
            });

            if (!response) throw new Error('No response text found');

            this._log('info', 'Response extracted');
            await this.page.close();

            return {
                success: true,
                text: response,
                provider: 'deepai-scraper'
            };

        } catch (error) {
            this._log('error', `DeepAI Failed: ${error.message}`);
            if (this.page) await this.page.close().catch(() => { });
            return {
                success: false,
                error: error.message,
                provider: 'deepai-scraper'
            };
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
