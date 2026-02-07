import { NextRequest, NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../convex/_generated/api';

export async function requireAuth(
  request: NextRequest
): Promise<{ authenticated: true } | { authenticated: false; response: NextResponse }> {
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

  const convex = getConvexClient();
  const valid = await convex.query(api.sessions.validate, { token });

  if (!valid) {
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
