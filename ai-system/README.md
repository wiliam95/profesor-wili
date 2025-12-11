# Multi-Provider AI Service

Production-ready AI service dengan **4 provider fallback** - semua **GRATIS**!

## 🚀 Quick Start

```bash
cd ai-system/vercel-bot
npm install
cp .env.example .env
# Edit .env dengan API keys Anda
node test-all-providers.js
```

## 📊 Provider Capacity

| # | Provider | Daily Limit | Speed | Priority |
|---|----------|-------------|-------|----------|
| 1 | **Gemini** | 1500 req/day | ~1s | PRIMARY |
| 2 | **Groq** | 180k tokens/day | ~0.5s | SECONDARY |
| 3 | **OpenRouter** | Unlimited* | ~2s | TERTIARY |
| 4 | **HuggingFace** | Rate limited | ~3s | QUATERNARY |

**Total kapasitas: 15,000+ requests/day GRATIS!**

## 🔑 API Keys

| Provider | Get Key From |
|----------|--------------|
| Gemini | [aistudio.google.com](https://aistudio.google.com/) |
| Groq | [console.groq.com/keys](https://console.groq.com/keys) |
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) |
| HuggingFace | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |

> ⚠️ **Gemini:** Enable billing di Google Cloud untuk kuota free tier!

## 📁 Files

```
vercel-bot/
├── ai-service.js              # Main unified service
├── providers/
│   ├── gemini-provider.js     # Google Gemini
│   ├── groq-provider.js       # Groq (Llama 3.3)
│   ├── openrouter-provider.js # OpenRouter (free models)
│   └── huggingface-provider.js # HuggingFace
├── test-all-providers.js      # Test script
├── package.json
└── .env.example
```

## 💻 Usage

```javascript
import { AIService } from './ai-service.js';

const ai = new AIService();

// Simple usage
const response = await ai.getResponse('Hello!');
console.log(response.text);

// With options
const response = await ai.getResponse('Hello!', {
  userId: 'user123',           // For rate limiting
  sessionId: 'session456',     // For chat history
  preferredProvider: 'groq',   // Force specific provider
  skipCache: false             // Use cached response
});
```

## 🔄 Fallback Flow

```
Request → Cache? → Gemini → Groq → OpenRouter → HuggingFace → Error
           ↓
        Return cached
```

## 📈 Features

- ✅ Smart provider selection
- ✅ Auto-fallback cascade
- ✅ Per-provider health monitoring
- ✅ Response caching (1 hour default)
- ✅ Per-user rate limiting
- ✅ Chat history/context
- ✅ Token/quota tracking
- ✅ Statistics & analytics

## 🧪 Testing

```bash
# Test all providers
node test-all-providers.js

# Check health
const health = ai.getHealthStatus();
console.log(health);
```

## 🌐 Vercel Integration

```javascript
// api/chat.js
import { AIService } from '../ai-system/vercel-bot/ai-service.js';

const ai = new AIService();

export default async function handler(req, res) {
  const { message, userId, sessionId } = req.body;
  
  const response = await ai.getResponse(message, { userId, sessionId });
  
  res.json(response);
}
```

## 📄 License

MIT
