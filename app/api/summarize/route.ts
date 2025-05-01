"use server";

import { NextRequest, NextResponse } from "next/server";

const TIMEOUT_MS = 15000;

async function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeout);
        return response;
    } catch (err) {
        clearTimeout(timeout);
        throw err;
    }
}

export async function POST(req: NextRequest) {
    const { url, length } = await req.json();

    if (!url || !length) {
        return NextResponse.json({ error: "Missing url or length" }, { status: 400 });
    }

    try {
        const firecrawlRes = await fetchWithTimeout("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
            },
            body: JSON.stringify({ url }),
        });

        const firecrawlData = await firecrawlRes.json();
        const content =
            firecrawlData?.content ||
            firecrawlData?.extractedText ||
            firecrawlData?.text ||
            firecrawlData?.rawText ||
            firecrawlData?.data?.markdown;

        if (!content || content.length < 100) {
            console.error("❌ Firecrawl empty or too short:", firecrawlData);
            return NextResponse.json({ error: "No content extracted from the page." }, { status: 500 });
        }

        const openaiRes = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4-0125-preview",
                messages: [
                    {
                        role: "system",
                        content: `You are a concise summarization assistant. Summarize the input into a maximum of ${length} words.`,
                    },
                    {
                        role: "user",
                        content,
                    },
                ],
                temperature: 0.7,
            }),
        });

        const openaiData = await openaiRes.json();
        const summary = openaiData.choices?.[0]?.message?.content || "No summary available.";

        return NextResponse.json({ summary });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error:", err.message);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        console.error("❌ Internal summarization error:", err);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
