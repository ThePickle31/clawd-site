import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/db';

export function requireAuth(
  request: NextRequest
): { authenticated: true } | { authenticated: false; response: NextResponse } {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (!validateSession(token)) {
    const response = NextResponse.json(
      { error: 'Session expired or invalid' },
      { status: 401 }
    );
    // Clear invalid cookie
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    return { authenticated: false, response };
  }

  return { authenticated: true };
}
