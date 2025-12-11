/**
 * ===========================================
 * COPILOT SCRAPER - Microsoft Copilot (Emergency)
 * ===========================================
 * 
 * Scraper untuk Microsoft Copilot dengan EXTRA CAUTION.
 * Microsoft memiliki AI detection yang aktif di 2025.
 * 
 * ⚠️ GUNAKAN HANYA SEBAGAI LAST RESORT!
 * 
 * @author AI System
 * @version 1.0.0
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import {
    getStealthBrowserConfig,
    hideWebDriver,
    getRandomViewport,
    naturalType,
    naturalClick,
    naturalScroll,
    naturalMouseMove,
    delayWithJitter,
    waitForElement,
    extractText,
    randomDelay
} from '../utils/stealth.js';

// Apply stealth plugin
puppeteer.use(StealthPlugin());

/**
 * CopilotScraper Class
 * 
 * PERHATIAN: Extra cautious implementation karena detection risk tinggi
 */
export class CopilotScraper {
    constructor(config = {}) {
        this.onLog = config.onLog || console.log;

        // Browser instance
        this.browser = null;
        this.page = null;

        // Session tracking (lebih konservatif)
        this.requestCount = 0;
        this.sessionRotateAfter = 10; // Rotasi lebih sering
        this.clearCookiesAfter = 25;

        // Rate limiting (lebih lama)
        this.lastRequestTime = 0;
        this.rateLimitMs = parseInt(process.env.COPILOT_RATE_LIMIT) || 5000;

        // Delay ranges (lebih lama)
        this.minActionDelay = 3000;
        this.maxActionDelay = 7000;

        // Detection tracking
        this.detectionCount = 0;
        this.maxDetections = 2; // Mark unhealthy after 2 detections

        // Selectors
        this.selectors = {
            chatInput: [
                '#userInput',
                'textarea[data-id="chat-input"]',
                'textarea[placeholder*="Ask"]',
                '.chat-textarea',
                'textarea'
            ],
            submitButton: [
                'button[data-id="submit-button"]',
                'button[aria-label*="Submit"]',
                'button[type="submit"]',
                '.submit-button'
            ],
            responseContainer: [
                '[data-content="ai-message"]',
                '.ai-response',
                '.response-content',
                '[class*="response"]',
                '.cib-message-text'
            ],
            loadingIndicator: [
                '.typing-indicator',
                '[data-state="loading"]',
                '.loading-dots',
                '[class*="loading"]'
            ],
            captcha: [
                '[data-testid="captcha"]',
                '.captcha',
                '#captcha',
                '[class*="captcha"]'
            ]
        };

        this._log('warn', 'CopilotScraper initialized - USE WITH CAUTION');
    }

    /**
     * Initialize browser dengan extra stealth
     */
    async _ensureBrowser() {
        if (!this.browser || !this.browser.isConnected()) {
            this._log('info', 'Launching new browser (Copilot)');

            const config = getStealthBrowserConfig();
            // Extra args untuk Copilot
            config.args.push(
                '--disable-extensions',
                '--disable-plugins',
                '--disable-notifications'
            );

            this.browser = await puppeteer.launch(config);
            this.page = await this.browser.newPage();

            // Setup page dengan viewport random
            await this.page.setViewport(getRandomViewport());
            await hideWebDriver(this.page);

            // Set extra headers
            await this.page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br'
            });

            // Navigate dengan delay
            await delayWithJitter(1000);
            await this.page.goto('https://copilot.microsoft.com/', {
                waitUntil: 'networkidle2',
                timeout: 45000
            });

            // Extra delay setelah load
            await delayWithJitter(3000);

            // Simulasi behavior natural
            await this._simulateInitialBehavior();

