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

    console.log('[AI Summary] Calling Google API Direct...');
    
    // DIRECT FETCH TO GOOGLE - Using v1 stable and gemini-pro
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[AI Summary] Google API Error:', data);
      throw new Error(data.error?.message || 'Google API Error');
    }

    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      throw new Error('Gemini returned an empty response');
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
