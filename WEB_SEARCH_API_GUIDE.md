# 🔍 WEB SEARCH API CONFIGURATION GUIDE

## 📋 OVERVIEW

Your WILI AI now supports **3 tiers of web search**:

| Priority | Service | Quality | Cost | Speed |
|----------|---------|---------|------|-------|
| **1st** | **Tavily** | ⭐⭐⭐⭐⭐ Best | $$$ Paid | ⚡ Fast (1-2s) |
| **2nd** | **Serper** | ⭐⭐⭐⭐ Great | $$ Affordable | ⚡ Fast (1-2s) |
| **3rd** | **Wikipedia** | ⭐⭐⭐ Good | ✅ FREE | ⚡ Fast (1s) |

The system **automatically** uses the best available service based on what API keys you have configured.

---

## 🎯 QUICK START (NO API KEYS NEEDED)

**Default Mode:** Wikipedia Search (FREE)
- ✅ Works immediately, no setup
- ✅ Good for general knowledge
- ⚠️ Limited to Wikipedia content only
- ⚠️ Not real-time (articles may be outdated)

---

## ⚡ UPGRADE TO PREMIUM SEARCH

### Option 1: Tavily API (RECOMMENDED) 🏆

**Why Tavily?**
- ✅ **Best quality** - Optimized for AI/LLM
- ✅ **Real-time Google Search** results
- ✅ **Structured data** - Easy to parse
- ✅ **Answer extraction** - Direct answers included
- ✅ Free tier: **1,000 searches/month**

**How to get Tavily API Key:**

1. **Go to:** https://tavily.com/#api
2. **Sign up** for free account
3. **Get API key** (looks like `tvly-xxx`)
4. **In WILI:**
   - Click Settings (gear icon) → Scroll down
   - Paste key in **"Tavily API Key"** field
   - Click **"Save Settings"**

**Pricing:**
- Free: 1,000 searches/month
- Pro: $30/month (unlimited)
- Enterprise: Custom pricing

**Example Search Quality:**
```
User: "latest AI news December 2025"
Tavily returns:
- Top 5 Google results
- Direct answer extracted
- Published dates included
- Source URLs provided
```

---

### Option 2: Serper API (ALTERNATIVE) 💎

**Why Serper?**
- ✅ **Google Search API** - Official SERP data
- ✅ **Fast responses** (1-2s average)
- ✅ **Rich data** - Answer boxes, knowledge graphs
- ✅ **Affordable** - $50 = 50,000 searches
- ✅ Free tier: **2,500 searches** for testing

**How to get Serper API Key:**

1. **Go to:** https://serper.dev/
2. **Sign up** with Google/GitHub
3. **Get API key** from dashboard
4. **In WILI:**
   - Settings → Scroll to **"Serper API Key"**
   - Paste your key
   - Save

**Pricing:**
- Free: 2,500 searches (one-time)
- Pay-as-you-go: $0.001/search ($50 = 50K searches)
- No monthly fees

**Example Search Quality:**
```
User: "weather in Tokyo"
Serper returns:
- Current weather from Google
- Answer box data
- Knowledge graph info
- Related searches
```

---

## 🔄 HOW AUTO-ROUTING WORKS

```
User sends message with search intent
        ↓
[1] Check if Tavily API key exists
    ✓ YES → Use Tavily (best quality)
    ✗ NO  → Go to [2]
        ↓
[2] Check if Serper API key exists
    ✓ YES → Use Serper (good quality)
    ✗ NO  → Go to [3]
        ↓
[3] Use Wikipedia (free fallback)
```

**You don't need to do anything!** Just add whichever API keys you have, and the system picks the best one automatically.

---

## 📊 COMPARISON TABLE

### Search Quality by Service

| Feature | Tavily | Serper | Wikipedia |
|---------|--------|--------|-----------|
| **Real-time Data** | ✅ Yes | ✅ Yes | ❌ No |
| **Google Results** | ✅ Yes | ✅ Yes | ❌ No |
| **Answer Extraction** | ✅ Yes | ✅ Yes | ⚠️ Sometimes |
| **News Results** | ✅ Yes | ✅ Yes | ❌ No |
| **Image Search** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **Snippet Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **API Reliability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 💰 COST ANALYSIS (MONTHLY)

### Scenario 1: Light User (100 searches/day)
- **Wikipedia**: ✅ **FREE**
- **Tavily Free**: ✅ **FREE** (up to ~33 searches/day)
- **Tavily Pro**: $30/month (unlimited)
- **Serper**: ~$3/month (100 x 30 = 3,000 searches)

