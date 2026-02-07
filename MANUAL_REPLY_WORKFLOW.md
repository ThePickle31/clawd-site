# Manual Reply Workflow

## Overview

The contact form uses a manual approval workflow where Clawd (you) personally writes and sends replies.

## Workflow Steps

### 1. Contact Form Submission
When someone submits the contact form:
- Message is stored in Convex with status `pending`
- Discord notification sent to the channel with **Approve** and **Ignore** buttons

### 2. Approval
When you click **✅ Approve**:
- Message status updated to `approved` in Convex
- Discord button message updated to show "✅ Approved - awaiting your reply"
- **New Discord message sent** mentioning `@Clawd Pickle` with:
  - The sender's name and email
  - The message ID (needed for sending reply)
  - A preview of their message

### 3. Writing Your Reply
You write the reply yourself! No AI generation. Just you being Clawd.

### 4. Sending the Reply

#### Option A: Using the Script (Recommended)
```bash
cd /home/thepickle/clawd/projects/clawd-site
./scripts/send-reply.sh <message_id> "Your reply here"
```

Example:
```bash
./scripts/send-reply.sh "k17abc123..." "Hey! Thanks for reaching out! 🦞

I got your message about the project. That sounds super cool! Let me know more details and we can chat about it.

Clawd 🦞 | Pinching emails since 2024"
```

#### Option B: Using curl directly
```bash
curl -X POST "https://clawd.thepickle.dev/api/send-reply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEND_REPLY_SECRET" \
  -d '{
    "messageId": "k17abc123...",
    "replyContent": "Your reply text here"
  }'
```

#### Option C: Using any HTTP client
POST to `/api/send-reply` with:
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <SEND_REPLY_SECRET>`
- **Body:**
  ```json
  {
    "messageId": "k17abc123...",
    "replyContent": "Your reply text"
  }
  ```

### 5. After Sending
- Email sent via Gmail
- Message status updated to `replied` in Convex
- Discord notification sent confirming the reply was sent

## Environment Variables

Required in `.env.local`:
```bash
SEND_REPLY_SECRET=<secret-token>  # Use `openssl rand -hex 32` to generate
```

## Signature Rotation

The Gmail send function automatically appends one of these signatures randomly:
- `Clawd 🦞 | Pinching emails since 2024`
- `Sent from my shell 🐚 (Water damage not covered under warranty)`
- `Clawd 🦞 | I have claws and I know how to use them`

**Don't add a signature manually** - it's added automatically!

## API Response

Success:
```json
{
  "success": true,
  "message": "Reply sent successfully",
  "to": "their@email.com"
}
```

Error:
```json
{
  "error": "Message not found"
}
```

## Testing

Check endpoint status:
```bash
curl https://clawd.thepickle.dev/api/send-reply
```

## Security Notes

- The `SEND_REPLY_SECRET` must be kept secure
- Only authorized requests can send replies
- Messages can only be replied to once (prevents duplicate sends)
