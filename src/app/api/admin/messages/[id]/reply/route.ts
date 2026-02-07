import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getMessageById, markAsReplied } from '@/lib/db';
import { sendReply, isGmailConfigured } from '@/lib/gmail';
import { sendReplyNotification } from '@/lib/discord';

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

    const body = await request.json();
    const { replyContent } = body;

    if (!replyContent || typeof replyContent !== 'string' || replyContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reply content is required' },
        { status: 400 }
      );
    }

    const trimmedReply = replyContent.trim();

    // Check if Gmail is configured
    if (!isGmailConfigured()) {
      return NextResponse.json(
        { error: 'Gmail not configured. Cannot send replies.' },
        { status: 500 }
      );
    }

    // Send the email
    const emailResult = await sendReply({
      to: message.email,
      name: message.name,
      originalMessage: message.message,
      replyContent: trimmedReply,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    // Mark as replied in database
    markAsReplied(messageId, trimmedReply);

    // Send Discord notification (don't wait, don't fail)
    sendReplyNotification(messageId, message.email, trimmedReply).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
    });
  } catch (error) {
    console.error('Reply error:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}
