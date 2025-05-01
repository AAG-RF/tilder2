"use server";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { url, length } = await req.json();

    if (!url || !length) {
        return NextResponse.json({ error: "Missing url or length" }, { status: 400 });
    }

    try {
        const firecrawlRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
            },
            body: JSON.stringify({ url }),
        });

        const firecrawlData = await firecrawlRes.json();
        const content = firecrawlData?.content;

        if (!content) {
            return NextResponse.json({ error: "No content extracted." }, { status: 500 });
        }

        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4",
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
                temperature: 0.3,
            }),
        });

        const openaiData = await openaiRes.json();
        const summary = openaiData.choices?.[0]?.message?.content || "No summary available.";

        return NextResponse.json({ summary });
    } catch (err) {
        console.error("Summarization error:", err);
        return NextResponse.json({ error: "Internal error." }, { status: 500 });
    }
}