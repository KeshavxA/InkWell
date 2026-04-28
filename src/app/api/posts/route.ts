import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

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

    const supabaseAdmin = getSupabaseAdmin();

    // Insert the post into the database
    // 1. Ensure profile exists (Safety check for author_id FK)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', author_id)
      .single();

    if (!profile) {
      console.log('Profile missing for author, creating one...');
      await supabaseAdmin.from('profiles').insert({
        id: author_id,
        username: email ? email.split('@')[0] : `user_${author_id.slice(0, 5)}`,
        full_name: 'Author'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title,
        slug,
        excerpt: summary,
        content,
        cover_image: featured_image,
        author_id,
        status: 'published',
        published_at: new Date().toISOString()
      })
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