            this.requestCount = 0;
        }

        return this.page;
    }

    /**
     * Simulasi behavior awal untuk terlihat natural
     */
    async _simulateInitialBehavior() {
        const page = this.page;

        // Random mouse movement
        const viewport = page.viewport();
        for (let i = 0; i < randomDelay(2, 4); i++) {
            const x = randomDelay(100, viewport.width - 100);
            const y = randomDelay(100, viewport.height - 100);
            await naturalMouseMove(page, x, y);
            await delayWithJitter(500);
        }

        // Random scroll
        await naturalScroll(page, 'down', randomDelay(50, 150));
        await delayWithJitter(1000);
        await naturalScroll(page, 'up', randomDelay(30, 80));

        await delayWithJitter(2000);
    }

    /**
     * Check rate limiting
     */
    async _checkRateLimit() {
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;

        if (elapsed < this.rateLimitMs) {
            const waitTime = this.rateLimitMs - elapsed;
            this._log('debug', `Rate limiting: waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
    }

    /**
     * Check session rotation
     */
    async _checkSessionRotation() {
        if (this.requestCount > 0 && this.requestCount % this.clearCookiesAfter === 0) {
            this._log('info', 'Clearing cookies');
            const client = await this.page.target().createCDPSession();
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');
        }

        if (this.requestCount > 0 && this.requestCount % this.sessionRotateAfter === 0) {
            this._log('info', 'Rotating session');
            await this._closeBrowser();
        }
    }

    /**
     * Check for detection/captcha
     */
    async _checkForDetection(page) {
        // Check for captcha
        for (const selector of this.selectors.captcha) {
            const captcha = await page.$(selector);
            if (captcha) {
                this.detectionCount++;
                this._log('error', 'Captcha detected!', { detectionCount: this.detectionCount });
                throw new Error('DETECTION: Captcha required');
            }
        }

        // Check for blocked message
        const pageContent = await page.content();
        const blockedIndicators = [
            'unusual activity',
            'verify you are human',
            'blocked',
            'access denied',
            'something went wrong'
        ];

        for (const indicator of blockedIndicators) {
            if (pageContent.toLowerCase().includes(indicator)) {
                this.detectionCount++;
                this._log('error', 'Detection indicator found', { indicator, detectionCount: this.detectionCount });
                throw new Error(`DETECTION: ${indicator}`);
            }
        }
    }

    /**
     * Tutup browser
     */
    async _closeBrowser() {
        if (this.browser) {
            try {
                await this.browser.close();
            } catch (e) { }
            this.browser = null;
            this.page = null;
        }
    }

    /**
     * Mendapatkan response dari Copilot
     */
    async getResponse(message, options = {}) {
        const startTime = Date.now();

        // Check if too many detections
        if (this.detectionCount >= this.maxDetections) {
            return {
                success: false,
                error: 'PROVIDER_BLOCKED',
                message: 'Copilot terdeteksi sebagai bot. Provider tidak tersedia.',
                provider: 'copilot'
            };
        }

        try {
            // Rate limiting
            await this._checkRateLimit();
            await this._checkSessionRotation();

            const page = await this._ensureBrowser();

            // Check detection sebelum mulai
            await this._checkForDetection(page);

            this._log('debug', 'Sending message to Copilot', { messageLength: message.length });

            // Extra delay sebelum interaksi
            await delayWithJitter(this.minActionDelay, this.maxActionDelay);

            // Find chat input
            const inputSelector = await waitForElement(page, this.selectors.chatInput, { timeout: 15000 });

            // Mouse ke input area
            const inputElement = await page.$(inputSelector);
            const inputBox = await inputElement.boundingBox();
            await naturalMouseMove(page, inputBox.x + inputBox.width / 2, inputBox.y + inputBox.height / 2);
            await delayWithJitter(500);

            // Click dan clear
            await naturalClick(page, inputSelector);
            await delayWithJitter(300);
            await page.keyboard.down('Control');
            await page.keyboard.press('a');
            await page.keyboard.up('Control');
            await page.keyboard.press('Backspace');
            await delayWithJitter(500);

            // Type slowly
            await naturalType(page, inputSelector, message, {
                minDelay: 100, // Lebih lambat dari Brave
                maxDelay: 200
            });

            // Delay sebelum submit
            await delayWithJitter(1500);

            // Submit
            try {
                const submitSelector = await waitForElement(page, this.selectors.submitButton, { timeout: 5000 });
                await naturalClick(page, submitSelector);
            } catch (e) {
                await page.keyboard.press('Enter');
            }

            this._log('debug', 'Message sent, waiting for response');

            // Wait for response dengan extra patience
            const response = await this._waitForResponse(page);

            // Check detection setelah response
            await this._checkForDetection(page);

            this.requestCount++;

            const responseTime = Date.now() - startTime;
            this._log('info', 'Got response from Copilot', { responseTime });

            return {
                success: true,
                text: response,
                provider: 'copilot',
                responseTime,
                metadata: {
                    requestCount: this.requestCount,
                    detectionCount: this.detectionCount
                }
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            this._log('error', 'Copilot error', { error: error.message });

            // Close browser on any error (safety)
            await this._closeBrowser();

            return {
                success: false,
                error: error.message,
                provider: 'copilot',
                responseTime,
                isDetectionError: error.message.includes('DETECTION')
            };
        }
    }

    /**
     * Wait for response
     */
    async _waitForResponse(page) {
        const timeout = 60000; // Longer timeout
        const startTime = Date.now();

        // Wait for loading
        try {
            await waitForElement(page, this.selectors.loadingIndicator, { timeout: 10000 });
        } catch (e) { }

        let lastText = '';
        let stableCount = 0;

        while (Date.now() - startTime < timeout) {
            const currentText = await extractText(page, this.selectors.responseContainer);

            if (currentText && currentText !== lastText) {
                lastText = currentText;
                stableCount = 0;
            } else if (currentText) {
                stableCount++;
                if (stableCount >= 5) { // More stable checks for Copilot
                    return currentText;
                }
            }

            await new Promise(resolve => setTimeout(resolve, 700));
        }

        if (lastText) return lastText;
        throw new Error('Timeout waiting for response');
    }

    /**
     * Get health status
     */
    getHealth() {
        return {
            browserActive: !!this.browser && this.browser.isConnected(),
            requestCount: this.requestCount,
            detectionCount: this.detectionCount,
            isBlocked: this.detectionCount >= this.maxDetections,
            lastRequestTime: this.lastRequestTime
        };
    }

    /**
     * Reset detection count (manual recovery)
     */
    resetDetectionCount() {
        this.detectionCount = 0;
        this._log('info', 'Detection count reset');
    }

    /**
     * Cleanup
     */
    async cleanup() {
        await this._closeBrowser();
        this._log('info', 'CopilotScraper cleaned up');
    }

    _log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            provider: 'copilot-scraper',
            message,
            ...data
        };

        if (this.onLog) {
            this.onLog(logEntry);
        }
    }
}

export default CopilotScraper;
