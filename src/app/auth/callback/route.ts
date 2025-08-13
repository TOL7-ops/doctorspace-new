import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextParam = requestUrl.searchParams.get('next') || '/dashboard';
  const type = requestUrl.searchParams.get('type');
  const accessToken = requestUrl.searchParams.get('access_token');
  const refreshToken = requestUrl.searchParams.get('refresh_token');

  // Handle password reset flow - check for access_token first
  if (accessToken) {
    const resetUrl = new URL('/reset-password', requestUrl.origin);
    resetUrl.searchParams.set('access_token', accessToken);
    if (refreshToken) resetUrl.searchParams.set('refresh_token', refreshToken);
    return NextResponse.redirect(resetUrl);
  }

  // Handle password reset flow by type
  if (type === 'recovery') {
    const resetUrl = new URL('/reset-password', requestUrl.origin);
    return NextResponse.redirect(resetUrl);
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Sanitize next so only relative paths are allowed
  let nextPath = '/dashboard';
  try {
    const url = new URL(nextParam, requestUrl.origin);
    if (url.origin === requestUrl.origin) {
      nextPath = url.pathname + url.search + url.hash;
    }
  } catch (_) {
    nextPath = '/dashboard';
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
} 