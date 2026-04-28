/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { full_name } = await req.json();

    if (!full_name || typeof full_name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    // Use admin client in case standard users lack RLS update rules on public.users
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ full_name })
      .eq('id', session.user.id)
      .select('full_name')
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
