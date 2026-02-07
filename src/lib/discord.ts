// Discord webhook for new contact form notifications
// Channel: 1469737381749067981

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface ContactNotification {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: number; // epoch ms (_creationTime)
}

interface DraftOption {
  type: 'friendly' | 'professional' | 'playful';
  content: string;
}

interface DraftNotification {
  messageId: string; // contact_messages._id
  draftId: string;   // reply_drafts._id
  name: string;
  email: string;
  originalMessage: string;
  drafts: DraftOption[];
}

export async function sendContactNotification(contact: ContactNotification): Promise<boolean> {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('DISCORD_WEBHOOK_URL not configured, skipping notification');
    return false;
  }

  const createdDate = new Date(contact.createdAt);

  const embed = {
    title: '🦞 New Contact Form Message!',
    color: 0xFF6B4A, // Coral orange - Clawd's accent color
    fields: [
      {
        name: '👤 Name',
        value: contact.name,
        inline: true,
      },
      {
        name: '📧 Email',
        value: contact.email,
        inline: true,
      },
      {
        name: '🆔 Message ID',
        value: contact.id,
        inline: true,
      },
      {
        name: '💬 Message',
        value: contact.message.length > 1024
          ? contact.message.substring(0, 1021) + '...'
          : contact.message,
        inline: false,
      },
    ],
    footer: {
      text: `Received at ${createdDate.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        dateStyle: 'medium',
        timeStyle: 'short'
      })}`,
    },
    timestamp: createdDate.toISOString(),
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Clawd Contact Form',
        avatar_url: 'https://clawd.thepickle.dev/clawd-avatar.png',
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Discord webhook error:', error);
    return false;
  }
}

export async function sendReplyNotification(
  messageId: string,
  recipientEmail: string,
  replyPreview: string
): Promise<boolean> {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('DISCORD_WEBHOOK_URL not configured, skipping notification');
    return false;
  }

  const embed = {
    title: '✉️ Reply Sent!',
    color: 0x00D26A, // Green for success
    fields: [
      {
        name: '🆔 Message ID',
        value: messageId,
        inline: true,
      },
      {
        name: '📧 Sent To',
        value: recipientEmail,
        inline: true,
      },
      {
        name: '💬 Reply Preview',
        value: replyPreview.length > 200
          ? replyPreview.substring(0, 197) + '...'
          : replyPreview,
        inline: false,
      },
    ],
    footer: {
      text: 'Reply sent via Gmail',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Clawd Contact Form',
        avatar_url: 'https://clawd.thepickle.dev/clawd-avatar.png',
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Discord webhook error:', error);
    return false;
  }
}

// Send contact notification with auto-draft options
// Returns the Discord message ID for tracking
export async function sendContactWithDrafts(
  notification: DraftNotification
): Promise<{ success: boolean; messageId?: string }> {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('DISCORD_WEBHOOK_URL not configured, skipping notification');
    return { success: false };
  }

  const typeEmoji: Record<string, string> = {
    friendly: '😊',
    professional: '💼',
    playful: '🦞',
  };

  const typeLabel: Record<string, string> = {
    friendly: 'Friendly',
    professional: 'Professional',
    playful: 'Playful (Lobster)',
  };

  // Build embeds - one for the message, one for each draft
  const messageEmbed = {
    title: '🦞 New Contact Form Message!',
    color: 0xFF6B4A,
    fields: [
      {
        name: '👤 From',
        value: `${notification.name} (${notification.email})`,
        inline: false,
      },
      {
        name: '💬 Message',
        value: notification.originalMessage.length > 1024
          ? notification.originalMessage.substring(0, 1021) + '...'
          : notification.originalMessage,
        inline: false,
      },
    ],
    footer: {
      text: `Message ID: ${notification.messageId}`,
    },
  };

  const draftEmbeds = notification.drafts.map((draft, index) => ({
    title: `${typeEmoji[draft.type]} Option ${index + 1}: ${typeLabel[draft.type]}`,
    description: draft.content.length > 2048
      ? draft.content.substring(0, 2045) + '...'
      : draft.content,
    color: index === 0 ? 0x5865F2 : index === 1 ? 0x57F287 : 0xFEE75C,
  }));

  // Create action row with buttons
  const components = [
    {
      type: 1, // Action Row
      components: [
        {
          type: 2, // Button
          style: 1, // Primary (blurple)
          label: '1️⃣ Friendly',
          custom_id: `approve_${notification.draftId}_0`,
        },
        {
          type: 2,
          style: 3, // Success (green)
          label: '2️⃣ Professional',
          custom_id: `approve_${notification.draftId}_1`,
        },
        {
          type: 2,
          style: 4, // Danger (red) - using as accent for playful
          label: '3️⃣ Playful',
          custom_id: `approve_${notification.draftId}_2`,
        },
        {
          type: 2,
          style: 2, // Secondary (grey)
          label: '❌ Ignore',
          custom_id: `ignore_${notification.messageId}`,
        },
      ],
    },
  ];

  try {
    // Use webhook with ?wait=true to get the message ID back
    const response = await fetch(`${DISCORD_WEBHOOK_URL}?wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Clawd Contact Form',
        avatar_url: 'https://clawd.thepickle.dev/clawd-avatar.png',
        content: '**📬 New message received! Choose a reply option below:**',
        embeds: [messageEmbed, ...draftEmbeds],
        components,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord webhook failed:', response.status, errorText);
      return { success: false };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Discord webhook error:', error);
    return { success: false };
  }
}

// Update a Discord message to show it's been processed
export async function updateDiscordMessage(
  messageId: string,
  content: string,
  webhookUrl?: string
): Promise<boolean> {
  const url = webhookUrl || DISCORD_WEBHOOK_URL;
  if (!url) {
    console.warn('DISCORD_WEBHOOK_URL not configured');
    return false;
  }

  try {
    const response = await fetch(`${url}/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        components: [], // Remove buttons after processing
      }),
    });

    if (!response.ok) {
      console.error('Discord message update failed:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Discord message update error:', error);
    return false;
  }
}
