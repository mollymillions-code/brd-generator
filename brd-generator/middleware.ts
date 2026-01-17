import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedPaths = [
    '/projects',
    '/dashboard',
    '/settings',
    '/api/projects',
    '/api/documents',
    '/api/chat',
    '/api/generate-brd',
  ]

  // Auth routes that should redirect to projects if already logged in
  const authPaths = ['/auth/login', '/auth/signup']

  const path = req.nextUrl.pathname

  // Check if the current path is protected
  const isProtectedPath = path === '/' || protectedPaths.some((protectedPath) =>
    path.startsWith(protectedPath)
  )

  // Check if the current path is an auth page
  const isAuthPath = authPaths.some((authPath) => path.startsWith(authPath))

  // Redirect to login if accessing protected route without session
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to projects if accessing auth pages with active session
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/projects', req.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
