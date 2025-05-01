# TiLDeR — Understand More by Reading Less

TiLDeR is a minimalist web app that lets you quickly summarize any article, report, or essay from the web using Firecrawl for scraping and OpenAI for summarization.

## ✨ Features

- 🧠 LLM-powered summaries in 100, 300, or 500 word formats
- 🔗 Paste any public URL to summarize its content
- ⚡ Built with Next.js App Router, Tailwind CSS, and ShadCN UI
- 🌐 Serverless API route for scraping and summarizing
- 🎨 Clean UI with responsive design and dark mode support

---

## 🧱 Tech Stack

- **Next.js 14 (App Router)**
- **Tailwind CSS + ShadCN UI**
- **TypeScript**
- **Firecrawl** for web scraping
- **OpenAI GPT-4** for summarization

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/tilder.git
cd tilder
npm install
```

# 2. Set up environment variables
Create a .env.local file and add:

```bash
FIRECRAWL_API_KEY=your_firecrawl_key
OPENAI_API_KEY=your_openai_key
```

# 3. Run the dev server

```bash
npm run dev
```

📁 Project Structure
```bash
/app
  /api/summarize     # Serverless API route
  /components/ui     # ShadCN components
  /lib               # (optional) utility functions
  layout.tsx         # App shell
  page.tsx           # Main UI
```
