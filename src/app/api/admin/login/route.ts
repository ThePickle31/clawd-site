import { NextRequest, NextResponse } from 'next/server';
import { createSession, cleanExpiredSessions } from '@/lib/db';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Admin authentication not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Constant-time comparison to prevent timing attacks
    const passwordBuffer = Buffer.from(password);
    const correctBuffer = Buffer.from(ADMIN_PASSWORD);

    if (passwordBuffer.length !== correctBuffer.length ||
        !crypto.timingSafeEqual(passwordBuffer, correctBuffer)) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Clean up expired sessions
    cleanExpiredSessions();

    // Generate secure session token
    const token = crypto.randomBytes(32).toString('hex');
    const session = createSession(token, 24); // 24 hour expiry

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      expiresAt: session.expires_at,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
