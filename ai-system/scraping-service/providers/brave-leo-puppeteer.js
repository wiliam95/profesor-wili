/**
 * Brave Leo via Browser Automation
 * More stable than API reverse engineering
 * 
 * Requirements:
 * - npm install puppeteer
 * - Brave browser installed
 */

import puppeteer from 'puppeteer-extra';
// Use standard puppeteer if extra not available, but user has puppeteer-extra in package.json
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

export class BraveLeoPuppeteer {
    constructor(config = {}) {
        this.onLog = config.onLog || console.log;
        this.browser = null;
        this.page = null;
        this._log('info', 'BraveLeoPuppeteer initialized');
    }

    async initialize() {
        if (this.browser) return;

        this._log('info', 'Launching Brave browser...');

        // Try to launch Brave if installed
        const bravePaths = [
            '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', // macOS
            'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe', // Windows
            '/usr/bin/brave-browser' // Linux
        ];

        // Find first existing path
        const fs = await import('fs');
        const executablePath = bravePaths.find(path => fs.existsSync(path));

        if (!executablePath) {
            this._log('warn', 'Brave Browser not found in default paths. Using default Puppeteer Chromium.');
        }

        this.browser = await puppeteer.launch({
            headless: "new", // Use new headless mode
            executablePath: executablePath, // Undefined means default Chromium
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        this.page = await this.browser.newPage();
        try {
            // Leo AI internal page - might not be accessible if not actual Brave
            if (executablePath) {
                await this.page.goto('brave://leo-ai', { waitUntil: 'networkidle2' });
            } else {
                // Fallback for testing layouts if Brave not present, though this won't work for Leo
                this._log('error', 'Cannot access brave://leo-ai without Brave Browser.');
                throw new Error('Brave Browser required for Leo');
            }
        } catch (e) {
            this._log('error', `Nav failed: ${e.message}`);
            throw e;
        }

        this._log('info', 'Brave Leo ready');
    }

    async getResponse(message) {
        const startTime = Date.now();

        try {
            await this.initialize();

            this._log('info', 'Sending to Brave Leo...');

            // Type in Leo chat
            await this.page.waitForSelector('textarea, input[type="text"]', { timeout: 10000 });
            await this.page.type('textarea, input[type="text"]', message);

            // Send
            await this.page.keyboard.press('Enter');

            // Wait for response
            await this.page.waitForFunction(() => {
                const responses = document.querySelectorAll('[data-role="assistant"]');
                return responses.length > 0;
            }, { timeout: 30000 });

            // Extract response
            const responseText = await this.page.evaluate(() => {
                const responses = document.querySelectorAll('[data-role="assistant"]');
                return responses[responses.length - 1]?.innerText || '';
            });

            return this.success(responseText, startTime);

        } catch (error) {
            this._log('error', `Brave Leo Puppeteer Failed: ${error.message}`);
            return {
                success: false,
                error: error.message,
                provider: 'brave-leo-puppeteer'
            };
        }
    }

    success(text, startTime) {
        const duration = Date.now() - startTime;
        this._log('info', `Brave Leo Success! (${duration}ms)`);
        return {
            success: true,
            text: text,
            provider: 'brave-leo-puppeteer',
            responseTime: duration
        };
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    _log(level, msg) {
        if (this.onLog) this.onLog({ level, message: msg, provider: 'brave-leo-puppeteer' });
    }
}

export default BraveLeoPuppeteer;
