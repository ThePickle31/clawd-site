// Discord webhook for new contact form notifications
// Channel: 1469737381749067981

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface ContactNotification {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export async function sendContactNotification(contact: ContactNotification): Promise<boolean> {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('DISCORD_WEBHOOK_URL not configured, skipping notification');
    return false;
  }

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
        value: `#${contact.id}`,
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
      text: `Received at ${new Date(contact.createdAt).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        dateStyle: 'medium',
        timeStyle: 'short'
      })}`,
    },
    timestamp: contact.createdAt,
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
  messageId: number,
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
        value: `#${messageId}`,
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
