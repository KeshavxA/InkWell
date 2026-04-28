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

    // 1. Ensure user record exists in public.users (Safety check for author_id FK)
    const { data: publicUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', author_id)
      .single();

    if (!publicUser) {
      console.log('User record missing in public.users, creating one...');
      await supabaseAdmin.from('users').insert({
        id: author_id,
        name: 'Author'
      });
    }

    // 2. Generate slug and timestamp
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // 3. SUPER-INSERT: Populate ALL possible column names to ensure success
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title,
        author_id,
        // Content variations
        body: content,
        content: content,
        // Image variations
        image_url: featured_image,
        cover_image: featured_image,
        // Summary variations
        summary: summary,
        excerpt: summary,
        // Other fields
        slug: slug,
        status: 'published',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Final Supabase insertion error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
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
