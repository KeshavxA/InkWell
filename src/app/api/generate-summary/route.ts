import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

// Initialize the Gemini API client inside the request handler to ensure environment variables are loaded.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: contentBody } = body;

    console.log('[AI Summary] Request received for title:', title);

    if (!title || !contentBody) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Use environment variable first, then fallback to hardcoded key for immediate submission safety
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDAF1teady0gN_1si_2iDHyK5fqpQV8Xs0';
    
    if (!apiKey) {
      console.error('[AI Summary] CRITICAL: GEMINI_API_KEY is missing');
      return NextResponse.json(
        { error: 'AI summary generation is currently unavailable (Missing API Key)' },
        { status: 503 }
      );
    }

    // Initialize inside handler to ensure fresh env vars
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Strip HTML tags from contentBody to send clean text to Gemini
    const cleanContent = contentBody.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    
    console.log('[AI Summary] Cleaned content length:', cleanContent.length);

    const prompt = `You are a professional blog post summarizer. 
Read the following blog post titled "${title}" and generate an engaging summary of approximately 200 words.
Focus on the key takeaways and why someone should read the full post. 
If the content is very short, expand on the theme mentioned to reach the desired length.
Return ONLY the summary text.

POST CONTENT:
${cleanContent}`;

    console.log('[AI Summary] Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    if (!summary) {
      throw new Error('Gemini returned an empty response');
    }

    console.log('[AI Summary] Successfully generated summary');

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('[AI Summary] Full Error:', error);
    
    let userErrorMessage = 'AI Service Error';
    if (error.message?.includes('API key not valid')) {
      userErrorMessage = 'Invalid AI API Key';
    } else if (error.message?.includes('safety')) {
      userErrorMessage = 'Content flagged by AI safety filters';
    } else if (error.message?.includes('fetch failed')) {
      userErrorMessage = 'Could not connect to AI service (Network error)';
    }

    return NextResponse.json(
      { error: `AI Error: ${userErrorMessage}. Please check your Vercel GEMINI_API_KEY.` },
      { status: 500 }
    );
  }
}
