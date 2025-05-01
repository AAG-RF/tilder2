"use server";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    const { content } = await req.json();

    if (!content || content.length < 125) {
        return NextResponse.json(
            { error: "Insufficient content for reasoning." },
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
                        "You are a critical-thinking assistant. Given a block of content, " +
                        "extract the core ideas, strip marketing fluff, and rewrite it for " +
                        "maximum clarity and insight (no summarising for brevity). " +
                        "Return a dense, coherent, refined rewrite.",
                },
                { role: "user", content },
            ],
            store: true,
        });

        const summary =
            completion.choices[0]?.message?.content?.trim() ||
            "No summary generated.";

        return NextResponse.json({ summary });
    } catch (err) {
        console.error("❌ Reasoning model failed:", err);
        return NextResponse.json(
            { error: "Failed to extract insights." },
            { status: 500 },
        );
    }
}