"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { analyzeReadability } from "@/lib/readability";

export default function Home() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [length, setLength] = useState<number | null>(null);
  const [interpretCount, setInterpretCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async (wordLimit: number) => {
    setLoading(true);
    setSummary("");
    setError("");
    setLength(wordLimit);
    setStatusMessage("Retrieving content from the page...");

    try {
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const scrapeData = await scrapeRes.json();

      if (!scrapeRes.ok) throw new Error(scrapeData.error || "Failed to retrieve content.");

      const rawContent = scrapeData.content;
      setContent(rawContent);
      setStatusMessage("Content retrieved. Summarizing now...");

      const summarizeRes = await fetch("/api/summarize-from-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: rawContent, length: wordLimit }),
      });

      const summaryData = await summarizeRes.json();

      if (!summarizeRes.ok) throw new Error(summaryData.error || "Failed to summarize content.");

      setSummary(summaryData.summary);
      setStatusMessage("");
      setInterpretCount(0);
      setCopied(false);
    } catch (err: any) {
      setError(err.message || "Unexpected error.");
      setStatusMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleInterpret = async () => {
    if (!summary) return;

    if (interpretCount >= 5) {
      setStatusMessage("🧱 We've hit semantic bedrock — this can't be simplified further without losing meaning.");
      return;
    }

    setLoading(true);
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
    } catch (err: any) {
      setError(err.message || "Failed to interpret summary.");
      setStatusMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setSummary("");
    setContent("");
    setError("");
    setStatusMessage("");
    setInterpretCount(0);
    setLength(null);
    setCopied(false);
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
    <main className="min-h-screen w-full bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-neutral-900 text-center px-6 py-12 flex flex-col items-center justify-center gap-12">
      <div className="w-full max-w-6xl space-y-6">
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
        <div className="flex gap-4">
          <Button onClick={() => handleSummarize(50)}>50 Words</Button>
          <Button onClick={() => handleSummarize(100)}>100 Words</Button>
          <Button onClick={() => handleSummarize(250)}>250 Words</Button>
          <Button onClick={() => handleSummarize(500)}>500 Words</Button>
        </div>
      </div>

      <div className="w-full max-w-5xl space-y-4">
        {statusMessage && <p className="text-blue-500 font-medium animate-pulse">{statusMessage}</p>}
        {error && <p className="text-red-500 font-mono">⚠️ {error}</p>}
        {summary && (
          <>
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
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" onClick={handleInterpret} disabled={interpretCount >= 5}>
                Less Detailed
              </Button>
              {length !== 500 && (
                <Button variant="outline" onClick={() => handleSummarize(500)}>
                  More Detailed
                </Button>
              )}
              <Button variant="outline" onClick={handleCopy}>
                {copied ? "✅ Copied" : "📋 Copy Summary"}
              </Button>
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
          </>
        )}
      </div>
    </main>
  );
}