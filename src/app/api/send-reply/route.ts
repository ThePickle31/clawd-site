import { NextRequest, NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';
import { sendReply } from '@/lib/gmail';
import { sendReplyNotification } from '@/lib/discord';
import { Id } from '../../../../convex/_generated/dataModel';

const SEND_REPLY_SECRET = process.env.SEND_REPLY_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify secret
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !SEND_REPLY_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const providedSecret = authHeader.replace('Bearer ', '');
    if (providedSecret !== SEND_REPLY_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, replyContent } = body;

    if (!messageId || typeof messageId !== 'string') {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      );
    }

    if (!replyContent || typeof replyContent !== 'string') {
      return NextResponse.json(
        { error: 'replyContent is required' },
        { status: 400 }
      );
    }

    const convex = getConvexClient();

    // Get the original message
    const message = await convex.query(api.messages.getById, {
      id: messageId as Id<'contact_messages'>,
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (message.status === 'replied') {
      return NextResponse.json(
        { error: 'Message has already been replied to' },
        { status: 400 }
      );
    }

    // Send the email
    const emailResult = await sendReply({
      to: message.email,
      name: message.name,
      originalMessage: message.message,
      replyContent,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    // Mark message as replied
    await convex.mutation(api.messages.markReplied, {
      id: messageId as Id<'contact_messages'>,
      reply_content: replyContent,
    });

    // Send confirmation notification to Discord
    await sendReplyNotification(
      messageId,
      message.email,
      replyContent
    );

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      to: message.email,
    });
  } catch (error) {
    console.error('Send reply error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Info endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/send-reply',
    method: 'POST',
    auth: 'Bearer token required (SEND_REPLY_SECRET)',
    body: {
      messageId: 'string (Convex message ID)',
      replyContent: 'string (your reply text)',
    },
    example: {
      messageId: 'abc123...',
      replyContent: 'Hey! Thanks for reaching out...',
    },
  });
}
