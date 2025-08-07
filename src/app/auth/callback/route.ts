import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  const type = requestUrl.searchParams.get('type');
  const accessToken = requestUrl.searchParams.get('access_token');

  console.log('Auth callback - code:', code ? 'present' : 'missing');
  console.log('Auth callback - next:', next);
  console.log('Auth callback - type:', type);
  console.log('Auth callback - access_token:', accessToken ? 'present' : 'missing');

  // Handle password reset flow - check for access_token first
  if (accessToken) {
    console.log('Auth callback: Found access_token, redirecting to reset-password');
    const resetUrl = new URL('/reset-password', requestUrl.origin);
    resetUrl.searchParams.set('access_token', accessToken);
    return NextResponse.redirect(resetUrl);
  }

  // Handle password reset flow by type
  if (type === 'recovery') {
    console.log('Auth callback: Handling password recovery flow');
    // For password reset, redirect to reset-password
    const resetUrl = new URL('/reset-password', requestUrl.origin);
    console.log('Auth callback: Redirecting to reset-password');
    return NextResponse.redirect(resetUrl);
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, requestUrl.origin));
} 