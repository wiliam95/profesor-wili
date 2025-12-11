/**
 * Test All Providers
 * 
 * Run: node test-all-providers.js
 */

import 'dotenv/config';
import { AIService } from './ai-service.js';

async function testAllProviders() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║     MULTI-PROVIDER AI SERVICE TEST                        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    const ai = new AIService({
        onLog: (entry) => {
            if (entry.level !== 'debug') {
                console.log(`[${entry.level.toUpperCase()}] ${entry.message}`);
            }
        }
    });

    const testMessage = 'Jelaskan apa itu kecerdasan buatan dalam 2 kalimat.';

    console.log(`Test Message: "${testMessage}"\n`);
    console.log('━'.repeat(60) + '\n');

    // Test 1: Auto-fallback
    console.log('TEST 1: Auto-Fallback (all providers)');
    console.log('─'.repeat(40));

    const response1 = await ai.getResponse(testMessage, {
        userId: 'test-user',
        sessionId: 'test-session'
    });

    if (response1.success) {
        console.log(`✅ SUCCESS`);
        console.log(`   Provider: ${response1.provider}`);
        console.log(`   Model: ${response1.model || 'N/A'}`);
        console.log(`   Time: ${response1.responseTime}ms`);
        console.log(`   Response: ${response1.text.substring(0, 100)}...`);
    } else {
        console.log(`❌ FAILED: ${response1.error}`);
        console.log(`   Message: ${response1.message}`);
    }

    console.log('\n' + '━'.repeat(60) + '\n');

    // Test 2: Cache
    console.log('TEST 2: Cache Hit');
    console.log('─'.repeat(40));

    const response2 = await ai.getResponse(testMessage, {
        userId: 'test-user',
        sessionId: 'test-session'
    });

    if (response2.cached) {
        console.log(`✅ CACHE HIT (${response2.responseTime}ms)`);
    } else {
        console.log(`ℹ️ New response (not cached)`);
    }

    console.log('\n' + '━'.repeat(60) + '\n');

    // Test 3: Specific provider
    const providers = ['gemini', 'groq', 'openrouter', 'huggingface'];

    console.log('TEST 3: Individual Providers');
    console.log('─'.repeat(40));

    for (const provider of providers) {
        const testResponse = await ai.getResponse('Hello!', {
            userId: `test-${provider}`,
            sessionId: `session-${provider}`,
            preferredProvider: provider,
            skipCache: true
        });

        const status = testResponse.success ? '✅' : '❌';
        const info = testResponse.success
            ? `${testResponse.responseTime}ms`
            : testResponse.error;

        console.log(`   ${status} ${provider.padEnd(12)} - ${info}`);
    }

    console.log('\n' + '━'.repeat(60) + '\n');

    // Health Status
    console.log('HEALTH STATUS:');
    console.log('─'.repeat(40));

    const health = ai.getHealthStatus();

    console.log('\nProvider Availability:');
    console.log(`   Gemini:      ${health.gemini.models ? '✅ Available' : '❌ No key'}`);
    console.log(`   Groq:        ${health.groq.available ? '✅ Available' : '❌ No key'}`);
    console.log(`   OpenRouter:  ${health.openrouter.available ? '✅ Available' : '❌ No key'}`);
    console.log(`   HuggingFace: ${health.huggingface.available ? '✅ Available' : '❌ No key'}`);

    console.log('\nStatistics:');
    console.log(`   Total Requests:    ${health.stats.totalRequests}`);
    console.log(`   Success Rate:      ${health.stats.successRate}%`);
    console.log(`   Avg Response Time: ${health.stats.averageResponseTime}ms`);
    console.log(`   Cache Hits:        ${health.cache.hits}`);

    console.log('\nProvider Usage:');
    for (const [provider, count] of Object.entries(health.stats.providerUsage)) {
        if (count > 0) {
            console.log(`   ${provider}: ${count} requests`);
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('Test Complete!');
}

testAllProviders().catch(console.error);
