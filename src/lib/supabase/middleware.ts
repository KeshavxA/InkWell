import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export const createClient = (req: NextRequest, res: NextResponse) => {
  return createMiddlewareClient({ req, res })
}
