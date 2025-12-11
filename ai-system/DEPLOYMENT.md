# Deployment Guide

Step-by-step guide untuk deploy AI system ke production.

## Prerequisites

- Node.js 18+
- Google Cloud account (untuk Gemini API)
- Railway.app atau Render.com account (untuk scraping service)

---

## Step 1: Setup Google AI Studio

### 1.1 Get API Key
1. Buka [https://aistudio.google.com/](https://aistudio.google.com/)
2. Klik **"Get API Key"**
3. Create new key atau gunakan existing project
4. Copy API key

### 1.2 Enable Billing (WAJIB!)

> ⚠️ Tanpa billing, quota free tier = 0

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project yang sama dengan API key
3. Go to **Billing** → **Link a billing account**
4. Tambahkan payment method (kartu kredit/debit)
5. Anda TIDAK akan dicharge selama dalam free tier limits

### 1.3 Verify
Test API key:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```

---

## Step 2: Deploy Scraping Service

### Option A: Railway.app (Recommended)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Navigate ke folder
cd ai-system/scraping-service

# 4. Create project
railway init

# 5. Set environment variables
railway variables set API_KEY=your_secure_key
railway variables set NODE_ENV=production

# 6. Deploy
railway up

# 7. Generate domain
railway domain

# Output: https://xxx.railway.app
```

### Option B: Render.com

1. Push code ke GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. New → **Web Service**
4. Connect repository
5. Settings:
   - Runtime: Docker
   - Free Instance Type
6. Add environment variables
7. Deploy

---

## Step 3: Configure Bot

### 3.1 Create .env file

```bash
cd ai-system/vercel-bot
cp .env.example .env
```

### 3.2 Edit .env

```env
GOOGLE_API_KEY=AIza...your_key...
SCRAPING_SERVICE_URL=https://your-app.railway.app
SCRAPING_API_KEY=your_secure_key
ENABLE_CACHE=true
CACHE_TTL=3600
```

---

## Step 4: Integration

### Vercel Bot Integration

```javascript
// api/chat.js (Vercel serverless function)
import { AIService } from '../ai-system/vercel-bot/ai-service.js';

const ai = new AIService();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, userId, sessionId } = req.body;

  try {
    const response = await ai.getResponse(message, { userId, sessionId });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Telegram Bot Integration

```javascript
import TelegramBot from 'node-telegram-bot-api';
import { AIService } from './ai-system/vercel-bot/ai-service.js';

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const ai = new AIService();

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  const response = await ai.getResponse(msg.text, {
    userId,
    sessionId: chatId.toString()
  });
  
  if (response.success) {
    bot.sendMessage(chatId, response.text);
  } else {
    bot.sendMessage(chatId, 'Maaf, terjadi error. Silakan coba lagi.');
  }
});
```

---

## Step 5: Testing

```bash
# Test Gemini
node test-gemini.js

# Test Scraping (local)
cd ai-system/scraping-service
npm start
# In another terminal:
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'

# Test Integration
node test-integration.js
```

---

## Monitoring

### Health Check
```bash
curl https://your-app.railway.app/health
```

### Statistics
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-app.railway.app/stats
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 429 Quota Exceeded | Enable billing di Google Cloud |
| Model not found | Use `gemini-2.0-flash-exp` |
| Scraping detection | Service akan auto-rotate sessions |
| Copilot blocked | POST `/api/admin/reset-copilot` |

---

## Production Checklist

- [ ] Google Cloud billing enabled
- [ ] API keys secured (tidak hardcoded)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Health monitoring active
- [ ] Backup provider tested
