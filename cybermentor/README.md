# CyberMentor AI 🛡️

> A modern SaaS-style cybersecurity chatbot — learn ethical hacking through real-world attack scenarios, powered by free LLMs via OpenRouter.

Built with Next.js 14 App Router, TypeScript, Tailwind CSS, and streaming AI responses.

---

## Features

- **Real-time streaming** — responses stream token by token, just like ChatGPT
- **Stop generation** — cancel a response mid-stream with the stop button
- **Regenerate** — re-run the last prompt for a fresh response
- **Light / Dark theme** — toggle between themes, persisted in localStorage
- **Syntax highlighting** — code blocks highlighted via highlight.js with language label
- **Per-block copy button** — copy any code block individually
- **Copy full response** — one-click copy for the entire message
- **Auto-scroll toggle** — freely scroll up to read history; scroll-to-bottom pill appears automatically
- **Markdown rendering** — headers, bold, lists, inline code, blockquotes all rendered
- **Model fallback** — automatically tries backup models if primary is rate-limited
- **Suggested prompts** — 3 clickable starter questions on empty state
- **Clear chat** — wipe conversation with one click
- **Responsive** — works on mobile and desktop

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + CSS variables for theming |
| Icons | Lucide React |
| Syntax highlighting | highlight.js |
| AI backend | OpenRouter API (free tier) |
| Models | `google/gemma-3-12b-it:free` → `gemma-3-4b-it:free` → `nvidia/nemotron-3-nano-30b-a3b:free` |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/yourusername/cybermentor-ai
cd cybermentor-ai
npm install
```

### 2. Set up environment

```bash
cp .env.local.example .env.local
```

Add your OpenRouter API key to `.env.local`:

```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
```

Get a free key at [openrouter.ai/keys](https://openrouter.ai/keys).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
cybermentor/
├── app/
│   ├── api/chat/
│   │   └── route.ts          # Streaming API route — calls OpenRouter with model fallback
│   ├── globals.css           # CSS variables for light/dark themes, prose styles, animations
│   ├── layout.tsx            # Root layout — wraps app in ThemeProvider
│   └── page.tsx              # Main chat UI — messages, input, header, empty state
├── components/
│   ├── MarkdownRenderer.tsx  # Markdown parser + highlight.js + per-block copy buttons
│   ├── MessageBubble.tsx     # User & assistant message bubbles, typing indicator
│   └── ThemeProvider.tsx     # Theme context — toggles data-theme on <html>, persists to localStorage
├── .env.local.example
├── tailwind.config.ts
└── vercel.json
```

---

## How the AI Backend Works

The `/api/chat` route:
1. Receives the full message history from the client
2. Tries models in order: `gemma-3-12b` → `gemma-3-4b` → `nemotron` (skips on 429/400)
3. Streams the SSE response from OpenRouter directly back to the browser as plain text chunks
4. The frontend reads the stream and appends tokens to the message in real time

Gemma models don't support the `system` role, so the system prompt is prepended to the first user message automatically.

---

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add `OPENROUTER_API_KEY` in **Settings → Environment Variables**
4. Deploy

---

## License

MIT
