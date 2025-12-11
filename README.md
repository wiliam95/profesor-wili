# WILI AI Workspace

Claude AI-inspired workspace with multiple AI providers (Gemini, OpenRouter, HuggingFace, OpenAI).

## Features

- 🤖 **Multiple AI Models**: Gemini 2.5, Llama, Mixtral, Qwen, and more
- 💬 **Streaming Chat**: Real-time token-by-token responses
- 🎨 **Artifacts**: Code, documents, and interactive previews
- 📁 **Projects**: Organize work into workspaces
- 🧠 **Thinking Bubble**: View AI reasoning process
- 🔧 **Tools Panel**: Configure AI capabilities
- 🌐 **Web Search**: Optional internet access
- 📎 **File Upload**: Images, code, documents

## Quick Start

```bash
# Install dependencies
npm install

# Configure API keys (copy and edit .env.local)
# GEMINI_API_KEY=your_key_here
# VITE_OPENROUTER_API_KEY=your_key_here

# Run development server
npm run dev
```

Open http://localhost:3000

## Project Structure

```
├── components/     # UI Components (16 files)
├── hooks/          # Custom React Hooks (4 files)
├── context/        # React Context Providers (3 files)
├── services/       # API Services (23 files)
├── utils/          # Utility Functions (3 files)
├── config/         # Configuration
├── store/          # State Management
├── i18n/           # Internationalization
├── docs/           # Documentation
└── scripts/        # Build Scripts
```

## Configuration

Edit `.env.local` for API keys:
```
GEMINI_API_KEY=your_gemini_api_key
VITE_OPENROUTER_API_KEY=your_openrouter_key
VITE_HF_TOKEN=your_huggingface_token
VITE_OPENAI_API_KEY=your_openai_key
```

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run typecheck` - TypeScript checking
- `npm run lint` - ESLint checking

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS (CDN)
- Lucide Icons
- React Markdown

## License

MIT
