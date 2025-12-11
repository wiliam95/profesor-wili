/**
 * ===========================================
 * SCRAPING SERVICE - Express API Server
 * ===========================================
 * 
 * Express server untuk Multi-Provider Scraping:
 * - Brave Leo (Primary)
 * - DeepSeek Chat (Recommended)
 * - LongCat Chat (Fast)
 * - MS Copilot (Emergency)
 * 
 * Deploy ke Railway.app atau Render.com.
 * 
 * Endpoints:
 * - POST /api/chat - Auto-select provider
 * - POST /api/chat/brave - Force Brave Leo
 * - POST /api/chat/deepseek - Force DeepSeek
 * - POST /api/chat/longcat - Force LongCat
 * - POST /api/chat/copilot - Force Copilot
 * - GET /health - Health check
 * - GET /stats - Statistics
 * 
 * @author AI System
 * @version 2.0.0
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

import { BraveScraper } from './providers/brave-scraper.js';
import { CopilotScraper } from './providers/copilot-scraper.js';
import { DeepSeekScraper } from './providers/deepseek-scraper.js';
import { LongCatScraper } from './providers/longcat-scraper.js';
import { LLM7Provider } from './providers/llm7-provider.js';
import { DeepAIScraper } from './providers/deepai-scraper.js';
import { PollinationsProvider } from './providers/pollinations-provider.js';
import { BraveLeoOllamaProvider } from './providers/brave-leo-ollama.js';
import { BraveLeoPuppeteer } from './providers/brave-leo-puppeteer.js';

// === Configuration ===
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['*'];

// === Initialize Express ===
const app = express();

// === Middleware ===

// Security
app.use(helmet());

// CORS
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000'
        ];

        if (allowedOrigins.indexOf(origin) !== -1 || CORS_ORIGINS[0] === '*') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Body parser
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX) || 30,
    message: {
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || uuidv4();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${requestId}`);
    next();
});

// API Key authentication
const authenticateApiKey = (req, res, next) => {
    if (!API_KEY) {
        // No API key configured, allow all
        return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (token !== API_KEY) {
        return res.status(401).json({
            success: false,
            error: 'UNAUTHORIZED',
            message: 'Invalid or missing API key'
        });
    }

    next();
};

// === Initialize Scrapers ===
const logger = (entry) => {
    const { level, message, ...data } = entry;
    // const logLine = `[${entry.timestamp}] [${level.toUpperCase()}] [${entry.provider || 'server'}] ${message}`;
    const provider = entry.provider || 'server';
    console.log(`[${level.toUpperCase()}] [${provider}] ${message}`);
};

const braveScraper = new BraveScraper({ onLog: logger });
const copilotScraper = new CopilotScraper({ onLog: logger });
const deepseekScraper = new DeepSeekScraper({ onLog: logger });
const longcatScraper = new LongCatScraper({ onLog: logger });
const llm7Provider = new LLM7Provider({ onLog: logger });
const deepaiScraper = new DeepAIScraper({ onLog: logger });
const pollinationsProvider = new PollinationsProvider({ onLog: logger });
const braveLeoOllama = new BraveLeoOllamaProvider({ onLog: logger });
const braveLeoPuppeteer = new BraveLeoPuppeteer({ onLog: logger });

// Statistics
const stats = {
    startTime: Date.now(),
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    providerUsage: {
        brave: 0,
        copilot: 0,
        deepseek: 0,
        longcat: 0
    }
};

// === Routes ===

/**
 * Root Route
 */
app.get('/', (req, res) => {
    res.json({
        service: 'AI Scraping Service (Backend)',
        status: 'running',
        endpoints: {
            health: '/health',
            stats: '/stats',
            chat: '/api/chat'
        },
        message: 'Bot Frontend is usually at http://localhost:5173'
    });
});

/**
 * Health Check
 */
app.get('/health', (req, res) => {
    const braveHealth = braveScraper.getHealth ? braveScraper.getHealth() : {};

    // Simple health check
    res.status(200).json({
        status: 'online',
        uptime: Date.now() - stats.startTime,
        providers: {
            brave: 'active',
            deepseek: 'active',
            longcat: 'active',
            copilot: 'backup'
        }
    });
});

/**
 * Statistics
 */
app.get('/stats', authenticateApiKey, (req, res) => {
    res.json({
        ...stats,
        uptime: Date.now() - stats.startTime
    });
});

/**
 * Chat with auto-provider selection
 */
