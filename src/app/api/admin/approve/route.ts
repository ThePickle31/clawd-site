import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';

export async function POST(request: NextRequest) {
  // Validate admin authentication
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const { messageId } = body;

    if (!messageId || typeof messageId !== 'string') {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const convex = getConvexClient();

    // Get the message from Convex
    const message = await convex.query(api.messages.getById, { id: messageId });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (message.status !== 'pending') {
      return NextResponse.json(
        { error: 'Message has already been processed' },
        { status: 400 }
      );
    }

    // Mark message as "approved" in Convex
    // Clawd will pick this up during heartbeat polling
    await convex.mutation(api.messages.markApproved, {
      id: messageId,
    });

    return NextResponse.json({
      success: true,
      message: 'Message approved - Clawd will reply shortly',
    });
  } catch (error) {
    console.error('Approve message error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
