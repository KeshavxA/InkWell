import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Helper for auth validation
async function getUserAccess() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return { user: null, role: null };

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  return { user: session.user, role: userRecord?.role };
}

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const { user, role } = await getUserAccess();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Authorization check
    if (role !== 'admin' && post.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ post });
  } catch (error: unknown) {
    console.error('Error in GET /api/posts/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const { user, role } = await getUserAccess();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();
    // Validate ownership before update
    const { data: existingPost } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (role !== 'admin' && existingPost.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await req.json();

    // Prevent overriding sensitive author_id by malicious payload
    delete updates.author_id;

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ post: data });
  } catch (error: unknown) {
    console.error('Error in PATCH /api/posts/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const { user, role } = await getUserAccess();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();
    // Validate ownership before delete
    const { data: existingPost } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (role !== 'admin' && existingPost.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/posts/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