### Scenario 2: Heavy User (1,000 searches/day)
- **Wikipedia**: ✅ **FREE** (but limited quality)
- **Tavily Pro**: $30/month (unlimited)
- **Serper**: ~$30/month (1,000 x 30 = 30,000 searches)

**Recommendation:**
- Casual use → Stick with **Wikipedia** (free)
- Professional use → Get **Tavily** ($30/month unlimited)
- Budget-conscious → Use **Serper** (pay-per-use, no monthly fee)

---

## 🧪 TESTING YOUR SETUP

### Test 1: Check which service is active

Open browser console (F12) and send a message like:
```
"search for latest AI news"
```

Check console logs:
```
[WILI] Starting Smart Web Search...
[Tavily] ✓ Found 5 results          ← Using Tavily!
[WILI] ✓ Search returned 5 results
```

or

```
[WebSearch] ⚠️ No premium API keys found, using Wikipedia fallback
[Wikipedia] ✓ Found 4 results       ← Using Wikipedia
```

### Test 2: Verify search quality

**With Tavily/Serper:**
Ask: "What happened in the world today?"
Expected: Recent news articles

**With Wikipedia:**
Ask: "What happened in the world today?"
Expected: General history/wiki articles (not today's news)

---

## 🛠️ TROUBLESHOOTING

### Problem 1: "Search returns no results"
**Cause:** API key might be invalid

**Fix:**
1. Check key in Settings (no typos?)
2. Verify key is active on provider's dashboard
3. Check browser console for error messages

---

### Problem 2: "Still using Wikipedia even though I added Tavily key"
**Cause:** API key not saved properly

**Fix:**
1. Re-enter API key in Settings
2. Click **"Save Settings"** button
3. **Refresh the page** (important!)
4. Open console and check:
   ```javascript
   localStorage.getItem('TAVILY_API_KEY') // Should show your key
   ```

---

### Problem 3: "API key invalid" error
**Cause:** Wrong key format or expired trial

**Fix:**
- Tavily keys start with `tvly-`
- Serper keys are alphanumeric (no prefix)
- Check if trial period expired
- Generate new key from provider

---

## 📝 UPDATING .env.example (FOR DEVELOPERS)

If you're deploying to Vercel, you can also set these via environment variables:

```bash
# Advanced Web Search (Optional)
VITE_TAVILY_API_KEY=tvly-your-key-here
VITE_SERPER_API_KEY=your-serper-key-here
```

But **Settings Panel is easier** - just paste and save!

---

## 🎯 RECOMMENDATIONS BY USE CASE

### For Students / Researchers:
→ **Tavily Free Tier** (1,000 searches/month) + Wikipedia fallback

### For Businesses / Power Users:
→ **Tavily Pro** ($30/month unlimited) - Best ROI

### For Developers / Testing:
→ **Serper Free Tier** (2,500 one-time) - Great for testing

### For Casual Users:
→ **Wikipedia** (free forever) - Good enough for most questions

---

## 🚀 FUTURE IMPROVEMENTS

Planned features:
- [ ] DuckDuckGo API integration
- [ ] Brave Search API
- [ ] Custom search engine support
- [ ] Search result caching
- [ ] Multi-language search

---

## 📞 SUPPORT

If you have issues:
1. Check console logs (F12 → Console tab)
2. Verify API keys are saved in localStorage
3. Test with simple query first
4. Check provider's status page

**Provider Status Pages:**
- Tavily: https://status.tavily.com/
- Serper: https://serper.dev/status

---

## ✅ SUMMARY

**What you added:**
- ✅ Tavily API support (premium Google search)
- ✅ Serper API support (Google SERP data)
- ✅ Smart auto-routing (best service auto-selected)
- ✅ Wikipedia fallback (always works)

**How it works:**
1. User sends message
2. System checks for API keys
3. Uses best available service automatically
4. Returns high-quality, real-time results

**Cost:**
- Free tier: Wikipedia (always available)
- Upgrade: Tavily or Serper (optional, ~$30/month)

**Setup time:** 2 minutes (just paste API key & save)

---

**Status:** ✅ FEATURE READY TO USE!

Try it now:
1. Go to Settings
2. Add Tavily or Serper key (optional)
3. Ask: "latest news about AI"
4. See real-time search results! 🎉
