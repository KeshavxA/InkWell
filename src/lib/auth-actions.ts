'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function signUpAction(formData: { email: string; fullName: string; role: string; password: string }) {
  try {
    const supabase = await createServerClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          role: formData.role,
        }
      }
    })

    if (authError) {
      return { error: authError.message }
    }

    if (authData.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          role: formData.role
        })

      if (dbError) {
        console.error('DB Error:', dbError)
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error('SignUp Error:', err);
    return { error: err.message || 'Server connection failed' }
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
