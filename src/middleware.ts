import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { pathname } = req.nextUrl

  try {
    // Skip middleware for static files and API routes
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/public/')
    ) {
      return res
    }

    // Special handling for reset-password route - always allow access
    if (pathname.startsWith('/reset-password')) {
      return res
    }

    // Get user session
    const { data: { user } } = await supabase.auth.getUser()

    // Check if current path is public
    const isPublicPath = publicRoutes.some(path => pathname.startsWith(path))

    // If authenticated and trying to access a public auth page → redirect to dashboard
    if (user && isPublicPath && pathname !== '/') {
      const dashboardUrl = new URL('/dashboard', req.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // If NOT authenticated and trying to access a protected route → redirect to login
    if (!user && !isPublicPath) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Allow the request to continue
    return res
  } catch (error) {
    console.error('Middleware error occurred:', error)
    // On error, allow the request to continue to prevent blocking
    return res
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 