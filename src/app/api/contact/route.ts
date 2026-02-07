import { NextRequest, NextResponse } from 'next/server';
import { createMessage, checkRateLimit } from '@/lib/db';
import { sendContactNotification } from '@/lib/discord';

// Input sanitization
function sanitizeInput(input: string, maxLength: number = 5000): string {
  return input
    .trim()
    .slice(0, maxLength)
    // Remove potentially dangerous HTML/script tags
    .replace(/<[^>]*>/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ');
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getClientIP(request: NextRequest): string {
  // Try various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit (3 per IP per hour)
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          resetAt: rateLimit.resetAt.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
            'Retry-After': String(Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    const { name, email, message } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name, 100);
    const sanitizedEmail = sanitizeInput(email, 254);
    const sanitizedMessage = sanitizeInput(message, 5000);

    // Validate lengths after sanitization
    if (sanitizedName.length < 1) {
      return NextResponse.json(
        { error: 'Name is too short' },
        { status: 400 }
      );
    }

    if (sanitizedMessage.length < 10) {
      return NextResponse.json(
        { error: 'Message is too short (minimum 10 characters)' },
        { status: 400 }
      );
    }

    // Create message in database
    const contactMessage = createMessage(
      sanitizedName,
      sanitizedEmail,
      sanitizedMessage,
      clientIP
    );

    // Send Discord notification (don't wait for it, don't fail if it fails)
    sendContactNotification({
      id: contactMessage.id,
      name: sanitizedName,
      email: sanitizedEmail,
      message: sanitizedMessage,
      createdAt: contactMessage.created_at,
    }).catch(console.error);

    return NextResponse.json(
      {
        success: true,
        message: 'Message received! Clawd will get back to you soon. 🦞',
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// Health check / info endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/contact',
    method: 'POST',
    rateLimit: '3 requests per IP per hour',
    fields: {
      name: 'string (required, max 100 chars)',
      email: 'string (required, valid email)',
      message: 'string (required, min 10 chars, max 5000 chars)',
    },
  });
}
