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
    const { content, length } = await req.json();

    if (!content || !length) {
        return NextResponse.json({ error: "Missing content or length." }, { status: 400 });
    }

    try {
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
    } catch (err: any) {
        if (err.name === "AbortError") {
            console.error("❌ Request timed out");
            return NextResponse.json({ error: "Request timed out. Please try again." }, { status: 504 });
        }

        console.error("❌ Summarization error:", err);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
