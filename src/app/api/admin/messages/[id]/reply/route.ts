import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../../../convex/_generated/api';
import { Id } from '../../../../../../../convex/_generated/dataModel';
import { sendReply, isGmailConfigured } from '@/lib/gmail';
import { sendReplyNotification } from '@/lib/discord';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const convex = getConvexClient();
    const { id } = await params;

    const message = await convex.query(api.messages.getById, {
      id: id as Id<"contact_messages">,
    });

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
    await convex.mutation(api.messages.markReplied, {
      id: id as Id<"contact_messages">,
      reply_content: trimmedReply,
    });

    // Send Discord notification
    try {
      await sendReplyNotification(id, message.email, trimmedReply);
    } catch (e) {
      console.error('Discord reply notification failed:', e);
    }

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
