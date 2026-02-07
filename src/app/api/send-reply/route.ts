import { NextRequest, NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';
import { sendReply } from '@/lib/gmail';
import { updateDiscordMessage } from '@/lib/discord';
import { Id } from '../../../../convex/_generated/dataModel';

// Simple API key auth for now
// TODO: Replace with proper auth later
const API_SECRET = process.env.SEND_REPLY_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageId, replyText } = body;

    if (!messageId || !replyText) {
      return NextResponse.json(
        { error: 'Missing messageId or replyText' },
        { status: 400 }
      );
    }

    const convex = getConvexClient();

    // Get the message
    const message = await convex.query(api.messages.getById, {
      id: messageId as Id<'contact_messages'>,
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (message.status !== 'approved') {
      return NextResponse.json(
        { error: 'Message must be approved before sending reply' },
        { status: 400 }
      );
    }

    // Send the email
    const emailResult = await sendReply({
      to: message.email,
      name: message.name,
      originalMessage: message.message,
      replyContent: replyText,
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
      reply_content: replyText,
    });

    // Update Discord message if we have the message ID
    if (message.discord_message_id) {
      const replyPreview = replyText.length > 300
        ? replyText.substring(0, 297) + '...'
        : replyText;

      await updateDiscordMessage(
        message.discord_message_id,
        `✅ **Clawd sent reply to ${message.email}!**\n\n**Preview:**\n${replyPreview}`
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
    });
  } catch (error) {
    console.error('Send reply error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
