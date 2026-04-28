import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// Admin service client is now initialized lazily within the handlers
// to prevent build-time environment variable errors.

// Helper to verify the caller is actually an admin
async function verifyAdmin() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return false;

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  return userRecord?.role === 'admin';
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'posts') {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select(`
          *,
          users:author_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ data });
    } else if (type === 'users') {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ data });
    } else if (type === 'comments') {
      // Just returning empty since comments table might not exist
      // Usually you'd join with posts and users
      const { data, error } = await supabaseAdmin
        .from('comments')
        .select(`
          *,
          users:author_id(full_name, email),
          posts:post_id(title)
        `)
        .order('created_at', { ascending: false });
        
      if (error && error.code === '42P01') {
        // Relation does not exist
        return NextResponse.json({ data: [] });
      }
      if (error) throw error;
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error: unknown) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id) {
       return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    if (type === 'posts') {
      const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } else if (type === 'comments') {
      const { error } = await supabaseAdmin.from('comments').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Delete Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
    
    // Attempt update on auth side if keeping auth metadata in sync is necessary
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Patch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
