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
        username: `author_${author_id.slice(0, 5)}`,
        full_name: 'Author'
      });
    }

    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // 2. SMART INSERT: Try both schema versions
    let postData: any = {
      title,
      author_id,
      created_at: new Date().toISOString()
    };

    // Try Schema A (inkwell_schema.sql)
    const trySchemaA = async () => {
      return await supabaseAdmin.from('posts').insert({
        ...postData,
        body: content,
        image_url: featured_image,
        summary: summary,
      }).select().single();
    };

    // Try Schema B (schema.sql)
    const trySchemaB = async () => {
      return await supabaseAdmin.from('posts').insert({
        ...postData,
        slug,
        content: content,
        cover_image: featured_image,
        excerpt: summary,
        status: 'published',
        published_at: new Date().toISOString()
      }).select().single();
    };

    let { data, error } = await trySchemaA();

    // If Schema A fails with a "column not found" error, try Schema B
    if (error && (error.message.includes('column') || error.code === '42703')) {
      console.log('Schema A failed, trying Schema B...');
      const resultB = await trySchemaB();
      data = resultB.data;
      error = resultB.error;
    }

    if (error) {
      console.error('Final Supabase insertion error:', error);
      return NextResponse.json(
        { error: `Database Error: ${error.message}` },
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
