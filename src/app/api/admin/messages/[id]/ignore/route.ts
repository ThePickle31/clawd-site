import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getMessageById, markAsIgnored } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const messageId = parseInt(id, 10);

    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    const message = getMessageById(messageId);

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (message.status !== 'pending') {
      return NextResponse.json(
        { error: `Message already ${message.status}` },
        { status: 400 }
      );
    }

    // Mark as ignored in database
    markAsIgnored(messageId);

    return NextResponse.json({
      success: true,
      message: 'Message ignored',
    });
  } catch (error) {
    console.error('Ignore error:', error);
    return NextResponse.json(
      { error: 'Failed to ignore message' },
      { status: 500 }
    );
  }
}
