# TiLDeR Project Architecture Notes

> A living snapshot of current system architecture, routes, features, and UI behavior — as of May 1, 2025.

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
- Handles timeouts

### `/api/reasoning`
- POSTs full article content to OpenAI Reasoning endpoint
- Uses `o4-mini` model
- Applies `reasoning_effort: "high"`
- Returns core insight distillation (not summarization)

### `/api/interpretation`
- Accepts already-returned summary
- Performs gradual semantic simplification
- Max 5 iterations per summary
- Returns simplified version each time ("TL;DR")

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

### Removed from UI
- Word count buttons (50/100/250/500)
- Extract Key Insights (merged into primary flow)

### Integrated
- `@vercel/analytics/react` and `@vercel/speed-insights/next`
- `readability.ts` returns grade-level + word count
- OG image added: `/public/ogImage.png`

---

## 🔐 Domain & Hosting
- Hosted via Vercel
- Custom domain connected (CNAME + A/AAAA if required)
- Error pages, redirects, and metadata in place

---

## 🚧 Outstanding / In Progress
- [ ] Session history (local, no-auth)
- [ ] Better progress indicator during slow responses (>15s)
- [ ] Retry logic or queued extraction
- [ ] Fallback or offline experience

---

## 🧾 Notes
- You’ve optimized for clarity, polish, and graceful degradation.
- The reasoning endpoint significantly outperforms summarization for depth.
- All simplification respects semantic boundaries.

---

> "Understand more by reading less." — TiLDeR
