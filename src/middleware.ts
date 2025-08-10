import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Special handling for reset-password route - always allow access
    if (req.nextUrl.pathname.startsWith('/reset-password')) {
      console.log('Middleware: Allowing access to reset-password route')
      return res
    }

    // Refresh session if expired
    const { data: { user } } = await supabase.auth.getUser()

    // Handle auth state
    const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))
    const isAuthRoute = req.nextUrl.pathname.startsWith('/auth/')
    const isApiRoute = req.nextUrl.pathname.startsWith('/api/')

    // Allow public routes and API routes
    if (isPublicRoute || isAuthRoute || isApiRoute) {
      // If user is logged in and trying to access auth pages, redirect to dashboard
      if (user && isPublicRoute && req.nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return res
    }

    // Protected routes - redirect to login if not authenticated
    if (!user) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // User is authenticated, allow access to protected routes
    return res
  } catch {
    console.error('Middleware error occurred')
    // On error, allow the request to continue
    return res
  }
}

// Specify which routes this middleware should run for
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 