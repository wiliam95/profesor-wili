
import { LLM7Provider } from './providers/llm7-provider.js';

const runTest = async () => {
    console.log('Testing LLM7 Provider...');
    const provider = new LLM7Provider({ onLog: console.log });
    try {
        const result = await provider.getResponse('Hello, can you hear me?');
        console.log('Result:', result);
    } catch (e) {
        console.error('Error:', e);
    }
};

runTest();
