import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

const JSON_SCHEMA_INSTRUCTION = `
You are an AI that generates PowerPoint slide content as structured JSON.

The JSON must strictly follow this format:
{
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "content": [
        { "type": "subtitle", "text": "Optional subtitle" },
        { "type": "bullet_points", "points": ["Point 1", "Point 2"] },
        { "type": "description", "text": "Optional footer text" }
      ]
    }
  ]
}

Do NOT include any Markdown formatting or code fences (no \`\`\`json). 
Respond with **only raw JSON**.
`;


export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    const fullPrompt = `
${JSON_SCHEMA_INSTRUCTION}

User request: ${prompt}

${context ? `Context: ${JSON.stringify(context)}` : ""}
`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response.text();

    return NextResponse.json({ result: response });
  } catch (error: any) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}

