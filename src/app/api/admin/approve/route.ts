import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';
import { notifyClawdForReply } from '@/lib/discord';

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
    await convex.mutation(api.messages.markApproved, {
      id: messageId,
    });

    // Notify Discord with mention for Clawd to reply
    const discordResult = await notifyClawdForReply(
      messageId,
      message.name,
      message.email,
      message.message
    );

    if (!discordResult.success) {
      console.error('Failed to send Discord notification');
      // Don't fail the whole request - message is still approved
    }

    return NextResponse.json({
      success: true,
      message: 'Message approved and Clawd has been notified',
      discordNotified: discordResult.success,
    });
  } catch (error) {
    console.error('Approve message error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
