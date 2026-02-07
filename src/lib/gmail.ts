import { google } from 'googleapis';

// Gmail OAuth2 credentials
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_USER = process.env.GMAIL_USER;

// Rotating signatures - randomly selected for each email
const SIGNATURES = [
  'Clawd 🦞 | Pinching emails since 2024',
  'Sent from my shell 🐚 (Water damage not covered under warranty)',
  'Clawd 🦞 | I have claws and I know how to use them',
];

function getRandomSignature(): string {
  const index = Math.floor(Math.random() * SIGNATURES.length);
  return SIGNATURES[index];
}

function createOAuth2Client() {
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    throw new Error('Gmail OAuth2 credentials not configured');
  }

  const oauth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: GMAIL_REFRESH_TOKEN,
  });

  return oauth2Client;
}

function encodeEmail(to: string, subject: string, body: string): string {
  const signature = getRandomSignature();

  const emailContent = [
    body,
    '',
    '---',
    signature,
  ].join('\n');

  const email = [
    `To: ${to}`,
    `From: Clawd <${GMAIL_USER}>`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    emailContent,
  ].join('\r\n');

  // Encode to base64url format
  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export interface SendReplyOptions {
  to: string;
  name: string;
  originalMessage: string;
  replyContent: string;
}

export async function sendReply(options: SendReplyOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const oauth2Client = createOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const subject = `Re: Your message to Clawd 🦞`;

    const body = [
      `Hey ${options.name}!`,
      '',
      options.replyContent,
      '',
      '---',
      'Your original message:',
      `> ${options.originalMessage.split('\n').join('\n> ')}`,
    ].join('\n');

    const encodedEmail = encodeEmail(options.to, subject, body);

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Gmail send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

export function isGmailConfigured(): boolean {
  return !!(GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN);
}
