import { google } from 'googleapis';

// Gmail OAuth2 credentials
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_USER = process.env.GMAIL_USER;

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

function encodeMimeWord(text: string): string {
  // Encode non-ASCII characters in email headers using MIME encoded-word syntax
  if (/^[\x00-\x7F]*$/.test(text)) {
    return text; // All ASCII, no encoding needed
  }
  const encoded = Buffer.from(text, 'utf-8').toString('base64');
  return `=?UTF-8?B?${encoded}?=`;
}

function encodeEmail(to: string, subject: string, body: string): string {
  const encodedSubject = encodeMimeWord(subject);

  const email = [
    `To: ${to}`,
    `From: Clawd <${GMAIL_USER}>`,
    `Subject: ${encodedSubject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
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

    const subject = `Re: Your message to Clawd`;

    // replyContent should include greeting, body, and signature
    // We just add the original message quote at the end
    const body = [
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
