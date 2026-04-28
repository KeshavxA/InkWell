import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
// Assumes GEMINI_API_KEY is set in the environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    // TODO: Implement rate limiting here (e.g., using Upstash Redis or standard memory limits)
    // to prevent abuse of the API route.

    const body = await req.json();
    const { title, body: contentBody } = body;

    if (!title || !contentBody) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing');
      return NextResponse.json(
        { error: 'AI summary generation is currently unavailable' },
        { status: 503 }
      );
    }

    // COST OPTIMIZATION NOTES:
    // 1. Summary is generated ONCE at post creation.
    // 2. The result should be stored in the DB to avoid repeated API calls.
    // 3. Never regenerate unless explicitly requested by the user.

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a blog summarizer. Read the following blog post titled '${title}' 
and generate a concise, engaging summary of approximately 200 words that 
captures the main points. Return only the summary text, nothing else.

Blog content: ${contentBody}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
