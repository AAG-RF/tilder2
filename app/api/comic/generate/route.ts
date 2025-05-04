import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { script } = await req.json();

        if (!script || typeof script !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid comic script." },
                { status: 400 }
            );
        }

        const prompt = `
Create a clean, semi-realistic editorial cartoon with four distinct panels in a horizontal strip. Each panel visualizes a moment from the summary below, using consistent characters and color schemes.

Style: Consistent line art, semi-realistic but expressive, slightly exaggerated expressions for emphasis. Clean layout. Use labeled signs, props, and character expressions to communicate each caption clearly.

Narrative:
${script}

Instructions:
    - Arrange panels left to right.
    - Ensure character continuity (e.g. same couple throughout).
    - Use clean typography for captions.
    - Do not add speech bubbles unless specified.
    `;

        if (process.env.NODE_ENV !== "production") {
            console.log("Comic prompt preview:", prompt);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const result = await openai.images.generate({
            model: "gpt-image-1",
            prompt,
            size: "1536x1024",
            quality: "high",
            output_format: "jpeg", // ✅ allows compression
            output_compression: 70,
        });
        

        clearTimeout(timeout);

        const image_base64 = result.data?.[0]?.b64_json;
        if (!image_base64) {
            throw new Error("Image generation failed: Missing data in response.");
        }

        return NextResponse.json({ image: image_base64 });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Image Generation Error:", err.message);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json(
            { error: "Unexpected error during image generation." },
            { status: 500 }
        );
    }
}
