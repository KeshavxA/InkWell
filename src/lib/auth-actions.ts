'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function signUpAction(formData: { email: string; fullName: string; role: string; password: string }) {
  try {
    const supabase = await createServerClient()

    // We only need to sign up. The Supabase Trigger (on_auth_user_created) 
    // in your schema.sql will automatically create the profile.
    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          role: formData.role,
          username: formData.email.split('@')[0]
        }
      }
    })

    if (authError) {
      return { error: authError.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('SignUp Server Error:', err);
    return { error: `Connection Error: ${err.message || 'Check your Supabase URL'}` }
  }
}

export async function signInAction(formData: { email: string; password: string }) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('SignIn Error:', err);
    return { error: err.message || 'Server connection failed' }
  }
}
