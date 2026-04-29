import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

// Initialize the Gemini API client inside the request handler to ensure environment variables are loaded.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: contentBody } = body;

    if (!title || !contentBody) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API Key' }, { status: 503 });
    }

    // Strip HTML tags
    const cleanContent = contentBody.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

    const prompt = `You are a professional blog post summarizer. 
Read the following blog post titled "${title}" and generate an engaging summary of approximately 200 words.
POST CONTENT: ${cleanContent}`;

    const modelsToTry = [
      { version: 'v1beta', name: 'gemini-1.5-flash' },
      { version: 'v1', name: 'gemini-pro' },
      { version: 'v1beta', name: 'gemini-pro' },
      { version: 'v1', name: 'gemini-1.5-flash' }
    ];

    let summary = '';
    let lastError = '';

    for (const modelInfo of modelsToTry) {
      try {
        console.log(`[AI Summary] Trying ${modelInfo.name} on ${modelInfo.version}...`);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${modelInfo.version}/models/${modelInfo.name}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          summary = data.candidates[0].content.parts[0].text;
          console.log(`[AI Summary] Success with ${modelInfo.name}!`);
          break;
        } else {
          lastError = data.error?.message || 'Unknown API Error';
          console.warn(`[AI Summary] ${modelInfo.name} failed: ${lastError}`);
        }
      } catch (err: any) {
        lastError = err.message;
        console.error(`[AI Summary] ${modelInfo.name} connection failed: ${lastError}`);
      }
    }

    if (!summary) {
      throw new Error(`All models failed. Last error: ${lastError}`);
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('[AI Summary] Full Error:', error);
    return NextResponse.json(
      { 
        error: `AI Error: ${error.message}`,
        details: error.message 
      },
      { status: 500 }
    );
  }
}
