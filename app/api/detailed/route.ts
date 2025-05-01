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
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a detail expansion assistant. Take the provided summary and elaborate on it by adding relevant context, background, and details to make it richer and more informative. Keep the original facts intact and avoid speculation.",
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
        const expanded = openaiData.choices?.[0]?.message?.content || "No elaboration available.";

        return NextResponse.json({ summary: expanded });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error:", err.message);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
    }
}