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

    // 3. ULTIMATE RESILIENT INSERT
    // We try to insert with the absolute minimum columns first
    const tryInsert = async (payload: any) => {
      return await supabaseAdmin.from('posts').insert(payload).select().single();
    };

    // Strategy 1: The 'inkwell_schema' (Simple)
    let { data, error } = await tryInsert({
      title,
      body: content,
      image_url: featured_image,
      summary: summary,
      author_id,
      created_at: new Date().toISOString()
    });

    // Strategy 2: If simple fails, try the 'schema' (Complex)
    if (error && (error.message.includes('column') || error.code === '42703')) {
      console.log('Strategy 1 failed, trying Strategy 2...');
      const result2 = await tryInsert({
        title,
        slug,
        content: content,
        cover_image: featured_image,
        excerpt: summary,
        author_id,
        status: 'published',
        published_at: new Date().toISOString()
      });
      data = result2.data;
      error = result2.error;
    }

    // Strategy 3: Absolute Bare Minimum (Emergency)
    if (error && (error.message.includes('column') || error.code === '42703')) {
      console.log('Strategy 2 failed, trying Strategy 3 (Bare Minimum)...');
      const result3 = await tryInsert({
        title,
        body: content,
        author_id
      });
      data = result3.data;
      error = result3.error;
    }

    if (error) {
      console.error('Final Database Error:', error);
      return NextResponse.json({ error: `Database Error: ${error.message}` }, { status: 500 });
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
