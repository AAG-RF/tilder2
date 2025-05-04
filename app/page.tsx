"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { analyzeReadability } from "@/lib/readability";

export default function Home() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [interpretCount, setInterpretCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState("light");
  const [comicImage, setComicImage] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("tilder-theme");
    const match = window.matchMedia("(prefers-color-scheme: dark)");
    const preferred = stored || (match.matches ? "dark" : "light");
    document.documentElement.classList.toggle("dark", preferred === "dark");
    setTheme(preferred);

    const listener = (e: MediaQueryListEvent) => {
      if (!stored) {
        const newTheme = e.matches ? "dark" : "light";
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        setTheme(newTheme);
      }
    };
    match.addEventListener("change", listener);
    return () => match.removeEventListener("change", listener);
  }, []);

  const handleSummarize = async () => {
    setSummary("");
    setError("");
    setComicImage(null);
    setStatusMessage("Retrieving content from the page...");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const scrapeData = await scrapeRes.json();
      if (!scrapeRes.ok) throw new Error(scrapeData.error || "Failed to retrieve content.");
      const rawContent = scrapeData.content;
      setStatusMessage("Content retrieved. Extracting key insights...");

      const reasoningRes = await fetch("/api/reasoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: rawContent }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const reasoningData = await reasoningRes.json();
      if (!reasoningRes.ok) throw new Error(reasoningData.error || "Reasoning failed.");

      setSummary(reasoningData.summary);
      setStatusMessage("");
      setInterpretCount(0);
      setCopied(false);
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("⏱ This article took too long to analyze. Try a shorter page until this can be improved.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error.");
      }
      setStatusMessage("");
    }
  };

  const handleInterpret = async () => {
    if (!summary) return;
    if (interpretCount >= 5) {
      setStatusMessage("🧱 We've hit semantic bedrock — this can't be simplified further without losing meaning.");
      return;
    }
    setError("");
    setStatusMessage("Simplifying further...");
    try {
      const res = await fetch("/api/interpretation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Interpretation failed.");

      setSummary(data.summary);
      setInterpretCount(prev => prev + 1);
      setStatusMessage("");
      setCopied(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to interpret summary.");
      }
      setStatusMessage("");
    }
  };

  const handleVisualizeComic = async () => {
    if (!summary || interpretCount < 3) return;
    setStatusMessage("Interpreting content...");
    setError("");
    try {
      const scriptRes = await fetch("/api/comic/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      const scriptData = await scriptRes.json();
      if (!scriptRes.ok) throw new Error(scriptData.error || "Comic script generation failed.");

      setStatusMessage("Generating comic visuals...");
      const imageRes = await fetch("/api/comic/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: scriptData.script }),
      });
      const imageData = await imageRes.json();
      if (!imageRes.ok) throw new Error(imageData.error || "Image generation failed.");

      setComicImage(`data:image/png;base64,${imageData.image}`);
      setStatusMessage("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to generate comic.");
      }
      setStatusMessage("");
    }
  };

  const handleReset = () => {
    setUrl("");
    setSummary("");
    setError("");
    setStatusMessage("");
    setInterpretCount(0);
    setCopied(false);
    setComicImage(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy to clipboard.");
    }
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground transition-colors px-6 py-12 flex flex-col items-center justify-center gap-12 relative">
      <Button
        variant="ghost"
        className="absolute top-6 right-6"
        onClick={() => {
          const newTheme = theme === "dark" ? "light" : "dark";
          document.documentElement.classList.toggle("dark", newTheme === "dark");
          setTheme(newTheme);
          localStorage.setItem("tilder-theme", newTheme);
        }}
      >
        {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </Button>

      <div className="w-full max-w-6xl space-y-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">TiLDeR</h1>
        <p className="text-xl text-muted-foreground italic">Understand more by reading less.</p>
        <p className="text-md text-muted-foreground">
          The internet moves fast. TiLDeR helps you keep up by summarizing articles, reports, and essays in seconds — distilled by powerful language models.
        </p>
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center gap-5">
        <Input
          placeholder="Paste a URL to summarize..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={handleSummarize}>🔍 Tilder This</Button>
        </div>
      </div>

      <div className="w-full max-w-5xl space-y-4">
        {statusMessage && <p className="text-blue-500 font-medium animate-pulse text-center">{statusMessage}</p>}
        {error && <p className="text-red-500 font-mono text-center">⚠️ {error}</p>}
        {comicImage && (
          <div className="flex flex-col items-center gap-4">
            <img src={comicImage} alt="Comic Strip" className="rounded shadow-lg max-w-full" />
            <a href={comicImage} download="tilder_comic.png">
              <Button variant="outline">📥 Download Comic</Button>
            </a>
          </div>
        )}
        {summary && (
          <>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="default" onClick={handleInterpret} disabled={interpretCount >= 5 || comicImage !== null}>
                🧠 TL;DR
              </Button>
              <Button variant="outline" onClick={handleCopy}>
                {copied ? "✅ Copied" : "📋 Copy Summary"}
              </Button>
              {interpretCount >= 3 && !comicImage && (
                <Button variant="outline" onClick={handleVisualizeComic}>
                  🖼️ Visualise as Comic
                </Button>
              )}
              {interpretCount >= 5 && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="animate-bounce text-primary font-semibold"
                >
                  🔁 Tilder a New Article?
                </Button>
              )}
            </div>
            <Card>
              <CardContent className="p-6 whitespace-pre-wrap text-left text-lg">
                {summary}
              </CardContent>
            </Card>
            <div className="text-sm text-muted-foreground text-center">
              {(() => {
                const { grade, words } = analyzeReadability(summary);
                const clarity =
                  grade <= 7
                    ? "Very easy to read"
                    : grade <= 9
                      ? "Clear and accessible"
                      : grade <= 12
                        ? "Moderate complexity"
                        : "Advanced reading level";
                return `🧠 Clarity: ${clarity} (${words} words)`;
              })()}
            </div>
          </>
        )}
      </div>
      <Analytics />
      <SpeedInsights />
    </main>
  );
}
