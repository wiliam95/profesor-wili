/**
 * Test Gemini Provider
 * 
 * Run: node test-gemini.js
 */

import 'dotenv/config';
import { GeminiProvider } from './providers/gemini-provider.js';

async function testGemini() {
    console.log('=== Testing Gemini Provider ===\n');

    try {
        const gemini = new GeminiProvider({
            apiKey: process.env.GOOGLE_API_KEY,
            onLog: (entry) => {
                console.log(`[${entry.level.toUpperCase()}] ${entry.message}`);
            }
        });

        console.log('1. Testing simple message...');
        const response1 = await gemini.getResponse('Halo! Siapa kamu?');

        if (response1.success) {
            console.log(`✅ Success! Model: ${response1.model}`);
            console.log(`   Response: ${response1.text.substring(0, 100)}...`);
            console.log(`   Time: ${response1.responseTime}ms`);
            console.log(`   Quota: ${response1.usage.quotaUsed}/${response1.usage.quotaLimit}`);
        } else {
            console.log(`❌ Failed: ${response1.error}`);
            console.log(`   Message: ${response1.message}`);
        }

        console.log('\n2. Testing with session...');
        const sessionId = 'test-session-123';

        await gemini.getResponse('Namaku Budi', { sessionId });
        const response2 = await gemini.getResponse('Siapa namaku?', { sessionId });

        if (response2.success) {
            console.log(`✅ Context preserved!`);
            console.log(`   Response: ${response2.text.substring(0, 100)}...`);
        }

        console.log('\n3. Health Status:');
        const health = gemini.getHealthStatus();
        for (const [model, status] of Object.entries(health)) {
            console.log(`   ${model}: ${status.healthy ? '✅' : '❌'} (${status.quotaUsed}/${status.quotaLimit})`);
        }

        console.log('\n=== Test Complete ===');

    } catch (error) {
        console.error('Test failed:', error.message);
        process.exit(1);
    }
}

testGemini();
