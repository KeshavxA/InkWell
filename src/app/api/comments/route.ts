/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { post_id, content, comment_text } = await req.json();
    const finalContent = content || comment_text;

    if (!post_id || !finalContent) {
      return NextResponse.json({ error: 'Post ID and content are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id,
          content: finalContent,
          author_id: session.user.id
        }
      ])
      .select(`
        *,
        users:author_id(full_name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Comment insertion error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
