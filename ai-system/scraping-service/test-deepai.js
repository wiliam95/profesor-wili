
import { DeepAIScraper } from './providers/deepai-scraper.js';

const runTest = async () => {
    console.log('Testing DeepAI Scraper...');
    const provider = new DeepAIScraper({ onLog: console.log });
    try {
        const result = await provider.getResponse('Hello, are you working?');
        console.log('Result:', result);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await provider.cleanup();
    }
};

runTest();
