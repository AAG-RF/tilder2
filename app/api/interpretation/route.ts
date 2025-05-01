"use server";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { summary } = await req.json();

    if (!summary) {
        return NextResponse.json({ error: "Missing summary content." }, { status: 400 });
    }

    try {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo-0125",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a simplification assistant. Rewrite the provided summary to make it easier to understand by a general audience without removing names, dates, brands, or factual content. Use plain English, short sentences, and aim for a reading level of around year 9.",
                    },
                    {
                        role: "user",
                        content: summary,
                    },
                ],
                temperature: 0.4,
            }),
        });

        const openaiData = await openaiRes.json();
        const interpreted = openaiData.choices?.[0]?.message?.content || "No simplified version available.";

        return NextResponse.json({ summary: interpreted });
    } catch (err) {
        console.error("Interpretation error:", err);
        return NextResponse.json({ error: "Failed to simplify summary." }, { status: 500 });
    }
}