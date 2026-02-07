import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getAllMessages, getPendingMessages } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter');

    const messages = filter === 'pending'
      ? getPendingMessages()
      : getAllMessages();

    return NextResponse.json({
      success: true,
      messages,
      total: messages.length,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
