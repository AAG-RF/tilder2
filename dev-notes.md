# TiLDeR Project Architecture Notes

> A living snapshot of current system architecture, routes, features, and UI behavior — as of May 4, 2025.

---

## 🧠 Purpose
A minimalist, high-clarity AI summarization tool that:
- Scrapes article content from URLs
- Extracts dense insights using advanced reasoning
- Offers optional simplification ("TL;DR")
- Works without ads, distractions, or auth
- Deploys live via Vercel with custom domain

---

## 📦 Routes & API Logic

### `/api/scrape`
- Calls Firecrawl API
- Retrieves page content
- Extracts from `.content`, `.extractedText`, `.data.markdown`, etc.
- Handles timeouts and fallbacks

### `/api/reasoning`
- POSTs full article content to OpenAI Reasoning endpoint
- Uses `o4-mini` model
- Applies `reasoning_effort: "medium"`
- System prompt: "You are a critical-thinking assistant..."
- Returns core insight distillation (not summarization)

### `/api/interpretation`
- Accepts already-returned summary
- Uses `o4-mini` model
- Applies `reasoning_effort: "medium"`
- System prompt: "You are a simplification assistant..."
- Performs iterative semantic simplification
- Max 5 iterations per summary
- Returns simplified version each time ("TL;DR")

### `/api/comic`
- NEW route
- Uses `o4-mini` model
- Converts summarized content into structured 4-panel comic prompts
- Each panel includes visual metaphors and caption text
- System prompt: "You are a visual storytelling assistant..."

---

## 🖼️ Frontend (page.tsx)

- Dark/light theme toggle with `localStorage` persistence
- Responsive layout using TailwindCSS
- Status messages (e.g., "Retrieving content...", "Simplifying...")

### Key Buttons
- **"🔍 Tilder This"** → triggers scrape + reasoning
- **"🧠 TL;DR"** → triggers interpretation
- **"📋 Copy Summary"** → uses `navigator.clipboard`
- **"🔁 Tilder a New Article?"** → resets form when simplification limit is hit

### Integrated
- `@vercel/analytics/react` and `@vercel/speed-insights/next`
- `readability.ts` returns grade-level + word count
- OG image added: `/public/ogImage.png`

---

## 🔐 Domain & Hosting
- Hosted via Vercel
- Custom domain connected
- Error pages, redirects, and metadata in place
- Long-running API calls now support up to 30s timeout handling

---

## 🚧 Outstanding / In Progress
- [ ] Session history (local, no-auth)
- [ ] Comic image generation route via DALL·E-3
- [ ] Optional "Validate via Secondary Sources" prototype

---

> "Understand more by reading less." — TiLDeR
