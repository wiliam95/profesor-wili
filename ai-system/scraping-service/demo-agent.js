/**
 * AI Web Scraping Demo Agent
 * 
 * This script demonstrates the capability to:
 * 1. Control a browser (Agentic behavior)
 * 2. Navigate to a website
 * 3. Extract information (Scraping)
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Add stealth plugin to avoid basic bot detection
puppeteer.use(StealthPlugin());

async function runDemo() {
    console.log('🤖 AI Agent starting...');
    console.log('🌐 Target: https://example.com');

    let browser;
    try {
        console.log('🚀 Launching browser...');
        browser = await puppeteer.launch({
            headless: "new", // Run in background
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();

        console.log('navigation_start: https://example.com');
        await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });

        // Extract data
        const data = await page.evaluate(() => {
            return {
                title: document.title,
                content: document.querySelector('p')?.innerText,
                header: document.querySelector('h1')?.innerText
            };
        });

        console.log('\n✅ SCRAPING SUCCESS!');
        console.log('------------------------------------------------');
        console.log(`Title  : ${data.title}`);
        console.log(`Header : ${data.header}`);
        console.log(`Content: ${data.content}`);
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (browser) {
            console.log('🔒 Closing browser...');
            await browser.close();
        }
    }
}

runDemo();
