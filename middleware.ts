import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // `updateSession` itself decides whether to gate or pass through based on
  // both the path and whether Supabase is configured. Centralizing that logic
  // here lets the middleware redirect already-authenticated users away from
  // `/auth/login` and unauthenticated users to it.
  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}