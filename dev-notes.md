# TiLDeR Project Architecture Notes

> A living snapshot of current system architecture, routes, features, and UI behavior — as of May 4, 2025.

---

## 🧠 Purpose
A minimalist, high-clarity AI summarization tool that:
- Scrapes article content from URLs
- Extracts dense insights using advanced reasoning
- Offers optional simplification ("TL;DR")
- Visualizes summaries as comic strips for better engagement
- Works without ads, distractions, or auth
- Deploys live via Vercel with custom domain

---

## 📦 Routes & API Logic

### `/api/scrape`
- Calls Firecrawl API
- Retrieves page content
- Extracts from `.content`, `.extractedText`, `.data.markdown`, etc.
- Handles timeouts

### `/api/reasoning`
- POSTs full article content to OpenAI Reasoning endpoint
- Uses `o4-mini` model
- Applies `reasoning_effort: "high"`
- Returns core insight distillation (not summarization)

### `/api/interpretation`
- Accepts already-returned summary
- Uses `o4-mini` model
- Applies `reasoning_effort: "high"`
- Performs gradual semantic simplification
- Max 5 iterations per summary
- Returns simplified version each time ("TL;DR")

### `/api/comic/interpret`
- Accepts a cleaned-up summary
- Uses `o4-mini` with visual storytelling system prompt
- Returns a four-panel comic-style visual script, one panel per core insight

### `/api/comic/generate`
- Accepts `script` from comic/interpret
- Calls `gpt-image-1` model to generate a horizontal strip comic
- Uses clean, editorial cartoon prompt
- Returns base64-encoded PNG image

---

## 🖼️ Frontend (page.tsx)

- Dark/light theme toggle with `localStorage` persistence
- Responsive layout using TailwindCSS
- Status messages (e.g., "Retrieving content...", "Simplifying...", "Generating comic visuals...")

### Key Buttons
- **"🔍 Tilder This"** → triggers scrape + reasoning
- **"🧠 TL;DR"** → triggers semantic interpretation (disabled after 5 calls)
- **"📋 Copy Summary"** → uses `navigator.clipboard`
- **"🖼️ Visualise as Comic"** → triggers `/comic/interpret` then `/comic/generate` (unlocked after 3 TL;DR calls)
- **"🔁 Tilder a New Article?"** → resets form

### Comic Output
- Displayed above summary card
- Includes download link for image

### Integrated
- `@vercel/analytics/react` and `@vercel/speed-insights/next`
- `readability.ts` returns grade-level + word count
- OG image added: `/public/ogImage.png`

---

## 🔐 Domain & Hosting
- Hosted via Vercel
- Preview deployments via `dev` branch
- `main` branch serves production
- `.vercel.json` in use to extend function timeout on image generation routes

---

## 🚧 Outstanding / In Progress
- [ ] Session history (local, no-auth)
- [ ] Add "Flavor Summaries" (e.g. Gen Z, Boomer, Jeff Bezos mode)
- [ ] Async job queue for image generation (to avoid timeout)
- [ ] Toast message for async return when available

---

> "Understand more by reading less." — TiLDeR
