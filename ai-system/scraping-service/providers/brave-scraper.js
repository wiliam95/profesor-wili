/**
 * ===========================================
 * BRAVE SCRAPER - UPDATED Desember 2025
 * ===========================================
 * 
 * Scraper untuk Brave Search AI dengan multiple URLs dan selectors.
 * Enhanced anti-detection dan robustness.
 * 
 * @author AI System
 * @version 2.0.0
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';

puppeteer.use(StealthPlugin());

export class BraveScraper {
    constructor(config = {}) {
        this.onLog = config.onLog || console.log;
        this.browser = null;
        this.requestCount = 0;
        this.lastRequestTime = 0;

        // Multiple URLs untuk try (Brave punya beberapa endpoints)
        this.braveUrls = [
            'https://search.brave.com/ask?source=chat',  // NEW endpoint
            'https://search.brave.com/chat',             // OLD
            'https://search.brave.com/search?q=hello&source=llmSuggest'
        ];

        // Multiple selectors untuk robustness
        this.inputSelectors = [
            'textarea[placeholder*="Tanya"]',            // Indonesian interface
            'textarea[placeholder*="ask"]',              // English interface
            'textarea[placeholder*="Ask"]',
            'textarea[placeholder*="pro clip"]',
            'textarea[placeholder*="Message"]',
            'textarea.input',
            'textarea',
            'input[type="text"]'
        ];

        this.responseSelectors = [
            '[class*="answer"]',
            '[class*="response"]',
            '[class*="message"]',
            '[class*="result"]',
            '[data-testid*="answer"]',
            'div[class*="text"]',
            '.ai-response',
            '.assistant-message',
            'p'
        ];

        this._log('info', 'BraveScraper initialized');
    }

    async initialize() {
        if (!this.browser) {
            this._log('info', 'Launching browser for Brave scraper...');
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process'
                ],
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
            });
            this._log('info', 'Browser launched successfully');
        }
        return this.browser;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this._log('info', 'Browser closed');
        }
    }

    randomDelay(min = 1000, max = 3000) {
        return new Promise(resolve =>
            setTimeout(resolve, Math.random() * (max - min) + min)
        );
    }

    async tryFindElement(page, selectors, timeout = 10000) {
        for (const selector of selectors) {
            try {
                this._log('debug', `Trying selector: ${selector}`);
                await page.waitForSelector(selector, { timeout: timeout / selectors.length });
                this._log('info', `Found element with selector: ${selector}`);
                return selector;
            } catch (e) {
                continue;
            }
        }
        throw new Error(`None of the selectors found: ${selectors.join(', ')}`);
    }

    async getResponse(message, options = {}) {
        // Rate limiting
        await this.rateLimit();

        const startTime = Date.now();
        const browser = await this.initialize();
        const context = await browser.createBrowserContext();
        const page = await context.newPage();

        try {
            // Set random user agent
            const userAgent = new UserAgent({ deviceCategory: 'desktop' });
            await page.setUserAgent(userAgent.toString());

            // Set viewport
            const width = 1920 + Math.floor(Math.random() * 200);
            const height = 1080 + Math.floor(Math.random() * 200);
            await page.setViewport({ width, height });

            // Enhanced stealth
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
                Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en', 'id'] });
                window.chrome = { runtime: {} };
            });

            // Try multiple URLs until one works
            let pageLoaded = false;
            let successUrl = null;

            for (const url of this.braveUrls) {
                try {
                    this._log('info', `Trying URL: ${url}`);
                    await page.goto(url, {
                        waitUntil: 'networkidle2',
                        timeout: 30000
                    });

                    // Check if page loaded successfully
                    const title = await page.title();
                    if (title && !title.includes('Error')) {
                        pageLoaded = true;
                        successUrl = url;
                        this._log('info', `Successfully loaded: ${url}`);
                        break;
                    }
                } catch (e) {
                    this._log('warn', `Failed to load ${url}: ${e.message}`);
                    continue;
                }
            }

            if (!pageLoaded) {
                throw new Error('Failed to load any Brave URL');
            }

            await this.randomDelay(2000, 4000);

            // Find input field
            this._log('info', 'Looking for input field...');
            const inputSelector = await this.tryFindElement(page, this.inputSelectors);

            // Click input
            await page.click(inputSelector);
            await this.randomDelay(500, 1000);

            // Type message with human-like speed
            this._log('info', 'Typing message...');
            for (const char of message) {
                await page.type(inputSelector, char, {
                    delay: 80 + Math.random() * 70
                });
            }

            await this.randomDelay(1000, 2000);

            // Submit (try multiple methods)
            this._log('info', 'Submitting message...');
            try {
                await page.keyboard.press('Enter');
            } catch (e) {
                // Alternative: click submit button
                const submitSelectors = ['button[type="submit"]', 'button[aria-label*="Send"]', 'button'];
                for (const selector of submitSelectors) {
                    try {
                        await page.click(selector);
                        break;
                    } catch (err) {
                        continue;
                    }
                }
            }

            // Wait for response
            this._log('info', 'Waiting for response...');
            await this.randomDelay(4000, 6000);

            // Wait for response element to appear
            try {
                await page.waitForFunction(
                    (selectors) => {
                        for (const selector of selectors) {
                            const elements = document.querySelectorAll(selector);
                            if (elements.length > 0) {
                                for (const el of elements) {
                                    const text = el.innerText || el.textContent;
                                    if (text && text.length > 20) {
                                        return true;
                                    }
                                }
                            }
                        }
                        return false;
                    },
                    { timeout: 30000 },
                    this.responseSelectors
                );
            } catch (e) {
                this._log('warn', 'Timeout waiting for response element');
            }

            await this.randomDelay(2000, 3000);

            // Extract response
            const responseText = await page.evaluate((selectors) => {
                for (const selector of selectors) {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        // Get the last/longest response
                        let bestText = '';
                        for (const el of elements) {
                            const text = el.innerText || el.textContent;
                            if (text && text.length > bestText.length && text.length > 20) {
                                bestText = text;
                            }
                        }
                        if (bestText) {
                            return bestText;
                        }
                    }
                }
                return null;
            }, this.responseSelectors);

            if (!responseText) {
                throw new Error('No response found from Brave');
            }

            const duration = Date.now() - startTime;
            this._log('info', `Response received successfully in ${duration}ms`);
            this.requestCount++;

            return {
                success: true,
                text: responseText.trim(),
                provider: 'brave',
                responseTime: duration
            };

        } catch (error) {
            const duration = Date.now() - startTime;
            this._log('error', `Brave scraping error: ${error.message}`);

            return {
                success: false,
                error: error.message,
                provider: 'brave',
                responseTime: duration
            };
        } finally {
            await page.close();
            await context.close();
        }
    }

    async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minDelay = 2000; // 2 seconds minimum

        if (timeSinceLastRequest < minDelay) {
            const waitTime = minDelay - timeSinceLastRequest;
            this._log('info', `Rate limiting: waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
    }

    getHealth() {
        return {
            browserActive: this.browser !== null,
            requestCount: this.requestCount,
            lastRequestTime: this.lastRequestTime
        };
    }

    async cleanup() {
        await this.close();
        this._log('info', 'BraveScraper cleaned up');
    }

    _log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            provider: 'brave-scraper',
            message,
            ...data
        };

        if (this.onLog) {
            this.onLog(logEntry);
        }
    }
}

export default BraveScraper;
