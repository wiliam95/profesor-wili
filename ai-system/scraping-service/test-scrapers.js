/**
 * ===========================================
 * SCRAPER TEST SCRIPT
 * ===========================================
 * 
 * Script untuk mengetes semua provider scraping secara otomatis.
 * Run: node test-scrapers.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const TEST_MESSAGE = 'Halo, tes satu dua tiga.';

async function testProvider(name, endpoint) {
    console.log(`\nTesting ${name}...`);
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Status: Waiting for response...`);

    const startTime = Date.now();

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: TEST_MESSAGE })
        });

        const data = await response.json();
        const duration = Date.now() - startTime;

        if (response.ok && data.success) {
            console.log(`✅ SUCCESS (${duration}ms)`);
            console.log(`   Response: ${data.text || data.response}`);
            return true;
        } else {
            console.log(`❌ FAILED (${duration}ms)`);
            console.log(`   Error: ${data.error || response.statusText}`);
            return false;
        }
    } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`❌ ERROR (${duration}ms)`);
        console.log(`   ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║     SCRAPING SERVICE AUTO-TEST             ║');
    console.log('╚════════════════════════════════════════════╝');

    // 1. Check Server Health
    console.log('\nchecking health...');
    try {
        const res = await fetch(`${BASE_URL}/health`);
        if (res.ok) {
            console.log('✅ Server is ONLINE');
        } else {
            console.log('❌ Server is OFFLINE or Error');
            console.log('   Please run: npm start');
            return;
        }
    } catch (e) {
        console.log('❌ Server is OFFLINE');
        console.log(`   Error: ${e.message}`);
        console.log('   Please run: npm start');
        return;
    }

    // 2. Test Individual Providers
    console.log('\n--- TESTING INDIVIDUAL PROVIDERS ---');

    await testProvider('DEEPSEEK (Recommended)', '/api/chat/deepseek');
    await testProvider('LONGCAT (Fast)', '/api/chat/longcat');
    await testProvider('BRAVE LEO', '/api/chat/brave');

    // 3. Test Auto Routing
    console.log('\n--- TESTING AUTO ROUTING ---');
    await testProvider('AUTO SELECT', '/api/chat');

    console.log('\nSee logs in terminal running "npm start" for details.');
}

runTests();