app.post('/api/chat', authenticateApiKey, async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'INVALID_REQUEST',
            message: 'Message is required'
        });
    }

    stats.totalRequests++;

    // 0. Try Brave Leo BYOM (OLLAMA - 100% PRIVATE & LOCAL)
    try {
        const result = await braveLeoOllama.getResponse(message);
        if (result.success) {
            stats.successfulRequests++;
            stats.providerUsage.ollama = (stats.providerUsage.ollama || 0) + 1;
            return res.json(result);
        }
    } catch (e) {
        console.log('Ollama (Local) failed/not available, falling back to Cloud...');
    }

    // 1. Try Pollinations.ai (BEST, NO API KEY, FAST)
    try {
        const result = await pollinationsProvider.getResponse(message);
        if (result.success) {
            stats.successfulRequests++;
            stats.providerUsage.pollinations = (stats.providerUsage.pollinations || 0) + 1;
            return res.json(result);
        }
    } catch (e) {
        console.log('Pollinations failed, falling back...');
    }

    // 2. Try LLM7Provider (Free No-Auth Fallback)
    try {
        const result = await llm7Provider.getResponse(message);
        if (result.success) {
            stats.successfulRequests++;
            stats.providerUsage.llm7 = (stats.providerUsage.llm7 || 0) + 1;
            return res.json(result);
        }
    } catch (e) {
        console.log('LLM7 failed, falling back...');
    }

    // 3. Try DeepAI (User Preferred Scraper)
    try {
        const result = await deepaiScraper.getResponse(message);
        if (result.success) {
            stats.successfulRequests++;
            stats.providerUsage.deepai = (stats.providerUsage.deepai || 0) + 1;
            return res.json(result);
        }
    } catch (e) {
        console.log('DeepAI failed, falling back...');
    }

    // 4. Try DeepSeek (Backup Scraper)
    try {
        const result = await deepseekScraper.getResponse(message);
        if (result.success) {
            stats.successfulRequests++;
            stats.providerUsage.deepseek++;
            return res.json(result);
        }
    } catch (e) {
        console.log('DeepSeek failed, falling back...');
    }

    // 5. Try LongCat (Fast Scraper)
    try {
        const result = await longcatScraper.getResponse(message);
        if (result.success) {
            stats.successfulRequests++;
            stats.providerUsage.longcat++;
            return res.json(result);
        }
    } catch (e) {
        console.log('LongCat failed, falling back...');
    }

    // 6. Try Brave Leo Puppeteer (Automation Fallback)
    try {
        const result = await braveLeoPuppeteer.getResponse(message);
        if (result.success) {
            stats.successfulRequests++;
            stats.providerUsage.bravePuppeteer = (stats.providerUsage.bravePuppeteer || 0) + 1;
            return res.json(result);
        }
    } catch (e) {
        console.log('Brave Leo Puppeteer failed...');
    }

    // 7. Fallback to Brave
    try {
        const result = await braveScraper.getResponse(message);
        if (result.success) {
            stats.successfulRequests++;
            stats.providerUsage.brave++;
            return res.json(result);
        }
    } catch (e) {
        console.log('Brave failed, falling back to emergency...');
    }

    // 4. Copilot (Emergency) is skipped for auto-chat to avoid detection,
    // unless specifically requested via /api/chat/copilot

    // All providers failed
    stats.failedRequests++;
    res.status(503).json({
        success: false,
        error: 'ALL_PROVIDERS_FAILED',
        message: 'All scraping providers are unavailable'
    });
});

/**
 * Individual Routes
 */
app.post('/api/chat/deepseek', authenticateApiKey, async (req, res) => {
    const { message } = req.body;
    stats.totalRequests++;
    const result = await deepseekScraper.getResponse(message);
    if (result.success) {
        stats.successfulRequests++;
        stats.providerUsage.deepseek++;
        res.json(result);
    } else {
        stats.failedRequests++;
        res.status(503).json(result);
    }
});

app.post('/api/chat/longcat', authenticateApiKey, async (req, res) => {
    const { message } = req.body;
    stats.totalRequests++;
    const result = await longcatScraper.getResponse(message);
    if (result.success) {
        stats.successfulRequests++;
        stats.providerUsage.longcat++;
        res.json(result);
    } else {
        stats.failedRequests++;
        res.status(503).json(result);
    }
});

app.post('/api/chat/brave', authenticateApiKey, async (req, res) => {
    const { message } = req.body;
    stats.totalRequests++;
    const result = await braveScraper.getResponse(message);
    if (result.success) {
        stats.successfulRequests++;
        stats.providerUsage.brave++;
        res.json(result);
    } else {
        stats.failedRequests++;
        res.status(503).json(result);
    }
});

app.post('/api/chat/copilot', authenticateApiKey, async (req, res) => {
    const { message } = req.body;
    stats.totalRequests++;
    const result = await copilotScraper.getResponse(message);
    if (result.success) {
        stats.successfulRequests++;
        stats.providerUsage.copilot++;
        res.json(result);
    } else {
        stats.failedRequests++;
        res.status(503).json(result);
    }
});

// === Error Handler ===
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`, err.stack);
    res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'An internal error occurred'
    });
});

// === Graceful Shutdown ===
const shutdown = async () => {
    console.log('\n[SHUTDOWN] Cleaning up...');

    // Best effort cleanup
    try { if (braveScraper.cleanup) await braveScraper.cleanup(); } catch (e) { }
    try { if (copilotScraper.cleanup) await copilotScraper.cleanup(); } catch (e) { }
    // DeepSeek and LongCat close browser on each request currently, but good to check
    if (deepseekScraper.browser) await deepseekScraper.browser.close();
    if (longcatScraper.browser) await longcatScraper.browser.close();

    console.log('[SHUTDOWN] Cleanup complete');
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// === Start Server ===
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     AI SCRAPING SERVICE v2.0                              ║
║     Running on port ${PORT}                                  ║
║                                                           ║
║     Providers:                                            ║
║     - DeepSeek Chat (Recommended)                         ║
║     - LongCat Chat (Fast)                                 ║
║     - Brave Leo (Fallback)                                ║
║     - MS Copilot (Emergency)                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
