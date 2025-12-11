/**
 * ===========================================
 * STEALTH UTILITIES - Anti-Detection untuk Puppeteer
 * ===========================================
 * 
 * Utility functions untuk menghindari bot detection
 * pada website seperti Brave dan Microsoft.
 * 
 * @author AI System
 * @version 1.0.0
 */

import UserAgent from 'user-agents';

/**
 * Konfigurasi viewport yang realistis
 */
const VIEWPORT_CONFIGS = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1536, height: 864 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 }
];

/**
 * Generate random user agent
 */
export function getRandomUserAgent() {
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    return userAgent.toString();
}

/**
 * Generate random viewport
 */
export function getRandomViewport() {
    const viewport = VIEWPORT_CONFIGS[Math.floor(Math.random() * VIEWPORT_CONFIGS.length)];
    return {
        ...viewport,
        deviceScaleFactor: Math.random() > 0.5 ? 1 : 2,
        hasTouch: false,
        isLandscape: true,
        isMobile: false
    };
}

/**
 * Random delay antara min dan max
 */
export function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Delay dengan jitter
 */
export async function delayWithJitter(baseMs, jitterPercent = 0.3) {
    const jitter = baseMs * jitterPercent;
    const actualDelay = baseMs + (Math.random() * jitter * 2) - jitter;
    await new Promise(resolve => setTimeout(resolve, actualDelay));
}

/**
 * Simulasi typing yang natural
 */
export async function naturalType(page, selector, text, options = {}) {
    const { minDelay = 80, maxDelay = 150 } = options;

    await page.click(selector);
    await delayWithJitter(200);

    for (const char of text) {
        await page.keyboard.type(char);
        await new Promise(resolve => setTimeout(resolve, randomDelay(minDelay, maxDelay)));
    }
}

/**
 * Simulasi mouse movement yang natural
 */
export async function naturalMouseMove(page, targetX, targetY) {
    const mouse = page.mouse;

    // Get current position (assume center of viewport if unknown)
    const viewport = page.viewport();
    let currentX = viewport.width / 2;
    let currentY = viewport.height / 2;

    // Buat path dengan beberapa titik (bezier-like curve)
    const steps = randomDelay(5, 10);

    for (let i = 1; i <= steps; i++) {
        const progress = i / steps;

        // Tambahkan sedikit randomness untuk membuat gerakan natural
        const jitterX = (Math.random() - 0.5) * 20;
        const jitterY = (Math.random() - 0.5) * 20;

        const x = currentX + (targetX - currentX) * progress + jitterX;
        const y = currentY + (targetY - currentY) * progress + jitterY;

        await mouse.move(x, y);
        await new Promise(resolve => setTimeout(resolve, randomDelay(10, 30)));
    }

    // Final position
    await mouse.move(targetX, targetY);
}

/**
 * Simulasi scroll yang natural
 */
export async function naturalScroll(page, direction = 'down', amount = 'random') {
    const viewport = page.viewport();
    const scrollAmount = amount === 'random'
        ? randomDelay(100, 400)
        : amount;

    const scrollY = direction === 'down' ? scrollAmount : -scrollAmount;

    // Scroll dengan beberapa step kecil
    const steps = randomDelay(3, 6);
    const stepAmount = scrollY / steps;

    for (let i = 0; i < steps; i++) {
        await page.evaluate((y) => {
            window.scrollBy({ top: y, behavior: 'smooth' });
        }, stepAmount);

        await new Promise(resolve => setTimeout(resolve, randomDelay(50, 150)));
    }
}

/**
 * Click dengan persiapan natural
 */
export async function naturalClick(page, selector, options = {}) {
    const { moveFirst = true, delay = true } = options;

    try {
        const element = await page.$(selector);
        if (!element) {
            throw new Error(`Element not found: ${selector}`);
        }

        const boundingBox = await element.boundingBox();
        if (!boundingBox) {
            throw new Error(`Cannot get bounding box for: ${selector}`);
        }

        // Titik click dengan sedikit randomness
        const targetX = boundingBox.x + boundingBox.width / 2 + (Math.random() - 0.5) * 10;
        const targetY = boundingBox.y + boundingBox.height / 2 + (Math.random() - 0.5) * 5;

        // Move mouse ke target
        if (moveFirst) {
            await naturalMouseMove(page, targetX, targetY);
            await delayWithJitter(100);
        }

        // Click
        await page.mouse.click(targetX, targetY);

        if (delay) {
            await delayWithJitter(300);
        }

        return true;
    } catch (error) {
        console.error(`Failed to click ${selector}:`, error.message);
        return false;
    }
}

/**
 * Tunggu element dengan timeout yang reasonable
 */
export async function waitForElement(page, selectors, options = {}) {
    const { timeout = 10000, visible = true } = options;

    // Support multiple selectors (fallback)
    const selectorList = Array.isArray(selectors) ? selectors : [selectors];

    for (const selector of selectorList) {
        try {
            await page.waitForSelector(selector, {
                timeout: timeout / selectorList.length,
                visible
            });
            return selector;
        } catch (e) {
            // Try next selector
        }
    }

    throw new Error(`None of the selectors found: ${selectorList.join(', ')}`);
}

/**
 * Extract text dari element dengan fallback
 */
export async function extractText(page, selectors) {
    const selectorList = Array.isArray(selectors) ? selectors : [selectors];

    for (const selector of selectorList) {
        try {
            const element = await page.$(selector);
            if (element) {
                const text = await page.evaluate(el => el.textContent, element);
                if (text && text.trim()) {
                    return text.trim();
                }
            }
        } catch (e) {
            // Try next selector
        }
    }

    return null;
}

/**
 * Setup browser dengan konfigurasi stealth
 */
export function getStealthBrowserConfig() {
    return {
        headless: process.env.PUPPETEER_HEADLESS !== 'false' ? 'new' : false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--user-agent=' + getRandomUserAgent()
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        ignoreDefaultArgs: ['--enable-automation']
    };
}

/**
 * Inject script untuk menyembunyikan WebDriver
 */
export async function hideWebDriver(page) {
    await page.evaluateOnNewDocument(() => {
        // Override webdriver property
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });

        // Override languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en', 'id']
        });

        // Override plugins
        Object.defineProperty(navigator, 'plugins', {
            get: () => [
                { name: 'Chrome PDF Plugin' },
                { name: 'Chrome PDF Viewer' },
                { name: 'Native Client' }
            ]
        });

        // Override permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications'
                ? Promise.resolve({ state: Notification.permission })
                : originalQuery(parameters)
        );

        // Override chrome runtime
        window.chrome = {
            runtime: {}
        };
    });
}

export default {
    getRandomUserAgent,
    getRandomViewport,
    randomDelay,
    delayWithJitter,
    naturalType,
    naturalMouseMove,
    naturalScroll,
    naturalClick,
    waitForElement,
    extractText,
    getStealthBrowserConfig,
    hideWebDriver
};
