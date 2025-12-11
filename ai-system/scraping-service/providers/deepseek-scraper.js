/**
 * ===========================================
 * DEEPSEEK SCRAPER - Persistent Session
 * ===========================================
 * 
 * Scraper dengan Session Persistence.
 * Menyimpan cookies/login di folder 'deepseek-session'.
 * 
 * JIKA SCRAPING GAGAL TERUS:
 * Gunakan DeepSeek via OpenRouter API (Gratis/Murah & Resmi).
 * 
 * @author AI System
 * @version 2.0.0
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import path from 'path';

puppeteer.use(StealthPlugin());

export class DeepSeekScraper {
    constructor(config = {}) {
        this.onLog = config.onLog || console.log;
        this.browser = null;
        this.chatUrl = 'https://chat.deepseek.com/';

        // Session path (stores cookies/localStorage)
        this.userDataDir = path.resolve(process.cwd(), 'deepseek-session');

        this.selectors = {
            input: ['textarea[id="chat-input"]', 'textarea'],
            response: ['.markdown-body', '.ds-markdown']
        };
    }

    async getResponse(message) {
        const startTime = Date.now();

        try {
            this._log('info', `Launching browser (Session: ${this.userDataDir})...`);

            this.browser = await puppeteer.launch({
                headless: false, // WAJIB FALSE agar tidak terdeteksi bot
                userDataDir: this.userDataDir, // Persistence
                args: [
                    '--no-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1280,720',
                    '--disable-infobars'
                ]
            });

            const pages = await this.browser.pages();
            const page = pages.length > 0 ? pages[0] : await this.browser.newPage();

            await page.setViewport({ width: 1280, height: 720 });

            // Navigate
            this._log('info', 'Navigating...');
            await page.goto(this.chatUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Check Cloudflare/Login
            await new Promise(r => setTimeout(r, 5000)); // Wait for check
            const title = await page.title();

            if (title.includes('Just a moment') || title.includes('Login')) {
                this._log('warn', 'Cloudflare/Login detected!');
                this._log('info', 'Please solve CAPTCHA / Login manually in the browser window...');

                // Wait up to 60s for user to solve
                try {
                    await page.waitForFunction(() => {
                        return !document.title.includes('Just a moment') && !document.title.includes('Login');
                    }, { timeout: 60000 });
                    this._log('info', 'Challenge passed!');
                } catch (e) {
                    throw new Error('Manual verification timeout. Please login manually first.');
                }
            }

            // Find input
            this._log('info', 'Finding input...');
            const input = await page.waitForSelector('textarea', { timeout: 10000 });

            await input.click();
            await page.keyboard.type(message, { delay: 50 }); // Human typing
            await page.keyboard.press('Enter');

            // Wait response
            this._log('info', 'Waiting for response...');
            await page.waitForFunction(() => {
                const bubbles = document.querySelectorAll('.markdown-body');
                return bubbles.length > 0;
            }, { timeout: 30000 });

            // Wait for generation (simple)
            await new Promise(r => setTimeout(r, 5000));

            const response = await page.evaluate(() => {
                const bubbles = document.querySelectorAll('.markdown-body');
                return bubbles[bubbles.length - 1].innerText;
            });

            const duration = Date.now() - startTime;

            // Simpan session dengan menutup browser secara normal (atau biarkan terbuka untuk performa, tapi di sini kita tutup)
            await this.browser.close();
            this.browser = null;

            return {
                success: true,
                text: response,
                provider: 'deepseek-scraper-persistent',
                responseTime: duration
            };

        } catch (error) {
            if (this.browser) await this.browser.close();
            this._log('error', error.message);
            return {
                success: false,
                error: error.message,
                provider: 'deepseek-scraper'
            };
        }
    }

    _log(level, msg) {
        if (this.onLog) this.onLog({ level, message: msg, provider: 'deepseek-scraper' });
    }
}

export default DeepSeekScraper;
