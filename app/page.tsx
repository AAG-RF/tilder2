"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async (length: number) => {
    setLoading(true);
    setSummary("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, length }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setSummary("An error occurred while summarizing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-neutral-900 text-center px-6 py-12 flex flex-col items-center justify-center gap-12">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">TiLDeR</h1>
        <p className="text-xl text-muted-foreground italic">Understand more by reading less.</p>
        <p className="text-md text-muted-foreground">
          The internet moves fast. TiLDeR helps you keep up by summarizing articles, reports, and essays in seconds — distilled by powerful language models.
        </p>
      </div>

      <div className="max-w-xl w-full flex flex-col items-center gap-4">
        <Input
          placeholder="Paste a URL to summarize..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="flex gap-3">
          <Button onClick={() => handleSummarize(100)}>100 Words</Button>
          <Button onClick={() => handleSummarize(300)}>300 Words</Button>
          <Button onClick={() => handleSummarize(500)}>500 Words</Button>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        {loading && <p className="text-muted-foreground">Summarizing...</p>}
        {summary && (
          <Card>
            <CardContent className="p-6 whitespace-pre-wrap text-left">
              {summary}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
