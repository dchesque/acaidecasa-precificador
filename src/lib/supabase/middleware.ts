import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PREFIXES = ['/auth/']

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // No backend configured: skip auth gating and let the app run in mock mode.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request: { headers: request.headers } })
  }

  const response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createMiddlewareClient({ req: request, res: response })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))

  if (!session && !isPublic) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (session && pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}