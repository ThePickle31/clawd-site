import { NextRequest, NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';
import { sendReply } from '@/lib/gmail';
import { sendReplyNotification, updateDiscordMessage } from '@/lib/discord';
import { Id } from '../../../../convex/_generated/dataModel';
import nacl from 'tweetnacl';

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

// Verify Discord signature
function verifyDiscordSignature(
  signature: string,
  timestamp: string,
  body: string
): boolean {
  if (!DISCORD_PUBLIC_KEY) {
    console.error('DISCORD_PUBLIC_KEY not configured');
    return false;
  }

  try {
    const message = Buffer.from(timestamp + body);
    const signatureBytes = Buffer.from(signature, 'hex');
    const publicKeyBytes = Buffer.from(DISCORD_PUBLIC_KEY, 'hex');

    return nacl.sign.detached.verify(message, signatureBytes, publicKeyBytes);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();

  // Verify signature
  if (!signature || !timestamp) {
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 });
  }

  if (!verifyDiscordSignature(signature, timestamp, body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);

  // Handle Discord ping (verification)
  if (payload.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // Handle component interactions (buttons)
  if (payload.type === 2) {
    // Message component interaction
    return handleButtonInteraction(payload);
  }

  // Handle button clicks (type 3 is also MESSAGE_COMPONENT)
  if (payload.type === 3) {
    return handleButtonInteraction(payload);
  }

  return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 });
}

async function handleButtonInteraction(payload: {
  data: { custom_id: string };
  message: { id: string };
  token: string;
  channel_id: string;
}) {
  const customId = payload.data.custom_id;
  const discordMessageId = payload.message.id;
  const interactionToken = payload.token;

  // Acknowledge the interaction immediately (defer the response)
  // This gives us 15 minutes to respond
  await respondToInteraction(payload, {
    type: 5, // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE - shows "thinking..."
    data: { flags: 64 }, // Ephemeral
  });

  try {
    // Parse the custom_id to determine action
    if (customId.startsWith('approve_')) {
      const parts = customId.split('_');
      const draftId = parts[1] as Id<'reply_drafts'>;
      const selectedIndex = parseInt(parts[2], 10);

      await processApproval(draftId, selectedIndex, discordMessageId, interactionToken);
    } else if (customId.startsWith('ignore_')) {
      const messageId = customId.split('_')[1] as Id<'contact_messages'>;
      await processIgnore(messageId, discordMessageId, interactionToken);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Button interaction error:', error);
    await followUpInteraction(interactionToken, {
      content: `❌ Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      flags: 64,
    });
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function processApproval(
  draftId: Id<'reply_drafts'>,
  selectedIndex: number,
  discordMessageId: string,
  interactionToken: string
) {
  const convex = getConvexClient();

  // Get the draft
  const draft = await convex.query(api.drafts.getById, { id: draftId });
  if (!draft) {
    throw new Error('Draft not found');
  }

  if (draft.status !== 'pending') {
    await followUpInteraction(interactionToken, {
      content: '⚠️ This draft has already been processed.',
      flags: 64,
    });
    return;
  }

  // Get the original message
  const message = await convex.query(api.messages.getById, { id: draft.message_id });
  if (!message) {
    throw new Error('Original message not found');
  }

  // Get the selected draft content
  const selectedDraft = draft.drafts[selectedIndex];
  if (!selectedDraft) {
    throw new Error('Invalid draft selection');
  }

  // Approve the draft in database
  await convex.mutation(api.drafts.approve, {
    id: draftId,
    selected_draft: selectedIndex,
  });

  // Send the email
  const emailResult = await sendReply({
    to: message.email,
    name: message.name,
    originalMessage: message.message,
    replyContent: selectedDraft.content,
  });

  if (!emailResult.success) {
    await convex.mutation(api.drafts.markFailed, { id: draftId });
    await followUpInteraction(interactionToken, {
      content: `❌ Failed to send email: ${emailResult.error}`,
      flags: 64,
    });
    return;
  }

  // Mark draft as sent and message as replied
  await convex.mutation(api.drafts.markSent, { id: draftId });
  await convex.mutation(api.messages.markReplied, {
    id: draft.message_id,
    reply_content: selectedDraft.content,
  });

  // Update Discord message to show it's processed
  await updateDiscordMessage(
    discordMessageId,
    `✅ **Reply sent!** (${selectedDraft.type} option selected)`
  );

  // Send confirmation notification
  await sendReplyNotification(
    String(draft.message_id),
    message.email,
    selectedDraft.content
  );

  // Send ephemeral confirmation
  await followUpInteraction(interactionToken, {
    content: `✅ Reply sent successfully using the **${selectedDraft.type}** option!`,
    flags: 64,
  });
}

async function processIgnore(
  messageId: Id<'contact_messages'>,
  discordMessageId: string,
  interactionToken: string
) {
  const convex = getConvexClient();

  // Get the message
  const message = await convex.query(api.messages.getById, { id: messageId });
  if (!message) {
    throw new Error('Message not found');
  }

  if (message.status !== 'pending') {
    await followUpInteraction(interactionToken, {
      content: '⚠️ This message has already been processed.',
      flags: 64,
    });
    return;
  }

  // Mark as ignored
  await convex.mutation(api.messages.markIgnored, { id: messageId });

  // Update Discord message
  await updateDiscordMessage(
    discordMessageId,
    `🚫 **Message ignored** from ${message.name}`
  );

  await followUpInteraction(interactionToken, {
    content: '🚫 Message marked as ignored.',
    flags: 64,
  });
}

// Helper to respond to the initial interaction
async function respondToInteraction(
  payload: { token: string },
  response: { type: number; data?: Record<string, unknown> }
) {
  const appId = process.env.DISCORD_APP_ID;
  if (!appId) {
    console.error('DISCORD_APP_ID not configured');
    return;
  }

  try {
    await fetch(
      `https://discord.com/api/v10/interactions/${payload.token}/callback`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      }
    );
  } catch (error) {
    console.error('Failed to respond to interaction:', error);
  }
}

// Helper to send follow-up message
async function followUpInteraction(
  token: string,
  message: { content: string; flags?: number }
) {
  const appId = process.env.DISCORD_APP_ID;
  if (!appId) {
    console.error('DISCORD_APP_ID not configured');
    return;
  }

  try {
    await fetch(
      `https://discord.com/api/v10/webhooks/${appId}/${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      }
    );
  } catch (error) {
    console.error('Failed to send follow-up:', error);
  }
}
