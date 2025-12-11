/**
 * Test Integration - Full AI Service
 * 
 * Run: node test-integration.js
 */

import 'dotenv/config';
import { AIService } from './ai-service.js';

async function testIntegration() {
    console.log('=== Testing Full AI Service Integration ===\n');

    try {
        const ai = new AIService({
            googleApiKey: process.env.GOOGLE_API_KEY,
            scrapingServiceUrl: process.env.SCRAPING_SERVICE_URL,
            scrapingApiKey: process.env.SCRAPING_API_KEY,
            enableCache: true,
            onLog: (entry) => {
                if (entry.level !== 'debug') {
                    console.log(`[${entry.level.toUpperCase()}] ${entry.message}`);
                }
            }
        });

        console.log('1. Testing primary provider (Gemini)...');
        const response1 = await ai.getResponse('Jelaskan apa itu AI dalam 1 kalimat', {
            userId: 'test-user-1'
        });

        if (response1.success) {
            console.log(`✅ Provider: ${response1.provider} (${response1.model || 'scraping'})`);
            console.log(`   Response: ${response1.text.substring(0, 100)}...`);
            console.log(`   Time: ${response1.responseTime}ms`);
            console.log(`   Cached: ${response1.cached}`);
        } else {
            console.log(`❌ Failed: ${response1.error}`);
        }

        console.log('\n2. Testing cache...');
        const response2 = await ai.getResponse('Jelaskan apa itu AI dalam 1 kalimat', {
            userId: 'test-user-1'
        });

        if (response2.cached) {
            console.log(`✅ Cache hit! Time: ${response2.responseTime}ms`);
        } else {
            console.log(`ℹ️ Cache miss (new response)`);
        }

        console.log('\n3. Testing rate limiting...');
        const rateLimitTest = await ai.getResponse('Test rate limit', {
            userId: 'test-user-1'
        });

        if (rateLimitTest.error === 'RATE_LIMITED') {
            console.log(`✅ Rate limiting working! Wait: ${rateLimitTest.message}`);
        } else {
            console.log(`ℹ️ Rate limit not triggered (enough time passed)`);
        }

        console.log('\n4. Health Status:');
        const health = ai.getHealthStatus();
        console.log('   Gemini Models:');
        for (const [model, status] of Object.entries(health.gemini)) {
            console.log(`     ${model}: ${status.healthy ? '✅' : '❌'} (${status.quotaRemaining} remaining)`);
        }
        console.log('   Scrapers:');
        console.log(`     Brave: ${health.scrapers.brave.healthy ? '✅' : '❌'}`);
        console.log(`     Copilot: ${health.scrapers.copilot.healthy ? '✅' : '❌'}`);

        console.log('\n5. Statistics:');
        const stats = ai.getStats();
        console.log(`   Total Requests: ${stats.totalRequests}`);
        console.log(`   Success Rate: ${stats.totalRequests > 0 ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) : 0}%`);
        console.log(`   Cache Keys: ${stats.cacheKeys}`);

        console.log('\n=== Integration Test Complete ===');

    } catch (error) {
        console.error('Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

testIntegration();
