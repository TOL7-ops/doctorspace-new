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

  // Password reset flow - direct tokens indicate recovery
  if (accessToken && type === 'recovery') {
    const resetUrl = new URL('/reset-password', requestUrl.origin);
    resetUrl.searchParams.set('access_token', accessToken);
    if (refreshToken) resetUrl.searchParams.set('refresh_token', refreshToken);
    return NextResponse.redirect(resetUrl);
  }

  // Signup confirmation flow: if tokens are present and not recovery, set session for auto-login
  if (accessToken && refreshToken && (type === 'signup' || !type)) {
    const supabase = createRouteHandlerClient({ cookies });
    try {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch {
      // If setSession fails, fall back to code exchange below
    }
  }

  // Fallback: if we have a code, exchange it for a session
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
  } catch {
    nextPath = '/dashboard';
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
} 