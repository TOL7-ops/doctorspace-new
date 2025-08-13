import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/appointments',
  '/book-appointment',
  '/inbox',
  '/doctor'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { pathname } = req.nextUrl

  try {
    // Skip middleware for static files, API routes, and other public assets
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/robots.txt') ||
      pathname.startsWith('/sitemap.xml') ||
      pathname.startsWith('/public/')
    ) {
      return res
    }

    // Get user session
    const { data: { user } } = await supabase.auth.getUser()

    // Check if current path is protected
    const isProtectedPath = protectedRoutes.some(path => pathname.startsWith(path))

    // If authenticated and trying to access auth pages (login/signup), redirect to dashboard
    if (user && (pathname === '/login' || pathname === '/signup')) {
      const dashboardUrl = new URL('/dashboard', req.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // If NOT authenticated and trying to access a protected route, redirect to login
    if (!user && isProtectedPath) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Doctor-only routes enforcement (paths under /doctor)
    if (user && pathname.startsWith('/doctor')) {
      // Look up role from patients
      const { data: patient } = await supabase
        .from('patients')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = (patient as { role?: string } | null)?.role || null
      if (role !== 'doctor') {
        const dashboardUrl = new URL('/dashboard', req.url)
        return NextResponse.redirect(dashboardUrl)
      }
    }

    // Allow the request to continue for all other cases
    return res
  } catch (error) {
    console.error('Middleware error occurred:', error)
    // On error, allow the request to continue to prevent blocking
    return res
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
} 