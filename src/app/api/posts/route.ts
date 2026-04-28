import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin privileges
// Required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, featured_image, content, summary, author_id } = body;

    // Validate required fields
    if (!title || !content || !author_id) {
      return NextResponse.json(
        { error: 'Title, content, and author_id are required' },
        { status: 400 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
       console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
       return NextResponse.json(
         { error: 'Database access is currently unavailable' },
         { status: 503 }
       );
    }

    // Insert the post into the database
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert([
        {
          title,
          featured_image,
          content,
          summary,
          author_id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insertion error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error) {
    console.error('Error in /api/posts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
