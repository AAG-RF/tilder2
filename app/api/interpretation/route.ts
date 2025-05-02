"use server";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    const { summary } = await req.json();
    if (!summary || summary.length < 125) {
        return NextResponse.json(
            { error: "Insufficient content for simplification." },
            { status: 400 },
        );
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "o4-mini",
            reasoning_effort: "medium",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a simplification assistant. Rewrite the provided summary to make it easier to understand by a general audience without removing names, dates, brands, or factual content. Use plain English, short sentences, and aim for a reading level of around year 9. Attempt to reduce the total length of the content while preserving all meaningful context.",
                },
                {
                    role: "user",
                    content: summary,
                },
            ],
            store: false,
        });

        const interpreted = completion.choices?.[0]?.message?.content?.trim() || "No simplified version available.";

        return NextResponse.json({ summary: interpreted });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error:", err.message);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
    }
}