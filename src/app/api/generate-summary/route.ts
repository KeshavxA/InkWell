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

    // 1. AUTO-DISCOVERY: Find what models this key can actually use
    console.log('[AI Summary] Auto-discovering available models...');
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    const listData = await listRes.json();
    
    if (!listData.models || listData.models.length === 0) {
      throw new Error('Your API Key has no models available. Please enable "Generative Language API" in Google Cloud.');
    }

    const availableModels = listData.models
      .filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
      .map((m: any) => m.name);

    console.log(`[AI Summary] Found ${availableModels.length} compatible models.`);

    let summary = '';
    let lastError = '';

    // 2. TRY EVERY DISCOVERED MODEL
    for (const modelPath of availableModels) {
      try {
        console.log(`[AI Summary] Trying ${modelPath}...`);
        // Use v1beta for widest compatibility
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`,
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
          console.log(`[AI Summary] Success with ${modelPath}!`);
          break;
        } else {
          lastError = data.error?.message || 'Unknown API Error';
          console.warn(`[AI Summary] ${modelPath} failed: ${lastError}`);
        }
      } catch (err: any) {
        lastError = err.message;
        console.error(`[AI Summary] ${modelPath} connection failed: ${lastError}`);
      }
    }

    if (!summary) {
      throw new Error(`All discovered models failed. Last error: ${lastError}`);
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
