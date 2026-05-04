import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prompt, mode } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'AI Service currently unavailable (Missing API Key)' }, { status: 503 });
    }

    let systemPrompt = '';
    if (mode === 'ideas') {
      systemPrompt = "You are a creative blog consultant. Generate 5 unique, viral blog post ideas based on the user's topic. For each idea, provide a catchy title and a 1-sentence hook.";
    } else if (mode === 'outline') {
      systemPrompt = "You are an expert content strategist. Create a detailed blog post outline for the following title. Include an introduction, 3-5 main sections with bullet points, and a conclusion.";
    } else if (mode === 'seo') {
      systemPrompt = "You are an SEO specialist. Analyze the following content/title and provide 5 high-traffic keywords, a meta description (under 160 chars), and 3 improved title variations.";
    }

    const fullPrompt = `${systemPrompt}\n\nUSER INPUT: ${prompt}`;

    // Use the same auto-discovery logic or a stable model
    const model = 'models/gemini-1.5-flash'; 
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API Error');
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
      throw new Error('No content generated');
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
