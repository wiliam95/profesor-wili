# WILI AI Workspace - Architecture Documentation

## Overview

WILI AI Workspace is a Claude AI-inspired chat interface built with React, TypeScript, and Vite. It supports multiple AI providers (Gemini, OpenRouter, HuggingFace, OpenAI) with streaming responses, artifacts, and project management.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (React)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Sidebar  │  │   Chat UI    │  │   Artifacts  │  │   Projects  │ │
│  └──────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Context Layer   │  │   Hooks Layer    │  │  Utils Layer     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                         Service Layer                                │
│  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐  ┌──────────┐  │
│  │ Gemini  │  │OpenRouter│  │HugFace │  │ OpenAI  │  │WebSearch │  │
│  └─────────┘  └──────────┘  └────────┘  └─────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ SSE/HTTP
┌─────────────────────────────────────────────────────────────────────┐
│                        AI Provider APIs                              │
│  Google AI  │  OpenRouter  │  HuggingFace  │  OpenAI               │
└─────────────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
BOT SETENGAH JADI/
├── components/          # UI Components
│   ├── Layout.tsx       # Main layout wrapper
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── ChatInterface.tsx # Chat UI with input
│   ├── MessageBubble.tsx # Individual message display
│   ├── ModelSelector.tsx # AI model dropdown
│   ├── ArtifactsPanel.tsx # Code/doc preview panel
│   ├── ArtifactsSpace.tsx # Artifacts management
│   ├── FileUpload.tsx    # File upload handler
│   ├── ToolsPanel.tsx    # AI tools configuration
│   ├── ProjectsPanel.tsx # Projects management
│   ├── ThinkingBubble.tsx # AI thinking indicator
│   ├── BotBuilder.tsx    # Custom bot creator
│   └── LoginPanel.tsx    # Authentication UI
├── hooks/               # Custom React Hooks
│   ├── useAuth.ts       # Authentication
│   ├── useChat.ts       # Chat operations
│   ├── useArtifacts.ts  # Artifacts management
│   └── useProjects.ts   # Projects management
├── context/             # React Context Providers
│   ├── AuthContext.tsx
│   ├── ChatContext.tsx
│   └── ProjectContext.tsx
├── services/            # API Services
│   ├── geminiService.ts # Google Gemini API
│   ├── openrouterService.ts
│   ├── hfService.ts
│   ├── openaiService.ts
│   └── index.ts         # Service exports
├── utils/               # Utility Functions
│   ├── apiHelpers.ts
│   ├── formatters.ts
│   └── validators.ts
├── config/              # Configuration
├── store/               # State Management
├── i18n/                # Internationalization
├── tests/               # Test Files
├── docs/                # Documentation
└── scripts/             # Build/Dev Scripts
```

## Data Flow

1. **User Input** → ChatInterface
2. **Message Processing** → useChat hook
3. **API Request** → Service Layer (geminiService, etc.)
4. **Streaming Response** → SSE parsing
5. **UI Update** → MessageBubble with streaming text
6. **Artifact Detection** → ArtifactsPanel

## Feature Flags

Located in `services/index.ts`:
- `enableClaudeFiles` - File upload support
- `enableWorkspace` - Project workspace
- `enableAIBuilder` - Bot builder feature
- `enableExperimentalStreaming` - Advanced streaming
- `enableThinking` - Thinking bubble UI

## API Integration

### Gemini API
- Model: gemini-2.5-pro, gemini-2.5-flash
- Streaming via Server-Sent Events
- Supports: text, images, files

### OpenRouter
- Multiple model access (Llama, Mixtral, etc.)
- Unified API endpoint
- Proxy via Vite dev server

## Security

- Input sanitization in `validators.ts`
- File type validation
- Rate limiting support
- API key storage in localStorage (dev only)
