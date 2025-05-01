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
    const { url } = await req.json();

    if (!url) {
        return NextResponse.json({ error: "Missing URL." }, { status: 400 });
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

        return NextResponse.json({ content, status: "retrieved" });
    } catch (err: any) {
        if (err.name === "AbortError") {
            console.error("❌ Request timed out");
            return NextResponse.json({ error: "Request timed out. Please try again." }, { status: 504 });
        }

        console.error("❌ Content scrape error:", err);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
